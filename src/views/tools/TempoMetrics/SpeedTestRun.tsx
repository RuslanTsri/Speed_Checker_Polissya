import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, FlatList, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSpeedTestSession } from '../../../hooks/tempoMetrics/useSpeedTestSession';
import { AppModal } from '../../components/AppModal';

// 🔥 Імпорт UI-компонентів
import { Mod } from '../../components/ui/mods';
import { Button } from '../../components/ui/Button';
import { ArrowIconActive, ArrowIcon } from '../../../../assets/icons';

// ==========================================
// 🔥 ГОРИЗОНТАЛЬНА ЛІНІЯ ТРЕКУ
// ==========================================
const TrackLine = () => (
    <View className="absolute left-0 right-0 h-[2px] bg-white/10 top-1/2 mt-[-1px]" />
);

// ==========================================
// 🔥 ВЕРТИКАЛЬНИЙ МАРКЕР / ФЛАЖОК (Новий дизайн)
// ==========================================
interface RunMarkerProps {
    position: number;
    totalDistance: number;
    label: string;
    type: 'start' | 'finish' | 'gate';
    triggered: boolean;
    timeDisplay: string;
}

const RunMarker = ({ position, totalDistance, label, type, triggered, timeDisplay }: RunMarkerProps) => {
    // 🔥 ДОДАНО: Хук перекладу для RunMarker
    const { t } = useTranslation();

    // Рахуємо позицію у % на основі дистанції
    const percent = totalDistance > 0 ? (position / totalDistance) * 100 : (type === 'start' ? 0 : 100);

    // Визначаємо колір залежно від типу та стану (triggered)
    let mainColor = '#A3A3A3'; // Сірий за замовчуванням (для гейтів)
    let shadowColor = 'rgba(163, 163, 163, 0.3)';

    if (triggered) {
        if (type === 'start') {
            mainColor = '#FF6D00'; // Помаранчевий
            shadowColor = 'rgba(255, 109, 0, 0.6)';
        } else if (type === 'finish') {
            mainColor = '#34d399'; // Зелений
            shadowColor = 'rgba(52, 211, 153, 0.6)';
        } else {
            // Активований проміжний гейт - робимо його світлішим сірим
            mainColor = '#F5F5F5';
            shadowColor = 'rgba(245, 245, 245, 0.3)';
        }
    }

    return (
        <View
            className="absolute top-0 bottom-0 w-24 -ml-12 items-center justify-center z-20"
            style={{ left: `${percent}%` }}
        >
            {/* Блок із текстом і часом (Зверху) */}
            <View className="h-16 justify-end items-center mb-3">
                {triggered && timeDisplay !== '--:--' && (
                    <View className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md mb-1.5 shadow-sm">
                        {/* 🔥 ВИПРАВЛЕНО: Видалено tabularNums зі style */}
                        <Text className="text-white font-mono font-bold text-[10px]">
                            {timeDisplay}
                        </Text>
                    </View>
                )}

                <Text
                    className={`text-[10px] font-bold uppercase tracking-widest ${triggered ? 'text-[#F5F5F5]' : 'text-[#A3A3A3]'}`}
                    style={{ color: triggered ? '#F5F5F5' : mainColor, fontFamily: 'Evolventa' }}
                >
                    {label}
                </Text>

                <Text className="text-[9px] text-white/30 font-bold" style={{ fontFamily: 'Evolventa' }}>
                    {position} {t('tools.speed_checker.meters_short')}
                </Text>
            </View>

            {/* Вертикальна паличка-маркер */}
            <View
                className="w-[1px] h-6 rounded-full"
                style={{
                    backgroundColor: triggered ? mainColor : 'rgba(255,255,255,0.1)',
                    shadowColor: triggered ? shadowColor : 'transparent',
                    shadowOpacity: 1,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: triggered ? 4 : 0
                }}
            />

            {/* Невелике заглиблення для крапки */}
            <View className="h-6 justify-center">
                <View className={`w-3 h-3 rounded-full border border-white/10 ${triggered ? 'bg-[#1C1C1E]' : 'bg-transparent'}`}/>
            </View>
        </View>
    );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function SpeedTestRun({ config, onBack, onFinish }: { config: any; onBack: () => void; onFinish: () => void; }) {
    const { t } = useTranslation();

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

    // ==========================================
    // 🔥 ПЛАВНА АНІМАЦІЯ ПРОГРЕСУ (Помаранчева)
    // ==========================================
    const animatedProgress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: progressPercent,
            duration: 300, // Плавно доповзає за 300мс
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    }, [progressPercent]);

    const progressWidth = animatedProgress.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    // ==========================================
    // СТИЛІЗАЦІЯ КОЛЬОРІВ ТА СТАТУСІВ
    // ==========================================
    const timerColor = isFinished ? 'text-[#34d399]' : isReady ? 'text-[#FF6D00]' : 'text-[#F5F5F5]';
    const decimalColor = isFinished ? 'text-[#34d399]' : 'text-[#FF6D00]';

    let statusText = t('tools.speed_checker.status_wait');
    let statusColor = 'text-[#3b82f6]';
    let dotColor = 'bg-[#3b82f6]';

    if (isFinished) {
        statusText = t('tools.speed_checker.status_result_obtained');
        statusColor = 'text-[#34d399]';
        dotColor = 'bg-[#34d399]';
    } else if (isReady) {
        statusText = t('tools.speed_checker.status_ready_to_measure');
        statusColor = 'text-[#FF6D00]';
        dotColor = 'bg-[#FF6D00]';
    } else if (isRunning) {
        statusText = t('tools.speed_checker.status_running');
        statusColor = 'text-[#34d399]';
        dotColor = 'bg-[#34d399]';
    }

    return (
        <View className="flex-1 pt-4 relative">
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View className="flex-row items-center justify-between mb-4 relative z-10">
                    <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                        {({ pressed }) => (
                            <View style={{ transform: [{ rotate: '-90deg' }] }}>
                                {pressed ? <ArrowIconActive width={28} height={28} fill="#F5F5F5" /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                            </View>
                        )}
                    </Pressable>
                    <View className="items-center flex-1">
                        <Text className="text-xl font-bold text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                            {t('tools.speed_checker.testing_title')}
                        </Text>
                        <Text className="text-[10px] font-bold tracking-widest text-[#A3A3A3] mt-1 uppercase" style={{ fontFamily: 'Evolventa' }}>
                            {teamName}
                        </Text>
                    </View>
                    <View className="w-10 items-end">
                        <View className={`w-2 h-2 rounded-full opacity-80 ${dotColor}`} />
                    </View>
                </View>

                {/* СТАТУС БАР */}
                <View className="flex-row items-center justify-center mb-6">
                    <View className={`w-2 h-2 rounded-full mr-2 shadow-sm ${dotColor}`} />
                    <Text className={`text-xs font-bold uppercase tracking-widest ${statusColor}`} style={{ fontFamily: 'Evolventa' }}>
                        {statusText}
                    </Text>
                </View>

                {/* PLAYER CARD */}
                <Mod className="mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-[10px] font-bold uppercase tracking-widest text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>
                            {t('tools.speed_checker.now_running')}
                        </Text>
                        <Text className="font-bold text-xs text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>
                            {currentPlayerIndex + 1} / {totalPlayers}
                        </Text>
                    </View>
                    <Text className="font-bold text-2xl text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                        {currentPlayerObj.name}
                    </Text>
                </Mod>

                {/* ТАЙМЕР ТА ОНОВЛЕНИЙ SENSOR TRACK */}
                <Mod className="mb-8">
                    {/* Головний таймер */}
                    <View className="items-center py-6 border-b border-white/5 mb-4">
                        <Text className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2 text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>
                            {isFinished ? t('tools.speed_checker.result') : t('tools.speed_checker.time')}
                        </Text>
                        <View className="flex-row items-baseline">
                            {/* 🔥 ВИПРАВЛЕНО: Видалено tabularNums зі style */}
                            <Text className={`text-6xl font-black font-mono tracking-tighter ${timerColor}`}>
                                {timeObj.main}
                            </Text>
                            <Text className={`text-3xl font-black font-mono mb-1 ${decimalColor}`}>
                                {timeObj.decimal}
                            </Text>
                        </View>
                    </View>

                    {/* ГОРИЗОНТАЛЬНИЙ SENSOR TRACK */}
                    <View className="h-32 justify-end relative mx-4 mt-2 mb-4">
                        <TrackLine />

                        {/* ПЛАВНИЙ ПОМАРАНЧЕВИЙ ПРОГРЕС */}
                        <Animated.View
                            className="absolute left-0 h-[2px] bg-[#FF6D00] shadow-[0_0_10px_rgba(255,109,0,0.8)] top-1/2 mt-[-1px] z-10"
                            style={{ width: progressWidth }}
                        />

                        {activeSensors.map((sensor, index) => {
                            const isStart = index === 0;
                            const isFinish = index === activeSensors.length - 1;
                            const totalDist = config.distance;

                            // Обчислюємо позицію метрів
                            // Обчислюємо позицію метрів
                            let pos = 0;
                            if (isStart) {
                                pos = 0;
                            } else if (isFinish) {
                                pos = totalDist;
                            } else {
                                // 🔥 НАДІЙНИЙ ФОЛБЕК
                                // Якщо спліт є у конфігу — беремо його.
                                // Якщо масив порожній — рівномірно розподіляємо гейт по треку.
                                pos = config.splitPositions?.[index - 1] || Math.round((totalDist / (activeSensors.length - 1)) * index);
                            }

                            const triggered = isStart
                                ? (isRunning || isFinished)
                                : (sensor.triggerTime !== undefined && sensor.triggerTime > 0);

                            let label = t('tools.speed_checker.gate_label', { number: index });
                            let type: 'start' | 'finish' | 'gate' = 'gate';

                            if (isStart) {
                                label = t('tools.speed_checker.start_label');
                                type = 'start';
                            } else if (isFinish) {
                                label = t('tools.speed_checker.finish_label');
                                type = 'finish';
                            }

                            let timeDisplay = '--:--';
                            if (isStart && (isRunning || isFinished)) {
                                timeDisplay = '00:00.00';
                            } else if (sensor.triggerTime) {
                                const tf = formatTime(sensor.triggerTime / 1000);
                                timeDisplay = `${tf.main}${tf.decimal}`;
                            }

                            return (
                                <RunMarker
                                    key={`sensor-${sensor.id}`}
                                    position={pos}
                                    totalDistance={totalDist}
                                    label={label as string}
                                    type={type}
                                    triggered={triggered}
                                    timeDisplay={timeDisplay}
                                />
                            );
                        })}
                    </View>
                </Mod>

                {/* ACTION BUTTONS */}
                <View className="mb-6">
                    {!isRunning && !isFinished && !isReady && (
                        <Button
                            variant="light"
                            title={t('tools.speed_checker.btn_start') as string}
                            icon={<Feather name="play" size={20} color="#0A0A0A" />}
                            onPress={startTraining}
                            className="w-full shadow-lg shadow-white/10"
                        />
                    )}

                    {isReady && (
                        <Button
                            variant="primary"
                            title={t('tools.speed_checker.btn_waiting_start') as string}
                            icon={<Feather name="loader" size={20} color="#F5F5F5" />}
                            onPress={resetSession}
                            className="w-full shadow-lg shadow-[#FF6D00]/20"
                        />
                    )}

                    {isRunning && (
                        <Button
                            variant="outline"
                            title={t('tools.speed_checker.btn_stop') as string}
                            icon={<Feather name="square" size={20} color="#F5F5F5" />}
                            onPress={stopTraining}
                            className="w-full bg-red-500/10 border-red-500/30"
                        />
                    )}

                    {isFinished && (
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Button
                                    variant="outline"
                                    title={t('tools.speed_checker.btn_reset') as string}
                                    onPress={resetSession}
                                />
                            </View>
                            <View className="flex-[2]">
                                <Button
                                    variant="light"
                                    title={t('tools.speed_checker.btn_skip') as string}
                                    onPress={nextPlayer}
                                    icon={<Feather name="chevron-right" size={20} color="#0A0A0A" />}
                                />
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* MODALS (Без змін) */}
            <AppModal visible={showIndividualModal} onClose={() => {}} title={t('tools.speed_checker.modal_result', { name: currentPlayerObj.name }) as string} type="center">
                <View className="items-center">
                    <Text className="text-xs font-bold uppercase tracking-widest mb-2 text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>{t('tools.speed_checker.run_time') as string}</Text>
                    {currentRunResult && (
                        <View className="flex-row items-baseline mb-8 mt-2">
                            <Text className="text-6xl font-black text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>{Math.floor(currentRunResult.fullTime / 60).toString().padStart(2, '0')}:{Math.floor(currentRunResult.fullTime % 60).toString().padStart(2, '0')}</Text>
                            <Text className="text-3xl font-black text-[#FF6D00]" style={{ fontFamily: 'Unbounded' }}>.{Math.round((currentRunResult.fullTime % 1) * 1000).toString().padStart(3, '0')}</Text>
                        </View>
                    )}
                    <View className="flex-row w-full gap-3"><View className="flex-1"><Button variant="outline" title={t('tools.speed_checker.btn_retry') as string} onPress={retryIndividualRun} /></View><View className="flex-1"><Button variant="primary" title={t('tools.speed_checker.btn_accept') as string} onPress={confirmIndividualRun} icon={<Feather name="check" size={18} color="#F5F5F5" />} /></View></View>
                </View>
            </AppModal>
            <AppModal visible={showSummaryModal} onClose={() => {}} title={t('tools.speed_checker.modal_summary', { count: localResults.length }) as string} type="center">
                <View className="h-96 w-full mt-2"><Text className="text-xs mb-4 text-center text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>{t('tools.speed_checker.summary_desc') as string}</Text><FlatList data={localResults} keyExtractor={(_, index) => index.toString()} className="flex-1 rounded-2xl border border-white/10 bg-white/5 mb-6" contentContainerStyle={{ padding: 12 }} showsVerticalScrollIndicator={false} renderItem={({ item, index }) => (<View className="flex-row justify-between items-center py-3 border-b border-white/5"><View className="flex-row items-center"><Text className="w-6 font-bold text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>{index + 1}.</Text><View><Text className="font-bold text-sm text-[#F5F5F5]" style={{ fontFamily: 'Evolventa' }}>{item.player.name}</Text><Text className="text-[10px] text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>#{item.player.number || 'N/A'}</Text></View></View><Text className="font-mono font-bold text-lg text-[#FF6D00]">{item.fullTime.toFixed(3)}s</Text></View>)} /><View className="flex-row w-full gap-3 mt-2"><View className="flex-1"><Button variant="outline" title={t('tools.speed_checker.btn_reset_all') as string} onPress={restartWholeSession} /></View><View className="flex-1"><Button variant="primary" title={t('tools.speed_checker.btn_save_db') as string} onPress={saveAllResults} isLoading={isSaving} icon={!isSaving && <Feather name="database" size={18} color="#F5F5F5" />} /></View></View></View>
            </AppModal>
        </View>
    );
}