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
    async getMyTeamsWithStatus() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: 'No user' };

        // 🔥 МАГІЯ SUPABASE: Вкладений запит
        // 1. Беремо команди (teams)
        // 2. Приєднуємо гравців (players)
        // 3. У кожного гравця рахуємо кількість результатів (results count)
        const { data, error } = await supabase
            .from('teams')
            .select(`
                id,
                name,
                players (
                    id,
                    results (count) 
                )
            `)
            .eq('coach_id', user.id)
            .order('name');

        if (error) {
            console.error("Error fetching teams:", error);
            return { data: [], error };
        }

        // 🔥 ОБРОБКА ДАНИХ (Mapping)
        const formatted = data.map((team: any) => {
            // Рахуємо кількість гравців
            const playersCount = team.players?.length || 0;

            // Перевіряємо: чи є хоч один гравець, у якого results > 0
            // team.players - це масив гравців
            // player.results - це масив об'єктів [{count: 5}] (через select count)
            const hasAnyResults = team.players?.some((player: any) =>
                player.results?.[0]?.count > 0
            );

            return {
                id: team.id,
                teamName: team.name,
                playerCount: playersCount,
                hasResults: hasAnyResults // true/false для червоної/зеленої плашки
            };
        });

        // Сортуємо: спочатку команди з даними, потім пусті
        formatted.sort((a, b) => Number(b.hasResults) - Number(a.hasResults));

        return { data: formatted, error: null };
    }
}

export const teamService = new TeamService();