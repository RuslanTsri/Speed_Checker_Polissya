import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { BaseService, ServiceResponse } from './BaseService';

const ProfileSchema = z.object({
    id: z.string().optional(),
    full_name: z.any(), // Тимчасово дозволяємо будь-що
    avatar_url: z.any(),
    pin_code: z.any(),
    role: z.any(),
    updated_at: z.any(),
}).passthrough();

export type Profile = z.infer<typeof ProfileSchema>;

class AuthService extends BaseService<Profile> {

    constructor() {
        // Передаємо назву таблиці 'profiles' і схему валідації в батьківський клас
        super('profiles', ProfileSchema);
    }

    // --- АВТОРИЗАЦІЯ (Supabase Auth API) ---

    /**
     * 1. РЕЄСТРАЦІЯ
     * Ми не використовуємо метод .create() з BaseService, бо юзера створює Auth API.
     * Але ми передаємо дані (full_name), щоб SQL-тригер сам створив профіль.
     */
    async signUp(email: string, password: string, fullName: string, pinCode: string) { // Додали аргумент pinCode
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    pin_code: pinCode,
                },
            },
        });
        return { data, error };
    }
    /**
     * 2. ВХІД
     */
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    }

    /**
     * 3. ВИХІД
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    }

    /**
     * 4. ВИДАЛЕННЯ АКАУНТУ
     * Тут ми викликаємо RPC функцію, бо BaseService.delete() видаляє рядок з таблиці,
     * а нам треба видалити самого Юзера з системи авторизації.
     */
    async deleteAccount() {
        // Викликаємо SQL-функцію, яку ми створили раніше
        const { error } = await supabase.rpc('delete_own_account');

        if (!error) {
            await this.signOut(); // Розлогінюємо клієнт
        }
        return { error };
    }

    // --- РОБОТА З ПРОФІЛЕМ (Використовуємо методи BaseService) ---

    /**
     * Отримати профіль поточного юзера.
     * Використовує this.getById() з BaseService
     */
    async getCurrentProfile(): Promise<ServiceResponse<Profile>> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: new Error("Користувач не авторизований") };
        }

        // Викликаємо батьківський метод getById, який вже вміє ходити в 'profiles'
        return this.getById(user.id);
    }

    /**
     * Оновити профіль поточного юзера (напр. змінити ПІН)
     * Обгортка над this.update()
     */
    async updateCurrentProfile(updates: Partial<Profile>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: new Error("No user") };

        // Викликаємо батьківський метод update (він сам перевірить Zod схему!)
        return this.update(user.id, updates);
    }
}

// Експортуємо готовий екземпляр
export const authService = new AuthService();