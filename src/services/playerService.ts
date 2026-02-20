import { z } from 'zod';
import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';
import NetInfo from '@react-native-community/netinfo';
import { syncManager } from './SyncManager';

// Замінили .uuid() на .string(), щоб уникнути Zod-помилок, хоча наша ліба і так генерує UUID
export const PlayerSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Ім'я гравця обов'язкове"),
    team_id: z.string()
});

export type Player = z.infer<typeof PlayerSchema>;

class PlayerService extends BaseService<Player> {
    constructor() {
        super('players', PlayerSchema);
    }

    async create(player: { name: string, team_id: string }) {
        console.log(`🚀 [PlayerService] Створення гравця: ${player.name}`);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error("User not found");

        return super.create({
            name: player.name,
            team_id: player.team_id
        });
    }

    async getByTeam(teamId: string) {
        console.log(`🔍 [PlayerService] Запит гравців команди: ${teamId}`);
        const state = await NetInfo.fetch();
        const cacheKey = `players_team_${teamId}`;

        // 1. Беремо офлайн-гравців з черги
        const pendingPlayers = syncManager.getPendingItems('players')
            .filter((p: any) => p.team_id === teamId);

        let serverPlayers: any[] = [];

        // 2. Онлайн запит
        if (state.isConnected) {
            try {
                console.log("🌐 [PlayerService] Онлайн, тягнемо з бази...");
                const { data, error } = await supabase
                    .from('players')
                    .select('*')
                    .eq('team_id', teamId)
                    .order('name');

                if (!error && data) {
                    serverPlayers = data;
                    // @ts-ignore
                    await this.saveToCache(cacheKey, data);
                }
            } catch (e) {
                console.log("⚠️ [PlayerService] Помилка мережі");
            }
        }

        // 3. Офлайн запит з кешу
        if (!state.isConnected || serverPlayers.length === 0) {
            console.log("📴 [PlayerService] Офлайн, читаємо з кешу");
            // @ts-ignore
            serverPlayers = await this.getFromCache(cacheKey) || [];
        }

        // 4. Злиття без дублікатів
         const deletedIds = syncManager.getDeletedIds('players');

        const combined = [...pendingPlayers, ...serverPlayers];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values())
            .filter(item => !deletedIds.includes(item.id)); // 🔥 Відкидаємо видалених

        return { data: unique, error: null };
    }
}

export const playerService = new PlayerService();