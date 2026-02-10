import { useState, useEffect, useRef } from 'react';
import { Alert, Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

import { useBle } from '../context/BleContext';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
})
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

    // 🔥 БЕРЕМО ДАНІ З BLE
    const {
        connected,
        pingMaster,
        pingProgress,
        state: bleState,
        finalTime,
        device
    } = useBle();

    const prevStateRef = useRef(bleState);

    // ---------------------------------------------------------
    //СЛУХАЧ ФІНІШУ
    // ---------------------------------------------------------
    useEffect(() => {
        const handleFinishEvent = async () => {
            // Перевіряємо: якщо поточний стан "finished", а попередній БУВ НЕ "finished"
            if (bleState === 'finished' && prevStateRef.current !== 'finished') {
                console.log("🏁 Фініш зафіксовано в налаштуваннях!");

                if (isSoundEnabled) {
                    try {
                        console.log("🔊 Програвання звуку...");
                        Vibration.vibrate([0, 500, 200, 500]);

                        // Варіант Б: Ваш MP3 файл (розкоментуйте, якщо додали файл в assets)
                        /*
                        const { sound } = await Audio.Sound.createAsync(
                            require('../../assets/sounds/finish_beep.mp3')
                        );
                        await sound.playAsync();
                        */
                    } catch (error) {
                        console.log("Помилка звуку:", error);
                    }
                }

                if (isNotifEnabled) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "🏁 Фініш!",
                            body: `Гравець завершив заїзд!`,
                            sound: true,
                        },
                        trigger: null, // null = відправити миттєво
                    });
                }
            }
            // Оновлюємо реф для наступної перевірки
            prevStateRef.current = bleState;
        };

        handleFinishEvent();
    }, [bleState, finalTime, isNotifEnabled, isSoundEnabled]); // Слідкуємо за цими змінними


    // ---------------------------------------------------------
    // ФУНКЦІЯ: Перевірка зв'язку (ПІНГ МАСТЕРА)
    // ---------------------------------------------------------
    const checkMasterConnection = async () => {
        if (connected) {
            const sent = await pingMaster();
            if (!sent) {
                Alert.alert("Помилка", "Не вдалося відправити команду на Master Node");
            }
        } else {
            Alert.alert("Інфо", "Система не підключена. Перейдіть в меню сканування.");
        }
    };

    // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
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

                // 🔥 Запитуємо дозвіл на сповіщення при старті додатка (Android/iOS)
                const { status } = await Notifications.getPermissionsAsync();
                if (status !== 'granted') {
                    await Notifications.requestPermissionsAsync();
                }

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
            pingProgress,
            state: bleState,
            deviceName: device?.name
        }
    };
};