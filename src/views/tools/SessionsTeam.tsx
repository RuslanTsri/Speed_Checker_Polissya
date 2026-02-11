import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Експортуємо типи, щоб SessionDetails теж їх бачив
export interface Attempt { round: number; time: number; }
export interface PlayerResult { id: string; playerName: string; number: string; bestTime: number; maxSpeed: number; attempts: Attempt[]; }
export interface TeamSession { id: string; teamName: string; testType: string; date: string; time: string; playerCount: number; bestTime: number; avgTime: number; results: PlayerResult[]; }

const DUMMY_TEAM_SESSIONS: TeamSession[] = [
    {
        id: 's1', teamName: 'ФК «Динамо» U17', testType: 'Тест 30 м • 2 гейти • Раундів: 2', date: '12.10.2023', time: '10:30', playerCount: 24, bestTime: 4.06, avgTime: 4.69,
        results: [
            { id: 'p1', playerName: 'Гравець 21', number: '21', bestTime: 4.06, maxSpeed: 25.1, attempts: [{ round: 1, time: 4.12 }, { round: 2, time: 4.06 }] },
            { id: 'p2', playerName: 'Гравець 13', number: '13', bestTime: 4.10, maxSpeed: 25.1, attempts: [{ round: 1, time: 4.20 }, { round: 2, time: 4.10 }] },
            { id: 'p3', playerName: 'Гравець 4', number: '4', bestTime: 4.26, maxSpeed: 24.5, attempts: [{ round: 1, time: 4.26 }, { round: 2, time: 4.30 }] },
        ]
    }
];

interface Props {
    searchQuery: string;
    onSelectSession: (session: TeamSession) => void;
}

export default function SessionsTeam({ searchQuery, onSelectSession }: Props) {
    const filteredSessions = DUMMY_TEAM_SESSIONS.filter(s =>
        s.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.date.includes(searchQuery)
    );

    return (
        <FlatList
            data={filteredSessions}
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