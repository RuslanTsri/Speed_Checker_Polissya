import { z } from 'zod';
import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';

// Схема валідації (прибираємо coach_id, бо його немає в таблиці players)
export const PlayerSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Ім'я гравця обов'язкове"),
    team_id: z.string().uuid()
}).passthrough();

export type Player = z.infer<typeof PlayerSchema>;

class PlayerService extends BaseService<Player> {
    constructor() {
        super('players', PlayerSchema);
    }

    // Створення гравця
    async create(player: { name: string, team_id: string }) {
        // Нам не треба перевіряти user тут, якщо ми не пишемо його ID в базу
        // Але перевірка сесії не завадить
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        // 🔥 ВИПРАВЛЕНО: Ми передаємо тільки те, що є в таблиці players
        return super.create({
            name: player.name,
            team_id: player.team_id
            // coach_id: user.id ❌ ВИДАЛИ ЦЕЙ РЯДОК, якщо він був
        });
    }

    // Отримати гравців конкретної команди
    async getByTeam(teamId: string) {
        return supabase
            .from('players')
            .select('*')
            .eq('team_id', teamId)
            .order('name');
    }
}

export const playerService = new PlayerService();