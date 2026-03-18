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
        return this.create(data);
    }

    async getBySessionGroup(teamId: string, sessionName: string) {
        console.log(`🔍 [ResultsService] Запит групи сесій: ${sessionName}`);
        const state = await NetInfo.fetch();
        const cacheKey = `results_group_${teamId}_${sessionName}`;

        const pendingSessions = syncManager.getPendingItems('sessions')
            .filter((s: any) => s.team_id === teamId && s.name === sessionName);
        const pendingSessionIds = pendingSessions.map((s: any) => s.id);

        const pendingResults = syncManager.getPendingItems('results')
            .filter((r: any) => pendingSessionIds.includes(r.session_id))
            .map((item: any) => {
                const session = pendingSessions.find((s: any) => s.id === item.session_id);
                return {
                    id: item.id,
                    playerId: item.player_id || 'guest',
                    playerName: item.player_name || 'Синхронізація...',
                    playerNumber: '-',
                    time: Number(item.full_time),
                    splits: item.gates || [],
                    distance: session?.total_distance || 30,
                    round: 0,
                    date: new Date(item.created_at || Date.now()).toLocaleTimeString()
                };
            });

        let serverFormatted: any[] = [];

        if (state.isConnected) {
            try {
                const { data, error } = await supabase
                    .from(this.tableName)
                    .select(`
                        id, full_time, gates, created_at, player_id,
                        players (name),
                        sessions!inner (id, team_id, name, test_type, total_distance)
                    `)
                    .eq('sessions.team_id', teamId)
                    .eq('sessions.name', sessionName)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    serverFormatted = data.map((item: any, index: number) => ({
                        id: item.id,
                        playerId: item.player_id || 'guest',
                        playerName: item.players?.name || 'Гість',
                        playerNumber: '-',
                        time: Number(item.full_time),
                        splits: item.gates || [],
                        distance: item.sessions.total_distance,
                        round: data.length - index,
                        date: new Date(item.created_at).toLocaleTimeString()
                    }));
                    // @ts-ignore
                    await this.saveToCache(cacheKey, { formatted: serverFormatted });
                }
            } catch (e) {
                console.log("⚠️ Помилка мережі");
            }
        }

        if (!state.isConnected || serverFormatted.length === 0) {
            // @ts-ignore
            const cached = await this.getFromCache(cacheKey);
            if (cached) serverFormatted = cached.formatted;
        }

        const combined = [...pendingResults, ...serverFormatted];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

        return { data: unique, error: null };
    }

    async getBySession(sessionId: string) {
        const state = await NetInfo.fetch();
        const cacheKey = `results_session_v2_${sessionId}`;

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
                const { data, error } = await supabase
                    .from(this.tableName)
                    .select(`*, players (name)`)
                    .eq('session_id', sessionId)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    rawData = data;
                    serverFormatted = data.map((item: any, index: number) => ({
                        id: item.id,
                        playerId: item.player_id || 'guest',
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
            } catch (e) {}
        }

        if (!state.isConnected || serverFormatted.length === 0) {
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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { data: [], error: 'Not auth' };
        const state = await NetInfo.fetch();
        let serverFormatted: any[] = [];

        if (state.isConnected) {
            try {
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
                        avgSplit: Number(item.full_time) / (item.gates.length + 1),
                        date: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                    }));
                    // @ts-ignore
                    await this.saveToCache('recent_results', serverFormatted);
                }
            } catch (e) {}
        }

        if (!state.isConnected || serverFormatted.length === 0) {
            // @ts-ignore
            serverFormatted = await this.getFromCache('recent_results') || [];
        }
        return { data: serverFormatted, error: null };
    }
}

export const resultsService = new ResultsService();