import { z } from 'zod';
import { BaseService, ServiceResponse } from './BaseService';
import { supabase } from '../lib/supabase';

// 1. Zod Схема (Валідація)
export const SessionSchema = z.object({
    id: z.string().optional(),
    created_at: z.string().optional(),
    coach_id: z.string().optional(), // Додаємо автоматично
    team_id: z.string().nullable().optional(),
    name: z.string().min(1, "Назва обов'язкова"),
    total_distance: z.number().positive(),
    test_type: z.string(),
    splits_config: z.any().optional() // JSON
});

export type Session = z.infer<typeof SessionSchema>;

class SessionsService extends BaseService<Session> {
    constructor() {
        super('sessions', SessionSchema);
    }

    // 🔥 Override (Перевизначення): Додаємо coach_id перед створенням
    async create(item: Partial<Session>): Promise<ServiceResponse<Session>> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: new Error('User not authenticated') };

        // Викликаємо батьківський метод, але вже з ID тренера
        return super.create({
            ...item,
            coach_id: user.id
        });
    }

    // 🔥 Custom Method: Складний запит із JOIN (немає в BaseService)
    async getMySessions() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: 'User not authenticated' };

        const { data, error } = await supabase
            .from(this.tableName)
            .select(`
                *,
                teams (name),
                results (count) 
            `)
            .eq('coach_id', user.id)
            .order('created_at', { ascending: false });

        if (error) return { data: [], error };

        // Форматуємо для UI
        const formatted = data.map((item: any) => ({
            id: item.id,
            date: new Date(item.created_at).toLocaleDateString(),
            time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            teamName: item.teams?.name || 'Вільне тренування',
            testType: item.test_type,
            playerCount: item.results?.[0]?.count || 0,
            distance: item.total_distance
        }));

        return { data: formatted, error: null };
    }
}

export const sessionsService = new SessionsService();