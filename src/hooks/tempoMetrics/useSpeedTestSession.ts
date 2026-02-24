import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBle } from '../../context/BleContext';
import { sessionsService } from '../../services/sessionsService';
import { resultsService } from '../../services/resultsService';

export interface LocalResult { player: any; fullTime: number; gates: number[]; }

// Master (ID=0) is always the START gate.
// Slave with the highest ID is always the FINISH gate.
const MASTER_SENSOR_ID = 0;

export const useSpeedTestSession = (config: any, onFinish: () => void) => {
    const { t } = useTranslation();
    const { state, elapsedTime, sensors, startTraining, stopTraining, resetSession } = useBle();

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [localResults, setLocalResults] = useState<LocalResult[]>([]);
    const [currentRunResult, setCurrentRunResult] = useState<LocalResult | null>(null);

    const [showIndividualModal, setShowIndividualModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Зафіксований час фінішу — щоб уникнути оновлення таймера після фінішу
    const [frozenTime, setFrozenTime] = useState<number | null>(null);
    const hasProcessedRun = useRef(false);

    // BLE state mapping:
    // 'armed'    → isReady   — система озброєна, очікує перетину старту
    // 'active'   → isRunning — атлет стартував, таймер іде
    // 'finished' → isFinished — атлет фінішував
    const isRunning  = state === 'active';
    const isFinished = state === 'finished';
    const isReady    = state === 'armed';

    const playersQueue = config.selectedPlayers?.length > 0
        ? config.selectedPlayers
        : [{ id: 'guest', name: t('tools.speed_checker.guest') as string, number: '-' }];

    const currentPlayerObj = playersQueue[currentPlayerIndex];
    const isLastPlayer = currentPlayerIndex === playersQueue.length - 1;

    // --- Створення сесії при маунті ---
    useEffect(() => {
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
    }, []);

    // --- ОБРОБКА ФІНІШУ ---
    // FIX: приймаємо sensors-знімок (snapshot) явно, щоб уникнути stale closure.
    // FIX: startSensorId завжди = MASTER_SENSOR_ID (0), не шукаємо Math.min.
    const handleRunFinish = useCallback((finalTime: number, sensorSnapshot: typeof sensors) => {
        hasProcessedRun.current = true;

        const result: LocalResult = {
            player: currentPlayerObj,
            fullTime: Number((finalTime / 1000).toFixed(3)),
            // Ворота — всі датчики КРІМ мастера (ID 0), у яких є час тригера
            gates: sensorSnapshot
                .filter(s => s.id !== MASTER_SENSOR_ID && s.triggerTime !== undefined)
                .sort((a, b) => a.id - b.id)
                .map(s => Number((s.triggerTime! / 1000).toFixed(3))),
        };

        setCurrentRunResult(result);
        setShowIndividualModal(true);
    }, [currentPlayerObj]);

    // --- ЕФЕКТ СТАНУ: відстежуємо перехід у 'finished' ---
    // FIX: sensors та elapsedTime додані до залежностей → немає stale closure.
    // FIX: час фінішу беремо з triggerTime останнього датчика (надійніше за elapsedTime).
    useEffect(() => {
        if (isFinished && !hasProcessedRun.current) {
            // Знімок активних датчиків у момент фінішу
            const sensorSnapshot = sensors
                .filter(s => s.status === 'active')
                .sort((a, b) => a.id - b.id);

            // Шукаємо час останнього спрацьованого датчика (slave з максимальним ID)
            const slaveSensors = sensorSnapshot.filter(s => s.id !== MASTER_SENSOR_ID);
            const finishSensor = [...slaveSensors]
                .reverse()
                .find(s => s.triggerTime !== undefined);

            // Фінішний час: з датчика (найточніше) або з elapsedTime як fallback
            const finalTime = finishSensor?.triggerTime ?? elapsedTime;

            setFrozenTime(finalTime);
            handleRunFinish(finalTime, sensorSnapshot);
        }

        // Скидаємо прапор при поверненні в активний чи очікування
        if (isReady || isRunning) {
            hasProcessedRun.current = false;
            setFrozenTime(null);
        }
    }, [isFinished, isReady, isRunning, sensors, elapsedTime, handleRunFinish]);

    // --- ДІЇ ПІСЛЯ ФІНІШУ ---
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
                    onPress: () => { setLocalResults([]); onFinish(); },
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

    // --- РОЗРАХУНОК АКТИВНИХ ДАТЧИКІВ ДЛЯ ВІДОБРАЖЕННЯ ---
    // Сортуємо: 0 (master/start) → 1, 2, ... → max (finish)
    let activeSensors = sensors
        .filter(s => s.status === 'active')
        .sort((a, b) => a.id - b.id);

    // Якщо фінішували — обрізаємо до останнього спрацьованого
    if (isFinished) {
        const lastTriggered = [...activeSensors]
            .reverse()
            .find(s => s.triggerTime !== undefined);
        if (lastTriggered) {
            activeSensors = activeSensors.filter(s => s.id <= lastTriggered.id);
        }
    }

    const totalSensors = activeSensors.length;

    // Індекс останнього спрацьованого датчика (для прогрес-бару)
    const lastTriggeredIndex = activeSensors.reduce((lastIdx, sensor, idx) => {
        const isStartAndRunning = idx === 0 && (isRunning || isFinished);
        const hasTriggered = sensor.triggerTime !== undefined && sensor.triggerTime > 0;
        if (isStartAndRunning) return 0;
        if (hasTriggered) return idx;
        return lastIdx;
    }, -1);

    const progressPercent = totalSensors > 1
        ? (Math.max(0, lastTriggeredIndex) / (totalSensors - 1)) * 100
        : 0;

    // --- СПЛІТОВІ РЯДКИ ---
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

    // --- ФОРМАТУВАННЯ ЧАСУ ---
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

    // Показуємо заморожений час на фініші, інакше — живий
    const displayTime = frozenTime !== null ? frozenTime : elapsedTime;

    return {
        currentPlayerObj,
        currentPlayerIndex,
        totalPlayers: playersQueue.length,
        teamName: config.teamName || (t('tools.speed_checker.free_training') as string),
        isRunning,
        isFinished,
        isReady,
        timeObj: formatTime(displayTime / 1000),
        progressPercent,
        activeSensors,
        splitRows,
        startTraining,
        stopTraining,
        resetSession,
        nextPlayer,
        formatTime,
        currentRunResult,
        localResults,
        showIndividualModal,
        confirmIndividualRun,
        retryIndividualRun,
        showSummaryModal,
        saveAllResults,
        restartWholeSession,
        isSaving,
    };
};