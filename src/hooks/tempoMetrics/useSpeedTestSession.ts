import { useState, useEffect, useRef, useMemo } from 'react';
import { Alert } from 'react-native';
import { useBle } from '../../context/BleContext';
import { sessionsService } from '../../services/sessionsService';
import { resultsService } from '../../services/resultsService';

export interface LocalResult {
    player: any;
    fullTime: number;
    gates: number[];
}

export const useSpeedTestSession = (config: any, onFinish: () => void) => {
    const {
        state, elapsedTime, sensors,
        startTraining, stopTraining, resetSession
    } = useBle();

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // 📦 Стан накопичення результатів
    const [localResults, setLocalResults] = useState<LocalResult[]>([]);
    const [currentRunResult, setCurrentRunResult] = useState<LocalResult | null>(null);

    // Модалки
    const [showIndividualModal, setShowIndividualModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const hasProcessedRun = useRef(false);

    // Стани BLE
    const isRunning = state === 'active';
    const isFinished = state === 'finished';
    const isReady = state === 'armed';

    const playersQueue = config.selectedPlayers?.length > 0
        ? config.selectedPlayers
        : [{ id: 'guest', name: 'Гість', number: '-' }];

    const currentPlayerObj = playersQueue[currentPlayerIndex];
    const isLastPlayer = currentPlayerIndex === playersQueue.length - 1;

    // 1. Створення сесії при старті
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

    // 2. Логіка ФІНІШУ
    useEffect(() => {
        if (isFinished && !hasProcessedRun.current) {
            handleRunFinish();
        }
        if (isReady || isRunning) {
            hasProcessedRun.current = false;
        }
    }, [isFinished, isReady, isRunning]);

    const handleRunFinish = () => {
        hasProcessedRun.current = true;

        const result: LocalResult = {
            player: currentPlayerObj,
            fullTime: Number((elapsedTime / 1000).toFixed(3)),
            gates: activeSensors
                .filter(s => s.triggerTime !== undefined && s.id > 1)
                .map(s => Number((s.triggerTime! / 1000).toFixed(3)))
        };

        setCurrentRunResult(result);
        setShowIndividualModal(true);
    };

    // --- ЛОГІКА МОДАЛКИ ОДНОГО ГРАВЦЯ ---
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

    // --- 🔥 ГОЛОВНА ЛОГІКА ЗБЕРЕЖЕННЯ І ОЧИЩЕННЯ ---
    const saveAllResults = async () => {
        if (!sessionId) return;
        setIsSaving(true);

        try {
            // 1. Відправляємо запити в БД
            const promises = localResults.map(res => {
                return resultsService.saveResult({
                    session_id: sessionId,
                    player_id: res.player.id !== 'guest' ? res.player.id : null,
                    full_time: res.fullTime,
                    gates: res.gates,
                    is_best: false
                });
            });

            await Promise.all(promises);

            // 2. Якщо все пройшло успішно
            setIsSaving(false);
            setShowSummaryModal(false);

            // 🧹 ОЧИЩЕННЯ КЕШУ
            setLocalResults([]);
            setCurrentPlayerIndex(0);

            Alert.alert("Успіх", "Всі результати збережено!", [
                {
                    text: "ОК",
                    onPress: () => {
                        // Додаткова гарантія очищення при виході
                        setLocalResults([]);
                        onFinish(); // Вихід з екрану
                    }
                }
            ]);

        } catch (error) {
            console.error(error);
            setIsSaving(false);
            // ⚠️ ВАЖЛИВО: При помилці НЕ очищаємо кеш,
            // щоб тренер міг спробувати натиснути "Зберегти" ще раз (наприклад, якщо зник інтернет)
            Alert.alert("Помилка", "Не вдалося зберегти дані. Перевірте інтернет та спробуйте ще раз.");
        }
    };

    // --- ПОВНЕ СКИДАННЯ (КНОПКА "ЗАНОВО") ---
    const restartWholeSession = () => {
        setShowSummaryModal(false);
        setLocalResults([]); // 🧹 Очищаємо кеш
        setCurrentPlayerIndex(0); // Повертаємось на початок
        resetSession();
        hasProcessedRun.current = false;
    };

    const nextPlayer = () => {
        resetSession();
        if (currentPlayerIndex < playersQueue.length - 1) {
            setCurrentPlayerIndex(prev => prev + 1);
        }
    };

    // --- Helper logic (Sensors & Progress) ---
    let activeSensors = sensors.filter(s => s.status === 'active').sort((a, b) => a.id - b.id);
    if (isFinished) {
        const lastTriggered = [...activeSensors].reverse().find(s => s.triggerTime !== undefined);
        if (lastTriggered) activeSensors = activeSensors.filter(s => s.id <= lastTriggered.id);
    }
    const totalSensors = activeSensors.length;
    const lastTriggeredIndex = activeSensors.reduce((lastIdx, sensor, idx) => {
        const triggered = sensor.triggerTime !== undefined && sensor.triggerTime > 0;
        if (idx === 0 && (isRunning || isFinished)) return 0;
        if (triggered) return idx;
        return lastIdx;
    }, -1);
    const progressPercent = totalSensors > 1 ? (Math.max(0, lastTriggeredIndex) / (totalSensors - 1)) * 100 : 0;

    const splitRows = useMemo(() => {
        const rows: { label: string; time: number }[] = [];
        if (totalSensors > 1) {
            for (let i = 1; i < totalSensors; i++) {
                const current = activeSensors[i];
                const prev = activeSensors[i - 1];
                if (current.triggerTime !== undefined && prev.triggerTime !== undefined) {
                    const diff = (current.triggerTime - prev.triggerTime) / 1000;
                    let label = totalSensors === 2 ? "START ➔ FINISH" : (i === 1 ? "START ➔ GATE 1" : (i === totalSensors - 1 ? `GATE ${i-1} ➔ FINISH` : `GATE ${i-1} ➔ GATE ${i}`));
                    rows.push({ label, time: diff });
                }
            }
        }
        return rows;
    }, [activeSensors, isFinished]);

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
        startTraining, stopTraining, resetSession, nextPlayer, formatTime,

        currentRunResult,
        localResults,

        showIndividualModal,
        confirmIndividualRun,
        retryIndividualRun,

        showSummaryModal,
        saveAllResults,
        restartWholeSession,

        isSaving
    };
};