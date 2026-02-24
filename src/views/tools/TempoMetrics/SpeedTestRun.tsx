import React from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    ActivityIndicator, FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSpeedTestSession } from '../../../hooks/tempoMetrics/useSpeedTestSession';
import { AppModal } from '../../components/AppModal';
import { useTheme } from '../../../context/ThemeContext';

// --- SENSOR DOT ---
// isStart  → жовтий (master, ID=0)
// isFinish → зелений (останній slave)
// інакше   → синій (проміжний gate)
const SensorDot = React.memo(({
                                  isTriggered, isStart, isFinish, isDark,
                              }: {
    isTriggered: boolean;
    isStart: boolean;
    isFinish: boolean;
    isDark: boolean;
}) => {
    let dotColors = isDark
        ? 'bg-slate-800 border-slate-600 shadow-transparent'
        : 'bg-slate-200 border-slate-300 shadow-transparent';

    if (isTriggered) {
        if (isStart) {
            dotColors = isDark
                ? 'bg-yellow-400 border-yellow-400 shadow-yellow-400/40'
                : 'bg-yellow-500 border-yellow-500 shadow-yellow-500/40';
        } else if (isFinish) {
            dotColors = isDark
                ? 'bg-green-400 border-green-400 shadow-green-400/40'
                : 'bg-green-500 border-green-500 shadow-green-500/40';
        } else {
            dotColors = isDark
                ? 'bg-blue-400 border-blue-400 shadow-blue-400/40'
                : 'bg-blue-500 border-blue-500 shadow-blue-500/40';
        }
    }

    return <View className={`w-4 h-4 rounded-full border-2 z-10 shadow-sm ${dotColors}`} />;
});

