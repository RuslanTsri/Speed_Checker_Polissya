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

export class BaseService<T extends { id?: string }> {
    protected tableName: string;
    protected schema?: ZodObject<any>;

    constructor(tableName: string, schema?: ZodObject<any>) {
        this.tableName = tableName;
        this.schema = schema;
    }

    protected async saveToCache(key: string, data: any) {
        try { await storage.setItem(`cache_${this.tableName}_${key}`, JSON.stringify(data)); } catch (e) { }
    }

    protected async getFromCache(key: string): Promise<any> {
        try {
            const json = await storage.getItem(`cache_${this.tableName}_${key}`);
            return json ? JSON.parse(json) : null;
        } catch (e) { return null; }
    }

    async create(item: Partial<T>): Promise<ServiceResponse<T>> {
        let validData = item;

        // 🔥 ВАЖЛИВО: Беремо очищені дані result.data (зайве сміття відрізано)
        if (this.schema) {
            const result = this.schema.safeParse(item);
            if (!result.success) return { data: null, error: new Error(result.error.issues[0].message) };
            validData = result.data as Partial<T>;
        }

        const itemId = validData.id || uuid.v4().toString();
        const payload = { ...validData, id: itemId };

        await syncManager.enqueue('INSERT', this.tableName, payload);

        const cachedAll = await this.getFromCache('all') || [];
        await this.saveToCache('all', [payload, ...cachedAll]);

        return { data: payload as unknown as T, error: null };
    }

    async update(id: string, updates: Partial<T>): Promise<ServiceResponse<T>> {
        let validData = updates;

        if (this.schema) {
            const result = this.schema.partial().safeParse(updates);
            if (!result.success) return { data: null, error: new Error(result.error.issues[0].message) };
            validData = result.data as Partial<T>;
        }

        await syncManager.enqueue('UPDATE', this.tableName, { ...validData, id });

        const cachedAll = await this.getFromCache('all') || [];
        const updatedCache = cachedAll.map((item: any) => item.id === id ? { ...item, ...updates } : item);
        await this.saveToCache('all', updatedCache);

        return { data: { ...updates, id } as unknown as T, error: null };
    }

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
        } catch (e) {}

        const cached = await this.getFromCache('all') || [];
        const pending = syncManager.getPendingItems(this.tableName);
        const combined = [...pending, ...cached];
        const uniqueMap = new Map();
        combined.forEach(item => uniqueMap.set(item.id, item));

        return { data: Array.from(uniqueMap.values()) as T[], error: null };
    }

    async delete(id: string): Promise<{ error: PostgrestError | Error | null }> {
        await syncManager.enqueue('DELETE', this.tableName, { id });
        const cachedAll = await this.getFromCache('all') || [];
        const updatedCache = cachedAll.filter((item: any) => item.id !== id);
        await this.saveToCache('all', updatedCache);
        return { error: null };
    }

    async getById(id: string): Promise<ServiceResponse<T>> {
        try {
            const state = await NetInfo.fetch();
            if (state.isConnected) {
                const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();
                if (!error && data) {
                    await this.saveToCache(`item_${id}`, data);
                    return { data: data as T, error: null };
                }
            }
        } catch (e) {}

        const cached = await this.getFromCache(`item_${id}`);
        return { data: cached ? (cached as T) : null, error: cached ? null : new Error('No data') };
    }
}