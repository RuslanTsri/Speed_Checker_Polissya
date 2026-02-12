import { useState, useMemo } from 'react';
import { TeamSession } from './useSessionsData';
import { useCSV } from '../useCSV';

export const useSessionDetails = (session: TeamSession) => {
    const [subTab, setSubTab] = useState<'BEST' | 'ALL'>('BEST');
    const [roundFilter, setRoundFilter] = useState<'ALL' | number>('ALL');

    const { exportSessionToCSV } = useCSV();

    // Отримуємо унікальні номери раундів
    const rounds = useMemo(() => {
        return Array.from(new Set(session.results.flatMap(r => r.attempts.map(a => a.round)))).sort();
    }, [session]);

    // Список всіх спроб
    const allAttemptsFlat = useMemo(() => {
        return session.results.flatMap(player =>
            player.attempts.map(attempt => ({
                playerName: player.playerName,
                round: attempt.round,
                time: attempt.time
            }))
        );
    }, [session]);

    // Фільтрація
    const filteredAttempts = useMemo(() => {
        return roundFilter === 'ALL'
            ? allAttemptsFlat
            : allAttemptsFlat.filter(a => a.round === roundFilter);
    }, [roundFilter, allAttemptsFlat]);

    // Хендлер для кнопки експорту
    const handleExport = () => exportSessionToCSV(session);

    return {
        subTab, setSubTab,
        roundFilter, setRoundFilter,
        rounds,
        filteredAttempts,
        sortedResults: [...session.results].sort((a, b) => a.bestTime - b.bestTime),
        handleExport
    };
};