import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSessionsData, TeamSession } from '../../hooks/sessions/useSessionsData';

// 🔥 Імпортуємо TeamsMod та іконки
import { TeamsMod } from '../components/ui/mods';
import {
    TeamsIcon, TeamsIconActive,
    ArrowIcon, ArrowIconActive
} from '../../../assets/icons';

interface Props { searchQuery: string; onSelectSession: (team: TeamSession) => void; }

export default function SessionsTeam({ searchQuery, onSelectSession }: Props) {
    const { t } = useTranslation();
    const { teamSessions, isLoading, refresh } = useSessionsData(searchQuery);

    if (isLoading && teamSessions.length === 0) {
        return <View className="mt-10"><ActivityIndicator color="#FF6D00" /></View>;
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
                <Text className="text-center mt-10 text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>
                    {t('tools.sessions.no_teams_found') as string}
                </Text>
            )}
            renderItem={({ item }) => (
                // 🔥 ВИКОРИСТОВУЄМО TeamsMod
                <TeamsMod
                    teamName={item.teamName}
                    tags={
                        <View className="flex-row items-center gap-2 mt-0.5">
                            {/* Бейдж: Кількість гравців */}
                            <View className="flex-row items-center px-2 py-1 rounded-md border border-white/10 bg-white/5">
                                <Feather name="users" size={10} color="#DCDCDC" style={{ marginRight: 6 }} />
                                <Text className="text-[10px] font-bold text-[#DCDCDC]">
                                    {t('tools.sessions.players_count', { count: item.playerCount }) as string}
                                </Text>
                            </View>

                            {/* Бейдж: Статус даних (Є дані / Немає даних) */}
                            {item.hasResults ? (
                                <View className="flex-row items-center px-2 py-1 rounded-md border border-emerald-500/20 bg-emerald-500/10">
                                    <Feather name="bar-chart-2" size={10} color="#34d399" style={{ marginRight: 4 }} />
                                    <Text className="text-emerald-500 text-[10px] font-bold">
                                        {t('tools.sessions.has_data') as string}
                                    </Text>
                                </View>
                            ) : (
                                <View className="flex-row items-center px-2 py-1 rounded-md border border-red-500/20 bg-red-500/10">
                                    <MaterialIcons name="error-outline" size={10} color="#f87171" style={{ marginRight: 4 }} />
                                    <Text className="text-red-500 text-[10px] font-bold">
                                        {t('tools.sessions.no_data_badge') as string}
                                    </Text>
                                </View>
                            )}
                        </View>
                    }
                    icon={<TeamsIcon width={31} height={31} fill="#F5F5F5" />}
                    activeIcon={<TeamsIconActive width={31} height={31} fill="#F5F5F5" />}
                    rightIcon={<ArrowIcon width={24} height={24} fill="#64748b" />}
                    rightActiveIcon={<ArrowIconActive width={24} height={24} fill="#F5F5F5" />}
                    onPress={() => onSelectSession(item)}
                    className="mb-3"
                />
            )}
        />
    );
}