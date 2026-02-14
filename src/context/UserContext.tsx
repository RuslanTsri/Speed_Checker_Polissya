import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService, Profile } from '../services/authService';

interface UserContextType {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    refreshProfile: () => Promise<void>;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        console.log("👤 [UserContext] Завантажуємо профіль...");
        const { data, error } = await authService.getById(userId);
        if (!error && data) {
            setProfile(data);
            console.log("✅ [UserContext] Профіль завантажено:", data.full_name);
        } else {
            console.error("❌ [UserContext] Помилка профілю:", error);
        }
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    const logout = async () => {
        console.log("🚀 [UserContext] Початок процесу виходу...");
        setIsLoading(true); // Показуємо спінер на секунду, поки чистимо дані
        try {
            // 1. Вихід із Supabase (це видалить токен з AsyncStorage)
            await authService.signOut();

            // 2. Очищаємо локальний стейт
            setUser(null);
            setProfile(null);

            console.log("✅ [UserContext] Сесія очищена");
        } catch (error) {
            console.error("❌ [UserContext] Помилка при виході:", error);
        } finally {
            setIsLoading(false); // Повертаємо можливість рендеру (тепер user = null, тому відкриється Auth)
        }
    };

    useEffect(() => {
        let isMounted = true; // Щоб уникнути помилок при розмонтуванні

        const checkSession = async () => {
            console.log("🔍 [UserContext] 1. Старт перевірки сесії...");

            try {
                // 🔥 ХАК: Створюємо гонку (Race).
                // Якщо Supabase думає довше 3 секунд -> викидаємо помилку і пускаємо юзера на вхід.
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout")), 3000)
                );

                // Чекаємо хто швидше: база чи таймер
                const result: any = await Promise.race([sessionPromise, timeoutPromise]);
                const session = result.data?.session;

                if (session?.user) {
                    console.log("🔓 [UserContext] 2. Знайдено активну сесію!");
                    if (isMounted) {
                        setUser(session.user);
                        // Завантажуємо профіль, але не блокуємо UI, якщо це довго
                        fetchProfile(session.user.id);
                    }
                } else {
                    console.log("🤷‍♂️ [UserContext] 2. Сесії немає (користувач не входив).");
                }
            } catch (error) {
                console.warn("⚠️ [UserContext] Перевірка сесії перервана (або тайм-аут):", error);
                // Тут нічого страшного, просто покажемо AuthScreen
            } finally {
                console.log("🏁 [UserContext] 3. Завантаження вимкнено.");
                if (isMounted) setIsLoading(false);
            }
        };

        checkSession();

        // Слухач змін (Вхід/Вихід)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (isMounted) {
                if (session?.user) {
                    setUser(session.user);
                    if (!profile) fetchProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={{ user, profile, isLoading, refreshProfile, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};