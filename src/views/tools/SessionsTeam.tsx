import React, { useState, useEffect } from 'react';
import {View, Text, FlatList, ActivityIndicator, Pressable, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSessionsData, TeamSession } from '../../hooks/sessions/useSessionsData';
import { TeamsMod } from '../components/ui/mods';
import { supabase } from '../../lib/supabase';

import {
    TeamsIcon, TeamsIconActive,
    ArrowIcon, ArrowIconActive,
    DocIconActive
} from '../../../assets/icons';

interface Props {
    searchQuery: string;
    onSelectSession: (session: any) => void;
    openTeam?: any;
}

export default function SessionsTeam({ searchQuery, onSelectSession, openTeam }: Props) {
    const { t } = useTranslation();
    const { teamSessions, isLoading, refresh } = useSessionsData(searchQuery);

    const [selectedTeam, setSelectedTeam] = useState<TeamSession | null>(null);
    const [teamSessionsList, setTeamSessionsList] = useState<any[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);

    useEffect(() => {
        if (openTeam) {
            loadSessionsForTeam(openTeam);
        }
    }, [openTeam]);

    const loadSessionsForTeam = async (team: TeamSession) => {
        setSelectedTeam(team);
        setIsLoadingSessions(true);
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('id, name, created_at, test_type, total_distance')
                .eq('team_id', team.id)
                .order('created_at', { ascending: false });

            if (data && !error) {
                const uniqueNames = Array.from(new Set(data.map(s => s.name)));
                const groupedList = uniqueNames.map(name => {
                    const sessionGroup = data.filter(s => s.name === name);
                    const latest = sessionGroup[0];
                    const distances = Array.from(new Set(sessionGroup.map(s => s.total_distance))).sort((a, b) => a - b);
                    return {
                        id: name,
                        name: name,
                        created_at: latest.created_at,
                        distances: distances
                    };
                });
                setTeamSessionsList(groupedList);
            }
        } catch (e) {
            console.error("Error loading team sessions", e);
        }
        setIsLoadingSessions(false);
    };

    if (selectedTeam) {
        return (
            <View className="flex-1">
                <View className="flex-row items-center px-4 py-2 mb-4 border-b border-surface-border">
                    <Pressable onPress={() => setSelectedTeam(null)} className="p-2 -ml-2 flex-row items-center">
                        {({ pressed }) => (
                            <>
                                <View style={styles.rotateLeft}>
                                    {pressed ? (
                                        <ArrowIconActive width={24} height={24} fill="#FF6D00" />
                                    ) : (
                                        <ArrowIcon width={24} height={24} fill="#F5F5F5" />
                                    )}
                                </View>
                                <Text className="text-text-main font-evolventa-bold ml-2">
                                    {t('tools.sessions.all_teams', 'Всі команди')}
                                </Text>
                            </>
                        )}
                    </Pressable>
                </View>

                <View className="px-4 mb-4">
                    <Text className="text-h3 text-text-main font-unbounded-bold">{selectedTeam.teamName}</Text>
                    <Text className="text-caption text-text-sub font-evolventa">
                        {t('tools.sessions.select_session_desc', 'Оберіть сесію для перегляду результатів')}
                    </Text>
                </View>

                {isLoadingSessions ? (
                    <ActivityIndicator color="#FF6D00" className="mt-10" />
                ) : (
                    <FlatList
                        data={teamSessionsList}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View className="items-center justify-center mt-10 opacity-70">
                                <Feather name="folder" size={32} color="#717171" className="mb-2" />
                                <Text className="text-text-sub font-evolventa">
                                    {t('tools.sessions.no_sessions_team', 'У цієї команди ще немає сесій')}
                                </Text>
                            </View>
                        )}
                        renderItem={({ item }) => {
                            const dateStr = new Date(item.created_at).toLocaleDateString();
                            const timeStr = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            return (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => onSelectSession({
                                        isGroup: true,
                                        teamId: selectedTeam.id,
                                        teamName: selectedTeam.teamName,
                                        sessionName: item.name,
                                        sessionDate: item.created_at
                                    })}
                                    className="bg-surface-card border border-surface-border p-4 rounded-3xl mb-3 flex-row items-center justify-between"
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-12 h-12 bg-brand-orange/10 rounded-2xl items-center justify-center border border-brand-orange/20 mr-4">
                                            <DocIconActive width={24} height={24} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-body text-text-main font-unbounded-bold" numberOfLines={1}>
                                                {item.name || t('tools.speed_checker.free_training', 'Тренування')}
                                            </Text>
                                            <View className="flex-row items-center mt-1">
                                                <Feather name="calendar" size={10} color="#A3A3A3" />
                                                <Text className="text-[10px] text-text-sub font-evolventa ml-1 mr-3">
                                                    {dateStr} {t('tools.sessions.at_time', 'о')} {timeStr}
                                                </Text>
                                                <Text className="text-[10px] text-brand-orange font-evolventa-bold">
                                                    {item.distances.join(', ')}м
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Feather name="chevron-right" size={20} color="#717171" />
                                </TouchableOpacity>
                            );
                        }}
                    />
                )}
            </View>
        );
    }

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
            ListEmptyComponent={() => <Text className="text-center mt-10 text-text-sub font-evolventa">{t('tools.sessions.no_teams_found')}</Text>}
            renderItem={({ item }) => (
                <TeamsMod
                    teamName={item.teamName}
                    tags={
                        <View className="flex-row items-center gap-2 mt-1">
                            <View className="flex-row items-center px-2 py-1 rounded-md border border-surface-border bg-surface-card">
                                <Feather name="users" size={10} color="#A3A3A3" style={{ marginRight: 6 }} />
                                <Text className="text-[10px] text-text-sub font-evolventa-bold">{t('tools.sessions.players_count', { count: item.playerCount })}</Text>
                            </View>

                            {item.hasResults ? (
                                <View className="flex-row items-center px-2 py-1 rounded-md border border-status-success/20 bg-status-success/10">
                                    <Feather name="bar-chart-2" size={10} color="#34d399" style={{ marginRight: 4 }} />
                                    <Text className="text-status-success text-[10px] font-evolventa-bold">{t('tools.sessions.has_data')}</Text>
                                </View>
                            ) : (
                                <View className="flex-row items-center px-2 py-1 rounded-md border border-status-error/20 bg-status-error/10">
                                    <MaterialIcons name="error-outline" size={10} color="#f87171" style={{ marginRight: 4 }} />
                                    <Text className="text-status-error text-[10px] font-evolventa-bold">{t('tools.sessions.no_data_badge')}</Text>
                                </View>
                            )}
                        </View>
                    }
                    icon={<TeamsIcon width={31} height={31} fill="#F5F5F5" />}
                    activeIcon={<TeamsIconActive width={31} height={31} fill="#F5F5F5" />}
                    rightIcon={<ArrowIcon width={24} height={24} fill="#64748b" />}
                    rightActiveIcon={<ArrowIconActive width={24} height={24} fill="#F5F5F5" />}
                    onPress={() => {
                        if (item.hasResults) {
                            loadSessionsForTeam(item);
                        } else {
                            Alert.alert(
                                t('tools.sessions.alert_attention', 'Увага'),
                                t('tools.sessions.no_team_results_alert', 'У цієї команди ще немає результатів.')
                            );
                        }
                    }}
                    className="mb-3"
                />
            )}
        />
    );
}

const styles = StyleSheet.create({
    rotateLeft: { transform: [{ rotate: '-90deg' }] },
});