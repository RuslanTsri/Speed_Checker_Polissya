import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppModal } from '../components/AppModal';
import { usePlayersLogic } from '../../hooks/players/usePlayersLogic';
import { useTheme } from '../../context/ThemeContext';

// 🔥 UI Компоненти
import { Mod, TeamsMod, PlayerMod } from '../components/ui/mods'; // Додано PlayerMod
import { SearchInput } from "../components/ui/SearchInput";
import { IconButton } from "../components/ui/Button";
import {
    TeamsIcon, TeamsIconActive,
    ArrowIcon, ArrowIconActive
} from '../../../assets/icons';

export default function PlayersScreen() {
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const {
        filteredTeams, players, selectedTeam, setSelectedTeam, isLoading,
        searchQuery, setSearchQuery, getInitials,
        isAddTeamModalVisible, setAddTeamModalVisible, newTeamName, setNewTeamName,
        isEditTeamModalVisible, setEditTeamModalVisible, editingTeamName, setEditingTeamName, handleUpdateTeam,
        isDeleteTeamModalVisible, setDeleteTeamModalVisible, handleConfirmDeleteTeam,
        isAddPlayerOptionsVisible, setAddPlayerOptionsVisible, isAddManualVisible, setAddManualVisible, newPlayerName, setNewPlayerName,
        isEditPlayerModalVisible, setEditPlayerModalVisible, editingPlayerName, setEditingPlayerName,
        isDeletePlayerModalVisible, setDeletePlayerModalVisible, playerToDelete,
        handleAddManualPlayer, handleEditPlayer, handleUpdatePlayer, handleDeletePlayer, handleConfirmDeletePlayer,
        isImportVisible, setImportVisible, isDropdownVisible, setDropdownVisible,
        handleCreateTeam, handleDeleteTeam, handleEditTeam,
        downloadTemplate, importedPlayers, importStatus, importMessage, handleSelectFile, handleConfirmImport
    } = usePlayersLogic();

    // --- 1. РЕЖИМ ПЕРЕГЛЯДУ ГРАВЦІВ У КОМАНДІ ---
    if (selectedTeam) {
        return (
            <View className="flex-1 pt-4 relative">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 mb-6 relative z-10">
                    <TouchableOpacity onPress={() => setSelectedTeam(null)} className="p-2 -ml-2">
                        <Feather name="chevron-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold flex-1 text-center text-white" numberOfLines={1}>
                        {selectedTeam.name}
                    </Text>
                    <TouchableOpacity onPress={() => setDropdownVisible(true)} className="p-2 -mr-2">
                        <Feather name="more-vertical" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Dropdown Menu Команди */}
                <Modal visible={isDropdownVisible} transparent animationType="fade">
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setDropdownVisible(false)}>
                        <View className="absolute top-16 right-4 rounded-2xl border border-white/10 shadow-xl overflow-hidden min-w-[160px] bg-slate-900/95">
                            <TouchableOpacity onPress={() => handleEditTeam()} className="flex-row items-center px-4 py-4 border-b border-white/5">
                                <Feather name="edit-2" size={16} color="#e2e8f0" style={{ marginRight: 10 }} />
                                <Text className="font-medium text-sm text-slate-200">{t('screens.players.menu_edit')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteTeam()} className="flex-row items-center px-4 py-4">
                                <Feather name="trash-2" size={16} color="#ef4444" style={{ marginRight: 10 }} />
                                <Text className="text-red-500 font-medium text-sm">{t('screens.players.menu_delete')}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Статистика команди */}
                <View className="flex-row justify-between px-6 pb-4 border-b border-white/5 mb-4">
                    <Text className="text-xs font-bold tracking-widest text-slate-400">
                        {t('screens.players.label_players_count', { count: players.length })}
                    </Text>
                    <Text className="text-xs font-bold tracking-widest text-slate-400">
                        {t('screens.players.label_last_session', { date: selectedTeam.lastSessionDate.toUpperCase() })}
                    </Text>
                </View>

                {/* Кнопка "Додати гравця" у стилі Mod */}
                <View className="px-4 mb-6">
                    <Mod
                        title={t('screens.players.btn_add_players')}
                        subtitle={t('screens.players.modal_players_title')}
                        onPress={() => setAddPlayerOptionsVisible(true)}
                        icon={<Feather name="user-plus" size={24} color="#FF6D00" />}
                    />
                </View>

                {/* 🔥 СПИСОК ГРАВЦІВ (Використовуємо PlayerMod) */}
                <FlatList
                    data={players}
                    keyExtractor={(item, index) => item.id ?? index.toString()}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <PlayerMod
                            name={item.name}
                            className="mb-3"
                            onEditPress={() => handleEditPlayer(item)}
                            onDeletePress={() => handleDeletePlayer(item)}
                            onPress={() => {}} // Тут можна додати перехід на профіль гравця
                        />
                    )}
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-10">
                            <Feather name="users" size={48} color="#334155" />
                            <Text className="mt-4 text-slate-500">{t('screens.players.empty_players')}</Text>
                        </View>
                    )}
                />

                {/* --- МОДАЛКИ ДЛЯ ГРАВЦІВ (Без змін) --- */}
                <AppModal type="bottom" visible={isAddPlayerOptionsVisible} onClose={() => setAddPlayerOptionsVisible(false)} title={t('screens.players.modal_players_title')}>
                    <View className="flex-row gap-4 mb-6 mt-2">
                        <TouchableOpacity onPress={() => { setAddPlayerOptionsVisible(false); setImportVisible(true); }} className="flex-1 border border-white/10 p-6 rounded-3xl items-start bg-white/5">
                            <View className="bg-emerald-500/20 p-3 rounded-xl mb-4"><Feather name="file-text" size={24} color="#34d399" /></View>
                            <Text className="font-bold text-lg mb-1 text-white">{t('screens.players.import_from_file')}</Text>
                            <Text className="text-xs text-slate-500">{t('screens.players.import_desc_csv')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setAddPlayerOptionsVisible(false); setAddManualVisible(true); }} className="flex-1 border border-white/10 p-6 rounded-3xl items-start bg-white/5">
                            <View className="bg-blue-500/20 p-3 rounded-xl mb-4"><Feather name="user-plus" size={24} color="#60a5fa" /></View>
                            <Text className="font-bold text-lg mb-1 text-white">{t('screens.players.add_manual')}</Text>
                            <Text className="text-xs text-slate-500">{t('screens.players.add_manual_desc')}</Text>
                        </TouchableOpacity>
                    </View>
                </AppModal>

                <AppModal type="center" visible={isAddManualVisible} onClose={() => setAddManualVisible(false)} title={t('screens.players.modal_new_player')}>
                    <TextInput value={newPlayerName} onChangeText={setNewPlayerName} className="p-4 rounded-xl border border-[#FF6D00]/50 bg-black/20 text-white mb-6 text-base" placeholder={t('screens.players.placeholder_player_name')} placeholderTextColor="#475569" autoFocus />
                    <View className="flex-row gap-3">
                        <TouchableOpacity onPress={() => setAddManualVisible(false)} className="flex-1 p-4 rounded-xl items-center bg-white/10"><Text className="font-bold text-white">{t('screens.players.btn_cancel')}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleAddManualPlayer()} className="flex-1 bg-[#FF6D00] p-4 rounded-xl items-center"><Text className="text-white font-bold">{t('screens.players.btn_add')}</Text></TouchableOpacity>
                    </View>
                </AppModal>

                <AppModal type="center" visible={isEditPlayerModalVisible} onClose={() => setEditPlayerModalVisible(false)} title={t('screens.players.modal_edit_player')}>
                    <TextInput value={editingPlayerName} onChangeText={setEditingPlayerName} className="p-4 rounded-xl border border-blue-500/50 bg-black/20 text-white mb-6 text-base" placeholder={t('screens.players.placeholder_player_name')} placeholderTextColor="#475569" autoFocus />
                    <View className="flex-row gap-3">
                        <TouchableOpacity onPress={() => setEditPlayerModalVisible(false)} className="flex-1 p-4 rounded-xl items-center bg-white/10"><Text className="font-bold text-white">{t('screens.players.btn_cancel')}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleUpdatePlayer()} className="flex-1 bg-blue-600 p-4 rounded-xl items-center"><Text className="text-white font-bold">{t('screens.players.btn_save')}</Text></TouchableOpacity>
                    </View>
                </AppModal>

                <AppModal type="center" visible={isDeletePlayerModalVisible} onClose={() => setDeletePlayerModalVisible(false)} title={t('screens.players.modal_delete_title')}>
                    <View className="items-center mb-6">
                        <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center mb-4"><Feather name="alert-circle" size={32} color="#ef4444" /></View>
                        <Text className="text-lg font-bold text-center mb-2 text-white">{t('screens.players.delete_player_confirm_title')}</Text>
                        <Text className="text-center text-sm px-4 text-slate-400">{t('screens.players.delete_player_confirm_desc', { name: playerToDelete?.name })}</Text>
                    </View>
                    <View className="flex-row gap-3">
                        <TouchableOpacity onPress={() => setDeletePlayerModalVisible(false)} className="flex-1 p-4 rounded-xl items-center bg-white/10"><Text className="font-bold text-white">{t('screens.players.btn_cancel')}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleConfirmDeletePlayer()} className="flex-1 bg-red-600 p-4 rounded-xl items-center"><Text className="text-white font-bold">{t('screens.players.btn_delete')}</Text></TouchableOpacity>
                    </View>
                </AppModal>

                <AppModal type="bottom" visible={isImportVisible} onClose={() => setImportVisible(false)} title={t('screens.players.import_title')}>
                    <TouchableOpacity onPress={() => downloadTemplate()} className="flex-row items-center border border-white/10 p-4 rounded-2xl mb-6 bg-white/5">
                        <View className="bg-emerald-500/20 p-3 rounded-xl mr-4"><Feather name="download" size={24} color="#34d399" /></View>
                        <View className="flex-1">
                            <Text className="font-bold text-base text-white">{t('screens.players.import_template')}</Text>
                            <Text className="text-xs text-slate-500">{t('screens.players.import_template_desc')}</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#475569" />
                    </TouchableOpacity>
                    {importedPlayers.length === 0 ? (
                        <TouchableOpacity onPress={() => handleSelectFile()} className="border-2 border-dashed border-white/10 rounded-3xl py-10 items-center justify-center mb-6 bg-white/5">
                            <Feather name="file-plus" size={32} color="#60a5fa" className="mb-3" />
                            <Text className="text-blue-500 font-bold">{t('screens.players.import_click_select')}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="mb-6">
                            <Text className="font-bold text-lg mb-3 text-white">{t('screens.players.import_found_count', { count: importedPlayers.length })}</Text>
                            <TouchableOpacity onPress={() => handleConfirmImport()} className="p-4 rounded-2xl items-center bg-[#FF6D00] shadow-lg shadow-[#FF6D00]/20">
                                <Text className="text-white font-black uppercase tracking-wide">{t('screens.players.import_confirm')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </AppModal>
            </View>
        );
    }

    // --- 2. ГОЛОВНИЙ СПИСОК КОМАНД ---
    return (
        <View className="flex-1 pt-4 relative">
            <View className="flex-row items-center justify-between px-4 mb-6">
                <Text className="text-3xl font-bold flex-1 text-white">{t('screens.players.title')}</Text>
                <IconButton
                    onPress={() => setAddTeamModalVisible(true)}
                    icon={<Feather name="plus" size={24} color="white" />}
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
                keyExtractor={(item, index) => item.id ?? index.toString()}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <TeamsMod
                        teamName={item.name}
                        tags={
                            <View className="flex-row gap-2">
                                <View className="flex-row items-center px-2 py-1 rounded-md border border-white/10 bg-white/5">
                                    <Feather name="users" size={10} color="#DCDCDC" style={{ marginRight: 6 }} />
                                    <Text className="text-[10px] font-bold text-[#DCDCDC]">{t('screens.players.label_players_count_short', { count: item.playerCount })}</Text>
                                </View>
                                {item.isMyTeam && (
                                    <View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                        <Feather name="check-circle" size={10} color="#34d399" style={{ marginRight: 4 }} />
                                        <Text className="text-emerald-500 text-[10px] font-bold">{t('screens.players.label_your_team')}</Text>
                                    </View>
                                )}
                            </View>
                        }
                        icon={<TeamsIcon width={31} height={31} fill="#F5F5F5" />}
                        activeIcon={<TeamsIconActive width={31} height={31} fill="#F5F5F5" />}
                        rightIcon={<ArrowIcon width={24} height={24} fill="#64748b" />}
                        rightActiveIcon={<ArrowIconActive width={24} height={24} fill="#F5F5F5" />}
                        onPress={() => setSelectedTeam(item)}
                        className="mb-3"
                    />
                )}
            />

            <AppModal type="fullscreen" visible={isAddTeamModalVisible} onClose={() => setAddTeamModalVisible(false)} title={t('screens.players.modal_new_team')}>
                <View className="mt-4">
                    <Text className="text-xs font-bold tracking-widest uppercase mb-2 text-slate-500">{t('screens.players.label_team_name')}</Text>
                    <TextInput value={newTeamName} onChangeText={setNewTeamName} className={`p-5 rounded-2xl text-lg mb-8 border bg-black/20 text-white ${newTeamName ? 'border-[#FF6D00]' : 'border-white/10'}`} placeholder={t('screens.players.placeholder_team_example')} placeholderTextColor="#475569" autoFocus />
                    <TouchableOpacity onPress={() => handleCreateTeam()} disabled={!newTeamName.trim()} className={`p-5 rounded-2xl items-center ${newTeamName.trim() ? 'bg-[#FF6D00]' : 'bg-white/10'}`}>
                        <Text className={`font-bold text-lg ${newTeamName.trim() ? 'text-white' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>{t('screens.players.btn_create_team')}</Text>
                    </TouchableOpacity>
                </View>
            </AppModal>
        </View>
    );
}