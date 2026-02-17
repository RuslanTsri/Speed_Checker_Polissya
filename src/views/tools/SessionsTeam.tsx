import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';

import { useSessionsData, TeamSession } from '../../hooks/sessions/useSessionsData';
interface Props {
    searchQuery: string;
    // Передаємо далі ID команди
    onSelectSession: (team: TeamSession) => void;}

export default function SessionsTeam({ searchQuery, onSelectSession }: Props) {
    const { teamSessions, isLoading, refresh } = useSessionsData(searchQuery);
    if (isLoading && teamSessions.length === 0) {
        return <View className="mt-10"><ActivityIndicator color="#facc15" /></View>;
    }

    return (
        <FlatList
            data={teamSessions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={refresh}
            ListEmptyComponent={() => (
                <Text className="text-slate-500 text-center mt-10">Команд не знайдено</Text>
            )}
            renderItem={({ item }) => (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onSelectSession(item)}
                    className="bg-slate-900 p-5 rounded-3xl mb-4 border border-slate-800 shadow-sm"
                >
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-white text-xl font-bold flex-1 mr-2">{item.teamName}</Text>

                        {/* 🔥 ЛОГІКА СТАТУСУ */}
                        {item.hasResults ? (
                            <View className="flex-row items-center bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                                <Feather name="bar-chart-2" size={12} color="#4ade80" style={{ marginRight: 4 }} />
                                <Text className="text-green-400 text-[10px] font-bold uppercase">Є дані</Text>
                            </View>
                        ) : (
                            <View className="flex-row items-center bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
                                <MaterialIcons name="error-outline" size={12} color="#f87171" style={{ marginRight: 4 }} />
                                <Text className="text-red-400 text-[10px] font-bold uppercase">Немає даних</Text>
                            </View>
                        )}
                    </View>

                    <Text className={`text-xs font-medium mb-4 ${item.hasResults ? 'text-green-400' : 'text-slate-500'}`}>
                        {item.hasResults ? 'Натисніть для перегляду статистики' : 'Тестування ще не проводились'}
                    </Text>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-slate-800 rounded-full items-center justify-center mr-3 border border-slate-700">
                                <Feather name="users" size={14} color="#94a3b8" />
                            </View>
                            <Text className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                                {item.playerCount} Гравців
                            </Text>
                        </View>

                        <Feather name="chevron-right" size={20} color={item.hasResults ? "#facc15" : "#475569"} />
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}