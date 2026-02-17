import { useState, useEffect, useRef, useMemo } from 'react';
import { Alert } from 'react-native';
import { useBle } from '../../context/BleContext';
import { sessionsService } from '../../services/sessionsService';
import { resultsService } from '../../services/resultsService';

export const useSpeedTestSession = (config: any, onFinish: () => void) => {
    const {
        state, elapsedTime, sensors,
        startTraining, stopTraining, resetSession
    } = useBle();

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const hasSavedResult = useRef(false);

    const isRunning = state === 'active';
    const isFinished = state === 'finished';
    const isReady = state === 'armed';

    // 1. Створення сесії в БД
    useEffect(() => {
        const createSession = async () => {
            const { data } = await sessionsService.create({
                team_id: config.teamId || null,
                name: config.teamName || 'Вільне тренування',
                total_distance: config.distance || 30,
                test_type: config.testType || 'STATIC',
            });
            if (data?.id) setSessionId(data.id);
        };
        createSession();
    }, []);

    // 2. Отримання активних сенсорів
    let activeSensors = sensors
        .filter(s => s.status === 'active')
        .sort((a, b) => a.id - b.id);

    if (isFinished) {
        const lastTriggered = [...activeSensors].reverse().find(s => s.triggerTime !== undefined);
        if (lastTriggered) {
            activeSensors = activeSensors.filter(s => s.id <= lastTriggered.id);
        }
    }

    const totalSensors = activeSensors.length;

    // 3. Розрахунок прогресу (Логіка для 2+ датчиків)
    const lastTriggeredIndex = activeSensors.reduce((lastIdx, sensor, idx) => {
        const triggered = sensor.triggerTime !== undefined && sensor.triggerTime > 0;
        if (idx === 0 && (isRunning || isFinished)) return 0; // Старт активовано
        if (triggered) return idx;
        return lastIdx;
    }, -1);

    const progressPercent = totalSensors > 1
        ? (Math.max(0, lastTriggeredIndex) / (totalSensors - 1)) * 100
        : 0;

    // 4. Логіка збереження в БД
    useEffect(() => {
        if (isFinished && sessionId && !hasSavedResult.current) {
            saveCurrentRun();
        }
        if (isReady || isRunning) {
            hasSavedResult.current = false;
        }
    }, [isFinished, isRunning, isReady, sessionId]);

    const saveCurrentRun = async () => {
        hasSavedResult.current = true;
        const player = playersQueue[currentPlayerIndex];

        const splits = activeSensors
            .filter(s => s.triggerTime !== undefined && s.id > 1)
            .map(s => Number((s.triggerTime! / 1000).toFixed(3)));

        const resultData = {
            session_id: sessionId!,
            player_id: player.id !== 'guest' ? player.id : null,
            full_time: Number((elapsedTime / 1000).toFixed(3)),
            gates: splits,
            is_best: false
        };

        const { error } = await resultsService.saveResult(resultData);
        if (error) hasSavedResult.current = false;
    };

    // 5. Формування таблиці сплітів (Різні назви для 2-х та 3+ датчиків)
    const splitRows = useMemo(() => {
        const rows: { label: string; time: number }[] = [];
        if (totalSensors > 1) {
            for (let i = 1; i < totalSensors; i++) {
                const current = activeSensors[i];
                const prev = activeSensors[i - 1];
                if (current.triggerTime !== undefined && prev.triggerTime !== undefined) {
                    const diff = (current.triggerTime - prev.triggerTime) / 1000;

                    let label = "";
                    if (totalSensors === 2) {
                        label = "START ➔ FINISH";
                    } else {
                        if (i === 1) label = "START ➔ GATE 1";
                        else if (i === totalSensors - 1) label = `GATE ${i - 1} ➔ FINISH`;
                        else label = `GATE ${i - 1} ➔ GATE ${i}`;
                    }
                    rows.push({ label, time: diff });
                }
            }
        }
        return rows;
    }, [activeSensors, isFinished]);

    const playersQueue = config.selectedPlayers?.length > 0
        ? config.selectedPlayers
        : [{ id: 'guest', name: 'Гість', number: '-' }];

    const currentPlayerObj = playersQueue[currentPlayerIndex];

    const formatTime = (totalSeconds: number) => {
        if (!totalSeconds && totalSeconds !== 0) return { main: "00:00", decimal: ".00" };
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        const ms = Math.floor((totalSeconds % 1) * 100);
        return {
            main: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
            decimal: `.${ms.toString().padStart(2, '0')}`
        };
    };

    const nextPlayer = () => {
        hasSavedResult.current = false;
        resetSession();
        if (currentPlayerIndex < playersQueue.length - 1) {
            setCurrentPlayerIndex(prev => prev + 1);
        } else {
            Alert.alert("Тест завершено", "Всі гравці пройшли тест.", [{ text: "ОК", onPress: onFinish }]);
        }
    };

    return {
        currentPlayerObj,
        currentPlayerIndex,
        totalPlayers: playersQueue.length,
        teamName: config.teamName || 'Вільне тренування',
        isRunning, isFinished, isReady,
        timeObj: formatTime(elapsedTime / 1000),
        progressPercent,
        activeSensors,
        splitRows,
        startTraining, stopTraining, resetSession, nextPlayer, formatTime
    };
};