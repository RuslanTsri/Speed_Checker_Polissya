import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService, Profile } from '../services/authService';
import { Alert } from 'react-native';

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
        if (!userId) return;

        console.log("👤 [UserContext] Завантажуємо профіль...");
        const { data, error } = await authService.getById(userId);

        if (!error && data) {
            setProfile(data);
            console.log("✅ [UserContext] Профіль завантажено:", data.full_name || "Без імені");
        } else {
            console.error("❌ [UserContext] Помилка профілю:", error);
        }
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    const logout = async () => {
        console.log("🚀 [UserContext] Початок процесу виходу...");
        setIsLoading(true);
        try {
            const { error } = await authService.signOut();
            if (error) throw error;
        } catch (error: any) {
            console.warn("⚠️ [UserContext] Помилка при signOut (це нормально, якщо токен протух):", error.message);
        } finally {
            setUser(null);
            setProfile(null);
            setIsLoading(false);
            console.log("✅ [UserContext] Локальна сесія очищена");
        }
    };

    useEffect(() => {
        let isMounted = true;

        const checkSession = async () => {
            console.log("🔍 [UserContext] 1. Старт перевірки сесії...");

            try {
                // Отримуємо сесію
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("❌ [UserContext] Помилка сесії:", error.message);
                    if (error.message.includes("Invalid Refresh Token") || error.message.includes("Not Found")) {
                        console.log("♻️ Токен невалідний -> Примусовий вихід");
                        await logout();
                        return;
                    }
                    throw error;
                }

                if (data.session?.user) {
                    console.log("🔓 [UserContext] 2. Знайдено активну сесію!");
                    if (isMounted) {
                        setUser(data.session.user);
                        fetchProfile(data.session.user.id);
                    }
                } else {
                    console.log("🤷‍♂️ [UserContext] 2. Сесії немає.");
                    if (isMounted) {
                        setUser(null);
                        setProfile(null);
                    }
                }
            } catch (error) {
                console.warn("⚠️ [UserContext] Глобальний збій перевірки:", error);
                if (isMounted) {
                    setUser(null);
                    setProfile(null);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`📣 [Auth Event]: ${event}`);

            if (event === 'TOKEN_REFRESHED') {
                console.log('🔄 Токен оновлено');
            }

            if (event === 'SIGNED_OUT') {
                if (isMounted) {
                    setUser(null);
                    setProfile(null);
                    setIsLoading(false);
                }
            }
            else if (session?.user) {
                if (isMounted) {
                    setUser(session.user);
                    if (!profile) fetchProfile(session.user.id);
                    setIsLoading(false);
                }
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