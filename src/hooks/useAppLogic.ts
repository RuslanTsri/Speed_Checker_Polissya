import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';
import { TabType } from '../views/layout/Footer';
// @ts-ignore
import { SessionTabType } from '../views/screens/SessionsScreen';
import { useTranslation } from 'react-i18next'; // 🔥 Додали імпорт

export type AppTab = TabType | 'TOOLS' | 'SETTINGS';
const PIN_SALT = "tempo_metrics_secure_v1";

export const useAppLogic = () => {
    // 🔥 Підключаємо обидва словники
    const { t } = useTranslation();

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
    const [navParams, setNavParams] = useState<any>(null);
    const [pinError, setPinError] = useState<string | null>(null);

    const handleLogout = () => {
        // 🔥 Локалізований Alert
        Alert.alert(
            t('screens.app.logout_title'),
            t('screens.app.logout_msg'),
            [
                { text: t('screens.app.btn_cancel'), style: "cancel" },
                {
                    text: t('screens.app.btn_logout'),
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        setCurrentTab('HOME');
                    }
                }
            ]
        );
    };

    const handleNavigate = (tab: AppTab, params?: any) => {
        if (tab === 'SESSIONS') {
            setSessionsInitialTab(params?.subTab);
            setNavParams(params);
        } else {
            setSessionsInitialTab(undefined);
            setNavParams(null);
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

        // 🔥 ПЕРЕВІРКА ІНТЕРНЕТУ
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            setPinError(t('logs.errors.app.no_internet_pin') as string);
            return;
        }

        if (oldPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
            setPinError(t('logs.errors.app.pin_length') as string);
            return;
        }

        if (profile?.pin_code && oldPin !== profile.pin_code) {
            setPinError(t('logs.errors.app.pin_incorrect') as string);
            return;
        }

        if (newPin !== confirmPin) {
            setPinError(t('logs.errors.app.pin_mismatch') as string);
            return;
        }

        if (oldPin === newPin) {
            setPinError(t('logs.errors.app.pin_same') as string);
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

            // 🔥 Локалізований Alert про успіх
            Alert.alert(
                t('screens.app.pin_success_title'),
                t('screens.app.pin_success_msg')
            );

        } catch (e: any) {
            console.error("❌ PIN Update Error:", e.message);

            // 🔥 Перехоплюємо сирі помилки Supabase
            let finalErrorMsg = t('logs.errors.app.pin_update_failed') as string;
            if (e.message) {
                const msg = e.message.toLowerCase();
                if (msg.includes('fetch') || msg.includes('network')) {
                    finalErrorMsg = t('logs.errors.auth.server_connection') as string; // Беремо з auth
                }
            }
            setPinError(finalErrorMsg);
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
        isPinLoading, pinError, navParams,
        handleLogout, handleNavigate, handleOpenPinModal, handleSubmitPinChange
    };
};