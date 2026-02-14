import { useState } from 'react';
import { Alert } from 'react-native';
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';

interface UseSettingsProps {
    onOpenPinChange: () => void;
    onOpenBluetooth: () => void;
}

export const useSettingsScreen = ({ onOpenPinChange, onOpenBluetooth }: UseSettingsProps) => {
    const { profile, refreshProfile } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [isEditModalVisible, setEditModalVisible] = useState(false);

    // Тимчасові стани для редагування
    const [tempName, setTempName] = useState('');
    const [tempAvatar, setTempAvatar] = useState('');

    // Налаштування системи (локальні)
    const [isNotifEnabled, setIsNotifEnabled] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Відкриття модалки
    const openEditModal = () => {
        setTempName(profile?.full_name || '');
        setTempAvatar(profile?.avatar_url || '');
        setEditModalVisible(true);
    };

    // --- ЄДИНА ФУНКЦІЯ ЗБЕРЕЖЕННЯ ---
    const handleSaveProfile = async () => {
        const cleanName = tempName.trim();

        if (cleanName.length < 2) {
            Alert.alert("Помилка", "Ім'я занадто коротке");
            return;
        }

        setIsLoading(true);
        console.log("💾 [Settings] Saving profile...");

        try {
            // Оновлюємо тільки ім'я та аватар (роль не чіпаємо)
            const { error } = await authService.updateCurrentProfile({
                full_name: cleanName,
                avatar_url: tempAvatar
            });

            if (error) throw error;

            console.log("✅ [Settings] Saved to Supabase");

            // Важливо: оновлюємо глобальний контекст
            await refreshProfile();

            setEditModalVisible(false);
            // Alert.alert("Успіх", "Профіль оновлено! 🚀"); // Можна прибрати, щоб не дратувати юзера
        } catch (e: any) {
            console.error("❌ [Settings] Save Error:", e.message);
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
        isDarkMode,
        setIsDarkMode,
        toggleNotif: () => setIsNotifEnabled(!isNotifEnabled),
        isEditModalVisible,
        setEditModalVisible,
        tempName, setTempName,
        tempAvatar, setTempAvatar,
        openEditModal,
        handleSaveProfile,
        handleConnectionPress: onOpenBluetooth,
        startPinChange: onOpenPinChange,
        handleFAQ: () => Alert.alert("FAQ", "Розділ у розробці"),
        handleExport: () => Alert.alert("Експорт", "Формування PDF...")
    };
};