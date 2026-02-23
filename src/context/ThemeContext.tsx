
import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../lib/storage'; // твій сторедж

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: true, // За замовчуванням темна, бо це спорт-додаток
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    // Тримаємо стейт теми тут
    const [isDark, setIsDark] = useState(true);

    // При першому запуску дістаємо збережену тему з пам'яті
    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await storage.getItem('app_theme');
            if (savedTheme !== null) {
                setIsDark(savedTheme === 'dark');
            }
        };
        loadTheme();
    }, []);

    // Функція для зміни теми і збереження
    const toggleTheme = async (value: boolean) => {
        setIsDark(value);
        await storage.setItem('app_theme', value ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Зручний хук для використання на будь-якому екрані
export const useTheme = () => useContext(ThemeContext);