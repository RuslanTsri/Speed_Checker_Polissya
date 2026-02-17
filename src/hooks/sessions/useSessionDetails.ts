import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { TeamSession } from './useSessionsData';
import { useCSV } from '../useCSV';
import {Alert} from "react-native";

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

    // ✅ Отримуємо функцію експорту з нашого хука
    const { exportResultsToCSV } = useCSV();

    useEffect(() => {
        const loadTeamResults = async () => {
            if (!session?.id) return;
            setIsLoading(true);

            // Запит: Результати -> Сесії -> Гравці
            const { data, error } = await supabase
                .from('results')
                .select(`
                    *,
                    players (id, name),
                    sessions!inner (id, team_id, test_type)
                `)
                .eq('sessions.team_id', session.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                const formatted = data.map((item: any) => ({
                    id: item.id,
                    playerId: item.players?.id || 'guest',
                    playerName: item.players?.name || 'Гість',
                    number: '-',
                    time: Number(item.full_time),
                    // ✅ Додаємо ці поля, щоб useCSV міг їх записати у файл
                    splits: item.gates || [],
                    testType: item.sessions?.test_type || 'Sprint',
                    date: new Date(item.created_at).toLocaleDateString()
                }));
                setRawResults(formatted);
            }
            setIsLoading(false);
        };

        loadTeamResults();
    }, [session.id]);

    // 1. Лідерборд
    const groupedPlayers = useMemo(() => {
        const playersMap = new Map<string, PlayerStats>();

        rawResults.forEach((res) => {
            if (!playersMap.has(res.playerId)) {
                playersMap.set(res.playerId, {
                    id: res.id,
                    playerName: res.playerName,
                    number: res.number,
                    bestTime: res.time,
                    maxSpeed: 0,
                    attemptsCount: 1
                });
            } else {
                const player = playersMap.get(res.playerId)!;
                player.attemptsCount += 1;
                if (res.time < player.bestTime) {
                    player.bestTime = res.time;
                }
            }
        });

        return Array.from(playersMap.values()).sort((a, b) => a.bestTime - b.bestTime);
    }, [rawResults]);

    // 2. Статистика для карток вгорі
    const sessionStats = useMemo(() => {
        if (rawResults.length === 0) return { best: 0, avg: 0 };
        const times = rawResults.map(r => r.time);
        const best = Math.min(...times);
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        return { best, avg };
    }, [rawResults]);

    // 🔥 РЕАЛЬНИЙ ЕКСПОРТ
    const handleExport = async () => {
        console.log("=== EXPORT ATTEMPT ===");
        console.log("Results count:", rawResults.length);
        console.log("Team:", session.teamName);

        if (rawResults.length === 0) {
            Alert.alert("Увага", "Дані ще завантажуються або відсутні для цієї команди");
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
        handleExport, // Тепер це робоча функція
        sessionStats,
        isLoading
    };
};