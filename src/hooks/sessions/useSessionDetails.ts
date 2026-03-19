import { useState, useEffect, useMemo } from 'react';
import { useCSV } from '../useCSV';
import { Alert } from "react-native";
import { useTranslation } from 'react-i18next';
import { resultsService } from '../../services/resultsService';
import { supabase } from '../../lib/supabase';
import { syncManager } from '../../services/SyncManager';

interface PlayerStats {
    id: string;
    playerName: string;
    number: string;
    bestTime: number;
    maxSpeed: number;
    attemptsCount: number;
    splits: number[];
    avgSplit: number;
}

export const useSessionDetails = (session: any) => {
    const { t } = useTranslation();
    const [subTab, setSubTab] = useState<'BEST' | 'ALL'>('BEST');
    const [roundFilter, setRoundFilter] = useState<'ALL' | number>('ALL');
    const [rawResults, setRawResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const predefinedDistances = [30, 60, 100];
    const [selectedDistance, setSelectedDistance] = useState<number>(session.distance || 30);

    const { exportResultsToExcel } = useCSV();

    const loadTeamResults = async () => {
        if (!session) return;
        setIsLoading(true);

        let data, error;

        if (session.isGroup) {
            // Перевірте сервіс resultsService.getBySessionGroup
            // Він має повертати 'created_at' з таблиці results
            const res = await resultsService.getBySessionGroup(session.teamId, session.sessionName);
            data = res.data;
            error = res.error;
        } else {
            const res = await resultsService.getBySession(session.id);
            data = res.data;
            error = res.error;
        }

        if (!error && data) {
            const enhancedData = data.map((result: any) => {
                const segments = (result.splits?.length || 0) + 1;
                return {
                    ...result,
                    // Додаємо created_at у кожен результат, якщо він є в БД
                    created_at: result.created_at || session.sessionDate,
                    distance: result.distance || session.distance || 30,
                    avgSplit: result.time / segments
                };
            });
            setRawResults(enhancedData);

            if (enhancedData.length > 0 && !enhancedData.some(r => r.distance === selectedDistance)) {
                setSelectedDistance(enhancedData[0].distance);
            }
        } else {
            setRawResults([]);
        }
        setIsLoading(false);
    };

    useEffect(() => { loadTeamResults(); }, [session]);
    useEffect(() => {
        const unsubscribe = syncManager.subscribe(() => { if (!syncManager.getIsSyncing()) loadTeamResults(); });
        return unsubscribe;
    }, [session]);

    const resultsFilteredByDistance = useMemo(() => {
        return rawResults.filter(r => r.distance === selectedDistance);
    }, [rawResults, selectedDistance]);

    const groupedPlayers = useMemo(() => {
        const playersMap = new Map<string, PlayerStats>();
        resultsFilteredByDistance.forEach((res) => {
            const key = res.playerId || res.playerName;

            if (!playersMap.has(key)) {
                playersMap.set(key, {
                    id: res.id,
                    playerName: res.playerName,
                    number: res.playerNumber || '-',
                    bestTime: res.time,
                    maxSpeed: 0,
                    attemptsCount: 1,
                    splits: res.splits || [],
                    avgSplit: res.avgSplit || 0
                });
            } else {
                const player = playersMap.get(key)!;
                player.attemptsCount += 1;

                if (res.time < player.bestTime) {
                    player.bestTime = res.time;
                    player.id = res.id;
                    player.splits = res.splits || [];
                    player.avgSplit = res.avgSplit || 0;
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
        try {
            // 🔥 ПЕРЕДАЄМО ТРЕТІЙ ПАРАМЕТР: session.sessionDate
            await exportResultsToExcel(rawResults, session.teamName, session.sessionDate);
        } catch (err) {
            console.error("Export handler error:", err);
        }
    };

    const handleDeleteSession = async (onSuccessCallback: () => void, scope: 'ALL' | 'ACTIVE_DISTANCE', currentDist?: number) => {
        const TAG = '[DELETE-DEBUG] 🗑️';
        console.log(`${TAG} --- ПОЧАТОК ВИДАЛЕННЯ ---`);
        console.log(`${TAG} Параметри: scope=${scope}, currentDist=${currentDist}`);
        console.log(`${TAG} Об'єкт session:`, JSON.stringify(session, null, 2));

        setIsDeleting(true);
        try {
            let sessionIdsToDelete: string[] = [];

            if (session.isGroup) {
                console.log(`${TAG} Це згрупована сесія. Шукаємо ID сесій в БД...`);
                let query = supabase
                    .from('sessions')
                    .select('id, total_distance')
                    .eq('team_id', session.teamId)
                    .eq('name', session.sessionName);

                if (scope === 'ACTIVE_DISTANCE' && currentDist) {
                    console.log(`${TAG} Фільтруємо за дистанцією: ${currentDist}`);
                    query = query.eq('total_distance', currentDist);
                }

                const { data, error: selectError } = await query;

                if (selectError) {
                    console.error(`${TAG} ❌ Помилка пошуку сесій:`, selectError);
                    throw selectError;
                }

                console.log(`${TAG} Знайдені сесії в БД:`, data);

                if (data) {
                    sessionIdsToDelete = data.map(s => s.id);
                }
            } else {
                console.log(`${TAG} Це одиночна сесія (не група). ID: ${session.id}`);
                if (session.id) {
                    sessionIdsToDelete.push(session.id);
                }
            }

            console.log(`${TAG} Фінальний список ID для видалення:`, sessionIdsToDelete);

            if (sessionIdsToDelete.length > 0) {
                console.log(`${TAG} КРОК 1: Видалення результатів (таблиця results)...`);
                const { data: resData, error: resultsError } = await supabase
                    .from('results')
                    .delete()
                    .in('session_id', sessionIdsToDelete)
                    .select('id');

                if (resultsError) {
                    console.error(`${TAG} ❌ Помилка видалення результатів:`, resultsError);
                    throw resultsError;
                }
                console.log(`${TAG} ✅ Реально видалено результатів з БД: ${resData?.length || 0}`);

                console.log(`${TAG} КРОК 2: Видалення самих сесій (таблиця sessions)...`);
                const { data: sesData, error: sessionsError } = await supabase
                    .from('sessions')
                    .delete()
                    .in('id', sessionIdsToDelete)
                    .select('id');

                if (sessionsError) {
                    console.error(`${TAG} ❌ Помилка видалення сесій:`, sessionsError);
                    throw sessionsError;
                }
                console.log(`${TAG} ✅ Реально видалено сесій з БД: ${sesData?.length || 0}`);

                if ((resData?.length || 0) === 0 && (sesData?.length || 0) === 0) {
                    console.log(`${TAG} ⚠️ УВАГА: Запити пройшли без помилок, але НУЛЬ рядків видалено. Скоріше за все, Supabase RLS (Row Level Security) блокує видалення!`);
                } else {
                    console.log(`${TAG} 🏆 УСПІШНО ВИДАЛЕНО З БД!`);
                }

            } else {
                console.log(`${TAG} ⚠️ Немає сесій для видалення (масив порожній).`);
            }

            setDeleteModalVisible(false);

            if (scope === 'ALL') {
                console.log(`${TAG} Навігація: Повертаємось на попередній екран`);
                onSuccessCallback();
            } else {
                const remainingResults = rawResults.filter(r => r.distance !== currentDist);
                console.log(`${TAG} Навігація: Залишилось дистанцій у групі: ${remainingResults.length}`);

                if (remainingResults.length === 0) {
                    onSuccessCallback();
                } else {
                    const nextDistance = remainingResults[0].distance;
                    console.log(`${TAG} Перемикаємось на дистанцію: ${nextDistance}`);
                    setSelectedDistance(nextDistance);
                    await loadTeamResults();
                }
            }
        } catch (error: any) {
            console.error(`${TAG} ❌ КРИТИЧНА ПОМИЛКА:`, error.message || error);
            Alert.alert('Помилка', 'Не вдалося видалити дані. Перевірте з\'єднання з інтернетом.');
        } finally {
            setIsDeleting(false);
            console.log(`${TAG} --- КІНЕЦЬ ВИДАЛЕННЯ ---`);
        }
    };

    const gateDistances = useMemo(() => {
        if (rawResults.length > 0 && rawResults[0].splits_config) {
            return rawResults[0].splits_config;
        }
        return [];
    }, [rawResults]);

    return {
        subTab, setSubTab, roundFilter, setRoundFilter, selectedDistance, setSelectedDistance, predefinedDistances, rounds: [],
        filteredAttempts: rawResults, sortedResults: groupedPlayers, handleExport, sessionStats, isLoading, gateDistances,
        isDeleteModalVisible, setDeleteModalVisible, isDeleting, handleDeleteSession
    };
};