import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppModal } from '../components/AppModal';
import { usePlayersLogic } from '../../hooks/players/usePlayersLogic';

export default function PlayersScreen() {

    const {
        // Data
        filteredTeams, players, selectedTeam, setSelectedTeam, isLoading,
        // UI
        searchQuery, setSearchQuery, getInitials,
        // Modals Team
        isAddTeamModalVisible, setAddTeamModalVisible, newTeamName, setNewTeamName,
        isEditTeamModalVisible, setEditTeamModalVisible, editingTeamName, setEditingTeamName, handleUpdateTeam,
        isDeleteTeamModalVisible, setDeleteTeamModalVisible, handleConfirmDeleteTeam,

        // Modals Player
        isAddPlayerOptionsVisible, setAddPlayerOptionsVisible, isAddManualVisible, setAddManualVisible, newPlayerName, setNewPlayerName,

        // Player Actions
        isEditPlayerModalVisible, setEditPlayerModalVisible, editingPlayerName, setEditingPlayerName,
        isDeletePlayerModalVisible, setDeletePlayerModalVisible, playerToDelete,

        handleAddManualPlayer, handleEditPlayer, handleUpdatePlayer,
        handleDeletePlayer, handleConfirmDeletePlayer,

        // Common
        isImportVisible, setImportVisible, isDropdownVisible, setDropdownVisible,
        handleCreateTeam, handleDeleteTeam, handleEditTeam,

        // Import
        downloadTemplate, importedPlayers, importStatus, importMessage, handleSelectFile, handleConfirmImport

    } = usePlayersLogic();

    // ==========================================
    // РЕНДЕР: 2. ДЕТАЛІ КОМАНДИ (СПИСОК ГРАВЦІВ)
    // ==========================================
    if (selectedTeam) {
        return (
            <View className="flex-1 bg-slate-950 pt-4 relative">
                {/* Header Команди */}
                <View className="flex-row items-center justify-between px-4 mb-6 relative z-10">
                    <TouchableOpacity onPress={() => setSelectedTeam(null)} className="p-2 -ml-2">
                        <Feather name="chevron-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold flex-1 text-center" numberOfLines={1}>
                        {selectedTeam.name}
                    </Text>
                    <TouchableOpacity onPress={() => setDropdownVisible(true)} className="p-2 -mr-2">
                        <Feather name="more-vertical" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {/* Dropdown Menu */}
                <Modal visible={isDropdownVisible} transparent animationType="fade">
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setDropdownVisible(false)}>
                        <View className="absolute top-16 right-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden min-w-[160px]">
                            <TouchableOpacity onPress={() => handleEditTeam()} className="flex-row items-center px-4 py-3 border-b border-slate-700/50">
                                <Feather name="edit-2" size={16} color="#e2e8f0" style={{ marginRight: 10 }} />
                                <Text className="text-slate-200 font-medium text-sm">Змінити</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteTeam()} className="flex-row items-center px-4 py-3">
                                <Feather name="trash-2" size={16} color="#ef4444" style={{ marginRight: 10 }} />
                                <Text className="text-red-400 font-medium text-sm">Видалити</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Info Bar */}
                <View className="flex-row justify-between px-6 pb-4 border-b border-slate-800 mb-4">
                    <Text className="text-slate-400 text-xs font-bold tracking-widest">ГРАВЦІВ: {players.length}</Text>
                    <Text className="text-slate-400 text-xs font-bold tracking-widest">ОСТАННЯ СЕСІЯ: {selectedTeam.lastSessionDate.toUpperCase()}</Text>
                </View>

                {/* Add Button */}
                <View className="flex-row px-4 mb-6 space-x-3">
                    <TouchableOpacity onPress={() => setAddPlayerOptionsVisible(true)} className="flex-1 bg-slate-900 border border-slate-700 py-3 rounded-xl flex-row justify-center items-center mr-2">
                        <Feather name="user-plus" size={16} color="#facc15" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-sm">Додати гравців</Text>
                    </TouchableOpacity>
                </View>

                {/* СПИСОК ГРАВЦІВ */}
                {isLoading && players.length === 0 ? (
                    <ActivityIndicator size="large" color="#facc15" className="mt-10" />
                ) : (
                    <FlatList
                        data={players}
                        keyExtractor={(item) => item.id || Math.random().toString()}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                        renderItem={({ item }) => (
                            <View className="bg-slate-900 mb-3 rounded-2xl p-4 flex-row items-center border border-slate-800">
                                <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center mr-4 border border-slate-700">
                                    <Text className="text-slate-400 font-bold">{getInitials(item.name)}</Text>
                                </View>
                                <Text className="text-white text-base font-medium flex-1">{item.name}</Text>

                                <View className="flex-row items-center space-x-1">
                                    <TouchableOpacity onPress={() => handleEditPlayer(item)} className="p-2 bg-slate-800/50 rounded-xl mr-2">
                                        <Feather name="edit-2" size={16} color="#60a5fa" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeletePlayer(item)} className="p-2 bg-red-500/10 rounded-xl">
                                        <Feather name="x" size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={() => (
                            <View className="items-center justify-center py-10">
                                <Feather name="users" size={48} color="#334155" />
                                <Text className="text-slate-500 mt-4">У цій команді ще немає гравців</Text>
                            </View>
                        )}
                    />
                )}

                {/* --- МОДАЛКИ (ДЛЯ РЕЖИМУ ПЕРЕГЛЯДУ КОМАНДИ) --- */}

                {/* 1. Вибір способу */}
                <AppModal type="bottom" visible={isAddPlayerOptionsVisible} onClose={() => setAddPlayerOptionsVisible(false)} title="Гравці">
                    <Text className="text-slate-400 text-xs mb-6 -mt-4">Команда: {selectedTeam.name}</Text>
                    <View className="flex-row space-x-4 mb-6">
                        <TouchableOpacity onPress={() => { setAddPlayerOptionsVisible(false); setImportVisible(true); }} className="flex-1 bg-slate-950 border border-slate-800 p-6 rounded-3xl mr-2 items-start">
                            <View className="bg-emerald-500/20 p-3 rounded-xl mb-4"><Feather name="file-text" size={24} color="#34d399" /></View>
                            <Text className="text-white font-bold text-lg mb-1">Імпорт з файлу</Text>
                            <Text className="text-slate-500 text-xs">CSV або Excel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setAddPlayerOptionsVisible(false); setAddManualVisible(true); }} className="flex-1 bg-slate-950 border border-slate-800 p-6 rounded-3xl ml-2 items-start">
                            <View className="bg-blue-500/20 p-3 rounded-xl mb-4"><Feather name="user-plus" size={24} color="#60a5fa" /></View>
                            <Text className="text-white font-bold text-lg mb-1">Додати вручну</Text>
                            <Text className="text-slate-500 text-xs">Для одного або кількох.</Text>
                        </TouchableOpacity>
                    </View>
                </AppModal>

                {/* 2. Ручне створення */}
                <AppModal type="center" visible={isAddManualVisible} onClose={() => setAddManualVisible(false)} title="Новий гравець">
                    <TextInput value={newPlayerName} onChangeText={setNewPlayerName} className="bg-slate-950 text-white p-4 rounded-xl border border-yellow-600/50 mb-6 text-base" placeholder="Ім'я та Прізвище" placeholderTextColor="#64748b" autoFocus />
                    <View className="flex-row space-x-3 mt-2">
                        <TouchableOpacity onPress={() => { setAddManualVisible(false); setNewPlayerName(''); }} className="flex-1 bg-slate-800 p-4 rounded-xl items-center mr-2"><Text className="text-slate-300 font-bold text-base">Скасувати</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleAddManualPlayer()} className="flex-1 bg-yellow-600 p-4 rounded-xl items-center ml-2"><Text className="text-slate-900 font-bold text-base">Додати</Text></TouchableOpacity>
                    </View>
                </AppModal>

                {/* 3. Редагування гравця */}
                <AppModal type="center" visible={isEditPlayerModalVisible} onClose={() => setEditPlayerModalVisible(false)} title="Редагувати гравця">
                    <Text className="text-slate-500 text-xs mb-2">Ім'я та Прізвище</Text>
                    <TextInput value={editingPlayerName} onChangeText={setEditingPlayerName} className="bg-slate-950 text-white p-4 rounded-xl border border-blue-500/50 mb-6 text-base" placeholder="Ім'я гравця" placeholderTextColor="#64748b" autoFocus />
                    <View className="flex-row space-x-3 mt-2">
                        <TouchableOpacity onPress={() => setEditPlayerModalVisible(false)} className="flex-1 bg-slate-800 p-4 rounded-xl items-center mr-2"><Text className="text-slate-300 font-bold text-base">Скасувати</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleUpdatePlayer()} disabled={isLoading} className="flex-1 bg-blue-600 p-4 rounded-xl items-center ml-2">{isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Зберегти</Text>}</TouchableOpacity>
                    </View>
                </AppModal>

                {/* 4. Видалення гравця */}
                <AppModal type="center" visible={isDeletePlayerModalVisible} onClose={() => setDeletePlayerModalVisible(false)} title="Видалення">
                    <View className="items-center mb-6">
                        <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center mb-4"><Feather name="alert-circle" size={32} color="#ef4444" /></View>
                        <Text className="text-white text-lg font-bold text-center mb-2">Видалити гравця?</Text>
                        <Text className="text-slate-400 text-center text-sm px-4">
                            Ви впевнені, що хочете видалити <Text className="text-white font-bold">{playerToDelete?.name}</Text>?
                            {'\n'}Цю дію неможливо відмінити.
                        </Text>
                    </View>
                    <View className="flex-row space-x-3 mt-2">
                        <TouchableOpacity onPress={() => setDeletePlayerModalVisible(false)} className="flex-1 bg-slate-800 p-4 rounded-xl items-center mr-2"><Text className="text-slate-300 font-bold text-base">Скасувати</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleConfirmDeletePlayer()} disabled={isLoading} className="flex-1 bg-red-600 p-4 rounded-xl items-center ml-2">{isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Видалити</Text>}</TouchableOpacity>
                    </View>
                </AppModal>

                {/* 5. Імпорт */}
                <AppModal type="bottom" visible={isImportVisible} onClose={() => setImportVisible(false)} title="Імпорт гравців">
                    <TouchableOpacity onPress={() => downloadTemplate()} className="flex-row items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 active:bg-slate-800">
                        <View className="bg-emerald-500/20 p-3 rounded-xl mr-4"><Feather name="download" size={24} color="#34d399" /></View>
                        <View className="flex-1"><Text className="text-white font-bold text-base">Завантажити шаблон</Text><Text className="text-slate-500 text-xs">Спочатку завантажте цей файл</Text></View>
                        <Feather name="chevron-right" size={20} color="#475569" />
                    </TouchableOpacity>
                    {importedPlayers.length === 0 ? (
                        <View>
                            <Text className="text-white font-bold text-lg mb-3 ml-1">Оберіть файл</Text>
                            <TouchableOpacity onPress={() => handleSelectFile()} className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-3xl py-10 items-center justify-center mb-4 active:bg-slate-800">
                                <Feather name="file-plus" size={32} color="#60a5fa" className="mb-3" />
                                <Text className="text-blue-400 font-bold text-base">Натисніть для вибору .csv</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="max-h-[350px]">
                            <View className="flex-row justify-between items-end mb-3 px-1">
                                <Text className="text-white font-bold text-lg">Знайдено: {importedPlayers.length}</Text>
                                <TouchableOpacity onPress={() => handleSelectFile()}><Text className="text-blue-400 text-xs font-bold uppercase">Змінити файл</Text></TouchableOpacity>
                            </View>
                            <View className="bg-slate-900 rounded-2xl border border-slate-800 mb-4 overflow-hidden">
                                <FlatList data={importedPlayers} keyExtractor={(_, index) => index.toString()} style={{ maxHeight: 200 }} contentContainerStyle={{ padding: 4 }} renderItem={({ item, index }) => (
                                    <View className="flex-row items-center py-3 px-3 border-b border-slate-800/50 last:border-0">
                                        <Text className="text-slate-500 w-8 text-xs font-mono">{index + 1}.</Text>
                                        <Text className="text-white flex-1 font-bold text-sm" numberOfLines={1}>{item.name}</Text>
                                    </View>
                                )} />
                            </View>
                        </View>
                    )}
                    {importStatus !== 'idle' && (
                        <View className={`p-4 rounded-xl mb-4 flex-row items-center ${importStatus === 'success' ? 'bg-emerald-500/10 border border-emerald-500/50' : 'bg-red-500/10 border border-red-500/50'}`}>
                            <Feather name={importStatus === 'success' ? "check-circle" : "alert-circle"} size={20} color={importStatus === 'success' ? "#34d399" : "#ef4444"} style={{ marginRight: 12 }} />
                            <Text className={importStatus === 'success' ? "text-emerald-400 font-bold flex-1" : "text-red-400 font-bold flex-1"}>{importMessage}</Text>
                        </View>
                    )}
                    {importedPlayers.length > 0 && (
                        <TouchableOpacity onPress={() => handleConfirmImport()} disabled={isLoading || importStatus === 'success'} className={`p-4 rounded-2xl items-center shadow-lg shadow-yellow-400/20 mt-2 ${isLoading || importStatus === 'success' ? 'bg-slate-800' : 'bg-yellow-400'}`}>
                            {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text className={`font-black text-lg uppercase tracking-wide ${importStatus === 'success' ? 'text-slate-500' : 'text-slate-900'}`}>{importStatus === 'success' ? 'Готово!' : 'Імпортувати'}</Text>}
                        </TouchableOpacity>
                    )}
                </AppModal>

                {/* 6. Редагування КОМАНДИ */}
                <AppModal type="center" visible={isEditTeamModalVisible} onClose={() => setEditTeamModalVisible(false)} title="Змінити назву">
                    <Text className="text-slate-500 text-xs mb-2">Нова назва команди</Text>
                    <TextInput value={editingTeamName} onChangeText={setEditingTeamName} className="bg-slate-950 text-white p-4 rounded-xl border border-blue-500/50 mb-6 text-base" placeholder="Назва команди" placeholderTextColor="#64748b" autoFocus />
                    <View className="flex-row space-x-3 mt-2">
                        <TouchableOpacity onPress={() => setEditTeamModalVisible(false)} className="flex-1 bg-slate-800 p-4 rounded-xl items-center mr-2"><Text className="text-slate-300 font-bold text-base">Скасувати</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleUpdateTeam()} disabled={isLoading} className="flex-1 bg-blue-600 p-4 rounded-xl items-center ml-2">{isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Зберегти</Text>}</TouchableOpacity>
                    </View>
                </AppModal>

                {/* 7. Видалення КОМАНДИ */}
                <AppModal type="center" visible={isDeleteTeamModalVisible} onClose={() => setDeleteTeamModalVisible(false)} title="Видалення">
                    <View className="items-center mb-6">
                        <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center mb-4"><Feather name="alert-triangle" size={32} color="#ef4444" /></View>
                        <Text className="text-white text-lg font-bold text-center mb-2">Видалити команду?</Text>
                        <Text className="text-slate-400 text-center text-sm px-4">Ви збираєтесь видалити <Text className="text-white font-bold">{selectedTeam.name}</Text>.\nВсі дані гравців та статистика будуть втрачені безповоротно.</Text>
                    </View>
                    <View className="flex-row space-x-3 mt-2">
                        <TouchableOpacity onPress={() => setDeleteTeamModalVisible(false)} className="flex-1 bg-slate-800 p-4 rounded-xl items-center mr-2"><Text className="text-slate-300 font-bold text-base">Скасувати</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleConfirmDeleteTeam()} disabled={isLoading} className="flex-1 bg-red-600 p-4 rounded-xl items-center ml-2">{isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Видалити</Text>}</TouchableOpacity>
                    </View>
                </AppModal>

            </View>
        );
    }

    // ==========================================
    // РЕНДЕР: 1. СПИСОК КОМАНД (ГОЛОВНИЙ)
    // ==========================================
    return (
        <View className="flex-1 bg-slate-950 pt-4 relative">
            <View className="flex-row items-center justify-between px-4 mb-6">
                <Text className="text-white text-3xl font-bold flex-1">Команди</Text>
                <TouchableOpacity onPress={() => setAddTeamModalVisible(true)} className="w-10 h-10 bg-slate-900 rounded-full border border-slate-800 items-center justify-center"><Feather name="plus" size={20} color="white" /></TouchableOpacity>
            </View>
            <View className="px-4 mb-6"><View className="bg-slate-900 flex-row items-center px-4 rounded-2xl border border-slate-800 h-14"><Feather name="search" size={20} color="#64748b" className="mr-3" /><TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Пошук команди" placeholderTextColor="#64748b" className="flex-1 text-white text-base h-full" /></View></View>
            {isLoading && filteredTeams.length === 0 ? <ActivityIndicator size="large" color="#facc15" className="mt-10" /> : (
                <FlatList data={filteredTeams} keyExtractor={(item) => item.id || Math.random().toString()} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }} renderItem={({ item }) => (
                    <TouchableOpacity activeOpacity={0.8} onPress={() => setSelectedTeam(item)} className="bg-slate-900 p-5 rounded-3xl mb-4 border border-slate-800 flex-row justify-between items-center">
                        <View className="flex-1">
                            <Text className="text-white text-lg font-bold mb-2">{item.name}</Text>
                            <View className="flex-row items-center flex-wrap">
                                <View className="flex-row items-center bg-slate-800 px-2 py-1 rounded-md mr-2 mb-1"><Feather name="users" size={12} color="#94a3b8" style={{ marginRight: 6 }} /><Text className="text-slate-300 text-xs font-bold">{item.playerCount} {item.playerCount === 1 || (item.playerCount % 10 === 1 && item.playerCount !== 11) ? 'гравець' : (item.playerCount > 1 && item.playerCount < 5 ? 'гравці' : 'гравців')}</Text></View>
                                {item.isMyTeam && (<View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 mb-1"><Feather name="check-circle" size={12} color="#34d399" style={{ marginRight: 4 }} /><Text className="text-emerald-400 text-xs font-bold">Ваша команда</Text></View>)}
                            </View>
                        </View>
                        <Feather name="chevron-right" size={20} color="#64748b" />
                    </TouchableOpacity>
                )} ListEmptyComponent={() => (<View className="items-center justify-center py-10"><Feather name="shield" size={48} color="#334155" /><Text className="text-slate-500 mt-4">Команд не знайдено</Text></View>)} />
            )}

            <AppModal type="fullscreen" visible={isAddTeamModalVisible} onClose={() => setAddTeamModalVisible(false)} title="Нова команда">
                <View className="mt-4">
                    <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-2 ml-1">Назва команди</Text>
                    <TextInput value={newTeamName} onChangeText={setNewTeamName} className={`bg-slate-900 text-white p-5 rounded-2xl text-lg mb-8 border ${newTeamName ? 'border-yellow-600/50' : 'border-slate-800'}`} placeholder="Наприклад: FC Polissya U-17" placeholderTextColor="#475569" autoFocus />
                    {isLoading ? <ActivityIndicator size="large" color="#facc15" /> : <TouchableOpacity onPress={() => handleCreateTeam()} disabled={!newTeamName.trim()} className={`p-5 rounded-2xl items-center ${newTeamName.trim() ? 'bg-yellow-400' : 'bg-slate-800'}`}><Text className={`font-bold text-lg ${newTeamName.trim() ? 'text-slate-900' : 'text-slate-500'}`}>Створити команду</Text></TouchableOpacity>}
                </View>
            </AppModal>
        </View>
    );
}