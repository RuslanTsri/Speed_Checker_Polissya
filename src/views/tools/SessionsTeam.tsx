import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSessionsData, TeamSession } from '../../hooks/sessions/useSessionsData';
import { TeamsMod } from '../components/ui/mods';

import {
    TeamsIcon, TeamsIconActive,
    ArrowIcon, ArrowIconActive
} from '../../../assets/icons';

interface Props {
    searchQuery: string;
    onSelectSession: (team: TeamSession) => void;
}

export default function SessionsTeam({ searchQuery, onSelectSession }: Props) {
    const { t } = useTranslation();
    const { teamSessions, isLoading, refresh } = useSessionsData(searchQuery);

    if (isLoading && teamSessions.length === 0) {
        return (
            <View className="mt-10">
                <ActivityIndicator color="#FF6D00" />
            </View>
        );
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
                <Text className="text-center mt-10 text-text-sub font-evolventa">
                    {t('tools.sessions.no_teams_found') as string}
                </Text>
            )}
            renderItem={({ item }) => (
                <TeamsMod
                    teamName={item.teamName}
                    tags={
                        <View className="flex-row items-center gap-2 mt-1">
                            <View className="flex-row items-center px-2 py-1 rounded-md border border-surface-border bg-surface-card">
                                <Feather name="users" size={10} color="#A3A3A3" style={{ marginRight: 6 }} />
                                <Text className="text-[10px] text-text-sub font-evolventa-bold">
                                    {t('tools.sessions.players_count', { count: item.playerCount }) as string}
                                </Text>
                            </View>

                            {item.hasResults ? (
                                <View className="flex-row items-center px-2 py-1 rounded-md border border-status-success/20 bg-status-success/10">
                                    <Feather name="bar-chart-2" size={10} color="#34d399" style={{ marginRight: 4 }} />
                                    <Text className="text-status-success text-[10px] font-evolventa-bold">
                                        {t('tools.sessions.has_data') as string}
                                    </Text>
                                </View>
                            ) : (
                                <View className="flex-row items-center px-2 py-1 rounded-md border border-status-error/20 bg-status-error/10">
                                    <MaterialIcons name="error-outline" size={10} color="#f87171" style={{ marginRight: 4 }} />
                                    <Text className="text-status-error text-[10px] font-evolventa-bold">
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