import { useState, useEffect, useRef } from 'react';
import { Alert, Keyboard, BackHandler, ToastAndroid } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';
import { TabType } from '../views/layout/Footer';
import { useKeepAwake } from 'expo-keep-awake';
// @ts-ignore
import { SessionTabType } from '../views/screens/SessionsScreen';
import { useTranslation } from 'react-i18next';

export type AppTab = TabType | 'TOOLS' | 'SETTINGS';
const PIN_SALT = "tempo_metrics_secure_v1";

export const useAppLogic = () => {
    useKeepAwake();
    const { t } = useTranslation();

    const { profile, refreshProfile, logout } = useUser();

    const [currentTab, setCurrentTab] = useState<AppTab>('HOME');
    const [sessionsInitialTab, setSessionsInitialTab] = useState<SessionTabType | undefined>(undefined);

    const [isPinModalVisible, setPinModalVisible] = useState(false);
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isPinLoading, setIsPinLoading] = useState(false);
    const [navParams, setNavParams] = useState<any>(null);
    const [pinError, setPinError] = useState<string | null>(null);

    const [homeActiveTool, setHomeActiveTool] = useState<string | null>(null);

    const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);

    const exitAppPromptRef = useRef(false);

    const handleLogout = () => {
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

    const handleNavigate = (tab: AppTab | 'SPEEDCHECK', params?: any) => {
        if (tab === 'SPEEDCHECK') {
            setSessionsInitialTab(undefined);
            setNavParams(null);
            setCurrentTab('HOME');
            setHomeActiveTool('SPEEDCHECK');
            return;
        }

        if (tab === 'HOME') {
            setHomeActiveTool(null);
        }

        if (tab === 'SESSIONS') {
            setSessionsInitialTab(params?.subTab);
            setNavParams(params);
        } else {
            setSessionsInitialTab(undefined);
            setNavParams(null);
        }
        setCurrentTab(tab as AppTab);
    };
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

    useEffect(() => {
        const handleBackPress = () => {
            if (isPinModalVisible) {
                setPinModalVisible(false);
                return true;
            }

            if (currentTab === 'SESSIONS') {
                if (sessionDetailsOpen) {
                    setSessionDetailsOpen(false);
                    return true;
                } else {
                    handleNavigate('HOME');
                    return true;
                }
            }

            if (currentTab === 'TOOLS') {
                handleNavigate('SETTINGS');
                return true;
            }

            if (currentTab === 'HOME' && homeActiveTool !== null) {
                setHomeActiveTool(null);
                return true;
            }

            if (currentTab !== 'HOME') {
                handleNavigate('HOME');
                return true;
            }

            if (exitAppPromptRef.current) {
                BackHandler.exitApp();
                return false;
            }

            exitAppPromptRef.current = true;
            ToastAndroid.show(
                t('screens.app.press_back_again_to_exit', 'Натисніть ще раз, щоб вийти'),
                ToastAndroid.SHORT
            );

            setTimeout(() => {
                exitAppPromptRef.current = false;
            }, 2000);

            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => backHandler.remove();
    }, [currentTab, navParams, isPinModalVisible, homeActiveTool, sessionDetailsOpen]);

    const handleSubmitPinChange = async () => {
        setPinError(null);

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
            const { error: authError } = await supabase.auth.updateUser({
                password: `${newPin}${PIN_SALT}`
            });

            if (authError) throw authError;

            const { error: profileError } = await authService.updateCurrentProfile({
                pin_code: newPin
            });

            if (profileError) throw profileError;

            console.log("✅ PIN та Пароль оновлено успішно");
            await refreshProfile();

            Keyboard.dismiss();
            setPinModalVisible(false);

            Alert.alert(
                t('screens.app.pin_success_title'),
                t('screens.app.pin_success_msg')
            );

        } catch (e: any) {
            console.error("❌ PIN Update Error:", e.message);

            let finalErrorMsg = t('logs.errors.app.pin_update_failed') as string;
            if (e.message) {
                const msg = e.message.toLowerCase();
                if (msg.includes('fetch') || msg.includes('network')) {
                    finalErrorMsg = t('logs.errors.auth.server_connection') as string;
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
        handleLogout, handleNavigate, handleOpenPinModal, handleSubmitPinChange,
        homeActiveTool, setHomeActiveTool,
        sessionDetailsOpen, setSessionDetailsOpen
    };
};