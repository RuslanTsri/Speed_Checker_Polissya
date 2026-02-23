import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSpeedTestSession } from '../../../hooks/tempoMetrics/useSpeedTestSession';
import { AppModal } from '../../components/AppModal';
import { useTheme } from '../../../context/ThemeContext'; // 🔥 Тема

const SensorDot = React.memo(({ isTriggered, isStart, isFinish, isDark }: {
    isTriggered: boolean, isStart: boolean, isFinish: boolean, isDark: boolean
}) => {
    let dotColors = isDark ? "bg-slate-800 border-slate-600 shadow-transparent" : "bg-slate-200 border-slate-300 shadow-transparent";
    if (isTriggered) {
        if (isStart) dotColors = isDark ? "bg-yellow-400 border-yellow-400 shadow-yellow-400/40" : "bg-yellow-500 border-yellow-500 shadow-yellow-500/40";
        else if (isFinish) dotColors = isDark ? "bg-green-400 border-green-400 shadow-green-400/40" : "bg-green-500 border-green-500 shadow-green-500/40";
        else dotColors = isDark ? "bg-blue-400 border-blue-400 shadow-blue-400/40" : "bg-blue-500 border-blue-500 shadow-blue-500/40";
    }
    return <View className={`w-4 h-4 rounded-full border-2 z-10 shadow-sm ${dotColors}`} />;
});

