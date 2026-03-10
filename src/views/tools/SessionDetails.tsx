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

    // 🔥 Локальний стейт для вибору дистанції у вкладці "Усі спроби"
    const [localAllDistance, setLocalAllDistance] = useState<number | 'ALL'>('ALL');

    const mainTabs = [
        { id: 'BEST', label: t('tools.sessions.tab_summary', 'Рейтинг') },
        { id: 'ALL', label: t('tools.sessions.tab_all_attempts', 'Усі спроби') }
    ];

    // Визначаємо, які дистанції показувати залежно від активного таба
    const activeDistances = subTab === 'BEST' ? predefinedDistances : ['ALL', ...predefinedDistances];
    const activeSelectedDistance = subTab === 'BEST' ? selectedDistance : localAllDistance;

    // 🔥 БЕЗПЕЧНА ФУНКЦІЯ ДЛЯ TYPESCRIPT
    // Перевіряє тип перед тим, як зберегти дистанцію, щоб додаток не впав
    const handleDistanceSelect = (dist: number | 'ALL') => {
        if (subTab === 'BEST') {
            // У рейтингу дозволяємо лише цифри
            if (typeof dist === 'number') {
                setSelectedDistance(dist);
            }
        } else {
            // В усіх спробах дозволяємо і цифри, і 'ALL'
            setLocalAllDistance(dist);
        }
    };

    // Розумний підрахунок та фільтрація спроб
    const displayedAttempts = useMemo(() => {
        if (subTab === 'BEST') return sortedResults;

        const counts: Record<string, number> = {};
        const withNumbers = filteredAttempts.map(attempt => {
            counts[attempt.playerName] = (counts[attempt.playerName] || 0) + 1;
            return { ...attempt, attemptNumber: counts[attempt.playerName] };
        });

        if (localAllDistance === 'ALL') return withNumbers;

        // Фільтруємо по вибраній дистанції (припускаємо, що у attempt є поле distance)
        return withNumbers.filter(a => a.distance === localAllDistance);
    }, [subTab, sortedResults, filteredAttempts, localAllDistance]);

    return (
        <View className="flex-1 pt-4">
            <View className="flex-row items-center justify-between px-4 mb-6">
                <Pressable onPress={onBack} className="p-2 -ml-2">
                    {({ pressed }) => (
                        <View style={styles.rotateRight}>
                            {pressed ? <ArrowIconActive width={24} height={24} fill="#FF6D00" /> : <ArrowIcon width={24} height={24} fill="#F5F5F5" />}
                        </View>
                    )}
                </Pressable>

                <View className="items-center flex-1">
                    <Text className="text-h4 text-text-main font-unbounded-bold">{t('tools.sessions.results_title', 'Результати')}</Text>
                    <Text className="text-caption text-text-sub font-evolventa">{session.teamName}</Text>
                </View>

                <Pressable onPress={handleExport} className="p-2 active:opacity-60">
                    <ExportIcon width={24} height={24} fill="#F5F5F5" />
                </Pressable>
            </View>

            <View className="px-4 mb-6">
                <Mod title={session.teamName} subtitle={t('tools.sessions.team', 'Команда')}>
                    <View className="flex-row justify-between items-end border-t border-surface-border pt-4 mt-1">
                        <View>
                            <Text className="text-caption text-text-sub uppercase font-evolventa">{t('tools.sessions.best', 'Кращий час')}</Text>
                            <Text className="text-h1 text-brand-yellow font-unbounded-black">
                                {sessionStats.best > 0 ? sessionStats.best.toFixed(2) : '--'}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-caption text-text-sub uppercase font-evolventa">{t('tools.sessions.average', 'Середній час')}</Text>
                            <Text className="text-h1 text-brand-orange font-unbounded-black">
                                {sessionStats.avg > 0 ? sessionStats.avg.toFixed(2) : '--'}
                            </Text>
                        </View>
                    </View>
                </Mod>
            </View>

            {/* ПІДПИС І ТАБИ ТИПУ РЕЗУЛЬТАТІВ */}
            <View className="px-4 mb-5">
                <Text className="text-[10px] text-text-muted uppercase tracking-widest font-evolventa-bold mb-3 ml-1">
                    {t('tools.sessions.result_type', 'Тип результатів')}
                </Text>
                <HeaderTabs tabs={mainTabs} activeTab={subTab} onTabChange={id => setSubTab(id as any)} />
            </View>

            {/* ПІДПИС І ТАБИ ВИБОРУ ДИСТАНЦІЇ */}
            <View className="px-4 mb-4">
                <Text className="text-[10px] text-text-muted uppercase tracking-widest font-evolventa-bold mb-3 ml-1">
                    {t('tools.sessions.choose_distance', 'Вибір дистанції')}
                </Text>
                {/* 🔥 Підключаємо наш новий безпечний хендлер */}
                <SubTabs
                    distances={activeDistances as any}
                    selectedDistance={activeSelectedDistance as any}
                    onSelect={handleDistanceSelect}
                />
            </View>

            <FlatList
                data={displayedAttempts}
                keyExtractor={(item, index) => `${item.playerName}-${index}`}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 4 }}
                renderItem={({ item, index }) => (
                    subTab === 'BEST' ? (
                        <RatingMod rank={index + 1} name={item.playerName} resultValue={item.bestTime.toFixed(2)} className="mb-3" />
                    ) : (
                        <View className="flex-row items-center justify-between p-4 mb-3 bg-surface-card rounded-2xl border border-surface-border">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-full bg-surface-bg items-center justify-center border border-surface-border/50">
                                    <Feather name="clock" size={16} color="#A3A3A3" />
                                </View>
                                <View>
                                    <Text className="text-body text-text-main font-evolventa-bold">{item.playerName}</Text>
                                    <Text className="text-[11px] text-text-sub font-evolventa mt-1">
                                        {t('tools.sessions.attempt_number', { num: item.attemptNumber, defaultValue: `Спроба ${item.attemptNumber}` })}
                                        {item.distance ? ` • ${item.distance} м` : ''}
                                    </Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-h3 text-text-main font-unbounded-bold">{item.time.toFixed(2)}</Text>
                                <Text className="text-[10px] text-text-muted font-unbounded-medium uppercase">сек</Text>
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