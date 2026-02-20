import { storage } from '../lib/storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase';

export type SyncActionType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SyncJob {
    id: string;
    type: SyncActionType;
    tableName: string;
    payload: any;
    createdAt: number;
}

class SyncManager {
    private queue: SyncJob[] = [];
    private isSyncing = false;
    private listeners: (() => void)[] = [];

    constructor() {
        this.loadQueue();
        NetInfo.addEventListener(state => {
            if (state.isConnected && state.isInternetReachable) {
                this.processQueue();
            }
        });
    }

    private async loadQueue() {
        try {
            const json = await storage.getItem('offline_queue');
            if (json) { this.queue = JSON.parse(json); this.notifyListeners(); }
        } catch (e) {}
    }

    private async persistQueue() {
        try { await storage.setItem('offline_queue', JSON.stringify(this.queue)); this.notifyListeners(); }
        catch (e) {}
    }

    async enqueue(type: SyncActionType, tableName: string, payload: any) {
        const job: SyncJob = {
            id: Date.now().toString() + Math.random().toString().slice(2, 5),
            type, tableName, payload, createdAt: Date.now(),
        };
        this.queue.push(job);
        await this.persistQueue();
        console.log(`📥 [SyncManager] Queued ${type} for ${tableName} (ID: ${payload.id})`);
        this.processQueue();
        return job;
    }

    getDeletedIds(tableName: string): string[] {
        return this.queue.filter(job => job.tableName === tableName && job.type === 'DELETE').map(job => job.payload.id);
    }

    getPendingItems(tableName: string) {
        return this.queue.filter(job => job.tableName === tableName && job.type === 'INSERT').map(job => job.payload);
    }

    async processQueue() {
        if (this.isSyncing || this.queue.length === 0) return;

        const state = await NetInfo.fetch();
        if (!state.isConnected) return;

        this.isSyncing = true;
        console.log(`🔄 [SyncManager] Syncing started... (${this.queue.length} jobs)`);

        const jobsToProcess = [...this.queue];
        const processedJobIds: string[] = [];

        try {
            jobsToProcess.sort((a, b) => a.createdAt - b.createdAt);

            for (const job of jobsToProcess) {
                try {
                    let res;
                    const query = supabase.from(job.tableName);

                    let payloadToSend = { ...job.payload };
                    // Жорстко вирізаємо created_at, бо воно генерується БД
                    delete payloadToSend.created_at;

                    if (job.type === 'INSERT') {
                        res = await query.insert(payloadToSend);
                    } else if (job.type === 'UPDATE') {
                        const { id, ...updateData } = payloadToSend;
                        res = await query.update(updateData).eq('id', id);
                    } else if (job.type === 'DELETE') {
                        res = await query.delete().eq('id', job.payload.id);
                    }

                    if (res?.error) {
                        const code = res.error.code;

                        if (code === '23505') {
                            // Дублікат -> Ігноруємо
                            processedJobIds.push(job.id);
                        } else if (code === '42501') {
                            // Порушення RLS
                            console.log(`⚠️ RLS Помилка. Завдання видалено.`);
                            processedJobIds.push(job.id);
                        } else if (code === '23503') {
                            // 🔥 БАТЬКА ВИДАЛЕНО (напр. команда вже видалена). Викидаємо завдання.
                            console.log(`⚠️ FK Violation: Батьківський запис не існує. Завдання видалено.`);
                            processedJobIds.push(job.id);
                        } else if (code === 'PGRST204') {
                            // 🔥 ЗАЙВА КОЛОНКА (якої немає в БД). Викидаємо завдання.
                            console.log(`⚠️ PGRST204: Зайве поле в запиті. Завдання видалено.`);
                            processedJobIds.push(job.id);
                        } else {
                            throw res.error; // Інші помилки (напр. відпав інет) -> лишаємо в черзі
                        }
                    } else {
                        console.log(`✅ [SyncManager] Success: ${job.type} -> ${job.tableName}`);
                        processedJobIds.push(job.id);
                    }
                } catch (err) {
                    console.error(`❌ [SyncManager] Job failed:`, err);
                }
            }

            if (processedJobIds.length > 0) {
                this.queue = this.queue.filter(j => !processedJobIds.includes(j.id));
                await this.persistQueue();
                console.log(`✅ [SyncManager] Sync done. Remaining: ${this.queue.length}`);
                this.notifyListeners();
            }

        } finally {
            this.isSyncing = false;
        }
    }

    getPendingCount() { return this.queue.length; }
    getIsSyncing() { return this.isSyncing; }
    subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }
    private notifyListeners() { this.listeners.forEach(l => l()); }
}

export const syncManager = new SyncManager();