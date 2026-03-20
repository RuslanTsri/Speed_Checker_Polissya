import { useState } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

export type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'error';

export const useOTAUpdate = () => {
    const [status, setStatus] = useState<UpdateStatus>('idle');

    const checkForUpdates = async () => {
        // ОТА оновлення не працюють в режимі розробника (Expo Go)
        if (__DEV__) {
            Alert.alert("Інфо", "Оновлення 'по повітрю' працюють лише у зібраному додатку (APK/AAB), а не в Expo Go.");
            return;
        }

        try {
            setStatus('checking');
            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                setStatus('downloading');
                await Updates.fetchUpdateAsync();
                setStatus('ready');

                Alert.alert(
                    "Оновлення готове",
                    "Нова версія успішно завантажена. Перезапустити програму зараз?",
                    [
                        { text: "Пізніше", style: "cancel", onPress: () => setStatus('ready') },
                        { text: "Перезапустити", onPress: () => Updates.reloadAsync() }
                    ]
                );
            } else {
                setStatus('idle');
                Alert.alert("Оновлень немає", "У вас встановлена найновіша версія програми. 🎉");
            }
        } catch (error) {
            console.error("Помилка оновлення:", error);
            setStatus('error');
            Alert.alert("Помилка", "Не вдалося перевірити оновлення. Перевірте з'єднання з інтернетом.");

            // Повертаємось в режим очікування через 3 секунди
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const restartApp = async () => {
        await Updates.reloadAsync();
    };

    return { status, checkForUpdates, restartApp };
};