import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBle } from '../../context/BleContext';
import { sessionsService } from '../../services/sessionsService';
import { resultsService } from '../../services/resultsService';

const TAG = '[SESSION-DEBUG] 🟠';

export interface LocalResult { player: any; fullTime: number; gates: number[]; }

const MASTER_SENSOR_ID = 0;

export const useSpeedTestSession = (config: any, onFinish: () => void, onNavigate?: any) => {
    const { t } = useTranslation();
    const { state, elapsedTime, sensors, startTraining, stopTraining, resetSession } = useBle();

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [localResults, setLocalResults] = useState<LocalResult[]>([]);
    const [currentRunResult, setCurrentRunResult] = useState<LocalResult | null>(null);

    const [showIndividualModal, setShowIndividualModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [frozenTime, setFrozenTime] = useState<number | null>(null);
    const [isScreenInitialized, setIsScreenInitialized] = useState(false);

    const hasProcessedRun = useRef(false);
    const isRunning  = state === 'active';
    const isFinished = state === 'finished';
    const isReady    = state === 'armed';

    const playersQueue = config.selectedPlayers?.length > 0
        ? config.selectedPlayers
        : [{ id: 'guest', name: t('tools.speed_checker.guest') as string, number: '-' }];

    const currentPlayerObj = playersQueue[currentPlayerIndex];
    const isLastPlayer = currentPlayerIndex === playersQueue.length - 1;

    useEffect(() => {
        resetSession();

        const createSession = async () => {
            const { data } = await sessionsService.create({
                team_id: config.teamId || null,
                name: config.teamName || (t('tools.speed_checker.free_training') as string),
                total_distance: config.distance || 30,
                test_type: config.testType || 'STATIC',
            });
            if (data?.id) setSessionId(data.id);
        };
        createSession();

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

        console.log(`${TAG} 📊 Зберігаємо результат пробігу для модалки:`, result);
        setCurrentRunResult(result);
        setShowIndividualModal(true);
    }, [currentPlayerObj]);

    useEffect(() => {
        if (!isScreenInitialized) return;

        if (isFinished && !hasProcessedRun.current) {
            console.log(`${TAG} 🏁 ОБРОБКА ФІНІШУ (Заморожуємо час)`);
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
            if (hasProcessedRun.current) console.log(`${TAG} 🔄 Скидаємо запобіжник фінішу (Новий забіг)`);
            hasProcessedRun.current = false;
            setFrozenTime(null);
        }
    }, [isFinished, isReady, isRunning, sensors, elapsedTime, handleRunFinish, isScreenInitialized]);

    const confirmIndividualRun = () => {
        console.log(`${TAG} Юзер натиснув 'Зарахувати'`);
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
        console.log(`${TAG} Юзер натиснув 'Перебігти'`);
        setShowIndividualModal(false);
        setCurrentRunResult(null);
        resetSession();
        hasProcessedRun.current = false;
    };

    const saveAllResults = async () => {
        if (!sessionId) return;
        setIsSaving(true);
        try {
            const promises = localResults.map(res => resultsService.saveResult({
                session_id: sessionId,
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
                                const mockSession = {
                                    id: config.teamId,
                                    teamName: config.teamName,
                                    hasResults: true,
                                    playerCount: localResults.length,
                                    testType: config.testType || 'STATIC',
                                };
                                onNavigate('SESSIONS', {
                                    subTab: 'TEAM',
                                    openSession: mockSession
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
            Alert.alert(
                t('tools.speed_checker.alert_error') as string,
                t('tools.speed_checker.error_save') as string,
            );
        }
    };

    const restartWholeSession = () => {
        setShowSummaryModal(false);
        setLocalResults([]);
        setCurrentPlayerIndex(0);
        resetSession();
        hasProcessedRun.current = false;
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
        const rows: { label: string; time: number }[] = [];
        if (totalSensors > 1) {
            for (let i = 1; i < totalSensors; i++) {
                const current = activeSensors[i];
                const prev = activeSensors[i - 1];
                if (current.triggerTime !== undefined && prev.triggerTime !== undefined) {
                    const diff = (current.triggerTime - prev.triggerTime) / 1000;
                    let label: string;
                    if (totalSensors === 2) {
                        label = 'START ➔ FINISH';
                    } else if (i === 1) {
                        label = 'START ➔ GATE 1';
                    } else if (i === totalSensors - 1) {
                        label = `GATE ${i - 1} ➔ FINISH`;
                    } else {
                        label = `GATE ${i - 1} ➔ GATE ${i}`;
                    }
                    rows.push({ label, time: diff });
                }
            }
        }
        return rows;
    }, [activeSensors, isFinished]);

    const formatTime = (totalSeconds: number) => {
        if (!totalSeconds && totalSeconds !== 0) return { main: '00:00', decimal: '.00' };
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        const ms = Math.floor((totalSeconds % 1) * 100);
        return {
            main: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
            decimal: `.${ms.toString().padStart(2, '0')}`,
        };
    };

    const displayTime = frozenTime !== null ? frozenTime : elapsedTime;

    return {
        currentPlayerObj, currentPlayerIndex, totalPlayers: playersQueue.length,
        teamName: config.teamName || (t('tools.speed_checker.free_training') as string),
        isRunning: isScreenInitialized ? isRunning : false,
        isFinished: isScreenInitialized ? isFinished : false,
        isReady: isScreenInitialized ? isReady : false,
        timeObj: isScreenInitialized ? formatTime(displayTime / 1000) : { main: '00:00', decimal: '.00' },
        progressPercent: isScreenInitialized ? progressPercent : 0,
        activeSensors, splitRows,
        startTraining, stopTraining, resetSession, nextPlayer, formatTime,
        currentRunResult, localResults, showIndividualModal, confirmIndividualRun,
        retryIndividualRun, showSummaryModal, saveAllResults, restartWholeSession, isSaving,
    };
};