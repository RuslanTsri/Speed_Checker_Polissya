import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';
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
        setPinError(null); // Очищаємо старі помилки при відкритті
        setPinModalVisible(true);
    };

    // Допоміжна функція: очищає помилку, коли юзер щось вводить
    const clearPinError = () => {
        if (pinError) setPinError(null);
    };

    const handleSubmitPinChange = async () => {
        setPinError(null); // Скидаємо перед перевіркою

        // 1. Валідація заповнення
        if (oldPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
            setPinError("Всі поля мають містити 4 цифри");
            return;
        }

        // 2. Перевірка старого PIN (порівнюємо з тим, що прийшло з бази в профілі)
        // Якщо в профілі ще немає піна (null), пропускаємо цей крок
        if (profile?.pin_code && oldPin !== profile.pin_code) {
            setPinError("Поточний PIN-код введено невірно");
            return;
        }

        // 3. Перевірка ідентичності нових значень
        if (newPin !== confirmPin) {
            setPinError("Нові PIN-коди не співпадають");
            return;
        }

        // 4. Заборона ставити той самий пін
        if (oldPin === newPin) {
            setPinError("Новий PIN має відрізнятися від старого");
            return;
        }

        setIsPinLoading(true);

        try {
            // 1. Оновлюємо ПАРОЛЬ в системі аутентифікації Supabase (для входу)
            const { error: authError } = await supabase.auth.updateUser({
                password: `${newPin}${PIN_SALT}`
            });

            if (authError) throw authError;

            // 2. Оновлюємо ПІН у таблиці профілів (для перевірки всередині додатка)
            const { error: profileError } = await authService.updateCurrentProfile({
                pin_code: newPin
            });

            if (profileError) throw profileError;

            console.log("✅ PIN та Пароль оновлено успішно");
            await refreshProfile(); // Оновлюємо глобальний контекст

            Keyboard.dismiss();
            setPinModalVisible(false);
            Alert.alert("Успіх", "PIN-код успішно змінено!");

        } catch (e: any) {
            console.error("❌ PIN Update Error:", e.message);
            // Виводимо помилку в червоний блок
            setPinError(e.message || "Не вдалося змінити PIN");
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
        oldPin,
        setOldPin: (text: string) => { setOldPin(text); clearPinError(); }, // 🔥 Авто-очищення помилки
        newPin,
        setNewPin: (text: string) => { setNewPin(text); clearPinError(); },
        confirmPin,
        setConfirmPin: (text: string) => { setConfirmPin(text); clearPinError(); },

        isPinLoading,
        pinError, // 👈 Експортуємо помилку в UI

        // Handlers
        handleLogout,
        handleNavigate,
        handleOpenPinModal,
        handleSubmitPinChange
    };
};