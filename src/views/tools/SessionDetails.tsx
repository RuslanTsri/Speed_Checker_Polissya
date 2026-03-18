import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSessionDetails } from '../../hooks/sessions/useSessionDetails';

import { AppModal } from '../components/AppModal';
import { Mod, RatingMod } from '../components/ui/mods';
import { HeaderTabs, SubTabs } from '../components/ui/tabs/';
import { ExportIcon, ArrowIcon, ArrowIconActive } from '../../../assets/icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SplitsBlock = ({ splits, totalTime, avgSplit, title }: any) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View className="bg-surface-bg/60 rounded-2xl border border-surface-border/50 overflow-hidden">
            <Pressable
                onPress={toggleExpand}
                className="flex-row items-center justify-between p-3 active:bg-surface-card/50"
            >
                <View className="flex-row items-center">
                    <MaterialCommunityIcons name="gesture-double-tap" size={14} color="#A3A3A3" />
                    <Text className="text-[10px] text-text-sub font-evolventa-bold ml-1.5 uppercase">
                        {title}
                    </Text>
                </View>
                <View style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
                    <Feather name="chevron-down" size={16} color="#A3A3A3" />
                </View>
            </Pressable>

            {isExpanded && (
                <View className="px-3 pb-3">
                    <View className="flex-row flex-wrap gap-2 mt-1">
                        <View className="bg-surface-card px-3 py-1.5 rounded-xl border border-surface-border flex-1 min-w-[80px]">
                            <Text className="text-[8px] text-text-muted font-evolventa uppercase mb-0.5">
                                {t('tools.sessions.start_0m')}
                            </Text>
                            <Text className="text-caption text-text-main font-unbounded-bold">0.000s</Text>
                        </View>

                        {splits && splits.slice(0, -1).map((splitTime: number, idx: number) => (
                            <View key={idx} className="bg-surface-card px-3 py-1.5 rounded-xl border border-surface-border flex-1 min-w-[80px]">
                                <Text className="text-[8px] text-text-muted font-evolventa uppercase mb-0.5">
                                    {t('tools.sessions.gate_n', { number: idx + 1 })}
                                </Text>
                                <Text className="text-caption text-text-main font-unbounded-bold">
                                    {splitTime.toFixed(3)}s
                                </Text>
                            </View>
                        ))}

                        <View className="bg-brand-orange/10 px-3 py-1.5 rounded-xl border border-brand-orange/30 flex-1 min-w-[80px]">
                            <Text className="text-[8px] text-brand-orange font-evolventa uppercase mb-0.5">
                                {t('tools.sessions.finish')}
                            </Text>
                            <Text className="text-caption text-brand-orange font-unbounded-bold">{totalTime.toFixed(3)}s</Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

export default function SessionDetails({ session, onBack }: any) {
    const { t } = useTranslation();
    const {
        subTab, setSubTab, selectedDistance, setSelectedDistance, predefinedDistances,
        filteredAttempts, sortedResults, sessionStats, handleExport,
        isDeleteModalVisible, setDeleteModalVisible, isDeleting, handleDeleteSession
    } = useSessionDetails(session);

    const [localAllDistance, setLocalAllDistance] = useState<number | 'ALL'>('ALL');

    const mainTabs = [
        { id: 'BEST', label: t('tools.sessions.tab_summary', 'Підсумок (Best)') },
    ];

    const activeDistances = subTab === 'BEST' ? predefinedDistances : ['ALL', ...predefinedDistances];
    const activeSelectedDistance = subTab === 'BEST' ? selectedDistance : localAllDistance;

    const handleDistanceSelect = (dist: number | 'ALL') => {
        if (subTab === 'BEST') {
            if (typeof dist === 'number') {
                setSelectedDistance(dist);
            }
        } else {
            setLocalAllDistance(dist);
        }
    };

    const displayedAttempts = useMemo(() => {
        const counts: Record<string, number> = {};
        const allWithNumbers = filteredAttempts.map(attempt => {
            counts[attempt.playerName] = (counts[attempt.playerName] || 0) + 1;
            return { ...attempt, attemptNumber: counts[attempt.playerName] };
        });

        if (subTab === 'BEST') {
            return sortedResults.map(playerResult => {
                const bestRun = allWithNumbers.find(a => a.id === playerResult.id);
                return {
                    ...playerResult,
                    bestAttemptNumber: bestRun ? bestRun.attemptNumber : 1
                };
            });
        }

        if (localAllDistance === 'ALL') return allWithNumbers;
        return allWithNumbers.filter(a => a.distance === localAllDistance);
    }, [subTab, sortedResults, filteredAttempts, localAllDistance]);

    const renderEmptyState = () => (
        <View className="items-center justify-center py-10 opacity-80 mt-10">
            <View className="w-16 h-16 rounded-full bg-surface-card items-center justify-center border border-surface-border mb-4">
                <Feather name="inbox" size={24} color="#A3A3A3" />
            </View>
            <Text className="text-body text-text-main font-evolventa-bold mb-1 text-center">
                {activeSelectedDistance === 'ALL'
                    ? t('tools.sessions.alert_no_data', 'Дані відсутні')
                    : t('tools.sessions.no_results_distance', { dist: activeSelectedDistance, defaultValue: `Немає результатів на ${activeSelectedDistance}м` })
                }
            </Text>
        </View>
    );

    return (
        <View className="flex-1 pt-2">
            <View className="flex-row items-center justify-between px-4 mb-3">
                <Pressable onPress={onBack} className="p-2 -ml-2">
                    {({ pressed }) => (
                        <View style={styles.rotateRight}>
                            {pressed ? <ArrowIconActive width={24} height={24} fill="#FF6D00" /> : <ArrowIcon width={24} height={24} fill="#F5F5F5" />}
                        </View>
                    )}
                </Pressable>

                <View className="items-center flex-1">
                    <Text className="text-h4 text-text-main font-unbounded-bold">{session.sessionName || t('tools.sessions.results_title', 'Результати')}</Text>
                </View>

                <Pressable onPress={handleExport} className="p-2 active:opacity-60">
                    <ExportIcon width={24} height={24} fill="#F5F5F5" />
                </Pressable>
            </View>

            <View className="px-4 mb-3">
                <View className="relative">
                    <Mod title={session.teamName} subtitle={t('tools.sessions.team', 'Команда')}>
                        <View className="flex-row justify-between items-end border-t border-surface-border pt-2 mt-0">
                            <View>
                                <Text className="text-caption text-text-sub uppercase font-evolventa mb-0.5">{t('tools.sessions.best', 'Найкращий')}</Text>
                                <Text className="text-h2 text-brand-yellow font-unbounded-black leading-tight">
                                    {sessionStats.best > 0 ? sessionStats.best.toFixed(3) : '--'}
                                </Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-caption text-text-sub uppercase font-evolventa mb-0.5">{t('tools.sessions.average', 'Середній')}</Text>
                                <Text className="text-h2 text-brand-orange font-unbounded-black leading-tight">
                                    {sessionStats.avg > 0 ? sessionStats.avg.toFixed(3) : '--'}
                                </Text>
                            </View>
                        </View>
                    </Mod>

                    <Pressable
                        onPress={() => setDeleteModalVisible(true)}
                        className="absolute top-4 right-4 p-2 active:opacity-60 bg-status-error/10 rounded-full border border-status-error/20"
                    >
                        <Feather name="trash-2" size={16} color="#ef4444" />
                    </Pressable>
                </View>
            </View>

            <View className="px-4 mb-3">
                <Text className="text-[10px] text-text-muted uppercase tracking-widest font-evolventa-bold mb-1.5 ml-1">
                    {t('tools.sessions.result_type', 'Тип результатів')}
                </Text>
                <HeaderTabs tabs={mainTabs} activeTab={subTab} onTabChange={id => setSubTab(id as any)} />
            </View>

            <View className="px-4 mb-2">
                <Text className="text-[10px] text-text-muted uppercase tracking-widest font-evolventa-bold mb-1.5 ml-1">
                    {t('tools.sessions.choose_distance', 'Вибір дистанції')}
                </Text>
                <SubTabs
                    distances={activeDistances as any}
                    selectedDistance={activeSelectedDistance as any}
                    onSelect={handleDistanceSelect}
                />
            </View>

            <FlatList
                data={displayedAttempts}
                keyExtractor={(item, index) => `${item.playerName}-${index}`}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 4, flexGrow: 1 }}
                ListEmptyComponent={renderEmptyState}
                renderItem={({ item, index }) => (
                    subTab === 'BEST' ? (
                        <View className="mb-4 bg-surface-card rounded-3xl border border-surface-border p-1">
                            <RatingMod
                                rank={index + 1}
                                name={item.playerName}
                                subtitle={
                                    <Text className="text-[10px] text-text-sub font-evolventa mt-0.5">
                                        {t('tools.sessions.attempt_number', { num: item.bestAttemptNumber })} • {selectedDistance} {t('tools.speed_checker.meters_short', 'м')}
                                    </Text>
                                }
                                resultValue={item.bestTime.toFixed(3)}
                                secondaryValue={<Text className="text-[9px] text-text-muted mt-0.5">{t('tools.sessions.seconds_short')}</Text>}
                                className="border-0 bg-transparent mb-1"
                            />

                            <View className="px-2 pb-2">
                                <SplitsBlock
                                    splits={item.splits}
                                    totalTime={item.bestTime}
                                    avgSplit={item.avgSplit}
                                    title={t('tools.sessions.best_attempt_metrics')}
                                />
                            </View>
                        </View>
                    ) : (
                        <View className="p-4 mb-3 bg-surface-card rounded-3xl border border-surface-border">
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-full bg-brand-orange/10 items-center justify-center border border-brand-orange/20">
                                        <Feather name="user" size={18} color="#FF6D00" />
                                    </View>
                                    <View>
                                        <Text className="text-body text-text-main font-unbounded-bold">{item.playerName}</Text>
                                        <Text className="text-[10px] text-text-sub font-evolventa">
                                            {t('tools.sessions.attempt_number', { num: item.round || index + 1 })} • {item.distance}{t('tools.speed_checker.meters_short', 'м')}
                                        </Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="text-h3 text-brand-orange font-unbounded-black leading-none">{item.time.toFixed(3)}s</Text>
                                    <Text className="text-[9px] text-text-muted font-evolventa uppercase tracking-tighter">
                                        {t('tools.sessions.total_time')}
                                    </Text>
                                </View>
                            </View>

                            <SplitsBlock
                                splits={item.splits}
                                totalTime={item.time}
                                avgSplit={item.avgSplit}
                                title={t('tools.sessions.gate_metrics')}
                            />
                        </View>
                    )
                )}
            />

            <AppModal type="center" visible={isDeleteModalVisible} onClose={() => setDeleteModalVisible(false)} title={t('tools.sessions.delete_data_title', 'Видалити дані?')}>
                <View className="items-center mb-6 mt-2">
                    <View className="w-16 h-16 bg-status-error/10 rounded-full items-center justify-center mb-4 border border-status-error/20">
                        <Feather name="alert-triangle" size={32} color="#ef4444" />
                    </View>
                    <Text className="text-lg font-unbounded-bold text-center mb-2 text-text-main">
                        {t('tools.sessions.choose_action', 'Оберіть дію')}
                    </Text>
                    <Text className="text-center text-sm px-4 text-text-sub font-evolventa">
                        {t('tools.sessions.delete_action_desc', 'Ви можете видалити результати лише для активної дистанції, або ж видалити всю сесію цілком.')}
                    </Text>
                </View>

                <View className="gap-3">
                    {activeSelectedDistance !== 'ALL' && (
                        <TouchableOpacity
                            onPress={() => handleDeleteSession(onBack, 'ACTIVE_DISTANCE', activeSelectedDistance as number)}
                            disabled={isDeleting}
                            className="w-full bg-surface-card border border-status-error/30 p-4 rounded-xl items-center justify-center active:opacity-60"
                        >
                            <Text className="text-status-error font-bold tracking-wide">
                                {t('tools.sessions.delete_distance', { distance: activeSelectedDistance })}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => handleDeleteSession(onBack, 'ALL')}
                        disabled={isDeleting}
                        className="w-full bg-status-error p-4 rounded-xl items-center justify-center active:opacity-60"
                    >
                        {isDeleting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white font-bold tracking-wide">
                                {t('tools.sessions.delete_all_session', 'Видалити ВСЮ сесію')}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setDeleteModalVisible(false)} className="w-full mt-2 p-3 items-center justify-center active:opacity-60">
                        <Text className="text-text-muted font-bold tracking-wide">
                            {t('tools.sessions.btn_cancel', 'Скасувати')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </AppModal>
        </View>
    );
}

const styles = StyleSheet.create({
    rotateRight: { transform: [{ rotate: '-90deg' }] }
});