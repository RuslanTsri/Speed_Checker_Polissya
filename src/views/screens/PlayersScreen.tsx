import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// 🔥 Наші преміальні компоненти
import { AppModal } from '../components/AppModal';
import { usePlayersLogic } from '../../hooks/players/usePlayersLogic';

// 🔥 UI Компоненти
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
    ImportIcon, ImportIconActive,
    ExportIcon, ExportIconActive,
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
        handleAddManualPlayer, handleEditPlayer, handleUpdatePlayer, handleDeletePlayer, handleConfirmDeletePlayer,
        isImportVisible, setImportVisible, isDropdownVisible, setDropdownVisible,
        handleCreateTeam, handleDeleteTeam, handleEditTeam,
        downloadTemplate, importedPlayers, handleSelectFile, handleConfirmImport
    } = usePlayersLogic();

    // --- 1. РЕЖИМ ПЕРЕГЛЯДУ ГРАВЦІВ У КОМАНДІ ---
    if (selectedTeam) {
        return (
            <View className="flex-1 pt-4 relative">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 mb-6 relative z-10">
                    {/* 🔥 КНОПКА НАЗАД */}
                    <Pressable onPress={() => setSelectedTeam(null)} className="p-2 -ml-2 active:opacity-60">
                        {({ pressed }) => (
                            <View style={styles.rotateLeft}>
                                {pressed ? (
                                    <ArrowIconActive width={24} height={24} fill="#FF6D00" />
                                ) : (
                                    <ArrowIcon width={24} height={24} fill="#F5F5F5" />
                                )}
                            </View>
                        )}
                    </Pressable>

                    <Text
                        className="text-h3 flex-1 text-center text-text-main font-unbounded-bold"
                        numberOfLines={1}
                    >
                        {selectedTeam.name}
                    </Text>

                    <TouchableOpacity onPress={() => setDropdownVisible(true)} className="p-2 -mr-2 active:opacity-60">
                        <Feather name="more-vertical" size={24} color="#A3A3A3" />
                    </TouchableOpacity>
                </View>

                {/* Dropdown Menu Команди */}
                <Modal visible={isDropdownVisible} transparent animationType="fade">
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setDropdownVisible(false)}>
                        <View className="absolute top-16 right-4 rounded-2xl border border-white/10 shadow-2xl overflow-hidden min-w-[180px] bg-[#0A0A0A]/95">

                            {/* Редагувати команду */}
                            <Pressable
                                onPress={() => { setDropdownVisible(false); handleEditTeam(); }}
                                className="flex-row items-center px-4 py-4 border-b border-white/5"
                                style={({ pressed }) => [pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                            >
                                {({ pressed }) => (
                                    <>
                                        <View style={{ marginRight: 12 }}>
                                            {pressed ? (
                                                <PenIconActive width={18} height={18} />
                                            ) : (
                                                <PenIcon width={18} height={18} fill="#A3A3A3" />
                                            )}
                                        </View>
                                        <Text className="font-medium text-sm text-[#F5F5F5] font-evolventa">
                                            {t('screens.players.menu_edit')}
                                        </Text>
                                    </>
                                )}
                            </Pressable>

                            {/* Видалити команду */}
                            <TouchableOpacity onPress={() => { setDropdownVisible(false); handleDeleteTeam(); }} className="flex-row items-center px-4 py-4 active:bg-red-500/10">
                                <Feather name="trash-2" size={18} color="#ef4444" style={{ marginRight: 12 }} />
                                <Text className="text-red-500 font-medium text-sm font-evolventa">
                                    {t('screens.players.menu_delete')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Статистика команди */}
                <View className="flex-row justify-between px-6 pb-4 border-b border-white/5 mb-4">
                    <Text className="text-[10px] font-bold tracking-widest uppercase text-[#A3A3A3] font-evolventa-bold">
                        {t('screens.players.label_players_count', { count: players.length })}
                    </Text>
                </View>

                {/* Швидка дія: Додати гравця */}
                <View className="px-4 mb-6 mt-2">
                    <Mod
                        title={t('screens.players.btn_add_players')}
                        subtitle={t('screens.players.modal_players_title')}
                        onPress={() => setAddPlayerOptionsVisible(true)}
                        icon={<Feather name="user-plus" size={24} color="#FF6D00" />}
                    />
                </View>

                {/* СПИСОК ГРАВЦІВ */}
                <FlatList
                    data={players}
                    keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
                    contentContainerStyle={styles.listPadding}
                    renderItem={({ item }) => (
                        <View className="mb-3">
                            <PlayerMod
                                name={item.name}
                                onEditPress={() => handleEditPlayer(item)}
                                onDeletePress={() => handleDeletePlayer(item)}
                                optimizeForList={true}
                            />
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-10 opacity-50">
                            <Feather name="users" size={48} color="#A3A3A3" />
                            <Text className="mt-4 text-[#A3A3A3] font-evolventa">
                                {t('screens.players.empty_players')}
                            </Text>
                        </View>
                    )}
                />

                {/* ==================================================== */}
                {/* МОДАЛКИ ДЛЯ КОМАНДИ */}
                {/* ==================================================== */}

                <AppModal type="center" visible={isEditTeamModalVisible} onClose={() => setEditTeamModalVisible(false)} title={t('screens.players.modal_edit_team') || "Редагувати команду"}>
                    <TextField
                        value={editingTeamName}
                        onChangeText={setEditingTeamName}
                        placeholder={t('screens.players.placeholder_team_example')}
                        autoFocus
                    />
                    <View className="flex-row gap-3 mt-4">
                        <Button variant="outline" title={t('screens.players.btn_cancel')} onPress={() => setEditTeamModalVisible(false)} className="flex-1" />
                        <Button variant="primary" title={t('screens.players.btn_save')} onPress={() => handleUpdateTeam()} className="flex-1" disabled={!editingTeamName?.trim()} />
                    </View>
                </AppModal>

                <AppModal type="center" visible={isDeleteTeamModalVisible} onClose={() => setDeleteTeamModalVisible(false)} title={t('screens.players.modal_delete_title')}>
                    <View className="items-center mb-6 mt-2">
                        <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center mb-4 border border-red-500/20">
                            <Feather name="alert-triangle" size={32} color="#ef4444" />
                        </View>
                        <Text className="text-lg font-unbounded-bold text-center mb-2 text-white">
                            Видалити команду?
                        </Text>
                        <Text className="text-center text-sm px-4 text-[#A3A3A3] font-evolventa">
                            Ви впевнені, що хочете видалити команду <Text className="text-white font-evolventa-bold">{selectedTeam?.name}</Text>? Всі гравці та їх результати будуть втрачені.
                        </Text>
                    </View>
                    <View className="flex-row gap-3">
                        <Button variant="outline" title={t('screens.players.btn_cancel')} onPress={() => setDeleteTeamModalVisible(false)} className="flex-1" />
                        <TouchableOpacity onPress={() => handleConfirmDeleteTeam()} className="flex-1 bg-red-600 p-4 rounded-xl items-center justify-center active:opacity-60">
                            <Text className="text-white font-bold tracking-wide">{t('screens.players.btn_delete')}</Text>
                        </TouchableOpacity>
                    </View>
                </AppModal>

                {/* ==================================================== */}
                {/* МОДАЛКИ ДЛЯ ГРАВЦІВ */}
                {/* ==================================================== */}

                {/* Вибір додавання гравця */}
                <AppModal type="bottom" visible={isAddPlayerOptionsVisible} onClose={() => setAddPlayerOptionsVisible(false)} title={t('screens.players.modal_players_title')}>
                    <View className="flex-row gap-3 mb-2 mt-4">
                        <Pressable
                            onPress={() => { setAddPlayerOptionsVisible(false); setImportVisible(true); }}
                            className="flex-1 rounded-3xl p-5 border border-white/5 bg-white/5 justify-between"
                            style={({ pressed }) => [
                                { minHeight: 150 },
                                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                            ]}
                        >
                            {({ pressed }) => (
                                <>
                                    <View className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 self-start mb-4 items-center justify-center w-12 h-12">
                                        {pressed ? <DocIconActive width={24} height={24} /> : <DocIcon width={24} height={24} />}
                                    </View>
                                    <View>
                                        <Text className="text-[#F5F5F5] text-sm leading-5 mb-1 font-unbounded-bold">{t('screens.players.import_from_file')}</Text>
                                        <Text className="text-[#A3A3A3] text-[10px] leading-4 font-evolventa">{t('screens.players.import_desc_csv')}</Text>
                                    </View>
                                </>
                            )}
                        </Pressable>

                        <Pressable
                            onPress={() => { setAddPlayerOptionsVisible(false); setAddManualVisible(true); }}
                            className="flex-1 rounded-3xl p-5 border border-white/5 bg-white/5 justify-between"
                            style={({ pressed }) => [
                                { minHeight: 150 },
                                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                            ]}
                        >
                            {({ pressed }) => (
                                <>
                                    <View className="bg-[#FF6D00]/10 p-3 rounded-xl border border-[#FF6D00]/20 self-start mb-4 items-center justify-center w-12 h-12">
                                        {pressed ? <UserIconActive width={24} height={24} /> : <UserIcon width={24} height={24} />}
                                    </View>
                                    <View>
                                        <Text className="text-[#F5F5F5] text-sm leading-5 mb-1 font-unbounded-bold">{t('screens.players.add_manual')}</Text>
                                        <Text className="text-[#A3A3A3] text-[10px] leading-4 font-evolventa">{t('screens.players.add_manual_desc')}</Text>
                                    </View>
                                </>
                            )}
                        </Pressable>
                    </View>
                </AppModal>

                {/* Ручне додавання гравця */}
                <AppModal type="center" visible={isAddManualVisible} onClose={() => setAddManualVisible(false)} title={t('screens.players.modal_new_player')}>
                    <TextField
                        value={newPlayerName}
                        onChangeText={setNewPlayerName}
                        placeholder={t('screens.players.placeholder_player_name')}
                        autoFocus
                    />
                    <View className="flex-row gap-3 mt-4">
                        <Button variant="outline" title={t('screens.players.btn_cancel')} onPress={() => setAddManualVisible(false)} className="flex-1" />
                        <Button variant="primary" title={t('screens.players.btn_add')} onPress={() => handleAddManualPlayer()} className="flex-1" disabled={!newPlayerName?.trim()} />
                    </View>
                </AppModal>

                {/* Редагування гравця */}
                <AppModal type="center" visible={isEditPlayerModalVisible} onClose={() => setEditPlayerModalVisible(false)} title={t('screens.players.modal_edit_player')}>
                    <TextField
                        value={editingPlayerName}
                        onChangeText={setEditingPlayerName}
                        placeholder={t('screens.players.placeholder_player_name')}
                        autoFocus
                    />
                    <View className="flex-row gap-3 mt-4">
                        <Button variant="outline" title={t('screens.players.btn_cancel')} onPress={() => setEditPlayerModalVisible(false)} className="flex-1" />
                        <Button variant="primary" title={t('screens.players.btn_save')} onPress={() => handleUpdatePlayer()} className="flex-1" disabled={!editingPlayerName?.trim()} />
                    </View>
                </AppModal>

                {/* Видалення гравця */}
                <AppModal type="center" visible={isDeletePlayerModalVisible} onClose={() => setDeletePlayerModalVisible(false)} title={t('screens.players.modal_delete_title')}>
                    <View className="items-center mb-6 mt-2">
                        <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center mb-4 border border-red-500/20">
                            <Feather name="alert-triangle" size={32} color="#ef4444" />
                        </View>
                        <Text className="text-lg font-unbounded-bold text-center mb-2 text-white">{t('screens.players.delete_player_confirm_title')}</Text>
                        <Text className="text-center text-sm px-4 text-[#A3A3A3] font-evolventa">{t('screens.players.delete_player_confirm_desc', { name: playerToDelete?.name })}</Text>
                    </View>
                    <View className="flex-row gap-3">
                        <Button variant="outline" title={t('screens.players.btn_cancel')} onPress={() => setDeletePlayerModalVisible(false)} className="flex-1" />
                        <TouchableOpacity onPress={() => handleConfirmDeletePlayer()} className="flex-1 bg-red-600 p-4 rounded-xl items-center justify-center active:opacity-60">
                            <Text className="text-white font-bold tracking-wide">{t('screens.players.btn_delete')}</Text>
                        </TouchableOpacity>
                    </View>
                </AppModal>

                {/* Імпорт з файлу (CSV) */}
                <AppModal type="bottom" visible={isImportVisible} onClose={() => setImportVisible(false)} title={importedPlayers.length > 0 ? "Перевірка файлу" : t('screens.players.import_title')}>
                    {importedPlayers.length === 0 ? (
                        <>
                            {/* Завантаження Шаблону */}
                            <Pressable
                                onPress={() => downloadTemplate()}
                                className="flex-row items-center border border-white/10 p-4 rounded-2xl mb-6 bg-white/5"
                                style={({ pressed }) => [pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
                            >
                                {({ pressed }) => (
                                    <>
                                        <View className="bg-emerald-500/10 p-3 rounded-xl mr-4 border border-emerald-500/20">
                                            {pressed ? <ExportIconActive width={24} height={24} /> : <ExportIcon width={24} height={24} fill="#34d399" />}
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-base text-white font-unbounded-bold">{t('screens.players.import_template')}</Text>
                                            <Text className="text-xs text-[#A3A3A3] font-evolventa">{t('screens.players.import_template_desc')}</Text>
                                        </View>
                                        <Feather name="chevron-right" size={20} color="#A3A3A3" />
                                    </>
                                )}
                            </Pressable>

                            {/* Вибір файлу */}
                            <Pressable
                                onPress={() => handleSelectFile()}
                                className="border-2 border-dashed border-white/10 rounded-3xl py-10 items-center justify-center mb-4 bg-white/5"
                                style={({ pressed }) => [pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
                            >
                                {({ pressed }) => (
                                    <>
                                        <View className="mb-3">
                                            {pressed ? <ImportIconActive width={36} height={36} /> : <ImportIcon width={36} height={36} fill="#FF6D00" />}
                                        </View>
                                        <Text className="text-[#FF6D00] font-evolventa-bold">
                                            {t('screens.players.import_click_select')}
                                        </Text>
                                    </>
                                )}
                            </Pressable>
                        </>
                    ) : (
                        <View className="w-full">
                            {/* Зелений бейдж успіху */}
                            <View className="flex-row items-center border border-emerald-500/30 bg-[#0A0A0A]/50 p-4 rounded-2xl mb-6 shadow-sm">
                                <View className="mr-4">
                                    <DocIconActive width={28} height={28} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base text-[#F5F5F5] mb-0.5 font-unbounded-bold">
                                        Файл перевірений
                                    </Text>
                                    <Text className="text-xs text-emerald-500 font-evolventa-bold">
                                        Знайдено {importedPlayers.length} гравців
                                    </Text>
                                </View>
                            </View>

                            {/* Заголовок списку */}
                            <Text className="text-[11px] text-[#F5F5F5] mb-3 font-evolventa-bold">
                                Список гравців
                            </Text>

                            <ScrollView
                                className="mb-6 max-h-[250px]"
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 10 }}
                            >
                                {importedPlayers.map((player, index) => (
                                    <View key={index} className="mb-2">
                                        <PlayerMod name={player.name} />
                                    </View>
                                ))}
                            </ScrollView>

                            {/* Кнопка імпорту */}
                            <Button
                                variant="primary"
                                title={t('screens.players.import_confirm') || 'Імпортувати'}
                                onPress={() => handleConfirmImport()}
                            />
                        </View>
                    )}
                </AppModal>
            </View>
        );
    }

    // --- 2. ГОЛОВНИЙ СПИСОК КОМАНД ---
    return (
        <View className="flex-1 pt-4 relative">
            <View className="flex-row items-center justify-between px-4 mb-6 relative z-10">
                <Text className="text-h2 flex-1 text-text-main font-unbounded-bold">
                    {t('screens.players.title')}
                </Text>
                <IconButton
                    onPress={() => setAddTeamModalVisible(true)}
                    icon={<Feather name="plus" size={24} color="#F5F5F5" />}
                />
            </View>

            <View className="px-4 mb-6 z-10">
                <SearchInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('screens.players.search_placeholder')}
                />
            </View>

            <FlatList
                data={filteredTeams}
                keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
                contentContainerStyle={styles.listPadding}
                renderItem={({ item }) => (
                    <TeamsMod
                        teamName={item.name}
                        tags={
                            <View className="flex-row gap-2 mt-1">
                                <View className="flex-row items-center px-2 py-1 rounded-md border border-white/10 bg-white/5">
                                    <Feather name="users" size={10} color="#DCDCDC" style={{ marginRight: 6 }} />
                                    <Text className="text-[10px] text-[#DCDCDC] font-evolventa-bold">
                                        {t('screens.players.label_players_count_short', { count: item.playerCount || 0 })}
                                    </Text>
                                </View>
                                {item.isMyTeam && (
                                    <View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                        <Feather name="check-circle" size={10} color="#34d399" style={{ marginRight: 4 }} />
                                        <Text className="text-emerald-500 text-[10px] font-evolventa-bold">
                                            {t('screens.players.label_your_team')}
                                        </Text>
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

            {/* Модалка створення команди */}
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
                            title={t('screens.players.btn_create_team')}
                            onPress={() => handleCreateTeam()}
                            disabled={!newTeamName?.trim()}
                        />
                    </View>
                </View>
            </AppModal>
        </View>
    );
}

const styles = StyleSheet.create({
    rotateLeft: { transform: [{ rotate: '-90deg' }] },
    listPadding: { paddingHorizontal: 16, paddingBottom: 120 }
});