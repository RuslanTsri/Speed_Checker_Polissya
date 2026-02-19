import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ZodObject } from 'zod';
import NetInfo from '@react-native-community/netinfo';
import { storage } from '../lib/storage';
import uuid from 'react-native-uuid';
import { syncManager } from './SyncManager';

export interface ServiceResponse<T> {
    data: T | null;
    error: PostgrestError | Error | null;
}

export interface ListResponse<T> {
    data: T[];
    error: PostgrestError | Error | null;
}

// 🔥 ВИПРАВЛЕННЯ: Додали обмеження типу "extends { id?: string }"
export class BaseService<T extends { id?: string }> {
    protected tableName: string;
    protected schema?: ZodObject<any>;

    constructor(tableName: string, schema?: ZodObject<any>) {
        this.tableName = tableName;
        this.schema = schema;
    }

    // --- КЕШУВАННЯ ---
    protected async saveToCache(key: string, data: any) {
        try {
            await storage.setItem(`cache_${this.tableName}_${key}`, JSON.stringify(data));
        } catch (e) { console.error("Cache save error", e); }
    }

    protected async getFromCache(key: string): Promise<any> {
        try {
            const json = await storage.getItem(`cache_${this.tableName}_${key}`);
            return json ? JSON.parse(json) : null;
        } catch (e) { return null; }
    }

    // --- СТВОРЕННЯ (INSERT) ---
    // --- СТВОРЕННЯ (INSERT) ---
    async create(item: Partial<T>): Promise<ServiceResponse<T>> {
        // 1. Валідація
        if (this.schema) {
            const result = this.schema.safeParse(item);
            if (!result.success) return { data: null, error: new Error(result.error.issues[0].message) };
        }

        // 🔥 ВИПРАВЛЕНО: Прибрали примусовий created_at, бо не всі таблиці його мають
        const itemId = item.id || uuid.v4().toString();
        const payload = { ...item, id: itemId };

        // 3. Відправляємо в чергу
        await syncManager.enqueue('INSERT', this.tableName, payload);

        // 4. Миттєво зберігаємо в локальний загальний кеш, щоб UI оновився
        const cachedAll = await this.getFromCache('all') || [];
        await this.saveToCache('all', [payload, ...cachedAll]);

        return { data: payload as unknown as T, error: null };
    }

    // --- ОНОВЛЕННЯ (UPDATE) ---
    async update(id: string, updates: Partial<T>): Promise<ServiceResponse<T>> {
        await syncManager.enqueue('UPDATE', this.tableName, { ...updates, id });

        // Оновлюємо кеш
        const cachedAll = await this.getFromCache('all') || [];
        const updatedCache = cachedAll.map((item: any) => item.id === id ? { ...item, ...updates } : item);
        await this.saveToCache('all', updatedCache);

        return { data: { ...updates, id } as unknown as T, error: null };
    }

    // --- ЧИТАННЯ (READ) ---
    async getAll(): Promise<ListResponse<T>> {
        try {
            const state = await NetInfo.fetch();
            if (state.isConnected) {
                const { data, error } = await supabase.from(this.tableName).select('*');
                if (!error && data) {
                    await this.saveToCache('all', data);
                    return { data: data as T[], error: null };
                }
            }
        } catch (e) {
            console.log(`📴 [BaseService] Network fail, going to cache`);
        }

        const cached = await this.getFromCache('all') || [];
        const pending = syncManager.getPendingItems(this.tableName);

        // Злиття: черга + кеш
        const combined = [...pending, ...cached];
        // Фільтрація унікальних за ID
        const uniqueMap = new Map();
        combined.forEach(item => uniqueMap.set(item.id, item));

        return { data: Array.from(uniqueMap.values()) as T[], error: null };
    }

    // --- ВИДАЛЕННЯ ---
    async delete(id: string): Promise<{ error: PostgrestError | Error | null }> {
        // Тепер працює в офлайні! Відправляємо в чергу
        await syncManager.enqueue('DELETE', this.tableName, { id });

        // Видаляємо з локального загального кешу
        const cachedAll = await this.getFromCache('all') || [];
        const updatedCache = cachedAll.filter((item: any) => item.id !== id);
        await this.saveToCache('all', updatedCache);

        return { error: null };
    }
    async getById(id: string): Promise<ServiceResponse<T>> {
        try {
            const state = await NetInfo.fetch();
            if (state.isConnected) {
                const { data, error } = await supabase
                    .from(this.tableName)
                    .select('*')
                    .eq('id', id)
                    .single();

                if (!error && data) {
                    // Зберігаємо в кеш конкретний запис
                    await this.saveToCache(`item_${id}`, data);
                    return { data: data as T, error: null };
                }
            }
        } catch (e) {
            console.log(`📴 [BaseService] Помилка мережі, читаємо ${id} з кешу`);
        }

        // Якщо офлайн - дістаємо з кешу
        const cached = await this.getFromCache(`item_${id}`);
        return {
            data: cached ? (cached as T) : null,
            error: cached ? null : new Error('Немає мережі і немає в кеші')
        };
    }
}