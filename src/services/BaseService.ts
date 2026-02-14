import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ZodObject, ZodRawShape } from 'zod';

export interface ServiceResponse<T> {
    data: T | null;
    error: PostgrestError | Error | null;
}

export interface ListResponse<T> {
    data: T[];
    error: PostgrestError | Error | null;
}

export class BaseService<T> {
    protected tableName: string;

    protected schema?: ZodObject<any>;

    constructor(tableName: string, schema?: ZodObject<any>) {
        this.tableName = tableName;
        this.schema = schema;
    }

    async getAll(): Promise<ListResponse<T>> {
        const { data, error } = await supabase.from(this.tableName).select('*');
        return { data: data as T[], error };
    }

    async getById(id: string): Promise<ServiceResponse<T>> {
        const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();
        return { data: data as T, error };
    }

    async create(item: Partial<T>): Promise<ServiceResponse<T>> {
        // Валідація
        if (this.schema) {
            const result = this.schema.safeParse(item);
            if (!result.success) {
                // 👇 Правильний доступ до помилок Zod
                const errorMessage = result.error.issues[0].message;
                console.error("Validation Error:", result.error.format());
                return { data: null, error: new Error(errorMessage) };
            }
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .insert(item)
            .select()
            .single();

        return { data: data as T, error };
    }

    async update(id: string, updates: Partial<T>): Promise<ServiceResponse<T>> {
        // Валідація
        if (this.schema) {
            // 👇 Тепер .partial() працює, бо ми вказали тип ZodObject
            const result = this.schema.partial().safeParse(updates);
            if (!result.success) {
                const errorMessage = result.error.issues[0].message;
                return { data: null, error: new Error(errorMessage) };
            }
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        return { data: data as T, error };
    }

    async delete(id: string): Promise<{ error: PostgrestError | null }> {
        const { error } = await supabase.from(this.tableName).delete().eq('id', id);
        return { error };
    }
}