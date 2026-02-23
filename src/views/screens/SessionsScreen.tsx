import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import SessionsGeneral from '../tools/SessionsGeneral';
import SessionsTeam from '../tools/SessionsTeam';
import SessionDetails from '../tools/SessionDetails';
import { useSessionsManager, SessionTabType } from '../../hooks/sessions/useSessionsManager';
import { TeamSession } from '../../hooks/sessions/useSessionsData';
import { useTheme } from '../../context/ThemeContext'; // 🔥 Тема

interface SessionsScreenProps {
    initialTab?: SessionTabType;
    openSession?: TeamSession | null;
}

export default function SessionsScreen({ initialTab, openSession }: SessionsScreenProps) {
    const { isDark } = useTheme(); // 🔥 Стейт
    const {
        activeTab, setActiveTab,
        searchQuery, setSearchQuery,
        selectedTeamSession, setSelectedTeamSession,
        clearSelection
    } = useSessionsManager(initialTab);

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        if (openSession) {
            setSelectedTeamSession(openSession);
            setActiveTab('TEAM');
        }
    }, [openSession]);

    if (selectedTeamSession) {
        return <SessionDetails session={selectedTeamSession} onBack={clearSelection} />;
    }

    return (
        <View className={`flex-1 pt-4 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <View className="flex-row items-center justify-between px-4 mb-6">
                <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Звіти</Text>
            </View>

            <View className="flex-row px-4 mb-6 space-x-3">
                <TouchableOpacity onPress={() => setActiveTab('TEAM')} className={`px-5 py-2 rounded-xl border shadow-sm ${activeTab === 'TEAM' ? 'bg-yellow-400 border-yellow-400' : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}`}>
                    <Text className={`font-bold text-sm ${activeTab === 'TEAM' ? 'text-slate-900' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>Командні</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('GENERAL')} className={`px-5 py-2 rounded-xl border shadow-sm ${activeTab === 'GENERAL' ? 'bg-yellow-400 border-yellow-400' : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}`}>
                    <Text className={`font-bold text-sm ${activeTab === 'GENERAL' ? 'text-slate-900' : (isDark ? 'text-slate-400' : 'text-slate-500')}`}>Загальні / Швидкі</Text>
                </TouchableOpacity>
            </View>

            <View className="px-4 mb-6">
                <View className={`flex-row items-center px-4 rounded-2xl border h-14 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <Feather name="search" size={20} color={isDark ? "#64748b" : "#94a3b8"} className="mr-3" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Пошук за командою або датою"
                        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                        className={`flex-1 text-base h-full ${isDark ? 'text-white' : 'text-slate-900'}`}
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