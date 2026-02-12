import { useState } from 'react';
import { Alert } from 'react-native';
import { useSettings } from './useSettings';

interface UseSettingsScreenProps {
    onOpenPinChange: () => void;
    onOpenBluetooth: () => void;
}

export const useSettingsScreen = ({ onOpenPinChange, onOpenBluetooth }: UseSettingsScreenProps) => {
    // 1. Отримуємо глобальні дані та методи з базового хука
    const {
        isLoading,
        userProfile,
        isNotifEnabled,
        isSoundEnabled,
        updateProfile,
        toggleNotif,
        toggleSound,
        checkMasterConnection,
        bleStatus
    } = useSettings();

    // 2. Локальний стан UI (те, що стосується лише цього екрану)
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempRole, setTempRole] = useState('');
    const [tempAvatar, setTempAvatar] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(true);

    // 3. Обчислювані значення для UI (Статус з'єднання)
    let connectionText = "Відключено";
    let connectionColor = "text-red-400";

    if (bleStatus.connected) {
        if (bleStatus.pingProgress) {
            connectionText = bleStatus.pingProgress;
            connectionColor = "text-yellow-400";
        } else {
            connectionText = bleStatus.deviceName || 'Підключено';
            connectionColor = "text-green-400";
        }
    }

    // 4. Обробники подій (Handlers)

    // Клік по статусу з'єднання
    const handleConnectionPress = () => {
        if (bleStatus.connected) {
            checkMasterConnection();
        } else {
            Alert.alert(
                "Bluetooth вимкнено",
                "Перейти до меню підключення?",
                [
                    { text: "Ні", style: "cancel" },
                    { text: "Так", onPress: onOpenBluetooth }
                ]
            );
        }
    };

    // Відкриття модалки редагування (ініціалізація полів)
    const openEditModal = () => {
        setTempName(userProfile.name);
        setTempRole(userProfile.role);
        setTempAvatar(userProfile.avatar);
        setEditModalVisible(true);
    };

    // Збереження профілю
    const handleSaveProfile = async () => {
        const success = await updateProfile(tempName, tempRole, tempAvatar);
        if (success) setEditModalVisible(false);
    };

    // Зміна ПІН-коду
    const startPinChange = () => {
        setEditModalVisible(false);
        // Невелика затримка, щоб модалка встигла закритись
        setTimeout(() => { onOpenPinChange(); }, 300);
    };

    const handleFAQ = () => {
        Alert.alert("FAQ", "Тут буде довідкова інформація та поширені запитання.");
    };

    const handleExport = () => {
        Alert.alert("Експорт", "Функція в розробці");
    };

    return {
        // Data
        isLoading,
        userProfile,
        bleStatus,
        connectionText,
        connectionColor,
        isNotifEnabled,
        isSoundEnabled,
        isDarkMode,

        // Modal & Form State
        isEditModalVisible,
        setEditModalVisible,
        tempName, setTempName,
        tempRole, setTempRole,
        tempAvatar, setTempAvatar,

        // Actions
        setIsDarkMode,
        toggleNotif,
        toggleSound,
        handleConnectionPress,
        openEditModal,
        handleSaveProfile,
        startPinChange,
        handleFAQ,
        handleExport
    };
};