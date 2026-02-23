import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppModal } from '../components/AppModal';
import { usePlayersLogic } from '../../hooks/players/usePlayersLogic';
import { useTheme } from '../../context/ThemeContext'; // 🔥 Тема

export default function PlayersScreen() {
    const { isDark } = useTheme(); // 🔥 Стейт
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

    if (selectedTeam) {
        return (
            <View className={`flex-1 pt-4 relative ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                {/* Header Команди */}
                <View className="flex-row items-center justify-between px-4 mb-6 relative z-10">
                    <TouchableOpacity onPress={() => setSelectedTeam(null)} className="p-2 -ml-2">
                        <Feather name="chevron-left" size={24} color={isDark ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-lg font-bold flex-1 text-center ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>
                        {selectedTeam.name}
                    </Text>
                    <TouchableOpacity onPress={() => setDropdownVisible(true)} className="p-2 -mr-2">
                        <Feather name="more-vertical" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                    </TouchableOpacity>
                </View>

                {/* Dropdown Menu */}
                <Modal visible={isDropdownVisible} transparent animationType="fade">
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setDropdownVisible(false)}>
                        <View className={`absolute top-16 right-4 rounded-2xl border shadow-xl overflow-hidden min-w-[160px] ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <TouchableOpacity onPress={() => handleEditTeam()} className={`flex-row items-center px-4 py-3 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                                <Feather name="edit-2" size={16} color={isDark ? "#e2e8f0" : "#64748b"} style={{ marginRight: 10 }} />
                                <Text className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Змінити</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteTeam()} className="flex-row items-center px-4 py-3">
                                <Feather name="trash-2" size={16} color="#ef4444" style={{ marginRight: 10 }} />
                                <Text className="text-red-500 font-medium text-sm">Видалити</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                <View className={`flex-row justify-between px-6 pb-4 border-b mb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <Text className={`text-xs font-bold tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ГРАВЦІВ: {players.length}</Text>
                    <Text className={`text-xs font-bold tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ОСТАННЯ СЕСІЯ: {selectedTeam.lastSessionDate.toUpperCase()}</Text>
                </View>

                <View className="flex-row px-4 mb-6 space-x-3">
                    <TouchableOpacity onPress={() => setAddPlayerOptionsVisible(true)} className={`flex-1 border py-3 rounded-xl flex-row justify-center items-center mr-2 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <Feather name="user-plus" size={16} color={isDark ? "#facc15" : "#eab308"} style={{ marginRight: 8 }} />
                        <Text className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Додати гравців</Text>
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
                            <View className={`mb-3 rounded-2xl p-4 flex-row items-center border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                                    <Text className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{getInitials(item.name)}</Text>
                                </View>
                                <Text className={`text-base font-medium flex-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</Text>

                                <View className="flex-row items-center space-x-1">
                                    <TouchableOpacity onPress={() => handleEditPlayer(item)} className={`p-2 rounded-xl mr-2 ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
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
                                <Feather name="users" size={48} color={isDark ? "#334155" : "#cbd5e1"} />
                                <Text className={`mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>У цій команді ще немає гравців</Text>
                            </View>
                        )}
                    />
                )}

                {/* --- МОДАЛКИ (ДЛЯ РЕЖИМУ ПЕРЕГЛЯДУ КОМАНДИ) --- */}

                {/* 1. Вибір способу */}
                <AppModal type="bottom" visible={isAddPlayerOptionsVisible} onClose={() => setAddPlayerOptionsVisible(false)} title="Гравці">
                    <Text className={`text-xs mb-6 -mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Команда: {selectedTeam.name}</Text>
                    <View className="flex-row space-x-4 mb-6">
                        <TouchableOpacity onPress={() => { setAddPlayerOptionsVisible(false); setImportVisible(true); }} className={`flex-1 border p-6 rounded-3xl mr-2 items-start ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <View className="bg-emerald-500/20 p-3 rounded-xl mb-4"><Feather name="file-text" size={24} color="#34d399" /></View>
                            <Text className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Імпорт з файлу</Text>
                            <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>CSV або Excel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setAddPlayerOptionsVisible(false); setAddManualVisible(true); }} className={`flex-1 border p-6 rounded-3xl ml-2 items-start ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <View className="bg-blue-500/20 p-3 rounded-xl mb-4"><Feather name="user-plus" size={24} color="#60a5fa" /></View>
                            <Text className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Додати вручну</Text>
                            <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Для одного або кількох.</Text>
                        </TouchableOpacity>
                    </View>
                </AppModal>

                {/* 2. Ручне створення */}
                <AppModal type="center" visible={isAddManualVisible} onClose={() => setAddManualVisible(false)} title="Новий гравець">
                    <TextInput value={newPlayerName} onChangeText={setNewPlayerName} className={`p-4 rounded-xl border mb-6 text-base ${isDark ? 'bg-slate-950 text-white border-yellow-500/50' : 'bg-slate-50 text-slate-900 border-yellow-400'}`} placeholder="Ім'я та Прізвище" placeholderTextColor={isDark ? "#64748b" : "#94a3b8"} autoFocus />
                    <View className="flex-row space-x-3 mt-2">
                        <TouchableOpacity onPress={() => { setAddManualVisible(false); setNewPlayerName(''); }} className={`flex-1 p-4 rounded-xl items-center mr-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}><Text className={`font-bold text-base ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Скасувати</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleAddManualPlayer()} className="flex-1 bg-yellow-500 p-4 rounded-xl items-center ml-2"><Text className="text-slate-900 font-bold text-base">Додати</Text></TouchableOpacity>
                    </View>
                </AppModal>

                {/* 3. Редагування гравця */}
                <AppModal type="center" visible={isEditPlayerModalVisible} onClose={() => setEditPlayerModalVisible(false)} title="Редагувати гравця">
                    <Text className={`text-xs mb-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Ім'я та Прізвище</Text>
                    <TextInput value={editingPlayerName} onChangeText={setEditingPlayerName} className={`p-4 rounded-xl border mb-6 text-base ${isDark ? 'bg-slate-950 text-white border-blue-500/50' : 'bg-slate-50 text-slate-900 border-blue-400'}`} placeholder="Ім'я гравця" placeholderTextColor={isDark ? "#64748b" : "#94a3b8"} autoFocus />
                    <View className="flex-row space-x-3 mt-2">
                        <TouchableOpacity onPress={() => setEditPlayerModalVisible(false)} className={`flex-1 p-4 rounded-xl items-center mr-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}><Text className={`font-bold text-base ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Скасувати</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleUpdatePlayer()} disabled={isLoading} className="flex-1 bg-blue-600 p-4 rounded-xl items-center ml-2">{isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Зберегти</Text>}</TouchableOpacity>
                    </View>
                </AppModal>

                {/* 4. Видалення гравця (ВІДНОВЛЕНО) */}
                <AppModal type="center" visible={isDeletePlayerModalVisible} onClose={() => setDeletePlayerModalVisible(false)} title="Видалення">
                    <View className="items-center mb-6">
                        <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center mb-4"><Feather name="alert-circle" size={32} color="#ef4444" /></View>
                        <Text className={`text-lg font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Видалити гравця?</Text>
                        <Text className={`text-center text-sm px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Ви впевнені, що хочете видалити <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{playerToDelete?.name}</Text>?
                            {'\n'}Цю дію неможливо відмінити.
                        </Text>
                    </View>
                    <View className="flex-row space-x-3 mt-2">
                        <TouchableOpacity onPress={() => setDeletePlayerModalVisible(false)} className={`flex-1 p-4 rounded-xl items-center mr-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}><Text className={`font-bold text-base ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Скасувати</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleConfirmDeletePlayer()} disabled={isLoading} className="flex-1 bg-red-600 p-4 rounded-xl items-center ml-2">{isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Видалити</Text>}</TouchableOpacity>
                    </View>
                </AppModal>

                {/* 5. Імпорт CSV (ВІДНОВЛЕНО) */}
                <AppModal type="bottom" visible={isImportVisible} onClose={() => setImportVisible(false)} title="Імпорт гравців">
                    <TouchableOpacity onPress={() => downloadTemplate()} className={`flex-row items-center border p-4 rounded-2xl mb-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800 active:bg-slate-800' : 'bg-white border-slate-200 active:bg-slate-50'}`}>
                        <View className="bg-emerald-500/20 p-3 rounded-xl mr-4"><Feather name="download" size={24} color="#34d399" /></View>
                        <View className="flex-1">
                            <Text className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Завантажити шаблон</Text>
                            <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Спочатку завантажте цей файл</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color={isDark ? "#475569" : "#94a3b8"} />
                    </TouchableOpacity>

                    {importedPlayers.length === 0 ? (
                        <View>
                            <Text className={`font-bold text-lg mb-3 ml-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Оберіть файл</Text>
                            <TouchableOpacity onPress={() => handleSelectFile()} className={`border-2 border-dashed rounded-3xl py-10 items-center justify-center mb-4 ${isDark ? 'border-slate-700 bg-slate-900/50 active:bg-slate-800' : 'border-slate-300 bg-slate-50 active:bg-slate-100'}`}>
                                <Feather name="file-plus" size={32} color="#60a5fa" className="mb-3" />
                                <Text className="text-blue-500 font-bold text-base">Натисніть для вибору .csv</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="max-h-[350px]">
                            <View className="flex-row justify-between items-end mb-3 px-1">
                                <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Знайдено: {importedPlayers.length}</Text>
                                <TouchableOpacity onPress={() => handleSelectFile()}><Text className="text-blue-500 text-xs font-bold uppercase">Змінити файл</Text></TouchableOpacity>
                            </View>
                            <View className={`rounded-2xl border mb-4 overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <FlatList data={importedPlayers} keyExtractor={(_, index) => index.toString()} style={{ maxHeight: 200 }} contentContainerStyle={{ padding: 4 }} renderItem={({ item, index }) => (
                                    <View className={`flex-row items-center py-3 px-3 border-b last:border-0 ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
                                        <Text className={`w-8 text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{index + 1}.</Text>
                                        <Text className={`flex-1 font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>{item.name}</Text>
                                    </View>
                                )} />
                            </View>
                        </View>
                    )}
                    {importStatus !== 'idle' && (
                        <View className={`p-4 rounded-xl mb-4 flex-row items-center ${importStatus === 'success' ? 'bg-emerald-500/10 border border-emerald-500/50' : 'bg-red-500/10 border border-red-500/50'}`}>
                            <Feather name={importStatus === 'success' ? "check-circle" : "alert-circle"} size={20} color={importStatus === 'success' ? "#34d399" : "#ef4444"} style={{ marginRight: 12 }} />
                            <Text className={importStatus === 'success' ? "text-emerald-500 font-bold flex-1" : "text-red-500 font-bold flex-1"}>{importMessage}</Text>
                        </View>
                    )}
                    {importedPlayers.length > 0 && (
                        <TouchableOpacity onPress={() => handleConfirmImport()} disabled={isLoading || importStatus === 'success'} className={`p-4 rounded-2xl items-center shadow-lg shadow-yellow-400/20 mt-2 ${isLoading || importStatus === 'success' ? (isDark ? 'bg-slate-800' : 'bg-slate-200') : 'bg-yellow-400'}`}>
                            {isLoading ? <ActivityIndicator color={isDark ? "#ffffff" : "#0f172a"} /> : <Text className={`font-black text-lg uppercase tracking-wide ${importStatus === 'success' ? (isDark ? 'text-slate-500' : 'text-slate-400') : 'text-slate-900'}`}>{importStatus === 'success' ? 'Готово!' : 'Імпортувати'}</Text>}
                        </TouchableOpacity>
                    )}
                </AppModal>

                {/* 6. Редагування КОМАНДИ (ВІДНОВЛЕНО) */}
                <AppModal type="center" visible={isEditTeamModalVisible} onClose={() => setEditTeamModalVisible(false)} title="Змінити назву">
                    <Text className={`text-xs mb-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Нова назва команди</Text>
                    <TextInput value={editingTeamName} onChangeText={setEditingTeamName} className={`p-4 rounded-xl border mb-6 text-base ${isDark ? 'bg-slate-950 text-white border-blue-500/50' : 'bg-slate-50 text-slate-900 border-blue-400'}`} placeholder="Назва команди" placeholderTextColor={isDark ? "#64748b" : "#94a3b8"} autoFocus />
                    <View className="flex-row space-x-3 mt-2">
                        <TouchableOpacity onPress={() => setEditTeamModalVisible(false)} className={`flex-1 p-4 rounded-xl items-center mr-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}><Text className={`font-bold text-base ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Скасувати</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleUpdateTeam()} disabled={isLoading} className="flex-1 bg-blue-600 p-4 rounded-xl items-center ml-2">{isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Зберегти</Text>}</TouchableOpacity>
                    </View>
                </AppModal>

                {/* 7. Видалення КОМАНДИ (ВІДНОВЛЕНО) */}
                <AppModal type="center" visible={isDeleteTeamModalVisible} onClose={() => setDeleteTeamModalVisible(false)} title="Видалення">
                    <View className="items-center mb-6">
                        <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center mb-4"><Feather name="alert-triangle" size={32} color="#ef4444" /></View>
                        <Text className={`text-lg font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Видалити команду?</Text>
                        <Text className={`text-center text-sm px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ви збираєтесь видалити <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedTeam.name}</Text>.{'\n'}Всі дані гравців та статистика будуть втрачені безповоротно.</Text>
                    </View>
                    <View className="flex-row space-x-3 mt-2">
                        <TouchableOpacity onPress={() => setDeleteTeamModalVisible(false)} className={`flex-1 p-4 rounded-xl items-center mr-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}><Text className={`font-bold text-base ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Скасувати</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleConfirmDeleteTeam()} disabled={isLoading} className="flex-1 bg-red-600 p-4 rounded-xl items-center ml-2">{isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Видалити</Text>}</TouchableOpacity>
                    </View>
                </AppModal>

            </View>
        );
    }

    // ГОЛОВНИЙ СПИСОК КОМАНД
    return (
        <View className={`flex-1 pt-4 relative ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <View className="flex-row items-center justify-between px-4 mb-6">
                <Text className={`text-3xl font-bold flex-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Команди</Text>
                <TouchableOpacity onPress={() => setAddTeamModalVisible(true)} className={`w-10 h-10 rounded-full border items-center justify-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}><Feather name="plus" size={20} color={isDark ? "white" : "black"} /></TouchableOpacity>
            </View>
            <View className="px-4 mb-6">
                <View className={`flex-row items-center px-4 rounded-2xl border h-14 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <Feather name="search" size={20} color={isDark ? "#64748b" : "#94a3b8"} className="mr-3" />
                    <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Пошук команди" placeholderTextColor={isDark ? "#64748b" : "#94a3b8"} className={`flex-1 text-base h-full ${isDark ? 'text-white' : 'text-slate-900'}`} />
                </View>
            </View>

            {isLoading && filteredTeams.length === 0 ? <ActivityIndicator size="large" color="#facc15" className="mt-10" /> : (
                <FlatList data={filteredTeams} keyExtractor={(item) => item.id || Math.random().toString()} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }} renderItem={({ item }) => (
                    <TouchableOpacity activeOpacity={0.8} onPress={() => setSelectedTeam(item)} className={`p-5 rounded-3xl mb-4 border flex-row justify-between items-center shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <View className="flex-1">
                            <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</Text>
                            <View className="flex-row items-center flex-wrap">
                                <View className={`flex-row items-center px-2 py-1 rounded-md mr-2 mb-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}><Feather name="users" size={12} color={isDark ? "#94a3b8" : "#64748b"} style={{ marginRight: 6 }} /><Text className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.playerCount} гравців</Text></View>
                                {item.isMyTeam && (<View className="flex-row items-center bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 mb-1"><Feather name="check-circle" size={12} color="#34d399" style={{ marginRight: 4 }} /><Text className="text-emerald-500 text-xs font-bold">Ваша команда</Text></View>)}
                            </View>
                        </View>
                        <Feather name="chevron-right" size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                    </TouchableOpacity>
                )} ListEmptyComponent={() => (<View className="items-center justify-center py-10"><Feather name="shield" size={48} color={isDark ? "#334155" : "#cbd5e1"} /><Text className={`mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Команд не знайдено</Text></View>)} />
            )}

            {/* Модалка додавання команди */}
            <AppModal type="fullscreen" visible={isAddTeamModalVisible} onClose={() => setAddTeamModalVisible(false)} title="Нова команда">
                <View className="mt-4">
                    <Text className={`text-xs font-bold tracking-widest uppercase mb-2 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Назва команди</Text>
                    <TextInput value={newTeamName} onChangeText={setNewTeamName} className={`p-5 rounded-2xl text-lg mb-8 border ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} ${newTeamName ? 'border-yellow-500' : (isDark ? 'border-slate-800' : 'border-slate-300')}`} placeholder="Наприклад: FC Polissya U-17" placeholderTextColor={isDark ? "#475569" : "#94a3b8"} autoFocus />
                    {isLoading ? <ActivityIndicator size="large" color="#facc15" /> : <TouchableOpacity onPress={() => handleCreateTeam()} disabled={!newTeamName.trim()} className={`p-5 rounded-2xl items-center shadow-sm ${newTeamName.trim() ? 'bg-yellow-400' : (isDark ? 'bg-slate-800' : 'bg-slate-200')}`}><Text className={`font-bold text-lg ${newTeamName.trim() ? 'text-slate-900' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>Створити команду</Text></TouchableOpacity>}
                </View>
            </AppModal>
        </View>
    );
}