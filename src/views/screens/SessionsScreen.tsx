import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';

import SessionsGeneral from '../tools/SessionsGeneral';
import SessionsTeam, { TeamSession } from '../tools/SessionsTeam';
import SessionDetails from '../tools/SessionDetails';

export type SessionTabType = 'GENERAL' | 'TEAM';

interface SessionsScreenProps {
    initialTab?: SessionTabType;
}

export default function SessionsScreen({ initialTab }: SessionsScreenProps) {
    const [mainTab, setMainTab] = useState<SessionTabType>(initialTab || 'TEAM');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeamSession, setSelectedTeamSession] = useState<TeamSession | null>(null);

    useEffect(() => {
        setMainTab(initialTab || 'TEAM');
    }, [initialTab]);

    if (selectedTeamSession) {
        return (
            <SessionDetails
                session={selectedTeamSession}
                onBack={() => setSelectedTeamSession(null)}
            />
        );
    }

    return (
        <View className="flex-1 bg-slate-950 pt-4">
            {/* Головний Header */}
            <View className="flex-row items-center justify-between px-4 mb-6">
                <Text className="text-white text-3xl font-bold">Звіти</Text>
            </View>

            <View className="flex-row px-4 mb-6 space-x-3">
                <TouchableOpacity
                    onPress={() => setMainTab('TEAM')}
                    className={`px-5 py-2 rounded-xl border ${mainTab === 'TEAM' ? 'bg-yellow-400 border-yellow-400' : 'bg-slate-900 border-slate-800'}`}
                >
                    <Text className={`font-bold text-sm ${mainTab === 'TEAM' ? 'text-slate-900' : 'text-slate-400'}`}>Командні</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setMainTab('GENERAL')}
                    className={`px-5 py-2 rounded-xl border ${mainTab === 'GENERAL' ? 'bg-yellow-400 border-yellow-400' : 'bg-slate-900 border-slate-800'}`}
                >
                    <Text className={`font-bold text-sm ${mainTab === 'GENERAL' ? 'text-slate-900' : 'text-slate-400'}`}>Загальні / Швидкі</Text>
                </TouchableOpacity>
            </View>

            <View className="px-4 mb-6">
                <View className="bg-slate-900 flex-row items-center px-4 rounded-2xl border border-slate-800 h-14">
                    <Feather name="search" size={20} color="#64748b" className="mr-3" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Пошук за командою або датою"
                        placeholderTextColor="#64748b"
                        className="flex-1 text-white text-base h-full"
                    />
                </View>
            </View>

            {mainTab === 'TEAM' ? (
                <SessionsTeam
                    searchQuery={searchQuery}
                    onSelectSession={setSelectedTeamSession}
                />
            ) : (
                <SessionsGeneral
                    searchQuery={searchQuery}
                />
            )}
        </View>
    );
}