export default function SpeedTestRun({ config, onBack, onFinish }: { config: any, onBack: () => void, onFinish: () => void }) {
    const { isDark } = useTheme(); // 🔥 Стейт
    const {
        currentPlayerObj, teamName, currentPlayerIndex, totalPlayers,
        isRunning, isFinished, isReady, timeObj, progressPercent, activeSensors, splitRows,
        startTraining, stopTraining, resetSession, nextPlayer, formatTime,
        currentRunResult, localResults, showIndividualModal, confirmIndividualRun,
        retryIndividualRun, showSummaryModal, saveAllResults, restartWholeSession, isSaving
    } = useSpeedTestSession(config, onFinish);

    // 🔥 СТАТИЧНІ КОЛЬОРИ ДЛЯ ВЕЛИКОГО СПИСКУ В МОДАЛЦІ
    const colors = {
        bgList: isDark ? 'rgba(2, 6, 23, 0.5)' : '#f8fafc',
        borderList: isDark ? '#1e293b' : '#e2e8f0',
        borderRow: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f1f5f9',
        textMain: isDark ? '#ffffff' : '#0f172a',
        textSub: isDark ? '#64748b' : '#64748b',
        yellow: isDark ? '#facc15' : '#eab308',
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <ScrollView className="flex-1 pt-4 px-4" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity onPress={onBack} className={`p-2 -ml-2 rounded-full ${isDark ? 'active:bg-slate-800' : 'active:bg-slate-200'}`}><Feather name="chevron-left" size={28} color={isDark ? "white" : "black"} /></TouchableOpacity>
                    <View className="items-center">
                        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Тестування</Text>
                        <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{teamName}</Text>
                    </View>
                    <View className="w-10" />
                </View>

                {/* Гравець Info */}
                <View className={`border rounded-2xl p-4 mb-8 flex-row justify-between items-center shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <View className="flex-row items-center">
                        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                            <Text className={`font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{currentPlayerObj.number || `#${currentPlayerIndex + 1}`}</Text>
                        </View>
                        <View>
                            <Text className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Гравець {currentPlayerIndex + 1} з {totalPlayers}</Text>
                            <Text className={`font-bold text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentPlayerObj.name}</Text>
                        </View>
                    </View>
                </View>

                {/* Таймер */}
                <View className="items-center mb-12">
                    <Text className={`text-xs font-bold tracking-[0.3em] uppercase mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{isFinished ? 'Результат' : 'Час'}</Text>
                    <View className="flex-row items-baseline">
                        <Text className={`text-7xl font-black font-mono tracking-tighter ${isFinished ? (isDark ? 'text-green-400' : 'text-green-600') : isReady ? (isDark ? 'text-yellow-400' : 'text-yellow-500') : (isDark ? 'text-white' : 'text-slate-900')}`}>{timeObj.main}</Text>
                        <Text className={`text-4xl font-black font-mono mb-1 ${isFinished ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-yellow-400' : 'text-yellow-500')}`}>{timeObj.decimal}</Text>
                    </View>
                </View>

                {/* Трек */}
                <View className="mb-12 h-80 relative w-full items-center">
                    <View className={`absolute top-0 bottom-0 w-[2px] ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <View className={`absolute top-0 w-[2px] shadow-lg ${isDark ? 'bg-green-500 shadow-green-500/50' : 'bg-green-500 shadow-green-400/50'}`} style={{ height: `${progressPercent}%` }} />
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
                                <View className="flex-1 items-end pr-6"><Text className={`text-[10px] font-black uppercase ${triggered || (isStart && isRunning) ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>{label}</Text></View>
                                <SensorDot isTriggered={triggered || (isStart && isRunning)} isStart={isStart} isFinish={isFinish} isDark={isDark} />
                                <View className="flex-1 items-start pl-6"><Text className={`font-mono text-xs ${triggered || (isStart && isRunning) ? (isDark ? 'text-slate-300' : 'text-slate-600') : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>{timeDisplay}</Text></View>
                            </View>
                        );
                    })}
                </View>

                {/* Кнопки */}
                <View className="mb-6">
                    {!isRunning && !isFinished && !isReady ? (
                        <TouchableOpacity onPress={startTraining} className="bg-green-500 py-5 rounded-2xl items-center flex-row justify-center shadow-sm">
                            <Feather name="play" size={24} color="#0f172a" style={{ marginRight: 10 }} /><Text className="font-black text-xl text-slate-900">СТАРТ</Text>
                        </TouchableOpacity>
                    ) : isRunning ? (
                        <TouchableOpacity onPress={stopTraining} className="bg-red-500 py-5 rounded-2xl items-center flex-row justify-center shadow-sm">
                            <Feather name="square" size={24} color="white" style={{ marginRight: 10 }} /><Text className="text-white font-black text-xl">СТОП</Text>
                        </TouchableOpacity>
                    ) : !isFinished ? (
                        <View className="flex-row space-x-3">
                            <TouchableOpacity onPress={resetSession} className={`flex-1 py-4 rounded-2xl items-center mr-2 border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}><Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Скинути</Text></TouchableOpacity>
                            <TouchableOpacity onPress={nextPlayer} className="flex-[2] bg-yellow-400 py-4 rounded-2xl items-center shadow-sm"><Text className="text-slate-900 font-black text-lg uppercase">Пропустити</Text></TouchableOpacity>
                        </View>
                    ) : null}
                </View>
            </ScrollView>

            {/* 1. МОДАЛКА ОДНОГО ГРАВЦЯ */}
            <AppModal
                visible={showIndividualModal}
                onClose={() => {}}
                title={`Результат: ${currentPlayerObj.name}`}
                type="center"
            >
                <View className="items-center">
                    <Text className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Час спроби</Text>
                    <View className="flex-row items-baseline mb-6">
                        <Text className={`text-6xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentRunResult?.fullTime.toFixed(2).split('.')[0] || timeObj.main.split(':')[0]}:{timeObj.main.split(':')[1]}</Text>
                        <Text className={`text-3xl font-black ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`}>.{currentRunResult?.fullTime.toFixed(3).split('.')[1] || timeObj.decimal.split('.')[1]}</Text>
                    </View>

                    <View className="flex-row w-full gap-3">
                        <TouchableOpacity onPress={retryIndividualRun} className={`flex-1 py-4 rounded-xl items-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                            <Text className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Перебігти</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={confirmIndividualRun} className="flex-1 bg-green-500 py-4 rounded-xl items-center flex-row justify-center">
                            <Text className="text-slate-900 font-black uppercase mr-1">Зарахувати</Text>
                            <Feather name="check" size={18} color="#0f172a" />
                        </TouchableOpacity>
                    </View>
                </View>
            </AppModal>

            {/* 2. ЗАГАЛЬНА МОДАЛКА (ОПТИМІЗОВАНА БЕЗ NativeWind У ЦИКЛІ) */}
            <AppModal
                visible={showSummaryModal}
                onClose={() => {}}
                title={`Підсумок (${localResults.length})`}
                type="center"
            >
                <View className="h-96 w-full">
                    <Text className={`text-xs mb-4 text-center ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Перевірте список перед записом у базу даних.</Text>

                    <FlatList
                        data={localResults}
                        keyExtractor={(_, index) => index.toString()}
                        className="flex-1 rounded-xl border mb-4"
                        style={{ backgroundColor: colors.bgList, borderColor: colors.borderList }}
                        contentContainerStyle={{ padding: 12 }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <View className="flex-row justify-between items-center py-3 border-b" style={{ borderColor: colors.borderRow }}>
                                <View className="flex-row items-center">
                                    <Text className="w-6 font-bold" style={{ color: colors.textSub }}>{index + 1}.</Text>
                                    <View>
                                        <Text className="font-bold text-sm" style={{ color: colors.textMain }}>{item.player.name}</Text>
                                        <Text className="text-[10px]" style={{ color: colors.textSub }}>#{item.player.number}</Text>
                                    </View>
                                </View>
                                <Text className="font-mono font-bold text-lg" style={{ color: colors.yellow }}>{item.fullTime.toFixed(3)}s</Text>
                            </View>
                        )}
                    />

                    <View className="flex-row w-full gap-3 mt-2">
                        <TouchableOpacity onPress={restartWholeSession} className={`flex-1 py-4 rounded-xl items-center border ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                            <Text className={`font-bold uppercase ${isDark ? 'text-red-400' : 'text-red-500'}`}>Скинути все</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={saveAllResults} disabled={isSaving} className="flex-1 bg-green-500 py-4 rounded-xl items-center flex-row justify-center">
                            {isSaving ? <ActivityIndicator color="#0f172a" size="small" /> : (
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