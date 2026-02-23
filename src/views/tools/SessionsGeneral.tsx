import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSessionsData } from '../../hooks/sessions/useSessionsData';
import { useTheme } from '../../context/ThemeContext'; // 🔥 Тема

interface Props {
    searchQuery: string;
}

const AutoMarqueeId = ({ id, isDark }: { id: string, isDark: boolean }) => {
    const scrollRef = useRef<ScrollView>(null);
    const scrollX = useRef(0);
    const maxScroll = 120;

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                scrollX.current += 1;
                if (scrollX.current > maxScroll) {
                    scrollX.current = -50;
                }
                scrollRef.current.scrollTo({ x: scrollX.current, animated: false });
            }
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <View className={`ml-3 flex-1 rounded-lg border overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
            <ScrollView
                ref={scrollRef} horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 6, paddingVertical: 2 }}
            >
                <Text className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    ID: <Text className={isDark ? 'text-slate-400' : 'text-slate-500'}>{id}</Text>
                </Text>
            </ScrollView>
        </View>
    );
};

export default function SessionsGeneral({ searchQuery }: Props) {
    const { isDark } = useTheme(); // 🔥 Стейт
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
                        <View className={`w-[48%] border p-4 rounded-2xl relative overflow-hidden shadow-sm ${isDark ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-300'}`}>
                            <View className="flex-row items-center mb-1">
                                <Feather name="trending-up" size={16} color={isDark ? "#4ade80" : "#16a34a"} />
                                <Text className={`text-xs font-bold uppercase ml-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>Найкращий</Text>
                            </View>
                            <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{best?.totalTime.toFixed(2) || '--'}s</Text>
                            <Text className={`text-sm mt-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`} numberOfLines={1}>{best?.playerName || 'N/A'}</Text>
                            <Text className={`text-[10px] font-bold mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} numberOfLines={1}>{best?.teamName}</Text>
                            <View className="absolute -right-2 -bottom-2 opacity-20"><MaterialCommunityIcons name="lightning-bolt" size={60} color={isDark ? "#4ade80" : "#16a34a"} /></View>
                        </View>

                        {/* WORST CARD */}
                        <View className={`w-[48%] border p-4 rounded-2xl relative overflow-hidden shadow-sm ${isDark ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-300'}`}>
                            <View className="flex-row items-center mb-1">
                                <Feather name="trending-down" size={16} color={isDark ? "#f87171" : "#dc2626"} />
                                <Text className={`text-xs font-bold uppercase ml-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Найгірший</Text>
                            </View>
                            <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{worst?.totalTime.toFixed(2) || '--'}s</Text>
                            <Text className={`text-sm mt-1 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`} numberOfLines={1}>{worst?.playerName || 'N/A'}</Text>
                            <Text className={`text-[10px] font-bold mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} numberOfLines={1}>{worst?.teamName}</Text>
                        </View>
                    </View>
                    <Text className={`font-bold px-2 uppercase text-xs tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Останні забіги</Text>
                </View>
            )}
            renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.7} className={`mb-3 p-4 rounded-2xl border flex-row justify-between items-center shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <View className="flex-1 mr-2">
                        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>{item.playerName}</Text>
                        <Text className={`text-xs font-medium mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} numberOfLines={1}>{item.teamName}</Text>

                        <View className="flex-row items-center mt-2">
                            <Feather name="clock" size={12} color={isDark ? "#64748b" : "#94a3b8"} />
                            <Text className={`text-[11px] ml-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{item.date}</Text>
                            <AutoMarqueeId id={item.id} isDark={isDark} />
                        </View>
                    </View>

                    <View className="items-end">
                        <Text className={`text-2xl font-black tracking-tight ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`}>
                            {item.totalTime.toFixed(2)}
                            <Text className={`text-sm font-bold ml-0.5 ${isDark ? 'text-yellow-600' : 'text-yellow-700'}`}>s</Text>
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <MaterialCommunityIcons name="timer-sand" size={12} color={isDark ? "#94a3b8" : "#cbd5e1"} />
                            <Text className={`text-[11px] ml-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>спліт: {item.avgSplit.toFixed(2)}s</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}