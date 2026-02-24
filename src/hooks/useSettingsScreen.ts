import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';
import { storage } from '../lib/storage';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import i18n from "i18next";

interface UseSettingsProps {
    onOpenPinChange: () => void;
    onOpenBluetooth: () => void;
}

export const useSettingsScreen = ({ onOpenPinChange, onOpenBluetooth }: UseSettingsProps) => {
    const { profile, refreshProfile } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    // 🔥 Беремо тему та функцію перемикання з нашого контексту
    const { isDark, toggleTheme } = useTheme();
    const { language, changeLanguage } = useLanguage();
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempAvatar, setTempAvatar] = useState('');

    // Додали стейт для сповіщень, якого не вистачало раніше
    const [isNotifEnabled, setIsNotifEnabled] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            const savedNotif = await storage.getItem('app_notifications');
            if (savedNotif !== null) {
                setIsNotifEnabled(savedNotif === 'true');
            }
        };
        loadSettings();
    }, []);

    const handleToggleNotif = async (newValue: boolean) => {
        setIsNotifEnabled(newValue);
        await storage.setItem('app_notifications', String(newValue));
    };
    const toggleLanguage = () => {
        const nextLang = language === 'uk' ? 'en' : 'uk';
        changeLanguage(nextLang);
    };
    const openEditModal = () => {
        setTempName(profile?.full_name || '');
        setTempAvatar(profile?.avatar_url || '');
        setEditModalVisible(true);
    };

    const handleSaveProfile = async () => {
        const cleanName = tempName.trim();
        if (cleanName.length < 2) {
            Alert.alert("Помилка", "Ім'я занадто коротке");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await authService.updateCurrentProfile({
                full_name: cleanName,
                avatar_url: tempAvatar
            });

            if (error) throw error;
            await refreshProfile();
            setEditModalVisible(false);
        } catch (e: any) {
            Alert.alert("Помилка", e.message || "Не вдалося зберегти зміни");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        userProfile: {
            name: profile?.full_name || 'Тренер',
            role: profile?.role || 'COACH',
            avatar: profile?.avatar_url || 'https://img.icons8.com/color/480/coach.png'
        },
        isNotifEnabled,
        toggleNotif: handleToggleNotif,
        isDark,
        setIsDarkMode: toggleTheme,
        isEditModalVisible,
        setEditModalVisible,
        tempName, setTempName,
        tempAvatar, setTempAvatar,
        openEditModal,
        toggleLanguage,
        handleSaveProfile,
        currentLang: language,
        handleConnectionPress: onOpenBluetooth,
        startPinChange: onOpenPinChange,
        handleFAQ: () => Alert.alert("FAQ", "Розділ у розробці"),
        handleExport: () => Alert.alert("Експорт", "Формування PDF...")
    };
};