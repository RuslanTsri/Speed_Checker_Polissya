import { z } from 'zod';
import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';

// 1. Zod Схема
export const ResultSchema = z.object({
    id: z.string().optional(),
    session_id: z.string().uuid(),
    player_id: z.string().uuid().nullable().optional(),
    full_time: z.number(),
    gates: z.array(z.number()),
    is_best: z.boolean().optional().default(false)
});

export type Result = z.infer<typeof ResultSchema>;

class ResultsService extends BaseService<Result> {
    constructor() {
        super('results', ResultSchema);
    }

    async saveResult(data: Partial<Result>) {
        return this.create(data);
    }

    // 🔥 ВИПРАВЛЕНО: Прибрали запит 'number'
    async getBySession(sessionId: string) {
        const { data, error } = await supabase
            .from(this.tableName)
            .select(`
                *,
                players (name) 
            `) // 👈 Було (name, number), стало просто (name)
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            return { data: [], error };
        }

        const formatted = data.map((item: any, index: number) => ({
            id: item.id,
            playerName: item.players?.name || 'Гість',
            playerNumber: '-', // 👈 Ставимо прочерк, бо номера немає
            time: Number(item.full_time),
            splits: item.gates,
            round: data.length - index,
            date: new Date(item.created_at).toLocaleTimeString()
        }));

        return { data: formatted, rawData: data, error: null };
    }

    // 🔥 ВИПРАВЛЕНО: Прибрали запит 'number'
    async getRecentResults(limit = 50) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: 'Not auth' };

        const { data, error } = await supabase
            .from('results')
            .select(`
                id,
                full_time,
                gates,
                created_at,
                players (name), -- 👈 Тут теж без number
                sessions (
                    created_at,
                    teams (name)
                )
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) return { data: [], error };

        const formatted = data.map((item: any) => ({
            id: item.id,
            playerName: item.players?.name || 'Гість',
            teamName: item.sessions?.teams?.name || 'Вільне тренування',
            totalTime: Number(item.full_time),
            avgSplit: item.gates.length > 0 ? (Number(item.full_time) / item.gates.length) : 0,
            date: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
        }));

        return { data: formatted, error: null };
    }
}

export const resultsService = new ResultsService();