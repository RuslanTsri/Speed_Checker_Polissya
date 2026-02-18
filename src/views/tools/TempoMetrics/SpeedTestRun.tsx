import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSpeedTestSession } from '../../../hooks/tempoMetrics/useSpeedTestSession';
import { AppModal } from '../../components/AppModal';

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
        startTraining, stopTraining, resetSession, nextPlayer, formatTime,

        // Пропси для модалок
        currentRunResult,
        localResults,

        showIndividualModal,
        confirmIndividualRun,
        retryIndividualRun,

        showSummaryModal,
        saveAllResults,
        restartWholeSession,
        isSaving
    } = useSpeedTestSession(config, onFinish);

    return (
        <View className="flex-1 bg-slate-950">
            <ScrollView className="flex-1 pt-4 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
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
                    <View className="absolute top-0 w-[2px] bg-green-500 shadow-lg shadow-green-500/50" style={{ height: `${progressPercent}%` }} />
                    {activeSensors.map((sensor, index) => {
                        const triggered = sensor.triggerTime !== undefined && sensor.triggerTime > 0;
                        const isStart = index === 0;
                        const isFinish = index === activeSensors.length - 1;
                        const top = (index / (Math.max(1, activeSensors.length - 1))) * 100;
                        let label = `GATE ${index}`;
                        if (isStart) label = "START"; else if (isFinish) label = "FINISH";
                        let timeDisplay = "--:--";
                        if (isStart && (isRunning || isFinished)) timeDisplay = "00:00.00";
                        else if (sensor.triggerTime) {
                            const t = formatTime(sensor.triggerTime / 1000);
                            timeDisplay = `${t.main}${t.decimal}`;
                        }
                        return (
                            <View key={`sensor-${sensor.id}`} className="absolute w-full flex-row items-center justify-center" style={{ top: `${top}%`, marginTop: -12 }}>
                                <View className="flex-1 items-end pr-6"><Text className={`text-[10px] font-black uppercase ${triggered || (isStart && isRunning) ? 'text-white' : 'text-slate-600'}`}>{label}</Text></View>
                                <SensorDot isTriggered={triggered || (isStart && isRunning)} isStart={isStart} isFinish={isFinish} />
                                <View className="flex-1 items-start pl-6"><Text className={`font-mono text-xs ${triggered || (isStart && isRunning) ? 'text-slate-300' : 'text-slate-600'}`}>{timeDisplay}</Text></View>
                            </View>
                        );
                    })}
                </View>

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
                    ) : !isFinished ? (
                        <View className="flex-row space-x-3">
                            <TouchableOpacity onPress={resetSession} className="flex-1 bg-slate-800 py-4 rounded-2xl items-center mr-2"><Text className="text-white font-bold">Скинути</Text></TouchableOpacity>
                            <TouchableOpacity onPress={nextPlayer} className="flex-[2] bg-yellow-400 py-4 rounded-2xl items-center"><Text className="text-slate-900 font-black text-lg uppercase">Пропустити</Text></TouchableOpacity>
                        </View>
                    ) : null}
                </View>
            </ScrollView>

            {/* 1. МОДАЛКА ОДНОГО ГРАВЦЯ (З'являється після кожного фінішу) */}
            <AppModal
                visible={showIndividualModal}
                onClose={() => {}}
                title={`Результат: ${currentPlayerObj.name}`}
                type="center"
            >
                <View className="items-center">
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Час спроби</Text>
                    {/* Показуємо час з state, або з currentRunResult, якщо він вже сформований */}
                    <View className="flex-row items-baseline mb-6">
                        <Text className="text-white text-6xl font-black">{currentRunResult?.fullTime.toFixed(2).split('.')[0] || timeObj.main.split(':')[0]}:{timeObj.main.split(':')[1]}</Text>
                        <Text className="text-yellow-400 text-3xl font-black">.{currentRunResult?.fullTime.toFixed(3).split('.')[1] || timeObj.decimal.split('.')[1]}</Text>
                    </View>

                    <View className="flex-row w-full gap-3">
                        <TouchableOpacity onPress={retryIndividualRun} className="flex-1 bg-slate-800 py-4 rounded-xl items-center border border-slate-700">
                            <Text className="text-slate-300 font-bold">Перебігти</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={confirmIndividualRun} className="flex-1 bg-green-500 py-4 rounded-xl items-center flex-row justify-center">
                            <Text className="text-slate-900 font-black uppercase mr-1">Зарахувати</Text>
                            <Feather name="check" size={18} color="#0f172a" />
                        </TouchableOpacity>
                    </View>
                </View>
            </AppModal>

            {/* 2. ЗАГАЛЬНА МОДАЛКА (З'являється після останнього гравця) */}
            <AppModal
                visible={showSummaryModal}
                onClose={() => {}}
                title={`Підсумок (${localResults.length})`}
                type="center"
            >
                <View className="h-96 w-full">
                    <Text className="text-slate-500 text-xs mb-4 text-center">Перевірте список перед записом у базу даних.</Text>
                    <FlatList
                        data={localResults}
                        keyExtractor={(_, index) => index.toString()}
                        className="flex-1 bg-slate-950/50 rounded-xl border border-slate-800 mb-4"
                        contentContainerStyle={{ padding: 12 }}
                        renderItem={({ item, index }) => (
                            <View className="flex-row justify-between items-center py-3 border-b border-slate-800/50 last:border-0">
                                <View className="flex-row items-center">
                                    <Text className="text-slate-500 w-6 font-bold">{index + 1}.</Text>
                                    <View>
                                        <Text className="text-white font-bold text-sm">{item.player.name}</Text>
                                        <Text className="text-slate-500 text-[10px]">#{item.player.number}</Text>
                                    </View>
                                </View>
                                <Text className="text-yellow-400 font-mono font-bold text-lg">{item.fullTime.toFixed(3)}s</Text>
                            </View>
                        )}
                    />
                    <View className="flex-row w-full gap-3 mt-2">
                        <TouchableOpacity onPress={restartWholeSession} className="flex-1 bg-red-500/10 py-4 rounded-xl items-center border border-red-500/30">
                            <Text className="text-red-400 font-bold uppercase">Скинути все</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={saveAllResults} disabled={isSaving} className="flex-1 bg-green-500 py-4 rounded-xl items-center flex-row justify-center">
                            {isSaving ? <ActivityIndicator color="black" size="small" /> : (
                                <>
                                    <Text className="text-slate-900 font-black uppercase mr-1">В базу</Text>
                                    <Feather name="database" size={18} color="#0f172a" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </AppModal>
        </View>
    );
}