import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSessionsData } from '../../hooks/sessions/useSessionsData';
import { TeamsMod } from '../components/ui/mods';
import { TeamsIcon, ArrowIcon } from '../../../assets/icons';

export default function SessionsTeam({ searchQuery, onSelectSession }: any) {
    const { t } = useTranslation();
    const { teamSessions, isLoading, refresh } = useSessionsData(searchQuery);

    if (isLoading && teamSessions.length === 0) return <View className="mt-10"><ActivityIndicator color="#FF6D00" /></View>;

    return (
        <FlatList
            data={teamSessions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            refreshing={isLoading}
            onRefresh={refresh}
            renderItem={({ item }) => (
                <TeamsMod
                    teamName={item.teamName}
                    icon={<TeamsIcon width={30} height={30} fill="#F5F5F5" />}
                    rightIcon={<ArrowIcon width={24} height={24} fill="#717171" />}
                    onPress={() => onSelectSession(item)}
                    className="mb-3"
                />
            )}
        />
    );
}