import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// 🔥 Наші преміальні компоненти
import { AppModal } from '../components/AppModal';
import { usePlayersLogic } from '../../hooks/players/usePlayersLogic';
import { Mod, TeamsMod, PlayerMod } from '../components/ui/mods';
import { SearchInput } from "../components/ui/SearchInput";
import { IconButton, Button } from "../components/ui/Button";
import { TextField } from '../components/ui/TextField';

// Іконки
import {
    TeamsIcon, TeamsIconActive,
    ArrowIcon, ArrowIconActive,
    DocIcon, DocIconActive,
    UserIcon, UserIconActive,
    PenIcon, PenIconActive
} from '../../../assets/icons';

export default function PlayersScreen() {
    const { t } = useTranslation();
    const {
        filteredTeams, players, selectedTeam, setSelectedTeam, searchQuery, setSearchQuery,
        isAddTeamModalVisible, setAddTeamModalVisible, newTeamName, setNewTeamName,
        isEditTeamModalVisible, setEditTeamModalVisible, editingTeamName, setEditingTeamName, handleUpdateTeam,
        isDeleteTeamModalVisible, setDeleteTeamModalVisible, handleConfirmDeleteTeam,
        isAddPlayerOptionsVisible, setAddPlayerOptionsVisible, isAddManualVisible, setAddManualVisible, newPlayerName, setNewPlayerName,
        isEditPlayerModalVisible, setEditPlayerModalVisible, editingPlayerName, setEditingPlayerName,
        isDeletePlayerModalVisible, setDeletePlayerModalVisible, playerToDelete,
        handleAddManualPlayer, handleUpdatePlayer, handleDeletePlayer, handleConfirmDeletePlayer,
        isImportVisible, setImportVisible, isDropdownVisible, setDropdownVisible,
        handleCreateTeam, handleConfirmImport, handleSelectFile, downloadTemplate, importedPlayers
    } = usePlayersLogic();

    // --- 1. РЕЖИМ ПЕРЕГЛЯДУ ГРАВЦІВ У КОМАНДІ ---
    if (selectedTeam) {
        return (
            <View className="flex-1 pt-4 bg-surface-bg">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 mb-6">
                    <Pressable onPress={() => setSelectedTeam(null)} className="p-2 -ml-2 active:opacity-60">
                        <View style={styles.rotateNeg90}>
                            <ArrowIcon width={24} height={24} fill="#F5F5F5" />
                        </View>
                    </Pressable>
                    <Text
                        className="text-h3 font-bold flex-1 text-center text-text-main font-unbounded"
                        numberOfLines={1}
                    >
                        {selectedTeam.name}
                    </Text>
                    <TouchableOpacity onPress={() => setDropdownVisible(true)} className="p-2">
                        <Feather name="more-vertical" size={24} color="#A3A3A3" />
                    </TouchableOpacity>
                </View>

                {/* Швидка дія: Додати гравця */}
                <View className="px-4 mb-6">
                    <Mod
                        title={t('screens.players.btn_add_players')}
                        subtitle={t('screens.players.modal_players_title')}
                        onPress={() => setAddPlayerOptionsVisible(true)}
                        icon={<Feather name="user-plus" size={24} color="#FF6D00" />}
                    />
                </View>

                {/* Список гравців */}
                <FlatList
                    data={players}
                    // ✅ Виправлено TS2769: Гарантуємо string
                    keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
                    contentContainerStyle={styles.listPadding}
                    renderItem={({ item }) => (
                        <View className="mb-3">
                            <PlayerMod
                                name={item.name}
                                onEditPress={() => {}}
                                onDeletePress={() => handleDeletePlayer(item)}
                                optimizeForList={true}
                            />
                        </View>
                    )}
                />

                {/* Модалка вибору способу додавання */}
                <AppModal visible={isAddPlayerOptionsVisible} onClose={() => setAddPlayerOptionsVisible(false)} title={t('screens.players.modal_players_title')}>
                    <View className="flex-row gap-3 mt-4">
                        <Pressable
                            onPress={() => { setAddPlayerOptionsVisible(false); setImportVisible(true); }}
                            className="flex-1 rounded-3xl p-5 bg-surface-card border border-surface-border items-center"
                        >
                            <DocIcon width={24} height={24} />
                            <Text className="text-text-main text-small font-bold mt-3 font-unbounded text-center">
                                {t('screens.players.import_from_file')}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => { setAddPlayerOptionsVisible(false); setAddManualVisible(true); }}
                            className="flex-1 rounded-3xl p-5 bg-surface-card border border-surface-border items-center"
                        >
                            <UserIcon width={24} height={24} />
                            <Text className="text-text-main text-small font-bold mt-3 font-unbounded text-center">
                                {t('screens.players.add_manual')}
                            </Text>
                        </Pressable>
                    </View>
                </AppModal>
            </View>
        );
    }

    // --- 2. ГОЛОВНИЙ СПИСОК КОМАНД ---
    return (
        <View className="flex-1 pt-4 bg-surface-bg">
            <View className="flex-row items-center justify-between px-4 mb-6">
                <Text className="text-h2 font-bold flex-1 text-text-main font-unbounded">
                    {t('screens.players.title')}
                </Text>
                <IconButton
                    onPress={() => setAddTeamModalVisible(true)}
                    icon={<Feather name="plus" size={24} color="#F5F5F5" />}
                />
            </View>

            <View className="px-4 mb-6">
                <SearchInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('screens.players.search_placeholder')}
                />
            </View>

            <FlatList
                data={filteredTeams}
                // ✅ Виправлено TS2769: Гарантуємо string
                keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
                contentContainerStyle={styles.listPadding}
                renderItem={({ item }) => (
                    <TeamsMod
                        teamName={item.name}
                        onPress={() => setSelectedTeam(item)}
                        icon={<TeamsIcon width={30} height={30} fill="#F5F5F5" />}
                        className="mb-3"
                    />
                )}
            />

            {/* Модалка створення команди */}
            <AppModal type="fullscreen" visible={isAddTeamModalVisible} onClose={() => setAddTeamModalVisible(false)} title={t('screens.players.modal_new_team')}>
                <View className="mt-8 px-2">
                    <TextField
                        label={t('screens.players.label_team_name')}
                        value={newTeamName}
                        onChangeText={setNewTeamName}
                        placeholder={t('screens.players.placeholder_team_example')}
                    />
                    <View className="mt-8">
                        <Button
                            variant="primary"
                            title={t('screens.players.btn_create_team')}
                            onPress={() => handleCreateTeam()}
                            disabled={!newTeamName.trim()}
                        />
                    </View>
                </View>
            </AppModal>
        </View>
    );
}

const styles = StyleSheet.create({
    rotateNeg90: { transform: [{ rotate: '-90deg' }] },
    listPadding: { paddingHorizontal: 16, paddingBottom: 120 }
});