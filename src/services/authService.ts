import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { BaseService, ServiceResponse } from './BaseService';

const ProfileSchema = z.object({
    id: z.string().optional(),
    full_name: z.any(),
    avatar_url: z.any(),
    pin_code: z.any(),
    role: z.any(),
    updated_at: z.any(),
});

export type Profile = z.infer<typeof ProfileSchema>;

class AuthService extends BaseService<Profile> {

    constructor() {
        super('profiles', ProfileSchema);
    }

    async signUp(email: string, password: string, fullName: string, pinCode: string) {
        console.log("🚀 [AuthService] Реєстрація нового юзера...");
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

    async signIn(email: string, password: string) {
        console.log("🚀 [AuthService] Вхід у систему...");
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    }

    async signOut() {
        console.log("🚪 [AuthService] Вихід із системи...");
        const { error } = await supabase.auth.signOut();
        return { error };
    }

    async deleteAccount() {
        console.log("⚠️ [AuthService] Видалення акаунту...");
        const { error } = await supabase.rpc('delete_own_account');
        if (!error) {
            await this.signOut();
        }
        return { error };
    }

    async getCurrentProfile(): Promise<ServiceResponse<Profile>> {
        console.log("🔍 [AuthService] Запит профілю...");
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return { data: null, error: new Error("Користувач не авторизований") };
        }

        return this.getById(session.user.id);
    }

    async updateCurrentProfile(updates: Partial<Profile>) {
        console.log("🚀 [AuthService] Оновлення профілю...");
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { data: null, error: new Error("No user") };

        return this.update(session.user.id, updates);
    }
}

export const authService = new AuthService();