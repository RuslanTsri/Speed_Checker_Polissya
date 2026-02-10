import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBle } from '../context/BleContext'; // Імпорт глобального стору

// --- ТИПИ ДАНИХ ---
export interface UserProfile {
    name: string;
    role: string;
    initials: string;
    avatar: string;
}

const STORAGE_KEYS = {
    PROFILE: 'user_profile_data',
    NOTIF: 'setting_notif',
    SOUND: 'setting_sound',
};

const DEFAULT_PROFILE: UserProfile = {
    name: "Руслан Цимбалюк",
    role: "Головний аналітик",
    initials: "РЦ",
    avatar: 'https://img.icons8.com/color/480/wolf.png',
};

export const useSettings = () => {
    const [isLoading, setIsLoading] = useState(true);

    // Стан налаштувань користувача
    const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
    const [isNotifEnabled, setIsNotifEnabled] = useState(true);
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);

    // 🔥 БЕРЕМО МЕТОДИ З ГЛОБАЛЬНОГО КОНТЕКСТУ BLUETOOTH
    // (Переконайтесь, що pingMaster додано в useTrainingBle.ts, як ми робили раніше)
    const {
        connected,
        pingMaster, // Наша функція для відправки CMD 22
        pingProgress, // Текст "Перевірка зв'язку..."
        state: bleState,
        device
    } = useBle();

    // ---------------------------------------------------------
    // 🔥 ФУНКЦІЯ: Перевірка зв'язку (ПІНГ МАСТЕРА)
    // ---------------------------------------------------------
    const checkMasterConnection = async () => {
        if (connected) {
            // Якщо підключено -> перевіряємо чи живий Мастер
            // Функція pingMaster сама встановить pingProgress
            const sent = await pingMaster();
            if (!sent) {
                // Якщо раптом пінг не пройшов (наприклад, device втрачено)
                Alert.alert("Помилка", "Не вдалося відправити команду на Master Node");
            }
        } else {
            // Якщо не підключено -> просто інформуємо
            Alert.alert("Інфо", "Система не підключена. Перейдіть в меню сканування.");
        }
    };

    // --- ЗАВАНТАЖЕННЯ ДАНИХ (AsyncStorage) ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileData, notifData, soundData] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
                    AsyncStorage.getItem(STORAGE_KEYS.NOTIF),
                    AsyncStorage.getItem(STORAGE_KEYS.SOUND),
                ]);

                if (profileData) setUserProfile(JSON.parse(profileData));
                if (notifData !== null) setIsNotifEnabled(JSON.parse(notifData));
                if (soundData !== null) setIsSoundEnabled(JSON.parse(soundData));
            } catch (e) {
                console.error("Load Error:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // --- ЗБЕРЕЖЕННЯ ПРОФІЛЮ ---
    const updateProfile = async (name: string, role: string, avatar: string) => {
        if (!name.trim()) {
            Alert.alert("Помилка", "Ім'я не може бути порожнім");
            return false;
        }
        const words = name.trim().split(' ');
        const newInitials = words.length > 1
            ? (words[0][0] + words[1][0]).toUpperCase()
            : words[0].substring(0, 2).toUpperCase();

        const newProfile = { name, role, initials: newInitials, avatar };
        try {
            setUserProfile(newProfile);
            await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
            return true;
        } catch (e) { return false; }
    };

    // --- ПЕРЕМИКАЧІ ---
    const toggleNotif = async () => {
        const newValue = !isNotifEnabled;
        setIsNotifEnabled(newValue);
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIF, JSON.stringify(newValue));
    };

    const toggleSound = async () => {
        const newValue = !isSoundEnabled;
        setIsSoundEnabled(newValue);
        await AsyncStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(newValue));
    };

    const clearCache = async () => {
        await AsyncStorage.clear();
        setUserProfile(DEFAULT_PROFILE);
        setIsNotifEnabled(true);
        setIsSoundEnabled(false);
        Alert.alert("Успіх", "Налаштування скинуто");
    };

    return {
        isLoading,
        userProfile,
        isNotifEnabled,
        isSoundEnabled,
        updateProfile,
        toggleNotif,
        toggleSound,
        clearCache,

        // Експортуємо логіку Bluetooth для UI
        checkMasterConnection,
        bleStatus: {
            connected,
            pingProgress, // Текст прогресу ("Перевірка...")
            state: bleState,
            deviceName: device?.name
        }
    };
};