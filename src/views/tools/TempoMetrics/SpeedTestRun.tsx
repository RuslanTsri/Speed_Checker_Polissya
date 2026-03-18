import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSpeedTestSession } from '../../../hooks/tempoMetrics/useSpeedTestSession';

import { AppModal } from '../../components/AppModal';
import { Mod } from '../../components/ui/mods';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { TextField } from '../../components/ui/TextField';
import { ArrowIcon, ArrowIconActive } from '../../../../assets/icons';

const RunMarker = ({ position, totalDistance, label, type, triggered, timeDisplay }: any) => {
    const { t } = useTranslation();

    const safePos = parseFloat(position) || 0;
    const safeTotal = parseFloat(totalDistance) || 0;

    let percent = 0;
    if (type === 'start') {
        percent = 0;
    } else if (type === 'finish') {
        percent = 100;
    } else {
        if (safeTotal > 0) {
            percent = (safePos / safeTotal) * 100;
        } else {
            percent = 50;
        }
    }
    percent = Math.max(0, Math.min(100, percent));

    const mainColor = triggered ? (type === 'start' ? '#FF6D00' : type === 'finish' ? '#34d399' : '#F5F5F5') : '#717171';

    return (
        <View className="absolute top-0 bottom-0 w-24 -ml-12 items-center justify-center z-20" style={{ left: `${percent}%` }}>
            <View className="h-16 justify-end items-center mb-3">
                {triggered && timeDisplay !== '--:--' && (
                    <View className="bg-surface-card border border-surface-border px-2 py-0.5 rounded-md mb-1.5 shadow-sm">
                        <Text className="text-text-main font-mono font-bold text-caption">{timeDisplay}</Text>
                    </View>
                )}
                <Text className="text-caption uppercase tracking-widest font-evolventa-bold" style={{ color: mainColor }}>{label}</Text>
                <Text className="text-[9px] text-text-muted font-evolventa-bold">{safePos} {t('tools.speed_checker.meters_short')}</Text>
            </View>
            <View className="w-[1px] h-6 rounded-full" style={{ backgroundColor: triggered ? mainColor : 'rgba(255,255,255,0.1)' }} />
            <View className="h-6 justify-center">
                <View className={`w-3 h-3 rounded-full border border-surface-border ${triggered ? 'bg-brand-orange/20' : 'bg-transparent'}`}/>
            </View>
        </View>
    );
};

