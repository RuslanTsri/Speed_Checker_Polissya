import { useState } from 'react';
import { Alert } from 'react-native';
import { useBle } from '../../context/BleContext';

export const useSpeedTestSession = (config: any, onFinish: () => void) => {
    const {
        state, elapsedTime, sensors,
        startTraining, stopTraining, resetSession
    } = useBle();

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    // Ініціалізація гравців
    const players = config.selectedPlayers.length > 0 ? config.selectedPlayers : ['Гість'];
    const currentPlayer = players[currentPlayerIndex];

    const isRunning = state === 'active';
    const isFinished = state === 'finished';
    const isReady = state === 'armed';

    // --- ЛОГІКА СЕНСОРІВ ---
    let activeSensors = sensors
        .filter(s => s.status === 'active')
        .sort((a, b) => a.id - b.id);

    // Якщо фінішували, відрізаємо "зайві" сенсори, які могли бути активовані випадково після фінішу
    if (isFinished) {
        const lastTriggeredSensorId = activeSensors.reduce((maxId, s) => {
            return (s.triggerTime && s.triggerTime > 0) ? s.id : maxId;
        }, 0);
        activeSensors = activeSensors.filter(s => s.id <= lastTriggeredSensorId);
    }

    const totalSensors = activeSensors.length;

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
        if (sensor.id === 0 && (isRunning || isFinished)) return Math.max(lastIdx, 0);
        if (sensor.triggerTime !== undefined && sensor.triggerTime > 0) return idx;
        return lastIdx;
    }, -1);

    const progressPercent = totalSensors > 1
        ? (Math.max(0, lastTriggeredIndex) / (totalSensors - 1)) * 100
        : 0;

    // --- СПЛІТИ (ТАБЛИЦЯ) ---
    const splitRows: { label: string; time: number; type: 'SPLIT' | 'TOTAL' }[] = [];
    if (activeSensors.length > 1) {
        for (let i = 1; i < activeSensors.length; i++) {
            const current = activeSensors[i];
            const prev = activeSensors[i - 1];
            if (current.triggerTime && prev.triggerTime) {
                const diff = (current.triggerTime - prev.triggerTime) / 1000;
                const label = i === activeSensors.length - 1
                    ? `Гейт ${prev.id} ➔ Фініш`
                    : `Гейт ${prev.id} ➔ Гейт ${current.id}`;
                splitRows.push({ label, time: diff, type: 'SPLIT' });
            }
        }
        if (isFinished && elapsedTime > 0) {
            splitRows.push({ label: 'ЗАГАЛЬНИЙ ЧАС', time: elapsedTime / 1000, type: 'TOTAL' });
        }
    }

    // --- ДІЇ ---
    const nextPlayer = () => {
        resetSession();
        if (currentPlayerIndex < players.length - 1) {
            setCurrentPlayerIndex(prev => prev + 1);
        } else {
            Alert.alert("Тест завершено", "Всі гравці пройшли тест.", [{ text: "ОК", onPress: onFinish }]);
        }
    };

    return {
        // State
        currentPlayer,
        currentPlayerIndex,
        totalPlayers: players.length,
        isRunning,
        isFinished,
        isReady,
        timeObj,
        progressPercent,
        activeSensors,
        splitRows,

        // Actions
        startTraining,
        stopTraining,
        resetSession,
        nextPlayer,
        formatTime
    };
};