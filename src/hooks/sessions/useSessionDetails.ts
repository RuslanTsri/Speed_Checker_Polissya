import { useState, useEffect, useMemo } from 'react';
import { TeamSession } from './useSessionsData';
import { useCSV } from '../useCSV';
import { Alert } from "react-native";
import { useTranslation } from 'react-i18next';
import { resultsService } from '../../services/resultsService';
import { syncManager } from '../../services/SyncManager';

interface PlayerStats {
    id: string; playerName: string; number: string; bestTime: number; maxSpeed: number; attemptsCount: number;
}

export const useSessionDetails = (session: TeamSession) => {
    const { t } = useTranslation();
    const [subTab, setSubTab] = useState<'BEST' | 'ALL'>('BEST');
    const [roundFilter, setRoundFilter] = useState<'ALL' | number>('ALL');
    const [rawResults, setRawResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const predefinedDistances = [30, 60, 100];
    const [selectedDistance, setSelectedDistance] = useState<number>(30);

    const { exportResultsToCSV } = useCSV();

    const loadTeamResults = async () => {
        if (!session?.id) return;
        setIsLoading(true);
        const { data, error } = await resultsService.getByTeam(session.id);
        if (!error && data) setRawResults(data);
        else setRawResults([]);
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

    const groupedPlayers = useMemo(() => {
        const playersMap = new Map<string, PlayerStats>();
        resultsFilteredByDistance.forEach((res) => {
            const key = res.playerId || res.playerName;
            if (!playersMap.has(key)) {
                playersMap.set(key, { id: res.id, playerName: res.playerName, number: res.playerNumber || '-', bestTime: res.time, maxSpeed: 0, attemptsCount: 1 });
            } else {
                const player = playersMap.get(key)!;
                player.attemptsCount += 1;
                if (res.time < player.bestTime) { player.bestTime = res.time; player.id = res.id; }
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
        try { await exportResultsToCSV(rawResults, session.teamName); } catch (err) { console.error("Export handler error:", err); }
    };

    return {
        subTab, setSubTab, roundFilter, setRoundFilter, selectedDistance, setSelectedDistance, predefinedDistances, rounds: [],
        filteredAttempts: rawResults, sortedResults: groupedPlayers, handleExport, sessionStats, isLoading
    };
};