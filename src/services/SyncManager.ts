import { storage } from '../lib/storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase';

export type SyncActionType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SyncJob {
    id: string; // ID самого завдання
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

        // Слухаємо інтернет і відправляємо чергу
        NetInfo.addEventListener(state => {
            if (state.isConnected && state.isInternetReachable) {
                this.processQueue();
            }
        });
    }

    private async loadQueue() {
        try {
            const json = await storage.getItem('offline_queue');
            if (json) {
                this.queue = JSON.parse(json);
                this.notifyListeners();
            }
        } catch (e) { console.error("Load queue error", e); }
    }

    private async persistQueue() {
        try {
            await storage.setItem('offline_queue', JSON.stringify(this.queue));
            this.notifyListeners();
        } catch (e) { console.error("Persist queue error", e); }
    }

    // Додати завдання в чергу
    async enqueue(type: SyncActionType, tableName: string, payload: any) {
        const job: SyncJob = {
            id: Date.now().toString() + Math.random().toString().slice(2, 5),
            type,
            tableName,
            payload,
            createdAt: Date.now(),
        };
        this.queue.push(job);
        await this.persistQueue();
        console.log(`📥 [SyncManager] Queued ${type} for ${tableName} (ID: ${payload.id})`);
        this.processQueue();
        return job;
    }
    getDeletedIds(tableName: string): string[] {
        return this.queue
            .filter(job => job.tableName === tableName && job.type === 'DELETE')
            .map(job => job.payload.id);
    }
    // Отримати "висячі" записи (щоб показувати їх в UI до синхронізації)
    getPendingItems(tableName: string) {
        return this.queue
            .filter(job => job.tableName === tableName && job.type === 'INSERT')
            .map(job => job.payload);
    }

    // Відправити чергу на сервер
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

                    // 🔥 Очищаємо payload від полів, яких немає в деяких таблицях
                    let payloadToSend = { ...job.payload };
                    if (job.tableName === 'players' || job.tableName === 'teams') {
                        delete payloadToSend.created_at;
                    }

                    // 🔥 3. ОБРОБКА
                    if (job.type === 'INSERT') {
                        res = await query.insert(payloadToSend); // Відправляємо очищений payload
                    } else if (job.type === 'UPDATE') {
                        const { id, ...updateData } = payloadToSend;
                        res = await query.update(updateData).eq('id', id);
                    } else if (job.type === 'DELETE') {
                        res = await query.delete().eq('id', job.payload.id);
                    }

                    if (res?.error) {
                        // 23505 - Такий ID вже є (Дублікат) -> Ігноруємо і видаляємо з черги
                        if (res.error.code === '23505') {
                            processedJobIds.push(job.id);
                        }
                        // 🔥 42501 - Порушення RLS безпеки -> Видаляємо з черги, щоб не блокувати інші дані!
                        else if (res.error.code === '42501') {
                            console.log(`⚠️ [SyncManager] RLS Помилка для ${job.tableName}. Завдання видалено.`);
                            processedJobIds.push(job.id);
                        }
                        else {
                            throw res.error; // Інші помилки (немає інету) залишаємо в черзі
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