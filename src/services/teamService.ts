import { z } from 'zod';
import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';

// Схема валідації
export const TeamSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Назва команди обов'язкова"),
    coach_id: z.string().optional()
}).passthrough();

export type Team = z.infer<typeof TeamSchema>;

class TeamService extends BaseService<Team> {
    constructor() {
        super('teams', TeamSchema);
    }

    // ✅ ВИПРАВЛЕННЯ: Тепер приймаємо об'єкт, щоб співпадало з BaseService
    async create(team: { name: string }) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        // Викликаємо батьківський create, передаючи об'єкт
        return super.create({
            name: team.name,
            coach_id: user.id
        });
    }

    async getMyTeams() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: 'No user' };

        // 🔥 ЗМІНА: Додаємо select('*, players(count)') щоб отримати кількість
        // Або просто select('*, players(*)') якщо хочемо список
        // Найпростіше для тебе зараз - взяти всі команди, де ти тренер

        return supabase
            .from('teams')
            .select(`
                *,
                players (id) 
            `) // Беремо ID гравців, щоб порахувати їх довжину
            .eq('coach_id', user.id)
            .order('name');
    }
}

export const teamService = new TeamService();