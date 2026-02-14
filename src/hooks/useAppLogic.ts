import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';
import { TabType } from '../views/layout/Footer';
// @ts-ignore
import { SessionTabType } from '../views/screens/SessionsScreen';
import { supabase } from '../lib/supabase';
export type AppTab = TabType | 'TOOLS' | 'SETTINGS';
const PIN_SALT = "tempo_metrics_secure_v1";
export const useAppLogic = () => {
    // 🔥 Отримуємо дані та методи з глобального контексту користувача
    const { profile, refreshProfile, logout } = useUser();

    // --- NAV STATE ---
    const [currentTab, setCurrentTab] = useState<AppTab>('HOME');
    const [sessionsInitialTab, setSessionsInitialTab] = useState<SessionTabType | undefined>(undefined);

    // --- PIN STATE ---
    const [isPinModalVisible, setPinModalVisible] = useState(false);
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isPinLoading, setIsPinLoading] = useState(false);

    // --- ACTIONS ---

    const handleLogout = () => {
        Alert.alert("Вихід", "Ви впевнені, що хочете вийти з акаунту?", [
            { text: "Скасувати", style: "cancel" },
            {
                text: "Вийти",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    setCurrentTab('HOME');
                }
            }
        ]);
    };

    const handleNavigate = (tab: AppTab, params?: any) => {
        if (tab === 'SESSIONS') {
            setSessionsInitialTab(params?.subTab);
        } else {
            setSessionsInitialTab(undefined);
        }
        setCurrentTab(tab);
    };

    // --- PIN ACTIONS ---

    const handleOpenPinModal = () => {
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
        setPinModalVisible(true);
    };

    const handleSubmitPinChange = async () => {
        // 1. Валідація заповнення
        if (oldPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
            Alert.alert("Помилка", "Всі поля мають містити 4 цифри");
            return;
        }

        // 2. Перевірка старого PIN (порівнюємо з тим, що прийшло з бази в профілі)
        // Якщо в профілі ще немає піна (null), пропускаємо цей крок
        if (profile?.pin_code && oldPin !== profile.pin_code) {
            Alert.alert("Помилка", "Невірний поточний PIN-код");
            return;
        }

        setIsPinLoading(true);

        try {
            // 1. Оновлюємо ПАРОЛЬ в системі аутентифікації Supabase
            // Саме це дозволить увійти з новим піном наступного разу
            const { error: authError } = await supabase.auth.updateUser({
                password: `${newPin}${PIN_SALT}`
            });

            if (authError) throw authError;

            // 2. Оновлюємо ПІН у таблиці профілів (для відображення та перевірки всередині)
            const { error: profileError } = await authService.updateCurrentProfile({
                pin_code: newPin
            });

            if (profileError) throw profileError;

            console.log("✅ PIN та Пароль оновлено успішно");
            await refreshProfile();

            Keyboard.dismiss();
            setPinModalVisible(false);
            Alert.alert("Успіх", "PIN-код успішно змінено!");

        } catch (e: any) {
            console.error("❌ PIN Update Error:", e.message);
            Alert.alert("Помилка", "Не вдалося змінити PIN: " + e.message);
        } finally {
            setIsPinLoading(false);
        }
    };

    return {
        // State
        currentTab,
        sessionsInitialTab,

        // Pin State
        isPinModalVisible, setPinModalVisible,
        oldPin, setOldPin,
        newPin, setNewPin,
        confirmPin, setConfirmPin,
        isPinLoading,

        // Handlers
        handleLogout,
        handleNavigate,
        handleOpenPinModal,
        handleSubmitPinChange
    };
};