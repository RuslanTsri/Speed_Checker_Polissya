import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';


interface Session {
    id: string;
    playerName: string;
    totalTime: number;
    avgSplit: number;
    date: string;
}


const DUMMY_SESSIONS: Session[] = [
    { id: '1', playerName: 'Олександр Назаренко', totalTime: 12.30, avgSplit: 4.10, date: '10:45' },
    { id: '2', playerName: 'Бені Макуана', totalTime: 11.95, avgSplit: 3.98, date: '10:42' },
    { id: '3', playerName: 'Пилип Будківський', totalTime: 14.10, avgSplit: 4.70, date: '10:38' },
    { id: '4', playerName: 'Денис Бойко', totalTime: 13.50, avgSplit: 4.50, date: '10:35' },
    { id: '5', playerName: 'Артем Шабанов', totalTime: 13.10, avgSplit: 4.36, date: '10:30' },
    { id: '6', playerName: 'Руслан Бабенко', totalTime: 12.80, avgSplit: 4.26, date: '10:25' },
    { id: '7', playerName: 'Луіфер Ернандес', totalTime: 12.50, avgSplit: 4.16, date: '10:20' },
];

export default function SessionsScreen() {
    const sorted = [...DUMMY_SESSIONS].sort((a, b) => a.totalTime - b.totalTime);
    const bestResult = sorted[0];
    const worstResult = sorted[sorted.length - 1];


    const renderHeader = () => (
        <View className="mb-6">
            <Text className="text-white text-3xl font-bold mb-4 px-2">Сесії</Text>

            <View className="flex-row justify-between">
                <View className="w-[48%] bg-green-900/30 border border-green-500/50 p-4 rounded-2xl relative overflow-hidden">
                    <View className="flex-row items-center mb-1">

                        <Feather name="trending-up" size={16} color="#4ade80" />
                        <Text className="text-green-400 text-xs font-bold uppercase ml-1">Найкращий</Text>
                    </View>

                    <Text className="text-white text-3xl font-black">{bestResult.totalTime.toFixed(2)}s</Text>
                    <Text className="text-slate-300 text-sm mt-1 font-semibold">{bestResult.playerName}</Text>

                    <View className="absolute -right-2 -bottom-2 opacity-20">
                        <MaterialCommunityIcons name="lightning-bolt" size={60} color="#4ade80" />
                    </View>
                </View>

                <View className="w-[48%] bg-red-900/20 border border-red-500/30 p-4 rounded-2xl relative overflow-hidden">
                    <View className="flex-row items-center mb-1">
                        <Feather name="trending-down" size={16} color="#f87171" />
                        <Text className="text-red-400 text-xs font-bold uppercase ml-1">Найгірший</Text>
                    </View>

                    <Text className="text-white text-3xl font-black">{worstResult.totalTime.toFixed(2)}s</Text>
                    <Text className="text-slate-300 text-sm mt-1 font-semibold">{worstResult.playerName}</Text>
                </View>
            </View>

            <Text className="text-slate-500 font-bold mt-6 mb-2 px-2 uppercase text-xs tracking-widest">
                Останні забіги
            </Text>
        </View>
    );

    const renderItem = ({ item }: { item: Session }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            className="bg-slate-800 mb-3 p-4 rounded-2xl border border-slate-700 flex-row justify-between items-center shadow-sm"
        >
            <View>
                <Text className="text-white text-lg font-bold">{item.playerName}</Text>
                <View className="flex-row items-center mt-2">
                    {/* Іконка годинника замість емодзі */}
                    <Feather name="clock" size={14} color="#64748b" style={{ marginRight: 6 }} />
                    <Text className="text-slate-500 text-xs mr-3 font-medium">{item.date}</Text>

                    <View className="bg-slate-700 px-2 py-0.5 rounded border border-slate-600">
                        <Text className="text-slate-300 text-[10px] font-bold">ID: {item.id}</Text>
                    </View>
                </View>
            </View>

            <View className="items-end">
                <Text className="text-yellow-400 text-2xl font-black tracking-tight">
                    {item.totalTime.toFixed(2)}<Text className="text-sm font-bold text-yellow-600 ml-1">s</Text>
                </Text>

                <View className="flex-row items-center mt-1">
                    <MaterialCommunityIcons name="timer-sand" size={12} color="#94a3b8" style={{ marginRight: 2 }} />
                    <Text className="text-slate-400 text-xs">
                        спліт: {item.avgSplit.toFixed(2)}s
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 px-4 pt-4">
            <FlatList
                data={DUMMY_SESSIONS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}