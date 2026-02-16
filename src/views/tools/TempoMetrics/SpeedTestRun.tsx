import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSpeedTestSession } from '../../../hooks/tempoMetrics/useSpeedTestSession';

// ✅ Стабільний компонент крапки для усунення CssInterop warning
const SensorDot = React.memo(({ isTriggered, isStart, isFinish }: {
    isTriggered: boolean, isStart: boolean, isFinish: boolean
}) => {
    let dotColors = "bg-slate-800 border-slate-600 shadow-transparent";
    if (isTriggered) {
        if (isStart) dotColors = "bg-yellow-400 border-yellow-400 shadow-yellow-400/40";
        else if (isFinish) dotColors = "bg-green-400 border-green-400 shadow-green-400/40";
        else dotColors = "bg-blue-400 border-blue-400 shadow-blue-400/40";
    }
    return <View className={`w-4 h-4 rounded-full border-2 z-10 shadow-sm ${dotColors}`} />;
});

export default function SpeedTestRun({ config, onBack, onFinish }: { config: any, onBack: () => void, onFinish: () => void }) {
    const {
        currentPlayerObj, teamName, currentPlayerIndex, totalPlayers,
        isRunning, isFinished, isReady, timeObj, progressPercent, activeSensors, splitRows,
        startTraining, stopTraining, resetSession, nextPlayer, formatTime
    } = useSpeedTestSession(config, onFinish);

    return (
        <ScrollView className="flex-1 bg-slate-950 pt-4 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2"><Feather name="chevron-left" size={28} color="white" /></TouchableOpacity>
                <View className="items-center">
                    <Text className="text-white text-lg font-bold">Тестування</Text>
                    <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{teamName}</Text>
                </View>
                <View className="w-10" />
            </View>

            {/* Гравець Info */}
            <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8 flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-slate-800 rounded-full items-center justify-center mr-4 border border-slate-700">
                        <Text className="text-slate-400 font-bold text-lg">{currentPlayerObj.number || `#${currentPlayerIndex + 1}`}</Text>
                    </View>
                    <View>
                        <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Гравець {currentPlayerIndex + 1} з {totalPlayers}</Text>
                        <Text className="text-white font-bold text-xl">{currentPlayerObj.name}</Text>
                    </View>
                </View>
            </View>

            {/* Таймер */}
            <View className="items-center mb-12">
                <Text className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase mb-2">{isFinished ? 'Результат' : 'Час'}</Text>
                <View className="flex-row items-baseline">
                    <Text className={`text-7xl font-black font-mono tracking-tighter ${isFinished ? 'text-green-400' : isReady ? 'text-yellow-400' : 'text-white'}`}>{timeObj.main}</Text>
                    <Text className={`text-4xl font-black font-mono mb-1 ${isFinished ? 'text-green-400' : 'text-yellow-400'}`}>{timeObj.decimal}</Text>
                </View>
            </View>

            {/* Трек */}
            <View className="mb-12 h-80 relative w-full items-center">
                <View className="absolute top-0 bottom-0 w-[2px] bg-slate-800" />
                <View className="absolute top-0 w-[2px] bg-green-500 shadow-lg" style={{ height: `${progressPercent}%` }} />

                {activeSensors.map((sensor, index) => {
                    const triggered = sensor.triggerTime !== undefined && sensor.triggerTime > 0;
                    const start = index === 0;
                    const finish = index === activeSensors.length - 1;
                    const top = (index / (Math.max(1, activeSensors.length - 1))) * 100;

                    let timeDisplay = "--:--";
                    if (start && (isRunning || isFinished)) timeDisplay = "00:00.00";
                    else if (sensor.triggerTime) {
                        const t = formatTime(sensor.triggerTime / 1000);
                        timeDisplay = `${t.main}${t.decimal}`;
                    }

                    return (
                        <View key={`sensor-${sensor.id}`} className="absolute w-full flex-row items-center justify-center" style={{ top: `${top}%`, marginTop: -12 }}>
                            <View className="flex-1 items-end pr-6"><Text className="text-xs font-bold text-slate-600 uppercase">{start ? 'START' : finish ? 'FINISH' : `GATE ${sensor.id}`}</Text></View>
                            <SensorDot isTriggered={triggered || (start && isRunning)} isStart={start} isFinish={finish} />
                            <View className="flex-1 items-start pl-6"><Text className="font-mono text-xs text-slate-500">{timeDisplay}</Text></View>
                        </View>
                    );
                })}
            </View>

            {/* Спліти */}
            {splitRows.length > 0 && (
                <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8">
                    {splitRows.map((row, idx) => (
                        <View key={idx} className="flex-row justify-between py-2 border-b border-slate-800 last:border-0">
                            <Text className="text-slate-400 font-bold text-xs">{row.label}</Text>
                            <Text className="text-white font-mono font-bold">{row.time.toFixed(2)} с</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Кнопки */}
            <View className="mb-6">
                {!isRunning && !isFinished && !isReady ? (
                    <TouchableOpacity onPress={startTraining} className="bg-green-500 py-5 rounded-2xl items-center flex-row justify-center">
                        <Feather name="play" size={24} style={{ marginRight: 10 }} /><Text className="font-black text-xl">СТАРТ</Text>
                    </TouchableOpacity>
                ) : isRunning ? (
                    <TouchableOpacity onPress={stopTraining} className="bg-red-500 py-5 rounded-2xl items-center flex-row justify-center">
                        <Feather name="square" size={24} color="white" style={{ marginRight: 10 }} /><Text className="text-white font-black text-xl">СТОП</Text>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-row space-x-3">
                        <TouchableOpacity onPress={resetSession} className="flex-1 bg-slate-800 py-4 rounded-2xl items-center mr-2"><Text className="text-white font-bold">Скинути</Text></TouchableOpacity>
                        <TouchableOpacity onPress={nextPlayer} className="flex-[2] bg-yellow-400 py-4 rounded-2xl items-center">
                            <Text className="text-slate-900 font-black text-lg uppercase">{currentPlayerIndex === totalPlayers - 1 ? 'Завершити' : 'Наступний'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}