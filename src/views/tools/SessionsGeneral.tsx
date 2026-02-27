import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSessionsData } from '../../hooks/sessions/useSessionsData';

// 🔥 Імпортуємо наші преміальні компоненти
import { BestCard, WorstCard } from '../components/ui/stats';
import { PlayerMod } from '../components/ui/mods';

interface Props { searchQuery: string; }

// 🔥 Оновлений AutoMarqueeId (зі скляним дизайном і перевіркою на порожній ID)
const AutoMarqueeId = ({ id }: { id: string | undefined }) => {
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

    // Якщо ID немає — просто нічого не малюємо (уникаємо порожніх сірих рамок)
    if (!id) return null;

    return (
        <View className="ml-3 flex-1 rounded-lg border border-white/10 bg-white/5 overflow-hidden">
            <ScrollView
                ref={scrollRef}
                horizontal
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 6, paddingVertical: 2 }}
            >
                <Text className="text-[10px] font-mono text-[#A3A3A3]">
                    ID: <Text className="text-[#A3A3A3]">{id}</Text>
                </Text>
            </ScrollView>
        </View>
    );
};

export default function SessionsGeneral({ searchQuery }: Props) {
    const { t } = useTranslation();
    const { generalSessions, stats } = useSessionsData(searchQuery);
    const { best, worst } = stats;

    return (
        <FlatList
            data={generalSessions}
            keyExtractor={(item, index) => item.id ?? index.toString()} // Захист для TypeScript
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
                <View className="mb-6">
                    {/* КАРТКИ СТАТИСТИКИ */}
                    <View className="flex-row justify-between mb-6">
                        <BestCard
                            title={t('tools.sessions.best') as string}
                            time={`${best?.totalTime.toFixed(2) || '--'}s`}
                            playerName={best?.playerName || (t('tools.sessions.not_available') as string)}
                            teamName={best?.teamName}
                        />

                        <WorstCard
                            title={t('tools.sessions.worst') as string}
                            time={`${worst?.totalTime.toFixed(2) || '--'}s`}
                            playerName={worst?.playerName || (t('tools.sessions.not_available') as string)}
                            teamName={worst?.teamName}
                        />
                    </View>

                    <Text
                        className="font-bold px-2 uppercase text-xs tracking-[0.1em] text-[#A3A3A3]"
                        style={{ fontFamily: 'Evolventa' }}
                    >
                        {t('tools.sessions.latest_runs') as string}
                    </Text>
                </View>
            )}
            renderItem={({ item }) => (
                <View className="mb-3">
                    <PlayerMod
                        name={item.playerName}

                        // 🔥 Складний блок: Команда, Дата та ID
                        subtitle={
                            <View className="mt-1">
                                <Text className="text-[10px] font-bold text-[#FF6D00] uppercase mb-1" style={{ fontFamily: 'Evolventa' }}>
                                    {item.teamName}
                                </Text>
                                <View className="flex-row items-center">
                                    <Feather name="clock" size={10} color="#A3A3A3" />
                                    <Text className="text-[10px] ml-1 text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>
                                        {item.date}
                                    </Text>

                                </View>
                            </View>
                        }

                        // 🔥 Блок з результатами (Час та Спліт) замість кнопок керування
                        rightIcon={
                            <View className="items-end justify-center">
                                <Text
                                    className="text-2xl font-black text-[#FF6D00]"
                                    style={{ fontFamily: 'Unbounded' }}
                                >
                                    {item.totalTime.toFixed(2)}
                                    <Text className="text-xs font-bold text-[#FF6D00]/70">s</Text>
                                </Text>

                                <View className="flex-row items-center mt-1">
                                    <MaterialCommunityIcons name="timer-sand" size={10} color="#A3A3A3" />
                                    <Text className="text-[10px] ml-0.5 text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>
                                        {t('tools.sessions.split', { time: item.avgSplit.toFixed(2) }) as string}
                                    </Text>
                                </View>
                            </View>
                        }
                    />
                </View>
            )}
        />
    );
}