// --- MAIN COMPONENT ---
export default function SpeedTestRun({
                                         config, onBack, onFinish,
                                     }: {
    config: any;
    onBack: () => void;
    onFinish: () => void;
}) {
    const { t } = useTranslation();
    const { isDark } = useTheme();

    const {
        currentPlayerObj, teamName, currentPlayerIndex, totalPlayers,
        isRunning, isFinished, isReady,
        timeObj, progressPercent, activeSensors,
        startTraining, stopTraining, resetSession, nextPlayer, formatTime,
        currentRunResult, localResults,
        showIndividualModal, confirmIndividualRun, retryIndividualRun,
        showSummaryModal, saveAllResults, restartWholeSession,
        isSaving,
    } = useSpeedTestSession(config, onFinish);

    const colors = {
        bgList:    isDark ? 'rgba(2, 6, 23, 0.5)' : '#f8fafc',
        borderList: isDark ? '#1e293b' : '#e2e8f0',
        borderRow:  isDark ? 'rgba(30, 41, 59, 0.5)' : '#f1f5f9',
        textMain:   isDark ? '#ffffff' : '#0f172a',
        textSub:    isDark ? '#64748b' : '#64748b',
        yellow:     isDark ? '#facc15' : '#eab308',
    };

    // Колір таймера залежить від стану
    const timerColor = isFinished
        ? (isDark ? 'text-green-400' : 'text-green-600')
        : isReady
            ? (isDark ? 'text-yellow-400' : 'text-yellow-500')
            : (isDark ? 'text-white' : 'text-slate-900');

    const decimalColor = isFinished
        ? (isDark ? 'text-green-400' : 'text-green-600')
        : (isDark ? 'text-yellow-400' : 'text-yellow-500');

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <ScrollView
                className="flex-1 pt-4 px-4"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity
                        onPress={onBack}
                        className={`p-2 -ml-2 rounded-full ${isDark ? 'active:bg-slate-800' : 'active:bg-slate-200'}`}
                    >
                        <Feather name="chevron-left" size={28} color={isDark ? 'white' : 'black'} />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {t('tools.speed_checker.testing_title') as string}
                        </Text>
                        <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {teamName}
                        </Text>
                    </View>
                    <View className="w-10" />
                </View>

                {/* PLAYER CARD */}
                <View className={`border rounded-2xl p-4 mb-8 flex-row justify-between items-center shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <View className="flex-row items-center">
                        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                            <Text className={`font-bold text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {currentPlayerObj.number || `#${currentPlayerIndex + 1}`}
                            </Text>
                        </View>
                        <View>
                            <Text className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                {t('tools.speed_checker.player_index', {
                                    current: currentPlayerIndex + 1,
                                    total: totalPlayers,
                                }) as string}
                            </Text>
                            <Text className={`font-bold text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {currentPlayerObj.name}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* TIMER */}
                <View className="items-center mb-12">
                    <Text className={`text-xs font-bold tracking-[0.3em] uppercase mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {isFinished
                            ? (t('tools.speed_checker.result') as string)
                            : (t('tools.speed_checker.time') as string)}
                    </Text>
                    <View className="flex-row items-baseline">
                        <Text className={`text-7xl font-black font-mono tracking-tighter ${timerColor}`}>
                            {timeObj.main}
                        </Text>
                        <Text className={`text-4xl font-black font-mono mb-1 ${decimalColor}`}>
                            {timeObj.decimal}
                        </Text>
                    </View>
                </View>

                {/* SENSOR TRACK */}
                <View className="mb-12 h-80 relative w-full items-center">
                    {/* Фонова лінія */}
                    <View className={`absolute top-0 bottom-0 w-[2px] ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    {/* Прогрес */}
                    <View
                        className={`absolute top-0 w-[2px] shadow-lg ${isDark ? 'bg-green-500 shadow-green-500/50' : 'bg-green-500 shadow-green-400/50'}`}
                        style={{ height: `${progressPercent}%` }}
                    />

                    {activeSensors.map((sensor, index) => {
                        const isStart  = index === 0;                           // завжди master (ID 0)
                        const isFinish = index === activeSensors.length - 1;    // завжди найбільший ID

                        // Стартовий датчик вважається спрацьованим щойно run почався
                        const triggered = isStart
                            ? (isRunning || isFinished)
                            : (sensor.triggerTime !== undefined && sensor.triggerTime > 0);

                        const top = (index / Math.max(1, activeSensors.length - 1)) * 100;

                        // Підпис датчика
                        let label = `GATE ${index}`;
                        if (isStart)  label = 'START';
                        if (isFinish) label = 'FINISH';

                        // Відображення часу
                        let timeDisplay = '--:--';
                        if (isStart && (isRunning || isFinished)) {
                            timeDisplay = '00:00.00';
                        } else if (sensor.triggerTime) {
                            const tf = formatTime(sensor.triggerTime / 1000);
                            timeDisplay = `${tf.main}${tf.decimal}`;
                        }

                        return (
                            <View
                                key={`sensor-${sensor.id}`}
                                className="absolute w-full flex-row items-center justify-center"
                                style={{ top: `${top}%`, marginTop: -12 }}
                            >
                                <View className="flex-1 items-end pr-6">
                                    <Text className={`text-[10px] font-black uppercase ${triggered ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>
                                        {label}
                                    </Text>
                                </View>
                                <SensorDot
                                    isTriggered={triggered}
                                    isStart={isStart}
                                    isFinish={isFinish}
                                    isDark={isDark}
                                />
                                <View className="flex-1 items-start pl-6">
                                    <Text className={`font-mono text-xs ${triggered ? (isDark ? 'text-slate-300' : 'text-slate-600') : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>
                                        {timeDisplay}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* ACTION BUTTONS
                 *  Стан-машина (відповідає BLE хуку):
                 *  idle/ready  → кнопка "Старт" (озброюємо систему)
                 *  armed       → очікування перетину START (isReady)
                 *  active      → таймер іде, кнопка "Стоп" (isRunning)
                 *  finished    → результат, кнопки "Скинути" / "Наступний" (isFinished)
                 */}
                <View className="mb-6">
                    {!isRunning && !isFinished && !isReady && (
                        // 1. Система готова — озброюємо
                        <TouchableOpacity
                            onPress={startTraining}
                            className="bg-green-500 py-5 rounded-2xl items-center flex-row justify-center shadow-sm"
                        >
                            <Feather name="play" size={24} color="#0f172a" style={{ marginRight: 10 }} />
                            <Text className="font-black text-xl text-slate-900">
                                {t('tools.speed_checker.btn_start') as string}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {isReady && (
                        // 2. Озброєно (armed) — чекаємо перетину стартової лінії.
                        //    Кнопка "Скасувати" скидає стан назад у ready.
                        <TouchableOpacity
                            onPress={resetSession}
                            className="bg-yellow-400 py-5 rounded-2xl items-center flex-row justify-center shadow-sm"
                        >
                            <Feather name="loader" size={24} color="#0f172a" style={{ marginRight: 10 }} />
                            <Text className="font-black text-xl text-slate-900">
                                {t('tools.speed_checker.btn_waiting_start', { defaultValue: 'ОЧІКУВАННЯ СТАРТУ...' }) as string}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {isRunning && (
                        // 3. Таймер іде — зупинити достроково
                        <TouchableOpacity
                            onPress={stopTraining}
                            className="bg-red-500 py-5 rounded-2xl items-center flex-row justify-center shadow-sm"
                        >
                            <Feather name="square" size={24} color="white" style={{ marginRight: 10 }} />
                            <Text className="text-white font-black text-xl">
                                {t('tools.speed_checker.btn_stop') as string}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {isFinished && (
                        // 4. Фініш — скинути поточний забіг або перейти до наступного гравця
                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={resetSession}
                                className={`flex-1 py-4 rounded-2xl items-center mr-2 border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}
                            >
                                <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {t('tools.speed_checker.btn_reset') as string}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={nextPlayer}
                                className="flex-[2] bg-yellow-400 py-4 rounded-2xl items-center shadow-sm"
                            >
                                <Text className="text-slate-900 font-black text-lg uppercase">
                                    {t('tools.speed_checker.btn_skip') as string}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* INDIVIDUAL RUN MODAL */}
            <AppModal
                visible={showIndividualModal}
                onClose={() => {}}
                title={t('tools.speed_checker.modal_result', { name: currentPlayerObj.name }) as string}
                type="center"
            >
                <View className="items-center">
                    <Text className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {t('tools.speed_checker.run_time') as string}
                    </Text>

                    {/* Показуємо час з currentRunResult — точне значення, зафіксоване в хуку */}
                    {currentRunResult && (
                        <View className="flex-row items-baseline mb-6">
                            <Text className={`text-6xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {Math.floor(currentRunResult.fullTime / 60).toString().padStart(2, '0')}
                                :{Math.floor(currentRunResult.fullTime % 60).toString().padStart(2, '0')}
                            </Text>
                            <Text className={`text-3xl font-black ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`}>
                                .{Math.round((currentRunResult.fullTime % 1) * 1000).toString().padStart(3, '0')}
                            </Text>
                        </View>
                    )}

                    <View className="flex-row w-full gap-3">
                        <TouchableOpacity
                            onPress={retryIndividualRun}
                            className={`flex-1 py-4 rounded-xl items-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
                        >
                            <Text className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {t('tools.speed_checker.btn_retry') as string}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={confirmIndividualRun}
                            className="flex-1 bg-green-500 py-4 rounded-xl items-center flex-row justify-center"
                        >
                            <Text className="text-slate-900 font-black uppercase mr-1">
                                {t('tools.speed_checker.btn_accept') as string}
                            </Text>
                            <Feather name="check" size={18} color="#0f172a" />
                        </TouchableOpacity>
                    </View>
                </View>
            </AppModal>

            {/* SUMMARY MODAL */}
            <AppModal
                visible={showSummaryModal}
                onClose={() => {}}
                title={t('tools.speed_checker.modal_summary', { count: localResults.length }) as string}
                type="center"
            >
                <View className="h-96 w-full">
                    <Text className={`text-xs mb-4 text-center ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        {t('tools.speed_checker.summary_desc') as string}
                    </Text>
                    <FlatList
                        data={localResults}
                        keyExtractor={(_, index) => index.toString()}
                        className="flex-1 rounded-xl border mb-4"
                        style={{ backgroundColor: colors.bgList, borderColor: colors.borderList }}
                        contentContainerStyle={{ padding: 12 }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <View
                                className="flex-row justify-between items-center py-3 border-b"
                                style={{ borderColor: colors.borderRow }}
                            >
                                <View className="flex-row items-center">
                                    <Text className="w-6 font-bold" style={{ color: colors.textSub }}>
                                        {index + 1}.
                                    </Text>
                                    <View>
                                        <Text className="font-bold text-sm" style={{ color: colors.textMain }}>
                                            {item.player.name}
                                        </Text>
                                        <Text className="text-[10px]" style={{ color: colors.textSub }}>
                                            #{item.player.number}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="font-mono font-bold text-lg" style={{ color: colors.yellow }}>
                                    {item.fullTime.toFixed(3)}s
                                </Text>
                            </View>
                        )}
                    />
                    <View className="flex-row w-full gap-3 mt-2">
                        <TouchableOpacity
                            onPress={restartWholeSession}
                            className={`flex-1 py-4 rounded-xl items-center border ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}
                        >
                            <Text className={`font-bold uppercase ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                                {t('tools.speed_checker.btn_reset_all') as string}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={saveAllResults}
                            disabled={isSaving}
                            className="flex-1 bg-green-500 py-4 rounded-xl items-center flex-row justify-center"
                        >
                            {isSaving
                                ? <ActivityIndicator color="#0f172a" size="small" />
                                : <>
                                    <Text className="text-slate-900 font-black uppercase mr-1">
                                        {t('tools.speed_checker.btn_save_db') as string}
                                    </Text>
                                    <Feather name="database" size={18} color="#0f172a" />
                                </>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </AppModal>
        </View>
    );
}