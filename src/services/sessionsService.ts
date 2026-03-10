import { z } from 'zod';
import { BaseService, ServiceResponse } from './BaseService';
import { supabase } from '../lib/supabase';
import NetInfo from '@react-native-community/netinfo';
import { syncManager } from './SyncManager';
import i18n from 'i18next';

export const SessionSchema = z.object({
    id: z.string().optional(),
    created_at: z.string().optional(),
    coach_id: z.string().optional(),
    team_id: z.string().nullable().optional(),
    name: z.string().min(1, { message: i18n.t('logs.errors.validation.name_required') }),
    total_distance: z.number().positive(),
    test_type: z.string(),
    splits_config: z.any().optional()
});

export type Session = z.infer<typeof SessionSchema>;

class SessionsService extends BaseService<Session> {
    constructor() {
        super('sessions', SessionSchema);
    }

    async create(item: Partial<Session>): Promise<ServiceResponse<Session>> {
        console.log(`🚀 [SessionsService] Створення сесії...`);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { data: null, error: new Error('User not authenticated') };

        return super.create({
            ...item,
            coach_id: session.user.id
        });
    }

    async getMySessions() {
        console.log("🔍 [SessionsService] Запит getMySessions...");
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { data: [], error: 'User not authenticated' };

        const state = await NetInfo.fetch();

        const pendingSessions = syncManager.getPendingItems('sessions')
            .filter((s: any) => s.coach_id === session.user.id)
            .map((item: any) => ({
                id: item.id,
                date: new Date(item.created_at || Date.now()).toLocaleDateString(),
                time: new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                teamName: item.team_id
                    ? i18n.t('screens.sessions.syncing')
                    : i18n.t('screens.sessions.free_training'),
                testType: item.test_type,
                playerCount: 0,
                distance: item.total_distance
            }));

        let serverFormatted: any[] = [];

        if (state.isConnected) {
            try {
                console.log("🌐 [SessionsService] Онлайн, тягнемо сесії...");
                const { data, error } = await supabase
                    .from(this.tableName)
                    .select(`*, teams (name), results (count)`)
                    .eq('coach_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    serverFormatted = data.map((item: any) => ({
                        id: item.id,
                        date: new Date(item.created_at).toLocaleDateString(),
                        time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        teamName: item.teams?.name || i18n.t('screens.sessions.free_training'),
                        testType: item.test_type,
                        playerCount: item.results?.[0]?.count || 0,
                        distance: item.total_distance
                    }));
                    // @ts-ignore
                    await this.saveToCache('my_sessions', serverFormatted);
                }
            } catch (e) {
                console.log("⚠️ [SessionsService] Помилка мережі");
            }
        }

        if (!state.isConnected || serverFormatted.length === 0) {
            console.log("📴 [SessionsService] Офлайн, читаємо з кешу");
            // @ts-ignore
            serverFormatted = await this.getFromCache('my_sessions') || [];
        }

        const combined = [...pendingSessions, ...serverFormatted];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

        // Сортуємо: нові зверху
        unique.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());

        return { data: unique, error: null };
    }
}

export const sessionsService = new SessionsService();