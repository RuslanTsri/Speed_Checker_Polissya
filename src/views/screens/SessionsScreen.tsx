import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';

import SessionsGeneral from '../tools/SessionsGeneral';
import SessionsTeam from '../tools/SessionsTeam';
import SessionDetails from '../tools/SessionDetails';

import { useSessionsManager, SessionTabType } from '../../hooks/sessions/useSessionsManager';

interface SessionsScreenProps {
    initialTab?: SessionTabType;
}

export default function SessionsScreen({ initialTab }: SessionsScreenProps) {
    const {
        activeTab, setActiveTab,
        searchQuery, setSearchQuery,
        selectedTeamSession, setSelectedTeamSession,
        clearSelection
    } = useSessionsManager(initialTab);

    // Скидаємо таб при зміні props
    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    if (selectedTeamSession) {
        return (
            <SessionDetails
                session={selectedTeamSession}
                onBack={clearSelection}
            />
        );
    }

    return (
        <View className="flex-1 bg-slate-950 pt-4">
            <View className="flex-row items-center justify-between px-4 mb-6">
                <Text className="text-white text-3xl font-bold">Звіти</Text>
            </View>

            <View className="flex-row px-4 mb-6 space-x-3">
                <TouchableOpacity onPress={() => setActiveTab('TEAM')} className={`px-5 py-2 rounded-xl border ${activeTab === 'TEAM' ? 'bg-yellow-400 border-yellow-400' : 'bg-slate-900 border-slate-800'}`}>
                    <Text className={`font-bold text-sm ${activeTab === 'TEAM' ? 'text-slate-900' : 'text-slate-400'}`}>Командні</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('GENERAL')} className={`px-5 py-2 rounded-xl border ${activeTab === 'GENERAL' ? 'bg-yellow-400 border-yellow-400' : 'bg-slate-900 border-slate-800'}`}>
                    <Text className={`font-bold text-sm ${activeTab === 'GENERAL' ? 'text-slate-900' : 'text-slate-400'}`}>Загальні / Швидкі</Text>
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

            {activeTab === 'TEAM' ? (
                <SessionsTeam searchQuery={searchQuery} onSelectSession={setSelectedTeamSession} />
            ) : (
                <SessionsGeneral searchQuery={searchQuery} />
            )}
        </View>
    );
}