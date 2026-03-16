import { useState, useEffect, useMemo } from 'react';
import { TeamSession } from './useSessionsData';
import { useCSV } from '../useCSV';
import { Alert } from "react-native";
import { useTranslation } from 'react-i18next';
import { resultsService } from '../../services/resultsService';
import { syncManager } from '../../services/SyncManager';

// 🔥 1. Додаємо splits та avgSplit до інтерфейсу
interface PlayerStats {
    id: string;
    playerName: string;
    number: string;
    bestTime: number;
    maxSpeed: number;
    attemptsCount: number;
    splits: number[]; // Додано
    avgSplit: number; // Додано
}

export const useSessionDetails = (session: TeamSession) => {
    const { t } = useTranslation();
    const [subTab, setSubTab] = useState<'BEST' | 'ALL'>('BEST');
    const [roundFilter, setRoundFilter] = useState<'ALL' | number>('ALL');
    const [rawResults, setRawResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const predefinedDistances = [30, 60, 100];
    const [selectedDistance, setSelectedDistance] = useState<number>(30);

    const { exportResultsToExcel } = useCSV();

    const loadTeamResults = async () => {
        if (!session?.id) return;
        setIsLoading(true);
        const { data, error } = await resultsService.getByTeam(session.id);

        if (!error && data) {
            // Додаємо розрахунок середнього спліту для кожної спроби
            const enhancedData = data.map(result => {
                const segments = (result.splits?.length || 0) + 1;
                return {
                    ...result,
                    avgSplit: result.time / segments
                };
            });
            setRawResults(enhancedData);
        } else {
            setRawResults([]);
        }
        setIsLoading(false);
    };

    useEffect(() => { loadTeamResults(); }, [session.id]);
    useEffect(() => {
        const unsubscribe = syncManager.subscribe(() => { if (!syncManager.getIsSyncing()) loadTeamResults(); });
        return unsubscribe;
    }, [session.id]);

    const resultsFilteredByDistance = useMemo(() => {
        return rawResults.filter(r => r.distance === selectedDistance);
    }, [rawResults, selectedDistance]);

    // 🔥 2. Оновлюємо логіку збереження найкращої спроби
    const groupedPlayers = useMemo(() => {
        const playersMap = new Map<string, PlayerStats>();
        resultsFilteredByDistance.forEach((res) => {
            const key = res.playerId || res.playerName;

            if (!playersMap.has(key)) {
                // Якщо це перша знайдена спроба гравця - записуємо її разом зі сплітами
                playersMap.set(key, {
                    id: res.id,
                    playerName: res.playerName,
                    number: res.playerNumber || '-',
                    bestTime: res.time,
                    maxSpeed: 0,
                    attemptsCount: 1,
                    splits: res.splits || [],    // Зберігаємо спліти
                    avgSplit: res.avgSplit || 0  // Зберігаємо середній спліт
                });
            } else {
                const player = playersMap.get(key)!;
                player.attemptsCount += 1;

                // Якщо знайдена спроба КРАЩА за збережену раніше - оновлюємо час І спліти
                if (res.time < player.bestTime) {
                    player.bestTime = res.time;
                    player.id = res.id;
                    player.splits = res.splits || [];   // Перезаписуємо спліти на кращі
                    player.avgSplit = res.avgSplit || 0; // Перезаписуємо середній спліт
                }
            }
        });
        return Array.from(playersMap.values()).sort((a, b) => a.bestTime - b.bestTime);
    }, [resultsFilteredByDistance]);

    const sessionStats = useMemo(() => {
        if (resultsFilteredByDistance.length === 0) return { best: 0, avg: 0 };
        const times = resultsFilteredByDistance.map(r => r.time);
        const best = Math.min(...times);
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        return { best, avg };
    }, [resultsFilteredByDistance]);

    const handleExport = async () => {
        if (rawResults.length === 0) {
            Alert.alert(t('tools.sessions.alert_attention') as string, t('tools.sessions.alert_no_data') as string);
            return;
        }
        try { await exportResultsToExcel(rawResults, session.teamName); } catch (err) { console.error("Export handler error:", err); }
    };

    const gateDistances = useMemo(() => {
        if (rawResults.length > 0 && rawResults[0].splits_config) {
            return rawResults[0].splits_config;
        }
        return [];
    }, [rawResults]);

    return {
        subTab, setSubTab, roundFilter, setRoundFilter, selectedDistance, setSelectedDistance, predefinedDistances, rounds: [],
        filteredAttempts: rawResults, sortedResults: groupedPlayers, handleExport, sessionStats, isLoading, gateDistances
    };
};