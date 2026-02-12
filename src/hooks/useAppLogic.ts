import { useState } from 'react';
import { Alert, Keyboard } from 'react-native';
import { TabType } from '../views/layout/Footer';
// @ts-ignore
import { SessionTabType } from '../views/screens/SessionsScreen';

export type AppTab = TabType | 'TOOLS' | 'SETTINGS';

export const useAppLogic = () => {
    // --- AUTH & NAV STATE ---
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentTab, setCurrentTab] = useState<AppTab>('HOME');
    const [sessionsInitialTab, setSessionsInitialTab] = useState<SessionTabType | undefined>(undefined);

    // --- PIN STATE ---
    const [isPinModalVisible, setPinModalVisible] = useState(false);
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    const OLD_PIN_MOCK = "1111";

    // --- ACTIONS ---

    const handleLogin = () => setIsLoggedIn(true);

    const handleLogout = () => {
        setIsLoggedIn(false);
        setCurrentTab('HOME');
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

    const handleSubmitPinChange = () => {
        if (oldPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
            Alert.alert("Помилка", "Всі поля мають містити 4 цифри");
            return;
        }
        if (oldPin !== OLD_PIN_MOCK) {
            Alert.alert("Помилка", "Невірний старий PIN-код");
            return;
        }
        if (newPin !== confirmPin) {
            Alert.alert("Помилка", "Нові PIN-коди не співпадають");
            return;
        }

        Keyboard.dismiss();
        setPinModalVisible(false);
        Alert.alert("Успіх", "PIN-код успішно змінено!");
    };

    return {
        // State
        isLoggedIn,
        currentTab,
        sessionsInitialTab,

        // Pin State
        isPinModalVisible, setPinModalVisible,
        oldPin, setOldPin,
        newPin, setNewPin,
        confirmPin, setConfirmPin,

        // Handlers
        handleLogin,
        handleLogout,
        handleNavigate,
        handleOpenPinModal,
        handleSubmitPinChange
    };
};