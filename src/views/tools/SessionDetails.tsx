import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { useSessionDetails } from '../../hooks/sessions/useSessionDetails';

import { Mod, RatingMod } from '../components/ui/mods';
import { HeaderTabs, SubTabs } from '../components/ui/tabs/';
import { ExportIcon, ArrowIcon, ArrowIconActive } from '../../../assets/icons';

export default function SessionDetails({ session, onBack }: any) {
    const { t } = useTranslation();
    const {
        subTab, setSubTab, selectedDistance, setSelectedDistance, predefinedDistances,
        filteredAttempts, sortedResults, sessionStats, handleExport
    } = useSessionDetails(session);

    const [localAllDistance, setLocalAllDistance] = useState<number | 'ALL'>('ALL');

    const mainTabs = [
        { id: 'BEST', label: t('tools.sessions.tab_summary', 'Підсумок (Best)') },
        { id: 'ALL', label: t('tools.sessions.tab_all_attempts', 'Усі спроби') }
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

    // 🔥 Розумний підрахунок: тепер знаходимо номер НАЙКРАЩОЇ спроби
    const displayedAttempts = useMemo(() => {
        // Спочатку рахуємо хронологічні номери для ВСІХ забігів гравців
        const counts: Record<string, number> = {};
        const allWithNumbers = filteredAttempts.map(attempt => {
            counts[attempt.playerName] = (counts[attempt.playerName] || 0) + 1;
            return { ...attempt, attemptNumber: counts[attempt.playerName] };
        });

        if (subTab === 'BEST') {
            // Для вкладки BEST беремо відсортовані найкращі результати
            return sortedResults.map(playerResult => {
                // Шукаємо саме той забіг (за унікальним ID), який став найкращим
                const bestRun = allWithNumbers.find(a => a.id === playerResult.id);
                return {
                    ...playerResult,
                    // Додаємо точний номер цієї переможної спроби
                    bestAttemptNumber: bestRun ? bestRun.attemptNumber : 1
                };
            });
        }

        // Для вкладки ALL
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
                    <Text className="text-h4 text-text-main font-unbounded-bold">{t('tools.sessions.results_title', 'Результати')}</Text>
                </View>

                <Pressable onPress={handleExport} className="p-2 active:opacity-60">
                    <ExportIcon width={24} height={24} fill="#F5F5F5" />
                </Pressable>
            </View>

            <View className="px-4 mb-3">
                <Mod title={session.teamName} subtitle={t('tools.sessions.team', 'Команда')}>
                    <View className="flex-row justify-between items-end border-t border-surface-border pt-2 mt-0">
                        <View>
                            <Text className="text-caption text-text-sub uppercase font-evolventa mb-0.5">{t('tools.sessions.best', 'Найкращий')}</Text>
                            <Text className="text-h2 text-brand-yellow font-unbounded-black leading-tight">
                                {sessionStats.best > 0 ? sessionStats.best.toFixed(2) : '--'}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-caption text-text-sub uppercase font-evolventa mb-0.5">{t('tools.sessions.average', 'Середній')}</Text>
                            <Text className="text-h2 text-brand-orange font-unbounded-black leading-tight">
                                {sessionStats.avg > 0 ? sessionStats.avg.toFixed(2) : '--'}
                            </Text>
                        </View>
                    </View>
                </Mod>
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
                        <RatingMod
                            rank={index + 1}
                            name={item.playerName}
                            // 🔥 Тепер тут формат точно як в ALL: "Спроба X • YY м"
                            subtitle={
                                <Text className="text-[10px] text-text-sub font-evolventa mt-0.5">
                                    {t('tools.sessions.attempt_number', { num: item.bestAttemptNumber, defaultValue: `Спроба ${item.bestAttemptNumber}` })}
                                    {` • ${selectedDistance} м`}
                                </Text>
                            }
                            resultValue={item.bestTime.toFixed(2)}
                            secondaryValue={
                                <Text className="text-[9px] text-text-muted font-unbounded-medium uppercase mt-0.5">
                                    {t('tools.sessions.seconds_short', 'с')}
                                </Text>
                            }
                            className="mb-2"
                        />
                    ) : (
                        <View className="flex-row items-center justify-between p-3.5 mb-2 bg-surface-card rounded-2xl border border-surface-border">
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-full bg-surface-bg items-center justify-center border border-surface-border/50">
                                    <Feather name="clock" size={14} color="#A3A3A3" />
                                </View>
                                <View>
                                    <Text className="text-body text-text-main font-evolventa-bold">{item.playerName}</Text>
                                    <Text className="text-[10px] text-text-sub font-evolventa mt-0.5">
                                        {t('tools.sessions.attempt_number', { num: item.attemptNumber, defaultValue: `Спроба ${item.attemptNumber}` })}
                                        {item.distance ? ` • ${item.distance} м` : ''}
                                    </Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-h4 text-text-main font-unbounded-bold">{item.time.toFixed(2)}</Text>
                                <Text className="text-[9px] text-text-muted font-unbounded-medium uppercase mt-0.5">
                                    {t('tools.sessions.seconds_short', 'с')}
                                </Text>
                            </View>
                        </View>
                    )
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    rotateRight: { transform: [{ rotate: '-90deg' }] }
});