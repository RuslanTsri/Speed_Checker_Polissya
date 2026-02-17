import { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services/teamService'; // Використовуємо твій teamService
import { resultsService } from '../../services/resultsService';

// Тип для списку "Загальні" (Останні забіги)
export interface GeneralSession {
    id: string;
    playerName: string;
    teamName: string;
    totalTime: number;
    avgSplit: number;
    date: string;
}

// 🔥 ЗМІНЕНО: Тепер це тип для КОМАНДИ в списку
export interface TeamSession {
    id: string; // ID команди
    teamName: string;
    playerCount: number;
    hasResults: boolean; // Чи є дані
    // Поля нижче необов'язкові для списку команд, але потрібні для сумісності з UI, якщо він їх вимагає
    testType?: string;
    date?: string;
    time?: string;
}

export const useSessionsData = (searchQuery: string) => {
    const [teamSessions, setTeamSessions] = useState<TeamSession[]>([]);
    const [generalSessions, setGeneralSessions] = useState<GeneralSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);

        // 1. Завантажуємо КОМАНДИ (використовуємо метод getMyTeamsWithStatus з teamService)
        // Якщо ти ще не оновив teamService як ми домовлялись, зроби це (код був вище)
        const { data: teamsData } = await teamService.getMyTeamsWithStatus();

        // 2. Завантажуємо останні забіги для вкладки "Загальні"
        const { data: resultsData } = await resultsService.getRecentResults();

        if (teamsData) {
            const mappedTeams: TeamSession[] = teamsData.map((t: any) => ({
                id: t.id,
                teamName: t.teamName,
                playerCount: t.playerCount,
                hasResults: t.hasResults,
                testType: t.hasResults ? 'Є результати' : 'Немає даних', // Заглушка для UI
                date: '', // Не показуємо дату в списку команд
                time: ''
            }));
            setTeamSessions(mappedTeams);
        }

        if (resultsData) {
            setGeneralSessions(resultsData);
        }

        setIsLoading(false);
    };

    // --- ФІЛЬТРАЦІЯ ---
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

    // --- СТАТИСТИКА (Best/Worst для General Tab) ---
    const stats = useMemo(() => {
        if (filteredGeneralSessions.length === 0) return { best: null, worst: null };
        const sorted = [...filteredGeneralSessions].sort((a, b) => a.totalTime - b.totalTime);
        return {
            best: sorted[0],
            worst: sorted[sorted.length - 1]
        };
    }, [filteredGeneralSessions]);

    return {
        teamSessions: filteredTeamSessions, // Це тепер список команд
        generalSessions: filteredGeneralSessions,
        stats,
        isLoading,
        refresh: loadData
    };
};