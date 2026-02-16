import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useBle } from '../../context/BleContext';

export const useSpeedTestSession = (config: any, onFinish: () => void) => {
    const {
        state, elapsedTime, sensors,
        startTraining, stopTraining, resetSession
    } = useBle();

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    // 1. Спочатку оголошуємо стани сесії
    const isRunning = state === 'active';
    const isFinished = state === 'finished';
    const isReady = state === 'armed';

    // 2. Отримуємо активні сенсори (Це має бути перед totalSensors)
    let activeSensors = sensors
        .filter(s => s.status === 'active')
        .sort((a, b) => a.id - b.id);

    // 3. Якщо ми на Фініші, відфільтровуємо сенсори, які не спрацювали
    if (isFinished) {
        const lastTriggered = [...activeSensors].reverse().find(s => s.triggerTime !== undefined);
        if (lastTriggered) {
            activeSensors = activeSensors.filter(s => s.id <= lastTriggered.id);
        }
    }

    // 4. Тепер можна рахувати довжину та прогрес
    const totalSensors = activeSensors.length;

    // --- ЛОГИ ---
    useEffect(() => {
        console.log("--- SpeedTestSession Init ---");
        console.log("Config received:", config);
        console.log("Total players in queue:", config.selectedPlayers?.length);
    }, []);

    // Отримуємо список об'єктів гравців
    const playersQueue = config.selectedPlayers && config.selectedPlayers.length > 0
        ? config.selectedPlayers
        : [{ id: 'guest', name: 'Гість', number: '-' }];

    const currentPlayerObj = playersQueue[currentPlayerIndex];

    useEffect(() => {
        console.log(`Current Player Changed: [${currentPlayerIndex}] ${currentPlayerObj?.name}`);
    }, [currentPlayerIndex, currentPlayerObj]);


    // --- ФОРМАТУВАННЯ ЧАСУ ---
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

    const timeObj = formatTime(elapsedTime / 1000);

    // --- ПРОГРЕС ---
    const lastTriggeredIndex = activeSensors.reduce((lastIdx, sensor, idx) => {
        const isStart = idx === 0;
        const hasTime = sensor.triggerTime !== undefined;

        if (isStart && (isRunning || isFinished)) return 0;
        if (hasTime) return idx;
        return lastIdx;
    }, -1);

    const progressPercent = totalSensors > 1
        ? (Math.max(0, lastTriggeredIndex) / (totalSensors - 1)) * 100
        : 0;

    // --- СПЛІТИ ---
    const splitRows: { label: string; time: number; type: 'SPLIT' | 'TOTAL' }[] = [];
    if (activeSensors.length > 1) {
        for (let i = 1; i < activeSensors.length; i++) {
            const current = activeSensors[i];
            const prev = activeSensors[i - 1];
            if (current.triggerTime !== undefined && prev.triggerTime !== undefined) {
                const diff = (current.triggerTime - prev.triggerTime) / 1000;
                const label = i === activeSensors.length - 1 ? 'START ➔ FINISH' : `GATE ${i} ➔ GATE ${i+1}`;
                splitRows.push({
                    label: i === activeSensors.length - 1 && activeSensors.length === 2
                        ? 'START ➔ FINISH'
                        : label,
                    time: diff,
                    type: 'SPLIT'
                });
            }
        }
        if (isFinished && elapsedTime > 0) {
            splitRows.push({ label: 'ЗАГАЛЬНИЙ ЧАС', time: elapsedTime / 1000, type: 'TOTAL' });
        }
    }

    // --- ДІЯ: НАСТУПНИЙ ГРАВЕЦЬ ---
    const nextPlayer = () => {
        console.log("Button 'NEXT' pressed");
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
        isDataLoaded: true,
        isRunning,
        isFinished,
        isReady,
        timeObj,
        progressPercent,
        activeSensors,
        splitRows,
        startTraining,
        stopTraining,
        resetSession,
        nextPlayer,
        formatTime
    };
};