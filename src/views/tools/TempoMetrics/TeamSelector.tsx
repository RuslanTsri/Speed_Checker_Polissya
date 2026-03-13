import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTeamSelection } from '../../../hooks/tempoMetrics/useTeamSelection';
import { usePlayersLogic } from '../../../hooks/players/usePlayersLogic';

import { SearchInput } from '../../components/ui/SearchInput';
import { TeamsMod } from '../../components/ui/mods';
import { Button, IconButton } from '../../components/ui/Button';
import { RadioButton } from '../../components/ui/RadioButton';
import { ArrowIcon, ArrowIconActive, TeamsIcon, TeamsIconActive } from '../../../../assets/icons';

import { AppModal } from '../../components/AppModal';
import { TextField } from '../../components/ui/TextField';

export default function TeamSelector({ onBack, onSelect }: any) {
    const { t } = useTranslation();
    const { teams, search, setSearch, selectedId, setSelectedId, isLoading: isSelectionLoading } = useTeamSelection();

    const {
        isAddTeamModalVisible, setAddTeamModalVisible, newTeamName, setNewTeamName, handleCreateTeam, isLoading: isLogicLoading
    } = usePlayersLogic();

    const [pendingNewTeam, setPendingNewTeam] = useState<string | null>(null);
    const [topTeamId, setTopTeamId] = useState<string | null>(null);

    const isInitialLoading = isSelectionLoading && teams.length === 0;
    const isEmpty = teams.length === 0 && !isSelectionLoading;

    useEffect(() => {
        if (pendingNewTeam) {
            const created = teams.find(t => t.name.toLowerCase() === pendingNewTeam.toLowerCase());
            if (created) {
                setSelectedId(created.id);
                setTopTeamId(created.id);
                setPendingNewTeam(null);
            }
        }
    }, [teams, pendingNewTeam, setSelectedId]);

    const onTeamCreate = async () => {
        const nameToCreate = newTeamName.trim();
        if (!nameToCreate) return;
        setPendingNewTeam(nameToCreate);
        await handleCreateTeam();
    };

    const displayTeams = useMemo(() => {
        if (!topTeamId) return teams;
        const topTeam = teams.find(t => t.id === topTeamId);
        const others = teams.filter(t => t.id !== topTeamId);
        return topTeam ? [topTeam, ...others] : teams;
    }, [teams, topTeamId]);

    const modalsJSX = (
        <AppModal type="fullscreen" visible={isAddTeamModalVisible} onClose={() => setAddTeamModalVisible(false)} title={t('screens.players.modal_new_team')}>
            <View className="mt-8 px-2">
                <TextField
                    label={t('screens.players.label_team_name')}
                    value={newTeamName}
                    onChangeText={setNewTeamName}
                    placeholder={t('screens.players.placeholder_team_example')}
                    autoFocus
                />
                <View className="mt-8">
                    <Button
                        variant="primary"
                        title={t('tools.speed_checker.btn_create_team')}
                        onPress={onTeamCreate}
                        disabled={!newTeamName?.trim() || isLogicLoading}
                        isLoading={isLogicLoading}
                    />
                </View>
            </View>
        </AppModal>
    );

    return (
        <View className="flex-1 pt-4 relative">
            {isInitialLoading && (
                <>
                    <View className="flex-row items-center justify-between px-4 mb-6 z-10">
                        <Pressable onPress={onBack} className="p-2 -ml-2">
                            {({ pressed }) => (
                                <View style={styles.rotateNeg90}>
                                    {pressed ? <ArrowIconActive width={28} height={28} /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                                </View>
                            )}
                        </Pressable>
                        <Text className="text-h3 flex-1 text-center text-text-main font-unbounded-bold">
                            {t('tools.speed_checker.select_team_title')}
                        </Text>
                        <View className="w-10" />
                    </View>
                    <View className="flex-1 justify-center items-center pb-20">
                        <ActivityIndicator size="large" color="#FF6D00" />
                    </View>
                </>
            )}

            {isEmpty && !isInitialLoading && (
                <>
                    <View className="flex-row items-center justify-between px-4 mb-6 z-10">
                        <Pressable onPress={onBack} className="p-2 -ml-2">
                            {({ pressed }) => (
                                <View style={styles.rotateNeg90}>
                                    {pressed ? <ArrowIconActive width={28} height={28} /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                                </View>
                            )}
                        </Pressable>
                        <Text className="text-h3 flex-1 text-center text-text-main font-unbounded-bold">
                            {t('tools.speed_checker.select_team_title')}
                        </Text>
                        <View className="w-10" />
                    </View>

                    <View className="items-center justify-center flex-1 px-6 pb-20">
                        <View className="w-20 h-20 bg-surface-card border border-surface-border rounded-full items-center justify-center mb-6">
                            <Feather name="shield" size={32} color="#717171" />
                        </View>
                        <Text className="text-text-sub text-center mb-8 font-evolventa text-body leading-5">
                            {t('tools.speed_checker.team_empty_no_teams_desc')}
                        </Text>
                        <Button
                            variant="primary"
                            title={t('tools.speed_checker.btn_create_team')}
                            onPress={() => setAddTeamModalVisible(true)}
                            className="w-full mb-3"
                        />
                        <Button variant="outline" title={t('tools.speed_checker.btn_go_back')} onPress={onBack} className="w-full" />
                    </View>
                </>
            )}

            {!isEmpty && !isInitialLoading && (
                <>
                    <View className="flex-row items-center justify-between px-4 mb-6 z-10">
                        <Pressable onPress={onBack} className="p-2 -ml-2">
                            {({ pressed }) => (
                                <View style={styles.rotateNeg90}>
                                    {pressed ? <ArrowIconActive width={28} height={28} /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                                </View>
                            )}
                        </Pressable>
                        <Text className="text-h3 flex-1 text-center text-text-main font-unbounded-bold">
                            {t('tools.speed_checker.select_team_title')}
                        </Text>
                        <IconButton
                            onPress={() => setAddTeamModalVisible(true)}
                            icon={<Feather name="plus" size={24} color="#F5F5F5" />}
                        />
                    </View>

                    <View className="px-4 mb-4 z-10">
                        <SearchInput value={search} onChangeText={setSearch} placeholder={t('tools.speed_checker.search_team')} />
                    </View>

                    <FlatList
                        data={displayTeams}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 200 }}
                        renderItem={({ item }) => {
                            const isSelected = selectedId === item.id;
                            return (
                                <TeamsMod
                                    teamName={item.name}
                                    tags={
                                        <View className="flex-row gap-2 mt-1">
                                            <View className="flex-row items-center px-2 py-1 rounded-md border border-surface-border bg-surface-card">
                                                <Feather name="users" size={10} color="#A3A3A3" style={{ marginRight: 6 }} />
                                                <Text className="text-caption text-text-sub font-evolventa-bold">
                                                    {t('tools.speed_checker.team_players_count', { count: item.players })}
                                                </Text>
                                            </View>
                                        </View>
                                    }
                                    icon={isSelected ? <TeamsIconActive width={31} height={31} fill="#FF6D00" /> : <TeamsIcon width={31} height={31} fill="#F5F5F5" />}
                                    rightIcon={<RadioButton selected={isSelected} onSelect={() => setSelectedId(item.id)} />}
                                    onPress={() => setSelectedId(item.id)}
                                    className={`mb-3 ${isSelected ? 'border-brand-orange/50 bg-brand-orange/5' : ''}`}
                                />
                            );
                        }}
                    />

                    <View className="absolute bottom-28 left-4 right-4 z-50">
                        <Button
                            variant="primary"
                            title={t('tools.speed_checker.btn_continue')}
                            onPress={() => { const team = teams.find(t => t.id === selectedId); if (team) onSelect(team.id, team.name); }}
                            disabled={!selectedId}
                            className="w-full shadow-xl"
                        />
                    </View>
                </>
            )}

            {modalsJSX}
        </View>
    );
}

const styles = StyleSheet.create({ rotateNeg90: { transform: [{ rotate: '-90deg' }] } });