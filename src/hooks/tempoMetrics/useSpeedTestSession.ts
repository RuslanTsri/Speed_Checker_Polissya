import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBle } from '../../context/BleContext';
import { sessionsService } from '../../services/sessionsService';
import { resultsService } from '../../services/resultsService';
import { supabase } from '../../lib/supabase';

const TAG = '[SESSION-DEBUG] 🟠';

export interface LocalResult { player: any; fullTime: number; gates: number[]; }

const MASTER_SENSOR_ID = 0;

export const useSpeedTestSession = (config: any, onFinish: () => void, onNavigate?: any) => {
    const { t } = useTranslation();
    const { state, elapsedTime, sensors, startTraining, stopTraining, resetSession } = useBle();

    const originalQueue = useMemo(() => config.selectedPlayers?.length > 0
            ? config.selectedPlayers
            : [{ id: 'guest', name: t('tools.speed_checker.guest') as string, number: '-' }],
        [config.selectedPlayers, t]);

    const [playersQueue, setPlayersQueue] = useState(originalQueue);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    const [sessionName, setSessionName] = useState<string>(
        config.sessionName || `TEST ${new Date().toLocaleDateString()}`
    );

    const [localResults, setLocalResults] = useState<LocalResult[]>([]);
    const [currentRunResult, setCurrentRunResult] = useState<LocalResult | null>(null);

    const [selectedForRetry, setSelectedForRetry] = useState<string[]>([]);
    const [showIndividualModal, setShowIndividualModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [frozenTime, setFrozenTime] = useState<number | null>(null);
    const [isScreenInitialized, setIsScreenInitialized] = useState(false);

    const hasProcessedRun = useRef(false);
    const isRunning  = state === 'active';
    const isFinished = state === 'finished';
    const isReady    = state === 'armed';

    const currentPlayerObj = playersQueue[currentPlayerIndex];
    const isLastPlayer = currentPlayerIndex === playersQueue.length - 1;

    useEffect(() => {
        resetSession();
        const initTimer = setTimeout(() => {
            setIsScreenInitialized(true);
        }, 150);

        return () => {
            clearTimeout(initTimer);
            resetSession();
        };
    }, []);

    const handleRunFinish = useCallback((finalTime: number, sensorSnapshot: typeof sensors) => {
        hasProcessedRun.current = true;

        const result: LocalResult = {
            player: currentPlayerObj,
            fullTime: Number((finalTime / 1000).toFixed(3)),
            gates: sensorSnapshot
                .filter(s => s.id !== MASTER_SENSOR_ID && s.triggerTime !== undefined)
                .sort((a, b) => a.id - b.id)
                .map(s => Number((s.triggerTime! / 1000).toFixed(3))),
        };

        setCurrentRunResult(result);
        setShowIndividualModal(true);
    }, [currentPlayerObj]);

    useEffect(() => {
        if (!isScreenInitialized) return;

        if (isFinished && !hasProcessedRun.current) {
            const sensorSnapshot = sensors
                .filter(s => s.status === 'active')
                .sort((a, b) => a.id - b.id);

            const slaveSensors = sensorSnapshot.filter(s => s.id !== MASTER_SENSOR_ID);
            const finishSensor = [...slaveSensors]
                .reverse()
                .find(s => s.triggerTime !== undefined);

            const finalTime = finishSensor?.triggerTime ?? elapsedTime;

            setFrozenTime(finalTime);
            handleRunFinish(finalTime, sensorSnapshot);
        }

        if (isReady || isRunning) {
            hasProcessedRun.current = false;
            setFrozenTime(null);
        }
    }, [isFinished, isReady, isRunning, sensors, elapsedTime, handleRunFinish, isScreenInitialized]);

    const confirmIndividualRun = () => {
        if (currentRunResult) {
            setLocalResults(prev => [...prev, currentRunResult]);
            setShowIndividualModal(false);
            setCurrentRunResult(null);
            if (isLastPlayer) {
                setTimeout(() => setShowSummaryModal(true), 300);
            } else {
                nextPlayer();
            }
        }
    };

    const retryIndividualRun = () => {
        setShowIndividualModal(false);
        setCurrentRunResult(null);
        resetSession();
        hasProcessedRun.current = false;
    };

    const toggleRetrySelection = (id: string) => {
        setSelectedForRetry(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const retrySelectedPlayers = () => {
        if (selectedForRetry.length === 0) {
            restartWholeSession();
            return;
        }

        const playersToRetry = localResults
            .filter(r => selectedForRetry.includes(r.player.id || r.player.name))
            .map(r => r.player);

        setLocalResults(prev => prev.filter(r => !selectedForRetry.includes(r.player.id || r.player.name)));
        setPlayersQueue(playersToRetry);
        setCurrentPlayerIndex(0);
        setSelectedForRetry([]);
        setShowSummaryModal(false);
        resetSession();
        hasProcessedRun.current = false;
    };

    const restartWholeSession = () => {
        setShowSummaryModal(false);
        setLocalResults([]);
        setPlayersQueue(originalQueue);
        setCurrentPlayerIndex(0);
        setSelectedForRetry([]);
        resetSession();
        hasProcessedRun.current = false;
    };

    const saveAllResults = async () => {
        if (!sessionName.trim()) {
            Alert.alert(
                t('tools.speed_checker.alert_error') as string,
                t('logs.errors.validation.session_name_required') as string
            );
            return;
        }
        setIsSaving(true);

        try {
            let currentSessionId = null;
            const targetDistance = config.distance || 30;

            let query = supabase.from('sessions')
                .select('id')
                .eq('name', sessionName.trim())
                .eq('total_distance', targetDistance);

            if (config.teamId) {
                query = query.eq('team_id', config.teamId);
            } else {
                query = query.is('team_id', null);
            }

            const { data: existingSessions } = await query.order('created_at', { ascending: false }).limit(1);

            if (existingSessions && existingSessions.length > 0) {
                currentSessionId = existingSessions[0].id;
                console.log(`${TAG} Found session (${currentSessionId}), appending...`);
            } else {
                console.log(`${TAG} Creating new session (different distance or name)...`);
                const { data } = await sessionsService.create({
                    team_id: config.teamId || null,
                    name: sessionName.trim(),
                    total_distance: targetDistance,
                    test_type: config.testType || 'STATIC',
                });
                if (data?.id) currentSessionId = data.id;
            }

            if (!currentSessionId) throw new Error(t('logs.errors.app.session_id_failed') as string);

            const promises = localResults.map(res => resultsService.saveResult({
                session_id: currentSessionId,
                player_id: res.player.id !== 'guest' ? res.player.id : null,
                full_time: res.fullTime,
                gates: res.gates,
                is_best: false,
                player_name: res.player.name,
            } as any));

            await Promise.all(promises);
            setIsSaving(false);
            setShowSummaryModal(false);

            Alert.alert(
                t('tools.speed_checker.alert_success') as string,
                t('tools.speed_checker.success_save') as string,
                [{
                    text: t('tools.speed_checker.alert_ok') as string,
                    onPress: () => {
                        setLocalResults([]);
                        resetSession();

                        if (onNavigate) {
                            if (config.teamId) {
                                const sessionToOpen = {
                                    isGroup: true,
                                    teamId: config.teamId,
                                    teamName: config.teamName,
                                    sessionName: sessionName.trim(),
                                    distance: targetDistance
                                };

                                onNavigate('SESSIONS', {
                                    subTab: 'TEAM',
                                    openSession: sessionToOpen
                                });
                            } else {
                                onNavigate('SESSIONS', {
                                    subTab: 'GENERAL'
                                });
                            }
                        } else {
                            onFinish();
                        }
                    },
                }]
            );
        } catch (error) {
            console.error(error);
            setIsSaving(false);
            Alert.alert(t('tools.speed_checker.alert_error') as string, t('tools.speed_checker.error_save') as string);
        }
    };

    const nextPlayer = () => {
        resetSession();
        if (currentPlayerIndex < playersQueue.length - 1) {
            setCurrentPlayerIndex(prev => prev + 1);
        }
    };

    let activeSensors = sensors
        .filter(s => s.status === 'active')
        .sort((a, b) => a.id - b.id);

    if (isFinished) {
        const lastTriggered = [...activeSensors]
            .reverse()
            .find(s => s.triggerTime !== undefined);
        if (lastTriggered) {
            activeSensors = activeSensors.filter(s => s.id <= lastTriggered.id);
        }
    }

    const totalSensors = activeSensors.length;

    const lastTriggeredIndex = activeSensors.reduce((lastIdx, sensor, idx) => {
        const isStartAndRunning = idx === 0 && (isRunning || isFinished);
        const hasTriggered = sensor.triggerTime !== undefined && sensor.triggerTime > 0;
        if (isStartAndRunning) return 0;
        if (hasTriggered) return idx;
        return lastIdx;
    }, -1);

    let progressPercent = 0;

    if (lastTriggeredIndex === 0) {
        progressPercent = 0;
    } else if (lastTriggeredIndex === totalSensors - 1) {
        progressPercent = 100;
    } else if (lastTriggeredIndex > 0) {
        const safeTotalDistance = Number(config.distance) || 0;
        const gatePosition = config.splitPositions?.[lastTriggeredIndex - 1];

        if (safeTotalDistance > 0 && gatePosition !== undefined) {
            progressPercent = (Number(gatePosition) / safeTotalDistance) * 100;
        } else {
            progressPercent = (lastTriggeredIndex / (totalSensors - 1)) * 100;
        }
    }

    progressPercent = Math.max(0, Math.min(100, progressPercent));

    const splitRows = useMemo(() => {
        return [];
    }, [activeSensors, isFinished]);

    const formatTime = (totalSeconds: number) => {
        if (!totalSeconds && totalSeconds !== 0) return { main: '00:00', decimal: '.000' };
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        const ms = Math.floor((totalSeconds % 1) * 1000);
        return {
            main: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
            decimal: `.${ms.toString().padStart(3, '0')}`,
        };
    };

    const displayTime = frozenTime !== null ? frozenTime : elapsedTime;

    return {
        currentPlayerObj, currentPlayerIndex, totalPlayers: playersQueue.length,
        teamName: config.teamName || (t('tools.speed_checker.free_training') as string),
        sessionName, setSessionName,
        isRunning: isScreenInitialized ? isRunning : false,
        isFinished: isScreenInitialized ? isFinished : false,
        isReady: isScreenInitialized ? isReady : false,
        timeObj: isScreenInitialized ? formatTime(displayTime / 1000) : { main: '00:00', decimal: '.000' },
        progressPercent: isScreenInitialized ? progressPercent : 0,
        activeSensors, splitRows,
        startTraining, stopTraining, resetSession, nextPlayer, formatTime,
        currentRunResult, localResults, showIndividualModal, confirmIndividualRun,
        retryIndividualRun, showSummaryModal, saveAllResults, restartWholeSession, isSaving,
        selectedForRetry, toggleRetrySelection, retrySelectedPlayers
    };
};