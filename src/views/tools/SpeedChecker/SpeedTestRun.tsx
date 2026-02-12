import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useBle } from '../../../context/BleContext';

interface Props {
    config: any;
    onBack: () => void;
    onFinish: () => void;
}

export default function SpeedTestRun({ config, onBack, onFinish }: Props) {
    const {
        state, elapsedTime, sensors,
        startTraining, stopTraining, resetSession
    } = useBle();

    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const players = config.selectedPlayers.length > 0 ? config.selectedPlayers : ['Гість'];
    const currentPlayer = players[currentPlayerIndex];

    const isRunning = state === 'active';
    const isFinished = state === 'finished';
    const isReady = state === 'armed';

    // 1. Отримуємо всі активні сенсори
    let activeSensors = sensors
        .filter(s => s.status === 'active')
        .sort((a, b) => a.id - b.id);

    // 🔥 ФІКС БАГА З СИНІМ ФІНІШЕМ
    // Якщо забіг завершено, ми повинні приховати всі сенсори, які йдуть ПІСЛЯ того, хто зафіксував фініш.
    // Це гарантує, що останній намальований сенсор буде вважатися фінішем (isFinish = true -> Зелений).
    if (isFinished) {
        // Знаходимо ID останнього сенсора, який спрацював (має час > 0)
        const lastTriggeredSensorId = activeSensors.reduce((maxId, s) => {
            return (s.triggerTime && s.triggerTime > 0) ? s.id : maxId;
        }, 0);

        // Фільтруємо список, залишаючи тільки ті, що брали участь у забігу (до фінішного включно)
        activeSensors = activeSensors.filter(s => s.id <= lastTriggeredSensorId);
    }

    const totalSensors = activeSensors.length;

    // 2. Форматування часу
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

    // 3. Розрахунок прогресу
    const lastTriggeredIndex = activeSensors.reduce((lastIdx, sensor, idx) => {
        if (sensor.id === 0 && (isRunning || isFinished)) return Math.max(lastIdx, 0);
        if (sensor.triggerTime !== undefined && sensor.triggerTime > 0) return idx;
        return lastIdx;
    }, -1);

    const progressPercent = totalSensors > 1
        ? (Math.max(0, lastTriggeredIndex) / (totalSensors - 1)) * 100
        : 0;

    // 4. Спліти
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

    const nextPlayer = () => {
        resetSession();
        if (currentPlayerIndex < players.length - 1) {
            setCurrentPlayerIndex(prev => prev + 1);
        } else {
            Alert.alert("Тест завершено", "Всі гравці пройшли тест.", [{ text: "ОК", onPress: onFinish }]);
        }
    };

    return (
        <ScrollView className="flex-1 bg-slate-950 pt-4 px-4" contentContainerStyle={{ paddingBottom: 40 }}>

            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2"><Feather name="chevron-left" size={28} color="white" /></TouchableOpacity>
                <Text className="text-white text-lg font-bold">Тестування</Text>
                <View className="w-10" />
            </View>

            {/* Гравець Info */}
            <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8 flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center mr-3 border border-slate-700">
                        <Text className="text-slate-400 font-bold">#{currentPlayerIndex + 1}</Text>
                    </View>
                    <View>
                        <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Гравець</Text>
                        <Text className="text-white font-bold text-lg">{currentPlayer}</Text>
                    </View>
                </View>
            </View>

            {/* Main Timer */}
            <View className="items-center mb-12">
                <Text className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase mb-2">
                    {isFinished ? 'Фінішний час' : 'Поточний час'}
                </Text>
                <View className="flex-row items-baseline">
                    <Text className={`text-7xl font-black font-mono tracking-tighter ${isFinished ? 'text-green-400' : isRunning ? 'text-white' : isReady ? 'text-yellow-400' : 'text-slate-600'}`}>
                        {timeObj.main}
                    </Text>
                    <Text className={`text-4xl font-black font-mono mb-1 ${isFinished ? 'text-green-400' : isRunning ? 'text-yellow-400' : isReady ? 'text-yellow-400' : 'text-slate-600'}`}>
                        {timeObj.decimal}
                    </Text>
                </View>
                {isReady && <Text className="text-yellow-500 font-bold uppercase animate-pulse mt-2">Очікування старту...</Text>}
            </View>

            {/* TRACK VISUALIZATION */}
            <View className="mb-12 h-80 relative w-full items-center">

                {/* Background Line */}
                <View className="absolute top-0 bottom-0 w-[2px] bg-slate-800" />

                {/* Progress Line */}
                <View
                    className="absolute top-0 w-[2px] bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                    style={{ height: `${progressPercent}%` }}
                />

                {/* Sensors */}
                {activeSensors.map((sensor, index) => {
                    const isTriggered = sensor.triggerTime !== undefined && sensor.triggerTime > 0;

                    const isStart = index === 0;
                    // Тепер це гарантовано останній елемент у списку візуалізації
                    const isFinish = index === activeSensors.length - 1;

                    const topPercent = (index / (Math.max(1, activeSensors.length - 1))) * 100;

                    let dotColorClass = "bg-slate-800 border-slate-600";
                    let textColorClass = "text-slate-600";
                    let timeColorClass = "text-slate-700";

                    // Logic for colors
                    if (isTriggered || (isStart && (isRunning || isFinished))) {
                        if (isStart) {
                            dotColorClass = "bg-yellow-400 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]";
                            textColorClass = "text-yellow-400";
                            timeColorClass = "text-white";
                        } else if (isFinish) {
                            dotColorClass = "bg-green-400 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]";
                            textColorClass = "text-green-400";
                            timeColorClass = "text-green-400";
                        } else {
                            dotColorClass = "bg-blue-400 border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]";
                            textColorClass = "text-blue-400";
                            timeColorClass = "text-blue-200";
                        }
                    }

                    let label = `GATE ${sensor.id}`;
                    if (isStart) label = "START";
                    if (isFinish) label = "FINISH";

                    let timeDisplay = "--:--";
                    if (isStart && (isRunning || isFinished)) {
                        timeDisplay = "00:00.00";
                    } else if (sensor.triggerTime) {
                        const t = formatTime(sensor.triggerTime / 1000);
                        timeDisplay = `${t.main}${t.decimal}`;
                    }

                    return (
                        <View
                            key={sensor.id}
                            className="absolute w-full flex-row items-center justify-center"
                            style={{ top: `${topPercent}%`, marginTop: -12 }}
                        >
                            <View className="flex-1 items-end pr-6">
                                <Text className={`text-xs font-bold uppercase ${textColorClass}`}>{label}</Text>
                            </View>

                            <View className={`w-4 h-4 rounded-full border-2 ${dotColorClass} z-10`} />

                            <View className="flex-1 items-start pl-6">
                                <View className={`bg-slate-900 px-2 py-1 rounded border ${isTriggered || (isStart && isRunning) ? 'border-slate-700' : 'border-slate-800'}`}>
                                    <Text className={`font-mono font-bold text-xs ${timeColorClass}`}>
                                        {timeDisplay}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Details Table */}
            {splitRows.length > 0 && (
                <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8">
                    <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Детальні спліти</Text>
                    {splitRows.map((row, idx) => (
                        <View key={idx} className={`flex-row justify-between items-center py-3 ${idx < splitRows.length - 1 ? 'border-b border-slate-800' : ''}`}>
                            <Text className={`text-sm font-bold ${row.type === 'TOTAL' ? 'text-white' : 'text-slate-400'}`}>
                                {row.label}
                            </Text>
                            <Text className={`font-mono font-bold ${row.type === 'TOTAL' ? 'text-green-400 text-lg' : 'text-blue-200'}`}>
                                {row.time.toFixed(2)} с
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Controls */}
            <View className="mb-6">
                {!isRunning && !isFinished && !isReady ? (
                    <TouchableOpacity onPress={startTraining} className="bg-green-500 w-full py-5 rounded-2xl items-center shadow-lg shadow-green-500/20 active:bg-green-600 flex-row justify-center">
                        <Feather name="play" size={24} color="#0f172a" style={{marginRight: 10}} />
                        <Text className="text-slate-900 font-black text-xl uppercase">СТАРТ</Text>
                    </TouchableOpacity>
                ) : isRunning ? (
                    <TouchableOpacity onPress={stopTraining} className="bg-red-500 w-full py-5 rounded-2xl items-center shadow-lg shadow-red-500/20 active:bg-red-600 flex-row justify-center">
                        <Feather name="square" size={24} color="white" style={{marginRight: 10}} />
                        <Text className="text-white font-black text-xl uppercase">СТОП</Text>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-row space-x-3">
                        <TouchableOpacity onPress={resetSession} className="flex-1 bg-slate-800 border border-slate-700 py-4 rounded-2xl items-center">
                            <Text className="text-white font-bold uppercase">Скинути</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={nextPlayer} className="flex-[2] bg-yellow-400 py-4 rounded-2xl items-center shadow-lg shadow-yellow-400/20">
                            <Text className="text-slate-900 font-black text-lg uppercase">Наступний</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

        </ScrollView>
    );
}