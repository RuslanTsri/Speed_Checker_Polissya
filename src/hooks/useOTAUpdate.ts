import { useState, useCallback, useEffect, useRef } from 'react';
import * as Updates from 'expo-updates';

export type UpdateStatus = 'idle' | 'checking' | 'ready' | 'downloading' | 'error' | 'up-to-date';

export interface UpdateInfo {
    message: string;
    id: string;
    date: string;
}

export const useOTAUpdate = () => {
    const [status, setStatus] = useState<UpdateStatus>('idle');
    const [updateMetadata, setUpdateMetadata] = useState<UpdateInfo | null>(null);
    // Додаємо стейт для збереження тексту помилки
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const checkForUpdates = useCallback(async () => {
        if (status === 'checking' || status === 'downloading') return;

        if (__DEV__) {
            setStatus('checking');
            setTimeout(() => setStatus('up-to-date'), 1500);
            return;
        }

        try {
            setStatus('checking');
            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                const manifest: any = update.manifest;
                const publishDate = manifest?.createdAt
                    ? new Date(manifest.createdAt).toLocaleDateString('uk-UA', {
                        day: '2-digit', month: 'long', year: 'numeric'
                    })
                    : 'Невідомо';

                setUpdateMetadata({
                    message: manifest?.extra?.expoUpdates?.message || "Покращення стабільності та виправлення помилок",
                    id: (update as any).updateId?.substring(0, 8) || 'N/A',
                    date: publishDate
                });

                setStatus('ready');
            } else {
                setStatus('up-to-date');
            }
        } catch (error: any) {
            console.error("OTA Check Error:", error);
            // Зберігаємо текст помилки і статус, таймер більше не скидає його автоматично
            setErrorDetails(error.message || String(error));
            setStatus('error');
        }
    }, [status]);

    const downloadAndRestart = async () => {
        try {
            setStatus('downloading');
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
        } catch (error: any) {
            console.error("OTA Download Error:", error);
            setErrorDetails(error.message || String(error));
            setStatus('error');
        }
    };

    const resetStatus = useCallback(() => {
        setStatus('idle');
        setUpdateMetadata(null);
        setErrorDetails(null); // Очищаємо помилку при закритті модалки
    }, []);

    return {
        status,
        updateMetadata,
        errorDetails, // Повертаємо помилку для UI
        checkForUpdates,
        downloadAndRestart,
        resetStatus
    };
};