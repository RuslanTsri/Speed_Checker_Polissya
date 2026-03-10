import { z } from 'zod';
import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';
import NetInfo from '@react-native-community/netinfo';
import { syncManager } from './SyncManager';
import i18n from 'i18next'; // 🔥 Імпортуємо глобальний i18next

export const TeamSchema = z.object({
    id: z.string().optional(),
    // 🔥 Локалізуємо повідомлення Zod-валідації
    name: z.string().min(1, { message: i18n.t('logs.errors.validation.team_name_required') }),
    coach_id: z.string().optional()
});

export type Team = z.infer<typeof TeamSchema>;

class TeamService extends BaseService<Team> {
    constructor() {
        super('teams', TeamSchema);
    }

    async create(team: { name: string }) {
        console.log(`🚀 [TeamService] Створення команди: ${team.name}`);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error(i18n.t('logs.errors.auth.user_not_found'));

        return super.create({
            name: team.name,
            coach_id: session.user.id
        });
    }

    async getMyTeams() {
        console.log("🔍 [TeamService] Запит getMyTeams...");
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { data: [], error: i18n.t('logs.errors.auth.user_not_found') };

        const state = await NetInfo.fetch();

        const pendingTeams = syncManager.getPendingItems('teams')
            .filter((t: any) => t.coach_id === session.user.id);

        let serverTeams: any[] = [];

        if (state.isConnected) {
            try {
                console.log("🌐 [TeamService] Онлайн, тягнемо команди з бази...");
                const { data, error } = await supabase
                    .from('teams')
                    .select(`*, players (id)`)
                    .eq('coach_id', session.user.id)
                    .order('name');

                if (!error && data) {
                    serverTeams = data;
                    // @ts-ignore
                    await this.saveToCache('my_teams', data);
                }
            } catch (e) {
                console.log("⚠️ [TeamService] Помилка мережі");
            }
        }

        if (!state.isConnected || serverTeams.length === 0) {
            console.log("📴 [TeamService] Офлайн, читаємо 'my_teams' з кешу");
            // @ts-ignore
            serverTeams = await this.getFromCache('my_teams') || [];
        }

        const deletedIds = syncManager.getDeletedIds('teams');

        const combined = [...pendingTeams, ...serverTeams];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values())
            .filter(item => !deletedIds.includes(item.id));

        return { data: unique, error: null };
    }

    async getMyTeamsWithStatus() {
        console.log("🔍 [TeamService] Запит getMyTeamsWithStatus...");
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { data: [], error: i18n.t('logs.errors.auth.user_not_found') };

        const state = await NetInfo.fetch();

        // Форматуємо чергу для UI
        const pendingTeams = syncManager.getPendingItems('teams')
            .filter((t: any) => t.coach_id === session.user.id)
            .map((t: any) => ({
                id: t.id,
                teamName: t.name,
                playerCount: 0,
                hasResults: false
            }));

        let serverFormatted: any[] = [];

        if (state.isConnected) {
            try {
                console.log("🌐 [TeamService] Онлайн, тягнемо статуси...");
                const { data, error } = await supabase
                    .from('teams')
                    .select(`id, name, players (id, results (count))`)
                    .eq('coach_id', session.user.id)
                    .order('name');

                if (!error && data) {
                    serverFormatted = data.map((team: any) => ({
                        id: team.id,
                        teamName: team.name,
                        playerCount: team.players?.length || 0,
                        hasResults: team.players?.some((player: any) => player.results?.[0]?.count > 0)
                    }));
                    serverFormatted.sort((a, b) => Number(b.hasResults) - Number(a.hasResults));
                    // @ts-ignore
                    await this.saveToCache('teams_with_status', serverFormatted);
                }
            } catch (e) {
                console.log("⚠️ [TeamService] Помилка мережі");
            }
        }

        if (!state.isConnected || serverFormatted.length === 0) {
            console.log("📴 [TeamService] Офлайн, читаємо статуси з кешу");
            // @ts-ignore
            serverFormatted = await this.getFromCache('teams_with_status') || [];
        }

        const deletedIds = syncManager.getDeletedIds('teams');

        const combined = [...pendingTeams, ...serverFormatted];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values())
            .filter(item => !deletedIds.includes(item.id));

        return { data: unique, error: null };
    }
}

export const teamService = new TeamService();