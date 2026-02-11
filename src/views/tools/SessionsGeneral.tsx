import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// 1. Додаємо teamName до інтерфейсу
interface GeneralSession {
    id: string;
    playerName: string;
    teamName: string; // 🔥 Нове поле
    totalTime: number;
    avgSplit: number;
    date: string;
}

// 2. Оновлюємо мокові дані (додав ФК Полісся та інші для прикладу)
const DUMMY_GENERAL_SESSIONS: GeneralSession[] = [
    { id: '1', playerName: 'Олександр Назаренко', teamName: 'ФК «Полісся»', totalTime: 12.30, avgSplit: 4.10, date: '10:45' },
    { id: '2', playerName: 'Бені Макуана', teamName: 'ФК «Полісся»', totalTime: 11.95, avgSplit: 3.98, date: '10:42' },
    { id: '3', playerName: 'Пилип Будківський', teamName: 'ФК «Полісся»', totalTime: 14.10, avgSplit: 4.70, date: '10:38' },
    { id: '4', playerName: 'Денис Бойко', teamName: 'ФК «Динамо»', totalTime: 13.50, avgSplit: 4.50, date: '10:35' },
    { id: '5', playerName: 'Артем Шабанов', teamName: 'ФК «Динамо»', totalTime: 13.10, avgSplit: 4.36, date: '10:30' },
];

interface Props {
    searchQuery: string;
}

export default function SessionsGeneral({ searchQuery }: Props) {
    const sortedGeneral = [...DUMMY_GENERAL_SESSIONS].sort((a, b) => a.totalTime - b.totalTime);
    const bestResult = sortedGeneral[0];
    const worstResult = sortedGeneral[sortedGeneral.length - 1];

    // 🔥 Оновив фільтрацію: тепер шукає і по імені, і по команді, і по даті
    const filteredData = sortedGeneral.filter(s =>
        s.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.date.includes(searchQuery)
    );

    return (
        <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
                <View className="mb-6">
                    <View className="flex-row justify-between mb-6">
                        <View className="w-[48%] bg-green-900/20 border border-green-500/30 p-4 rounded-2xl relative overflow-hidden">
                            <View className="flex-row items-center mb-1">
                                <Feather name="trending-up" size={16} color="#4ade80" />
                                <Text className="text-green-400 text-xs font-bold uppercase ml-1">Найкращий</Text>
                            </View>
                            <Text className="text-white text-3xl font-black">{bestResult?.totalTime.toFixed(2)}s</Text>
                            <Text className="text-slate-300 text-sm mt-1 font-semibold">{bestResult?.playerName}</Text>
                            {/* Додано команду в картку Найкращого */}
                            <Text className="text-blue-400 text-[10px] font-bold mt-0.5">{bestResult?.teamName}</Text>
                            <View className="absolute -right-2 -bottom-2 opacity-20"><MaterialCommunityIcons name="lightning-bolt" size={60} color="#4ade80" /></View>
                        </View>

                        <View className="w-[48%] bg-red-900/20 border border-red-500/30 p-4 rounded-2xl relative overflow-hidden">
                            <View className="flex-row items-center mb-1">
                                <Feather name="trending-down" size={16} color="#f87171" />
                                <Text className="text-red-400 text-xs font-bold uppercase ml-1">Найгірший</Text>
                            </View>
                            <Text className="text-white text-3xl font-black">{worstResult?.totalTime.toFixed(2)}s</Text>
                            <Text className="text-slate-300 text-sm mt-1 font-semibold">{worstResult?.playerName}</Text>
                            {/* Додано команду в картку Найгіршого */}
                            <Text className="text-blue-400 text-[10px] font-bold mt-0.5">{worstResult?.teamName}</Text>
                        </View>
                    </View>
                    <Text className="text-slate-500 font-bold px-2 uppercase text-xs tracking-widest">Останні забіги</Text>
                </View>
            )}
            renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.7} className="bg-slate-900 mb-3 p-4 rounded-2xl border border-slate-800 flex-row justify-between items-center shadow-sm">
                    <View className="flex-1">
                        <Text className="text-white text-lg font-bold">{item.playerName}</Text>

                        {/* 🔥 Вивід назви команди */}
                        <Text className="text-blue-400 text-xs font-medium mt-0.5">
                            {item.teamName}
                        </Text>

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