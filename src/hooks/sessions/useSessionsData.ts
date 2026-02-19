import { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services/teamService';
import { resultsService } from '../../services/resultsService';
import { syncManager } from '../../services/SyncManager'; // 🔥 Додали імпорт

export interface GeneralSession {
    id: string;
    playerName: string;
    teamName: string;
    totalTime: number;
    avgSplit: number;
    date: string;
}

export interface TeamSession {
    id: string;
    teamName: string;
    playerCount: number;
    hasResults: boolean;
    testType?: string;
    date?: string;
    time?: string;
}

export const useSessionsData = (searchQuery: string) => {
    const [teamSessions, setTeamSessions] = useState<TeamSession[]>([]);
    const [generalSessions, setGeneralSessions] = useState<GeneralSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);

        // Тягнемо команди та результати (вони автоматично врахують офлайн-чергу)
        const { data: teamsData } = await teamService.getMyTeamsWithStatus();
        const { data: resultsData } = await resultsService.getRecentResults();

        if (teamsData) {
            const mappedTeams: TeamSession[] = teamsData.map((t: any) => ({
                id: t.id,
                teamName: t.teamName,
                playerCount: t.playerCount,
                hasResults: t.hasResults,
                testType: t.hasResults ? 'Є результати' : 'Немає даних',
                date: '',
                time: ''
            }));
            setTeamSessions(mappedTeams);
        }

        if (resultsData) {
            setGeneralSessions(resultsData);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // 🔥 АВТО-ОНОВЛЕННЯ ПІСЛЯ СИНХРОНІЗАЦІЇ
    useEffect(() => {
        const unsubscribe = syncManager.subscribe(() => {
            if (!syncManager.getIsSyncing()) {
                console.log("♻️ [useSessionsData] Синхронізація завершена, оновлюємо списки...");
                loadData();
            }
        });
        return unsubscribe;
    }, []);

    const filteredTeamSessions = useMemo(() => {
        if (!searchQuery) return teamSessions;
        return teamSessions.filter(s =>
            s.teamName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [teamSessions, searchQuery]);

    const filteredGeneralSessions = useMemo(() => {
        if (!searchQuery) return generalSessions;
        return generalSessions.filter(s =>
            s.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.teamName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [generalSessions, searchQuery]);

    const stats = useMemo(() => {
        if (filteredGeneralSessions.length === 0) return { best: null, worst: null };
        const sorted = [...filteredGeneralSessions].sort((a, b) => a.totalTime - b.totalTime);
        return {
            best: sorted[0],
            worst: sorted[sorted.length - 1]
        };
    }, [filteredGeneralSessions]);

    return {
        teamSessions: filteredTeamSessions,
        generalSessions: filteredGeneralSessions,
        stats,
        isLoading,
        refresh: loadData
    };
};