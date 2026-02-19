import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSessionsData } from '../../hooks/sessions/useSessionsData';

interface Props {
    searchQuery: string;
}

// 🔥 Окремий компонент для автоматичної прокрутки UUID
const AutoMarqueeId = ({ id }: { id: string }) => {
    const scrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(0);
    const maxScroll = 120; // Орієнтовна довжина прокрутки для UUID

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                scrollX.current += 1;
                if (scrollX.current > maxScroll) {
                    scrollX.current = -50; // Повертаємо трохи назад для ефекту безкінечності
                }
                scrollRef.current.scrollTo({ x: scrollX.current, animated: false });
            }
        }, 50); // Швидкість гортання

        return () => clearInterval(interval);
    }, []);

    return (
        <View className="ml-3 flex-1 bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <ScrollView
                ref={scrollRef}
                horizontal
                scrollEnabled={false} // Вимикаємо ручний скрол, щоб працював автомат
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 6, paddingVertical: 2 }}
            >
                <Text className="text-slate-500 text-[10px] font-mono">
                    ID: <Text className="text-slate-400">{id}</Text>
                </Text>
            </ScrollView>
        </View>
    );
};

export default function SessionsGeneral({ searchQuery }: Props) {
    const { generalSessions, stats } = useSessionsData(searchQuery);
    const { best, worst } = stats;

    return (
        <FlatList
            data={generalSessions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
                <View className="mb-6">
                    <View className="flex-row justify-between mb-6">
                        {/* BEST CARD */}
                        <View className="w-[48%] bg-green-900/20 border border-green-500/30 p-4 rounded-2xl relative overflow-hidden">
                            <View className="flex-row items-center mb-1">
                                <Feather name="trending-up" size={16} color="#4ade80" />
                                <Text className="text-green-400 text-xs font-bold uppercase ml-1">Найкращий</Text>
                            </View>
                            <Text className="text-white text-3xl font-black">{best?.totalTime.toFixed(2) || '--'}s</Text>
                            <Text className="text-slate-300 text-sm mt-1 font-semibold" numberOfLines={1}>{best?.playerName || 'N/A'}</Text>
                            <Text className="text-blue-400 text-[10px] font-bold mt-0.5" numberOfLines={1}>{best?.teamName}</Text>
                            <View className="absolute -right-2 -bottom-2 opacity-20"><MaterialCommunityIcons name="lightning-bolt" size={60} color="#4ade80" /></View>
                        </View>

                        {/* WORST CARD */}
                        <View className="w-[48%] bg-red-900/20 border border-red-500/30 p-4 rounded-2xl relative overflow-hidden">
                            <View className="flex-row items-center mb-1">
                                <Feather name="trending-down" size={16} color="#f87171" />
                                <Text className="text-red-400 text-xs font-bold uppercase ml-1">Найгірший</Text>
                            </View>
                            <Text className="text-white text-3xl font-black">{worst?.totalTime.toFixed(2) || '--'}s</Text>
                            <Text className="text-slate-300 text-sm mt-1 font-semibold" numberOfLines={1}>{worst?.playerName || 'N/A'}</Text>
                            <Text className="text-blue-400 text-[10px] font-bold mt-0.5" numberOfLines={1}>{worst?.teamName}</Text>
                        </View>
                    </View>
                    <Text className="text-slate-500 font-bold px-2 uppercase text-xs tracking-widest">Останні забіги</Text>
                </View>
            )}
            renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.7} className="bg-slate-900 mb-3 p-4 rounded-2xl border border-slate-800 flex-row justify-between items-center shadow-sm">
                    <View className="flex-1 mr-2">
                        <Text className="text-white text-lg font-bold" numberOfLines={1}>{item.playerName}</Text>
                        <Text className="text-blue-400 text-xs font-medium mt-0.5" numberOfLines={1}>{item.teamName}</Text>

                        <View className="flex-row items-center mt-2">
                            <Feather name="clock" size={12} color="#64748b" />
                            <Text className="text-slate-500 text-[11px] ml-1 font-medium">{item.date}</Text>

                            {/* 🔥 Виклик нашої "авто-каруселі" */}
                            <AutoMarqueeId id={item.id} />
                        </View>
                    </View>

                    <View className="items-end">
                        <Text className="text-yellow-400 text-2xl font-black tracking-tight">
                            {item.totalTime.toFixed(2)}
                            <Text className="text-sm font-bold text-yellow-600 ml-0.5">s</Text>
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <MaterialCommunityIcons name="timer-sand" size={12} color="#94a3b8" />
                            <Text className="text-slate-400 text-[11px] ml-0.5">спліт: {item.avgSplit.toFixed(2)}s</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}