import React, { useEffect, useRef, memo, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSessionsData } from '../../hooks/sessions/useSessionsData';

import { BestCard, WorstCard } from '../components/ui/stats';
import { PlayerMod } from '../components/ui/mods';

interface Props { searchQuery: string; }

// ==========================================
// 1. ОПТИМІЗОВАНИЙ AutoMarqueeId
// ==========================================
const AutoMarqueeId = memo(({ id }: { id: string | undefined }) => {
    const scrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(0);
    const maxScroll = 120;

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                scrollX.current += 1;
                if (scrollX.current > maxScroll) scrollX.current = -50;
                scrollRef.current.scrollTo({ x: scrollX.current, animated: false });
            }
        }, 50);
        return () => clearInterval(interval);
    }, []);

    if (!id) return null;

    return (
        <View className="ml-3 flex-1 rounded-lg border border-surface-border bg-surface-card/50 overflow-hidden">
            <ScrollView
                ref={scrollRef}
                horizontal
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.marqueePadding}
            >
                <Text className="text-caption font-evolventa text-text-sub">
                    ID: <Text className="text-text-muted">{id}</Text>
                </Text>
            </ScrollView>
        </View>
    );
});

// ==========================================
// 2. МЕМОІЗОВАНА КАРТКА СЕСІЇ
// ==========================================
const SessionItem = memo(({ item, t }: { item: any, t: any }) => {
    return (
        <View className="mb-3">
            <PlayerMod
                name={item.playerName}
                optimizeForList={true}
                subtitle={
                    <View className="mt-1">
                        <Text className="text-caption text-brand-orange uppercase mb-1 font-evolventa-bold">
                            {item.teamName}
                        </Text>
                        <View className="flex-row items-center">
                            <Feather name="clock" size={10} color="#A3A3A3" />
                            <Text className="text-caption ml-1 text-text-sub font-evolventa">
                                {item.date}
                            </Text>
                            <AutoMarqueeId id={item.id} />
                        </View>
                    </View>
                }
                rightIcon={
                    <View className="items-end justify-center">
                        <Text className="text-h2 text-brand-orange font-unbounded-black leading-none">
                            {item.totalTime.toFixed(2)}
                            <Text className="text-small text-brand-orange/70 font-unbounded-bold">s</Text>
                        </Text>

                        <View className="flex-row items-center mt-1">
                            <MaterialCommunityIcons name="timer-sand" size={10} color="#A3A3A3" />
                            <Text className="text-caption ml-0.5 text-text-sub font-evolventa">
                                {t('tools.sessions.split', { time: item.avgSplit.toFixed(2) }) as string}
                            </Text>
                        </View>
                    </View>
                }
            />
        </View>
    );
});

// ==========================================
// 3. ГОЛОВНИЙ КОМПОНЕНТ
// ==========================================
export default function SessionsGeneral({ searchQuery }: Props) {
    const { t } = useTranslation();
    const { generalSessions, stats } = useSessionsData(searchQuery);
    const { best, worst } = stats;

    const renderItem = useCallback(({ item }: { item: any }) => (
        <SessionItem item={item} t={t} />
    ), [t]);

    return (
        <FlatList
            data={generalSessions}
            keyExtractor={(item, index) => item.id ?? index.toString()}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}

            renderItem={renderItem}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}

            ListHeaderComponent={() => (
                <View className="mb-6">
                    <View className="flex-row justify-between mb-6">
                        <BestCard
                            title={t('tools.sessions.best') as string}
                            time={`${best?.totalTime.toFixed(2) || '--'}s`}
                            playerName={best?.playerName || (t('tools.sessions.not_available') as string)}
                            teamName={best?.teamName}
                            optimizeForList={true}
                        />

                        <WorstCard
                            title={t('tools.sessions.worst') as string}
                            time={`${worst?.totalTime.toFixed(2) || '--'}s`}
                            playerName={worst?.playerName || (t('tools.sessions.not_available') as string)}
                            teamName={worst?.teamName}
                            optimizeForList={true}
                        />
                    </View>

                    <Text className="px-2 uppercase text-caption tracking-widest text-text-sub font-evolventa-bold">
                        {t('tools.sessions.latest_runs') as string}
                    </Text>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    listPadding: {
        paddingHorizontal: 16,
        paddingBottom: 100
    },
    marqueePadding: {
        paddingHorizontal: 6,
        paddingVertical: 2
    }
});