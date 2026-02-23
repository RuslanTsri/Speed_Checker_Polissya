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
            if (json) {
                this.queue = JSON.parse(json);
                this.notifyListeners();
            }
        } catch (e) {}
    }

    private async persistQueue() {
        try {
            await storage.setItem('offline_queue', JSON.stringify(this.queue));
            this.notifyListeners();
        } catch (e) {}
    }

    async enqueue(type: SyncActionType, tableName: string, payload: any) {
        const job: SyncJob = {
            id: Date.now().toString() + Math.random().toString().slice(2, 5),
            type, tableName, payload, createdAt: Date.now(),
        };
        this.queue.push(job);
        await this.persistQueue();
        console.log(`📥 [SyncManager] Queued ${type} for ${tableName} (ID: ${payload.id})`);

        // Викликаємо без await, щоб не блокувати UI
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
        // 🔥 КРОК 1: Миттєва перевірка без асинхронних пауз
        if (this.isSyncing || this.queue.length === 0) return;

        this.isSyncing = true; // Закриваємо замок відразу
        this.notifyListeners();

        try {
            // Перевіряємо інтернет
            const state = await NetInfo.fetch();
            if (!state.isConnected) {
                this.isSyncing = false;
                this.notifyListeners();
                return;
            }

            console.log(`🔄 [SyncManager] Syncing started... (${this.queue.length} jobs)`);

            // 🔥 КРОК 2: Обробляємо чергу по одному елементу, поки вона не стане порожньою
            // Це набагато надійніше за копіювання масиву
            while (this.queue.length > 0) {
                // Беремо найперше завдання (FIFO)
                const job = this.queue[0];

                try {
                    const query = supabase.from(job.tableName);
                    let payloadToSend = { ...job.payload };
                    delete payloadToSend.created_at;

                    let res;
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
                        // 23505 - Duplicate key (вже є в базі)
                        if (code === '23505' || code === '42501' || code === '23503' || code === 'PGRST204') {
                            console.log(`⚠️ [SyncManager] Job ${job.id} skipped due to error code: ${code}`);
                            this.queue.shift(); // Видаляємо з черги як "оброблене"
                        } else {
                            // Серйозна помилка (мережева) - зупиняємо цикл, спробуємо пізніше
                            console.log(`❌ [SyncManager] Network/Server error, stopping. Code: ${code}`);
                            break;
                        }
                    } else {
                        console.log(`✅ [SyncManager] Success: ${job.type} -> ${job.tableName}`);
                        this.queue.shift(); // Успішно відправлено - видаляємо
                    }
                } catch (err) {
                    console.error(`❌ [SyncManager] Fatal job error:`, err);
                    break; // Перериваємо цикл при невідомій помилці
                }

                // Зберігаємо стан черги після кожного успішного кроку
                await this.persistQueue();
            }

        } finally {
            this.isSyncing = false;
            this.notifyListeners();
            console.log(`🏁 [SyncManager] Sync cycle finished. Remaining: ${this.queue.length}`);
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