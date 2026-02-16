import { useState } from 'react';
import { Alert } from 'react-native';
import { useBle } from '../../context/BleContext';

export const useSpeedTestSession = (config: any, onFinish: () => void) => {
    const {
        state, elapsedTime, sensors,
        startTraining, stopTraining, resetSession
    } = useBle();

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    // Отримуємо список гравців з конфігу
    const playersQueue = config.selectedPlayers && config.selectedPlayers.length > 0
        ? config.selectedPlayers
        : [{ id: 'guest', name: 'Гість', number: '-' }];

    // Поточний об'єкт гравця
    const currentPlayerObj = playersQueue[currentPlayerIndex];

    const isRunning = state === 'active';
    const isFinished = state === 'finished';
    const isReady = state === 'armed';

    // --- ЛОГІКА СЕНСОРІВ ---
    let activeSensors = sensors
        .filter(s => s.status === 'active')
        .sort((a, b) => a.id - b.id);

    // Авто-стоп таймера, якщо останній сенсор активований
    if (isRunning && activeSensors.length > 1) {
        const lastSensor = activeSensors[activeSensors.length - 1];
        if (lastSensor.triggerTime && lastSensor.triggerTime > 0) {
            stopTraining();
        }
    }

    // Відфільтровуємо лише ті сенсори, що спрацювали до фінішу (щоб уникнути фантомних спрацювань)
    if (isFinished) {
        const lastTriggeredSensorId = activeSensors.reduce((maxId, s) =>
            (s.triggerTime && s.triggerTime > 0) ? s.id : maxId, 0);
        activeSensors = activeSensors.filter(s => s.id <= lastTriggeredSensorId);
    }

    // --- ФОРМАТУВАННЯ ---
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

    // Розрахунок прогресу для візуалізації треку
    const lastTriggeredIndex = activeSensors.reduce((lastIdx, sensor, idx) => {
        if (sensor.id === 0 && (isRunning || isFinished)) return Math.max(lastIdx, 0);
        if (sensor.triggerTime !== undefined && sensor.triggerTime > 0) return idx;
        return lastIdx;
    }, -1);

    const progressPercent = activeSensors.length > 1
        ? (Math.max(0, lastTriggeredIndex) / (activeSensors.length - 1)) * 100
        : 0;

    // Розрахунок сплітів для таблиці
    const splitRows: { label: string; time: number; type: 'SPLIT' | 'TOTAL' }[] = [];
    if (activeSensors.length > 1) {
        for (let i = 1; i < activeSensors.length; i++) {
            const current = activeSensors[i];
            const prev = activeSensors[i - 1];
            if (current.triggerTime && prev.triggerTime) {
                const diff = (current.triggerTime - prev.triggerTime) / 1000;
                splitRows.push({
                    label: i === activeSensors.length - 1 ? `Гейт ${prev.id} ➔ Фініш` : `Гейт ${prev.id} ➔ Гейт ${current.id}`,
                    time: diff,
                    type: 'SPLIT'
                });
            }
        }
        if (isFinished && elapsedTime > 0) {
            splitRows.push({ label: 'ЗАГАЛЬНИЙ ЧАС', time: elapsedTime / 1000, type: 'TOTAL' });
        }
    }

    // --- ОСНОВНА ДІЯ: ПЕРЕХІД ДО НАСТУПНОГО ГРАВЦЯ ---
    const nextPlayer = () => {
        // 1. Скидаємо всі стани в BleContext (час, тригери сенсорів)
        resetSession();

        // 2. Перевіряємо чи є наступний гравець
        if (currentPlayerIndex < playersQueue.length - 1) {
            setCurrentPlayerIndex(prev => prev + 1);
        } else {
            // Якщо гравці закінчилися
            Alert.alert(
                "Тест завершено",
                "Всі обрані гравці пройшли тестування.",
                [{ text: "До результатів", onPress: onFinish }]
            );
        }
    };

    return {
        currentPlayerObj,
        teamName: config.teamName || 'Вільне тренування',
        currentPlayerIndex,
        totalPlayers: playersQueue.length,
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