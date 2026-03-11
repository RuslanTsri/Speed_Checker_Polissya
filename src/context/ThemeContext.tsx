
import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../lib/storage';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: true,
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await storage.getItem('app_theme');
            if (savedTheme !== null) {
                setIsDark(savedTheme === 'dark');
            }
        };
        loadTheme();
    }, []);

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

export const useTheme = () => useContext(ThemeContext);