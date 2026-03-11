import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';
import { storage } from '../lib/storage';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

interface UseSettingsProps {
    onOpenPinChange: () => void;
    onOpenBluetooth: () => void;
    onOpenSupport: () => void;
}

export const useSettingsScreen = ({ onOpenPinChange, onOpenBluetooth, onOpenSupport }: UseSettingsProps) => {
    const { t } = useTranslation();

    const { profile, refreshProfile } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const { isDark, toggleTheme } = useTheme();
    const { language, changeLanguage } = useLanguage();
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempAvatar, setTempAvatar] = useState('');

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
            Alert.alert(t('screens.common.error'), t('logs.errors.settings.name_short'));
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
            let errorMsg = t('logs.errors.settings.save_failed') as string;
            if (e.message && (e.message.includes('fetch') || e.message.includes('network'))) {
                errorMsg = t('logs.errors.auth.server_connection') as string;
            }
            Alert.alert(t('screens.common.error'), errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        userProfile: {
            name: profile?.full_name || t('screens.settings.default_name'),
            role: profile?.role || t('screens.settings.default_role'),
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

        handleFAQ: onOpenSupport,

        handleExport: () => Alert.alert(t('screens.settings.export_title'), t('screens.settings.export_msg'))
    };
};