import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSessionsData, TeamSession } from '../../hooks/sessions/useSessionsData';
import { useTheme } from '../../context/ThemeContext';

interface Props { searchQuery: string; onSelectSession: (team: TeamSession) => void; }

export default function SessionsTeam({ searchQuery, onSelectSession }: Props) {
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const { teamSessions, isLoading, refresh } = useSessionsData(searchQuery);

    if (isLoading && teamSessions.length === 0) return <View className="mt-10"><ActivityIndicator color={isDark ? "#facc15" : "#eab308"} /></View>;

    return (
        <FlatList
            data={teamSessions} keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}
            refreshing={isLoading} onRefresh={refresh}
            ListEmptyComponent={() => (
                <Text className={`text-center mt-10 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{t('tools.sessions.no_teams_found') as string}</Text>
            )}
            renderItem={({ item }) => (
                <TouchableOpacity
                    activeOpacity={0.8} onPress={() => onSelectSession(item)}
                    className={`p-5 rounded-3xl mb-4 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                >
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className={`text-xl font-bold flex-1 mr-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.teamName}</Text>

                        {item.hasResults ? (
                            <View className={`flex-row items-center px-2 py-1 rounded-lg border ${isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                                <Feather name="bar-chart-2" size={12} color={isDark ? "#4ade80" : "#16a34a"} style={{ marginRight: 4 }} />
                                <Text className={`text-[10px] font-bold uppercase ${isDark ? 'text-green-400' : 'text-green-600'}`}>{t('tools.sessions.has_data') as string}</Text>
                            </View>
                        ) : (
                            <View className={`flex-row items-center px-2 py-1 rounded-lg border ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                                <MaterialIcons name="error-outline" size={12} color={isDark ? "#f87171" : "#dc2626"} style={{ marginRight: 4 }} />
                                <Text className={`text-[10px] font-bold uppercase ${isDark ? 'text-red-400' : 'text-red-600'}`}>{t('tools.sessions.no_data_badge') as string}</Text>
                            </View>
                        )}
                    </View>

                    <Text className={`text-xs font-medium mb-4 ${item.hasResults ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                        {item.hasResults ? (t('tools.sessions.click_to_view') as string) : (t('tools.sessions.no_tests_run') as string)}
                    </Text>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                                <Feather name="users" size={14} color={isDark ? "#94a3b8" : "#64748b"} />
                            </View>
                            <Text className={`text-xs font-medium uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {t('tools.sessions.players_count', { count: item.playerCount }) as string}
                            </Text>
                        </View>
                        <Feather name="chevron-right" size={20} color={item.hasResults ? (isDark ? "#facc15" : "#eab308") : (isDark ? "#475569" : "#cbd5e1")} />
                    </View>
                </TouchableOpacity>
            )}
        />
    );
}