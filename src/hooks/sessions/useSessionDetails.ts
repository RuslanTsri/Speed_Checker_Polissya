import { useState, useEffect, useMemo } from 'react';
import { TeamSession } from './useSessionsData';
import { useCSV } from '../useCSV';
import { Alert } from "react-native";
import { resultsService } from '../../services/resultsService'; // 🔥 Використовуємо сервіс
import { syncManager } from '../../services/SyncManager'; // 🔥 Слухаємо офлайн-чергу

interface PlayerStats {
    id: string;
    playerName: string;
    number: string;
    bestTime: number;
    maxSpeed: number;
    attemptsCount: number;
}

export const useSessionDetails = (session: TeamSession) => {
    const [subTab, setSubTab] = useState<'BEST' | 'ALL'>('BEST');
    const [roundFilter, setRoundFilter] = useState<'ALL' | number>('ALL');
    const [rawResults, setRawResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { exportResultsToCSV } = useCSV();

    const loadTeamResults = async () => {
        if (!session?.id) return;
        setIsLoading(true);

        // 🔥 Використовуємо наш сервіс, який сам дістане і з кешу, і з бази, і з черги
        const { data, error } = await resultsService.getByTeam(session.id);
        if (!error && data) {
            // Дані вже відформатовані сервісом, просто зберігаємо
            setRawResults(data);
        } else {
            setRawResults([]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadTeamResults();
    }, [session.id]);

    // 🔥 АВТО-ОНОВЛЕННЯ ПІСЛЯ СИНХРОНІЗАЦІЇ
    useEffect(() => {
        const unsubscribe = syncManager.subscribe(() => {
            if (!syncManager.getIsSyncing()) {
                console.log("♻️ [useSessionDetails] Синхронізація завершена, оновлюємо...");
                loadTeamResults();
            }
        });
        return unsubscribe;
    }, [session.id]);

    const groupedPlayers = useMemo(() => {
        const playersMap = new Map<string, PlayerStats>();

        rawResults.forEach((res) => {
            // Сервіс віддає 'playerName' і 'time', підлаштовуємось під це
            if (!playersMap.has(res.id)) { // Використовуємо id запису як ключ, якщо немає playerId
                playersMap.set(res.id, {
                    id: res.id,
                    playerName: res.playerName,
                    number: res.playerNumber || '-',
                    bestTime: res.time,
                    maxSpeed: 0,
                    attemptsCount: 1
                });
            } else {
                const player = playersMap.get(res.id)!;
                player.attemptsCount += 1;
                if (res.time < player.bestTime) {
                    player.bestTime = res.time;
                }
            }
        });

        return Array.from(playersMap.values()).sort((a, b) => a.bestTime - b.bestTime);
    }, [rawResults]);

    const sessionStats = useMemo(() => {
        if (rawResults.length === 0) return { best: 0, avg: 0 };
        const times = rawResults.map(r => r.time);
        const best = Math.min(...times);
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        return { best, avg };
    }, [rawResults]);

    const handleExport = async () => {
        console.log("=== EXPORT ATTEMPT ===");
        if (rawResults.length === 0) {
            Alert.alert("Увага", "Дані відсутні");
            return;
        }
        try {
            await exportResultsToCSV(rawResults, session.teamName);
        } catch (err) {
            console.error("Export handler error:", err);
        }
    };

    return {
        subTab, setSubTab,
        roundFilter, setRoundFilter,
        rounds: [],
        filteredAttempts: rawResults,
        sortedResults: groupedPlayers,
        handleExport,
        sessionStats,
        isLoading
    };
};