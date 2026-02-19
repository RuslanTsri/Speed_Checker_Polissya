import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import NetInfo from '@react-native-community/netinfo'; // 🔥 Додали імпорт
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';
import { TabType } from '../views/layout/Footer';
// @ts-ignore
import { SessionTabType } from '../views/screens/SessionsScreen';

export type AppTab = TabType | 'TOOLS' | 'SETTINGS';
const PIN_SALT = "tempo_metrics_secure_v1";

export const useAppLogic = () => {
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

    const [pinError, setPinError] = useState<string | null>(null);

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
        setPinError(null);
        setPinModalVisible(true);
    };

    const clearPinError = () => {
        if (pinError) setPinError(null);
    };

    const handleSubmitPinChange = async () => {
        setPinError(null);

        // 🔥 ПЕРЕВІРКА ІНТЕРНЕТУ (Зміна пароля не працює офлайн!)
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            setPinError("Зміна PIN-коду потребує підключення до Інтернету");
            return;
        }

        if (oldPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
            setPinError("Всі поля мають містити 4 цифри");
            return;
        }

        if (profile?.pin_code && oldPin !== profile.pin_code) {
            setPinError("Поточний PIN-код введено невірно");
            return;
        }

        if (newPin !== confirmPin) {
            setPinError("Нові PIN-коди не співпадають");
            return;
        }

        if (oldPin === newPin) {
            setPinError("Новий PIN має відрізнятися від старого");
            return;
        }

        setIsPinLoading(true);

        try {
            // 1. Оновлюємо ПАРОЛЬ в системі аутентифікації Supabase
            const { error: authError } = await supabase.auth.updateUser({
                password: `${newPin}${PIN_SALT}`
            });

            if (authError) throw authError;

            // 2. Оновлюємо ПІН у таблиці профілів
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
            setPinError(e.message || "Не вдалося змінити PIN");
        } finally {
            setIsPinLoading(false);
        }
    };

    return {
        currentTab, sessionsInitialTab,
        isPinModalVisible, setPinModalVisible,
        oldPin, setOldPin: (text: string) => { setOldPin(text); clearPinError(); },
        newPin, setNewPin: (text: string) => { setNewPin(text); clearPinError(); },
        confirmPin, setConfirmPin: (text: string) => { setConfirmPin(text); clearPinError(); },
        isPinLoading, pinError,
        handleLogout, handleNavigate, handleOpenPinModal, handleSubmitPinChange
    };
};