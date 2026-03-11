import React, { createContext, useState, useEffect, useContext } from 'react';
import i18n from '../lib/i18n';
import { storage } from '../lib/storage';

const LANG_KEY = 'app_language';

interface LanguageContextType {
    language: string;
    changeLanguage: (lang: string) => Promise<void>;
    isLangLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'uk',
    changeLanguage: async () => {},
    isLangLoading: true,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<string>('uk');
    const [isLangLoading, setIsLangLoading] = useState(true);

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const savedLang = await storage.getItem(LANG_KEY);
                if (savedLang) {
                    setLanguage(savedLang);
                    await i18n.changeLanguage(savedLang);
                } else {
                    setLanguage(i18n.language || 'uk');
                }
            } catch (error) {
                console.error('Failed to load language', error);
            } finally {
                setIsLangLoading(false);
            }
        };

        loadLanguage();
    }, []);

    const changeLanguage = async (newLang: string) => {
        setLanguage(newLang);
        await i18n.changeLanguage(newLang);
        await storage.setItem(LANG_KEY, newLang);
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, isLangLoading }}>
    {children}
    </LanguageContext.Provider>
);
};

export const useLanguage = () => useContext(LanguageContext);