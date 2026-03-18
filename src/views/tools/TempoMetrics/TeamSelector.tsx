    import React, { useEffect, useState, useMemo } from 'react';
    import { View, Text, FlatList, ActivityIndicator, Pressable, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
    import { Feather } from '@expo/vector-icons';
    import { useTranslation } from 'react-i18next';
    import { useTeamSelection } from '../../../hooks/tempoMetrics/useTeamSelection';
    import { usePlayersLogic } from '../../../hooks/players/usePlayersLogic';

    import { SearchInput } from '../../components/ui/SearchInput';
    import { TeamsMod } from '../../components/ui/mods';
    import { Button, IconButton } from '../../components/ui/Button';
    import { RadioButton } from '../../components/ui/RadioButton';
    import {
        ArrowIcon, ArrowIconActive,
        TeamsIcon, TeamsIconActive,
        DocIcon, DocIconActive,
        UserIcon, UserIconActive
    } from '../../../../assets/icons';

    import { AppModal } from '../../components/AppModal';
    import { TextField } from '../../components/ui/TextField';

    export default function TeamSelector({ onBack, onSelect }: any) {
        const { t } = useTranslation();
        const { teams, search, setSearch, selectedId, setSelectedId, isLoading: isSelectionLoading } = useTeamSelection();

        const {
            isAddTeamOptionsVisible, setAddTeamOptionsVisible,
            isAddTeamImportVisible, setAddTeamImportVisible, excludedPlayers,
            toggleExcludePlayer, handleSelectTeamFile, handleConfirmImportTeam,
            isAddTeamModalVisible, setAddTeamModalVisible, newTeamName, setNewTeamName,
            handleCreateTeamManual, importedPlayers, isLoading: isLogicLoading
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
            await handleCreateTeamManual();
        };

        const onTeamImport = async (skipPlayers: boolean) => {
            const nameToCreate = newTeamName.trim();
            if (!nameToCreate) return;
            setPendingNewTeam(nameToCreate);
            await handleConfirmImportTeam(skipPlayers);
        };

        const displayTeams = useMemo(() => {
            if (!topTeamId) return teams;
            const topTeam = teams.find(t => t.id === topTeamId);
            const others = teams.filter(t => t.id !== topTeamId);
            return topTeam ? [topTeam, ...others] : teams;
        }, [teams, topTeamId]);

        const modalsJSX = (
            <>
                <AppModal type="bottom" visible={isAddTeamOptionsVisible} onClose={() => setAddTeamOptionsVisible(false)} title={t('tools.speed_checker.btn_create_team', 'Створити команду')}>
                    <View className="flex-row gap-3 mb-2 mt-4">
                        <Pressable
                            onPress={() => handleSelectTeamFile()}
                            className="flex-1 rounded-3xl p-5 border border-white/5 bg-white/5 justify-between"
                            style={({ pressed }) => [ { minHeight: 150 }, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] } ]}
                        >
                            {({ pressed }) => (
                                <>
                                    <View className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 self-start mb-4 items-center justify-center w-12 h-12">
                                        {pressed ? <DocIconActive width={24} height={24} /> : <DocIcon width={24} height={24} />}
                                    </View>
                                    <View>
                                        <Text className="text-[#F5F5F5] text-sm leading-5 mb-1 font-unbounded-bold">{t('screens.players.from_file', 'З файлу')}</Text>
                                        <Text className="text-[#A3A3A3] text-[10px] leading-4 font-evolventa">{t('screens.players.file_format_desc', 'Excel (.xlsx) або CSV')}</Text>
                                    </View>
                                </>
                            )}
                        </Pressable>

                        <Pressable
                            onPress={() => { setAddTeamOptionsVisible(false); setAddTeamModalVisible(true); }}
                            className="flex-1 rounded-3xl p-5 border border-white/5 bg-white/5 justify-between"
                            style={({ pressed }) => [ { minHeight: 150 }, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] } ]}
                        >
                            {({ pressed }) => (
                                <>
                                    <View className="bg-[#FF6D00]/10 p-3 rounded-xl border border-[#FF6D00]/20 self-start mb-4 items-center justify-center w-12 h-12">
                                        {pressed ? <UserIconActive width={24} height={24} /> : <UserIcon width={24} height={24} />}
                                    </View>
                                    <View>
                                        <Text className="text-[#F5F5F5] text-sm leading-5 mb-1 font-unbounded-bold">{t('screens.players.manual', 'Вручну')}</Text>
                                        <Text className="text-[#A3A3A3] text-[10px] leading-4 font-evolventa">{t('screens.players.enter_name_desc', 'Ввести назву')}</Text>
                                    </View>
                                </>
                            )}
                        </Pressable>
                    </View>
                </AppModal>

                <AppModal type="center" visible={isAddTeamModalVisible} onClose={() => setAddTeamModalVisible(false)} title={t('screens.players.modal_new_team', 'Нова команда')}>
                    <View className="mt-4 px-2">
                        <TextField
                            value={newTeamName}
                            onChangeText={setNewTeamName}
                            placeholder={t('screens.players.placeholder_team_example', 'Введіть назву')}
                            autoFocus
                        />
                        <View className="flex-row gap-3 mt-4">
                            <Button variant="outline" title={t('screens.players.btn_cancel', 'Скасувати')} onPress={() => setAddTeamModalVisible(false)} className="flex-1" />
                            <Button
                                variant="primary"
                                title={isLogicLoading ? t('screens.players.status_wait', 'Зачекайте...') : t('tools.speed_checker.btn_create_team', 'Створити')}
                                onPress={onTeamCreate}
                                className="flex-1"
                                disabled={!newTeamName?.trim() || isLogicLoading}
                            />
                        </View>
                    </View>
                </AppModal>

                <AppModal type="bottom" visible={isAddTeamImportVisible} onClose={() => setAddTeamImportVisible(false)} title={t('screens.players.team_from_file', 'Команда з файлу')}>
                    <View className="mt-2 w-full">
                        <TextField
                            label={t('screens.players.team_name_from_file', 'Назва команди (з файлу)')}
                            value={newTeamName}
                            onChangeText={setNewTeamName}
                            placeholder={t('screens.players.placeholder_team_example', 'Введіть назву')}
                        />

                        <Text className="text-[11px] text-[#A3A3A3] mb-3 mt-4 font-evolventa">
                            {t('screens.players.found_players_desc', 'Знайдено ')} {importedPlayers?.length || 0} {t('screens.players.players_click_red', 'гравців. Натисніть на гравця, щоб виділити його ')} <Text className="text-red-500 font-bold">{t('screens.players.red_color', 'червоним')}</Text> {t('screens.players.wont_be_added', '(він не додасться до команди).')}
                        </Text>

                        <ScrollView
                            className="mb-6 max-h-[300px]"
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={{ paddingBottom: 10 }}
                        >
                            {importedPlayers?.map((player: any, index: number) => {
                                const isExcluded = excludedPlayers.has(player.name);
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={0.7}
                                        onPress={() => toggleExcludePlayer(player.name)}
                                        className={`flex-row items-center px-4 py-3 rounded-xl mb-2 border transition-colors ${
                                            isExcluded
                                                ? 'border-red-500/50 bg-red-500/10'
                                                : 'border-white/5 bg-[#0A0A0A]'
                                        }`}
                                    >
                                        <View className="flex-1">
                                            <Text className={`font-evolventa-bold text-base ${isExcluded ? 'text-red-500 line-through opacity-70' : 'text-[#F5F5F5]'}`}>
                                                {player.name}
                                            </Text>
                                        </View>
                                        {isExcluded && <Feather name="x-circle" size={18} color="#ef4444" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <View className="flex-row gap-3">
                            <Button
                                variant="outline"
                                title={t('screens.players.btn_create_empty', 'Створити порожню')}
                                onPress={() => onTeamImport(true)}
                                className="flex-1"
                            />
                            <Button
                                variant="primary"
                                title={isLogicLoading ? t('screens.players.status_wait', 'Зачекайте...') : t('screens.players.btn_create_with_players', 'Створити з гравцями')}
                                onPress={() => onTeamImport(false)}
                                className="flex-[1.5]"
                                disabled={!newTeamName?.trim() || isLogicLoading}
                            />
                        </View>
                    </View>
                </AppModal>
            </>
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
                                onPress={() => setAddTeamOptionsVisible(true)}
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
                                onPress={() => setAddTeamOptionsVisible(true)}
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
                                                        {t('tools.speed_checker.team_players_count', { count: item.players } as any)}
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