export default function SpeedTestRun({ config, onBack, onFinish, onNavigate }: any) {
    const { t } = useTranslation();

    const {
        currentPlayerObj, teamName,
        sessionName, setSessionName,
        currentPlayerIndex, totalPlayers, isRunning, isFinished, isReady,
        timeObj, progressPercent, activeSensors, startTraining, stopTraining, resetSession, nextPlayer,
        showIndividualModal, confirmIndividualRun, retryIndividualRun,
        showSummaryModal, saveAllResults, isSaving,
        localResults, currentRunResult, formatTime,
        restartWholeSession,
        selectedForRetry, toggleRetrySelection, retrySelectedPlayers
    } = useSpeedTestSession(config, onFinish, onNavigate);

    const animatedProgress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: progressPercent,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false
        }).start();
    }, [progressPercent]);

    const timerColor = isFinished ? 'text-status-success' : isReady ? 'text-brand-orange' : 'text-text-main';

    return (
        <View className="flex-1 pt-4">
            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between mb-4 z-10">
                    <Pressable onPress={onBack} className="p-2 -ml-2">
                        {({ pressed }) => (
                            <View style={styles.rotateNeg90}>
                                {pressed ? <ArrowIconActive width={28} height={28} /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                            </View>
                        )}
                    </Pressable>
                    <View className="items-center flex-1">
                        <Text className="text-h3 text-text-main font-unbounded-bold">{t('tools.speed_checker.testing_title')}</Text>
                        <Text className="text-caption uppercase tracking-widest text-text-sub mt-1 font-evolventa-bold">{teamName}</Text>
                    </View>
                    <View className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-status-success' : 'bg-brand-orange'}`} />
                </View>

                <Mod className="mb-6">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-caption uppercase tracking-widest text-text-muted font-evolventa-bold">{t('tools.speed_checker.now_running')}</Text>
                        <Text className="text-body text-text-muted font-evolventa-bold">{currentPlayerIndex + 1} / {totalPlayers}</Text>
                    </View>
                    <Text className="text-h2 text-text-main font-unbounded-bold">{currentPlayerObj?.name || '---'}</Text>
                </Mod>

                <Mod className="mb-8">
                    <View className="items-center py-6 border-b border-surface-border mb-4">
                        <Text className="text-caption uppercase mb-2 text-text-muted font-evolventa-bold">{isFinished ? t('tools.speed_checker.result') : t('tools.speed_checker.time')}</Text>
                        <View className="flex-row items-baseline">
                            <Text className={`text-h1 font-unbounded-black tracking-tighter ${timerColor}`}>{timeObj.main}</Text>
                            <Text className={`text-h3 font-unbounded-bold mb-1 ${timerColor}`}>{timeObj.decimal}</Text>
                        </View>
                    </View>

                    <View className="h-32 justify-end relative mx-4 mb-4">
                        <View className="absolute left-0 right-0 h-[2px] bg-surface-border top-1/2 mt-[-1px]" />
                        <Animated.View className="absolute left-0 h-[2px] bg-brand-orange top-1/2 mt-[-1px] z-10" style={{ width: animatedProgress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />

                        {activeSensors.map((sensor: any, index: number) => {
                            const isTriggered = index === 0 ? (isRunning || isFinished) : (sensor.triggerTime ?? 0) > 0;
                            let timeDisplay = '--:--';
                            if (index === 0 && (isRunning || isFinished)) timeDisplay = '00:00.000';
                            else if (sensor.triggerTime) {
                                const tf = formatTime(sensor.triggerTime / 1000);
                                timeDisplay = `${tf.main}${tf.decimal}`;
                            }

                            const isStart = index === 0;
                            const isFinish = index === activeSensors.length - 1;

                            let markerPosition = 0;
                            if (isStart) {
                                markerPosition = 0;
                            } else if (isFinish) {
                                markerPosition = config.distance;
                            } else {
                                markerPosition = config.splitPositions?.[index - 1] || 0;
                            }

                            const markerType = isStart ? 'start' : isFinish ? 'finish' : 'gate';
                            const markerLabel = isStart
                                ? t('tools.speed_checker.start_label')
                                : isFinish
                                    ? t('tools.speed_checker.finish_label')
                                    : t('tools.speed_checker.gate_label', { number: index });

                            return (
                                <RunMarker
                                    key={sensor.id}
                                    position={markerPosition}
                                    totalDistance={config.distance}
                                    triggered={isTriggered}
                                    timeDisplay={timeDisplay}
                                    type={markerType}
                                    label={markerLabel}
                                />
                            );
                        })}
                    </View>
                </Mod>

                <View className="gap-y-4">
                    {!isRunning && !isFinished && !isReady && <Button variant="light" title={t('tools.speed_checker.btn_start')} icon={<Feather name="play" size={20} color="#0A0A0A" />} onPress={startTraining} className="w-full" />}
                    {isReady && <Button variant="primary" title={t('tools.speed_checker.btn_waiting_start')} icon={<Feather name="loader" size={20} color="#F5F5F5" />} onPress={resetSession} className="w-full" />}
                    {isRunning && <Button variant="outline" title={t('tools.speed_checker.btn_stop')} icon={<Feather name="square" size={20} color="#F5F5F5" />} onPress={stopTraining} className="w-full bg-status-error/10 border-status-error/30" />}
                    {isFinished && (
                        <View className="flex-row gap-3">
                            <Button variant="outline" title={t('tools.speed_checker.btn_reset')} onPress={resetSession} className="flex-1" />
                            <Button variant="light" title={t('tools.speed_checker.btn_skip')} onPress={nextPlayer} icon={<Feather name="chevron-right" size={20} color="#0A0A0A" />} className="flex-[2]" />
                        </View>
                    )}
                </View>
            </ScrollView>

            <AppModal
                visible={showSummaryModal}
                onClose={() => {}}
                title={t('tools.speed_checker.modal_summary', { count: localResults?.length || 0 })}
                type="center"
            >
                <View className="h-[520px] w-full">
                    <View className="mb-4 mt-2">
                        <TextField
                            label={t('tools.speed_checker.session_name_label', 'Назва сесії (співпаде - доповнить)')}
                            value={sessionName}
                            onChangeText={setSessionName}
                            placeholder={t('tools.speed_checker.session_name_placeholder', 'Введіть назву сесії')}
                        />
                    </View>

                    <Text className="text-[10px] text-text-sub font-evolventa mb-2 ml-1 uppercase tracking-widest">
                        {selectedForRetry.length > 0
                            ? t('tools.speed_checker.selected_for_retry', { count: selectedForRetry.length })
                            : t('tools.speed_checker.results_title', 'Результати')
                        }
                    </Text>

                    <FlatList
                        data={localResults || []}
                        keyExtractor={(_, i) => i.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({item}) => {
                            const id = item.player.id || item.player.name;
                            const isSelected = selectedForRetry.includes(id);
                            return (
                                <Pressable
                                    onPress={() => toggleRetrySelection(id)}
                                    className={`py-3 px-3 mb-2 rounded-2xl border flex-row items-center justify-between transition-colors ${
                                        isSelected ? 'bg-status-error/10 border-status-error/30' : 'bg-surface-card border-surface-border'
                                    }`}
                                >
                                    <View className="flex-row items-center gap-3">
                                        <View pointerEvents="none">
                                            <Checkbox checked={isSelected} onChange={() => {}} />
                                        </View>
                                        <Text className={`font-evolventa-bold ${isSelected ? 'text-status-error' : 'text-text-main'}`}>
                                            {item.player.name}
                                        </Text>
                                    </View>
                                    <Text className="text-brand-orange font-unbounded-bold">{item.fullTime.toFixed(3)}s</Text>
                                </Pressable>
                            )
                        }}
                    />

                    <View className="pt-3 mt-1 border-t border-surface-border bg-surface-bg">
                        <Button
                            variant="primary"
                            title={t('tools.speed_checker.btn_save_all', 'Зберегти всі результати')}
                            onPress={saveAllResults}
                            isLoading={isSaving}
                            className="mb-2"
                        />
                        <Button
                            variant="outline"
                            title={selectedForRetry.length > 0
                                ? t('tools.speed_checker.btn_retry_selected', { count: selectedForRetry.length })
                                : t('tools.speed_checker.btn_retry_team', 'Перебігти всім')}
                            onPress={retrySelectedPlayers}
                            className="border-status-error/30 bg-status-error/10"
                        />
                    </View>
                </View>
            </AppModal>

            <AppModal
                visible={showIndividualModal}
                onClose={retryIndividualRun}
                title={currentPlayerObj?.name || ''}
                type="center"
            >
                <View className="items-center py-4">
                    <Text className="text-text-sub font-evolventa mb-2">{t('tools.speed_checker.run_time')}</Text>
                    <Text className="text-h1 text-text-main font-unbounded-black">{currentRunResult?.fullTime.toFixed(3)}s</Text>
                    <View className="flex-row gap-3 mt-8 w-full">
                        <Button variant="outline" title={t('tools.speed_checker.btn_retry')} onPress={retryIndividualRun} className="flex-1" />
                        <Button variant="primary" title={t('tools.speed_checker.btn_accept')} onPress={confirmIndividualRun} className="flex-1" />
                    </View>
                </View>
            </AppModal>
        </View>
    );
}

const styles = StyleSheet.create({ rotateNeg90: { transform: [{ rotate: '-90deg' }] } });