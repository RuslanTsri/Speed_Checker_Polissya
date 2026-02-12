import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSessionsData } from '../../hooks/sessions/useSessionsData';

interface Props {
    searchQuery: string;
}

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
                            <Text className="text-slate-300 text-sm mt-1 font-semibold">{best?.playerName || 'N/A'}</Text>
                            <Text className="text-blue-400 text-[10px] font-bold mt-0.5">{best?.teamName}</Text>
                            <View className="absolute -right-2 -bottom-2 opacity-20"><MaterialCommunityIcons name="lightning-bolt" size={60} color="#4ade80" /></View>
                        </View>

                        {/* WORST CARD */}
                        <View className="w-[48%] bg-red-900/20 border border-red-500/30 p-4 rounded-2xl relative overflow-hidden">
                            <View className="flex-row items-center mb-1">
                                <Feather name="trending-down" size={16} color="#f87171" />
                                <Text className="text-red-400 text-xs font-bold uppercase ml-1">Найгірший</Text>
                            </View>
                            <Text className="text-white text-3xl font-black">{worst?.totalTime.toFixed(2) || '--'}s</Text>
                            <Text className="text-slate-300 text-sm mt-1 font-semibold">{worst?.playerName || 'N/A'}</Text>
                            <Text className="text-blue-400 text-[10px] font-bold mt-0.5">{worst?.teamName}</Text>
                        </View>
                    </View>
                    <Text className="text-slate-500 font-bold px-2 uppercase text-xs tracking-widest">Останні забіги</Text>
                </View>
            )}
            renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.7} className="bg-slate-900 mb-3 p-4 rounded-2xl border border-slate-800 flex-row justify-between items-center shadow-sm">
                    <View className="flex-1">
                        <Text className="text-white text-lg font-bold">{item.playerName}</Text>
                        <Text className="text-blue-400 text-xs font-medium mt-0.5">{item.teamName}</Text>
                        <View className="flex-row items-center mt-2">
                            <Feather name="clock" size={14} color="#64748b" style={{ marginRight: 6 }} />
                            <Text className="text-slate-500 text-xs mr-3 font-medium">{item.date}</Text>
                            <View className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                <Text className="text-slate-400 text-[10px] font-bold">ID: {item.id}</Text>
                            </View>
                        </View>
                    </View>
                    <View className="items-end pl-2">
                        <Text className="text-yellow-400 text-2xl font-black tracking-tight">{item.totalTime.toFixed(2)}<Text className="text-sm font-bold text-yellow-600 ml-1">s</Text></Text>
                        <View className="flex-row items-center mt-1">
                            <MaterialCommunityIcons name="timer-sand" size={12} color="#94a3b8" style={{ marginRight: 2 }} />
                            <Text className="text-slate-400 text-xs">спліт: {item.avgSplit.toFixed(2)}s</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}