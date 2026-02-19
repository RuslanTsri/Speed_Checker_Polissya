import { z } from 'zod';
import { BaseService } from './BaseService';
import { supabase } from '../lib/supabase';
import NetInfo from '@react-native-community/netinfo';
import { syncManager } from './SyncManager';

export const ResultSchema = z.object({
    id: z.string().optional(),
    session_id: z.string(),
    player_id: z.string().nullable().optional(),
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
        console.log("🚀 [ResultsService] Збереження результату забігу...");
        return this.create(data);
    }

    async getBySession(sessionId: string) {
        console.log(`🔍 [ResultsService] Запит результатів сесії ${sessionId}...`);
        const state = await NetInfo.fetch();
        const cacheKey = `results_session_${sessionId}`;

        const pendingResults = syncManager.getPendingItems('results')
            .filter((r: any) => r.session_id === sessionId)
            .map((item: any) => ({
                id: item.id,
                playerName: 'Синхронізація...',
                playerNumber: '-',
                time: Number(item.full_time),
                splits: item.gates,
                round: 0,
                date: new Date(item.created_at || Date.now()).toLocaleTimeString()
            }));

        let serverFormatted: any[] = [];
        let rawData: any[] = [];

        if (state.isConnected) {
            try {
                console.log("🌐 [ResultsService] Онлайн, тягнемо результати...");
                const { data, error } = await supabase
                    .from(this.tableName)
                    .select(`*, players (name)`)
                    .eq('session_id', sessionId)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    rawData = data;
                    serverFormatted = data.map((item: any, index: number) => ({
                        id: item.id,
                        playerName: item.players?.name || 'Гість',
                        playerNumber: '-',
                        time: Number(item.full_time),
                        splits: item.gates,
                        round: data.length - index,
                        date: new Date(item.created_at).toLocaleTimeString()
                    }));
                    // @ts-ignore
                    await this.saveToCache(cacheKey, { formatted: serverFormatted, raw: data });
                }
            } catch (e) {
                console.log("⚠️ [ResultsService] Помилка мережі");
            }
        }

        if (!state.isConnected || serverFormatted.length === 0) {
            console.log("📴 [ResultsService] Офлайн, читаємо з кешу");
            // @ts-ignore
            const cached = await this.getFromCache(cacheKey);
            if (cached) {
                serverFormatted = cached.formatted;
                rawData = cached.raw;
            }
        }

        const combined = [...pendingResults, ...serverFormatted];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

        return { data: unique, rawData, error: null };
    }

    async getRecentResults(limit = 50) {
        console.log("🔍 [ResultsService] Запит останніх результатів...");
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { data: [], error: 'Not auth' };

        const state = await NetInfo.fetch();
        let serverFormatted: any[] = [];

        if (state.isConnected) {
            try {
                console.log("🌐 [ResultsService] Онлайн, тягнемо останні результати...");
                const { data, error } = await supabase
                    .from('results')
                    .select(`id, full_time, gates, created_at, players (name), sessions (created_at, teams (name))`)
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (!error && data) {
                    serverFormatted = data.map((item: any) => ({
                        id: item.id,
                        playerName: item.players?.name || 'Гість',
                        teamName: item.sessions?.teams?.name || 'Вільне тренування',
                        totalTime: Number(item.full_time),
                        avgSplit: item.gates.length > 0 ? (Number(item.full_time) / item.gates.length) : 0,
                        date: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                    }));
                    // @ts-ignore
                    await this.saveToCache('recent_results', serverFormatted);
                }
            } catch (e) {
                console.log("⚠️ [ResultsService] Помилка мережі");
            }
        }

        if (!state.isConnected || serverFormatted.length === 0) {
            console.log("📴 [ResultsService] Офлайн, читаємо останні результати з кешу");
            // @ts-ignore
            serverFormatted = await this.getFromCache('recent_results') || [];
        }

        return { data: serverFormatted, error: null };
    }
    async getByTeam(teamId: string) {
        console.log(`🔍 [ResultsService] Запит результатів для команди ${teamId}...`);
        const state = await NetInfo.fetch();
        const cacheKey = `results_team_${teamId}`;

        // 🔥 1. Отримуємо результати з черги SyncManager, які належать цій команді
        // Оскільки в результатах немає team_id, нам треба знайти ID сесій цієї команди в черзі
        const pendingSessions = syncManager.getPendingItems('sessions')
            .filter((s: any) => s.team_id === teamId)
            .map((s: any) => s.id);

        // Тепер беремо результати, які посилаються на ці сесії
        const pendingResults = syncManager.getPendingItems('results')
            .filter((r: any) => pendingSessions.includes(r.session_id))
            .map((item: any) => ({
                id: item.id,
                playerName: item.player_name || 'Синхронізація...', // Додайте ім'я в payload при створенні
                playerNumber: '-',
                time: Number(item.full_time),
                splits: item.gates,
                round: 0,
                date: new Date().toLocaleTimeString(),
                isPending: true // Мітка для UI
            }));

        let serverFormatted: any[] = [];

        if (state.isConnected) {
            try {
                const { data, error } = await supabase
                    .from('results')
                    .select(`
                    *,
                    players (name),
                    sessions!inner (team_id)
                `)
                    .eq('sessions.team_id', teamId)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    serverFormatted = data.map((item: any) => ({
                        id: item.id,
                        playerName: item.players?.name || 'Гість',
                        playerNumber: '-',
                        time: Number(item.full_time),
                        splits: item.gates,
                        round: 0,
                        date: new Date(item.created_at).toLocaleTimeString()
                    }));
                    await this.saveToCache(cacheKey, serverFormatted);
                }
            } catch (e) {
                console.log("⚠️ [ResultsService] Помилка мережі");
            }
        }

        if (!state.isConnected || serverFormatted.length === 0) {
            serverFormatted = await this.getFromCache(cacheKey) || [];
        }

        // 🔥 2. ЗЛИВАЄМО ДАНІ: Офлайн черга + Кеш/Сервер
        const combined = [...pendingResults, ...serverFormatted];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

        return { data: unique, error: null };
    }
}

export const resultsService = new ResultsService();