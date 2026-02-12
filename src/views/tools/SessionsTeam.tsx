import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TeamSession, useSessionsData } from '../../hooks/sessions/useSessionsData';

interface Props {
    searchQuery: string;
    onSelectSession: (session: TeamSession) => void;
}

export default function SessionsTeam({ searchQuery, onSelectSession }: Props) {
    const { teamSessions } = useSessionsData(searchQuery);

    return (
        <FlatList
            data={teamSessions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onSelectSession(item)}
                    className="bg-slate-900 p-5 rounded-3xl mb-4 border border-slate-800 shadow-sm"
                >
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-white text-xl font-bold flex-1">{item.teamName}</Text>
                        <Feather name="chevron-right" size={20} color="#64748b" />
                    </View>
                    <Text className="text-blue-400 text-xs font-medium mb-4">{item.testType}</Text>

                    <View className="flex-row items-center">
                        <View className="flex-row items-center mr-4">
                            <Feather name="calendar" size={14} color="#64748b" style={{ marginRight: 6 }} />
                            <Text className="text-slate-400 text-xs font-medium">{item.date} • {item.time}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Feather name="users" size={14} color="#64748b" style={{ marginRight: 6 }} />
                            <Text className="text-slate-400 text-xs font-medium uppercase tracking-widest">{item.playerCount} Гравців</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}