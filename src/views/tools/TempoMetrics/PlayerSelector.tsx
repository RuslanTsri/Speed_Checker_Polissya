import React from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePlayerSelection } from '../../../hooks/tempoMetrics/usePlayerSelection';
import { Player } from '../../../services/playerService';
import { useTheme } from '../../../context/ThemeContext';

interface Props { teamId: string; onBack: () => void; onSelect: (players: Player[]) => void; }

export default function PlayerSelector({ teamId, onBack, onSelect }: Props) {
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const { players, selectedIds, toggleSelection, toggleAll, isEmpty, isLoading, search, setSearch } = usePlayerSelection(teamId);

    if (isEmpty) {
        return (
            <View className="flex-1 px-4 pt-4">
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity onPress={onBack} className={`p-2 -ml-2 rounded-full ${isDark ? 'active:bg-slate-800' : 'active:bg-slate-200'}`}><Feather name="chevron-left" size={28} color={isDark ? "white" : "black"} /></TouchableOpacity>
                    <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('tools.speed_checker.team_empty_title') as string}</Text>
                    <View className="w-10" />
                </View>
                <View className="items-center justify-center flex-1 mb-20">
                    <Text className={`font-bold uppercase tracking-widest mb-8 text-center px-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('tools.speed_checker.team_empty_desc') as string}</Text>
                    <TouchableOpacity onPress={onBack} className={`border py-4 px-8 rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}>
                        <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('tools.speed_checker.btn_go_back') as string}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 px-4 pt-4">
            <View className="flex-row items-center justify-between mb-2">
                <TouchableOpacity onPress={onBack} className={`p-2 -ml-2 rounded-full ${isDark ? 'active:bg-slate-800' : 'active:bg-slate-200'}`}><Feather name="chevron-left" size={28} color={isDark ? "white" : "black"} /></TouchableOpacity>
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('tools.speed_checker.select_players_title') as string}</Text>
                <View className="w-10" />
            </View>

            <View className="flex-row justify-between items-center mb-4">
                <Text className={`font-bold text-base ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>{t('tools.speed_checker.selected_count') as string} <Text className={isDark ? 'text-white' : 'text-slate-900'}>{selectedIds.length}</Text> {t('tools.speed_checker.from') as string} {players.length}</Text>
            </View>

            <View className={`flex-row items-center px-4 rounded-2xl border h-14 mb-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <Feather name="search" size={20} color={isDark ? "#64748b" : "#94a3b8"} className="mr-3" />
                <TextInput value={search} onChangeText={setSearch} placeholder={t('tools.speed_checker.search_player') as string} placeholderTextColor={isDark ? "#64748b" : "#94a3b8"} className={`flex-1 text-base h-full ${isDark ? 'text-white' : 'text-slate-900'}`} />
            </View>

            <View className="flex-row justify-between mb-4 px-1">
                <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{t('tools.speed_checker.player_list') as string}</Text>
                <TouchableOpacity onPress={toggleAll}>
                    <Text className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{selectedIds.length === players.length && players.length > 0 ? (t('tools.speed_checker.deselect_all') as string) : (t('tools.speed_checker.select_all') as string)}</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={isDark ? "#facc15" : "#eab308"} className="mt-10" />
            ) : (
                <FlatList
                    data={players} keyExtractor={item => item.id || Math.random().toString()} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const isSelected = selectedIds.includes(item.id || '');
                        return (
                            <TouchableOpacity onPress={() => toggleSelection(item.id || '')} activeOpacity={0.7} className={`p-4 rounded-2xl mb-3 border flex-row items-center shadow-sm ${isSelected ? (isDark ? 'bg-slate-900 border-yellow-600' : 'bg-yellow-50 border-yellow-400') : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')}`}>
                                <View className={`w-6 h-6 rounded-md items-center justify-center mr-4 ${isSelected ? (isDark ? 'bg-yellow-400' : 'bg-yellow-500') : (isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-300')}`}>
                                    {isSelected && <Feather name="check" size={16} color={isDark ? "#0f172a" : "#ffffff"} />}
                                </View>
                                <View><Text className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</Text></View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}

            <TouchableOpacity
                onPress={() => onSelect(players.filter(p => selectedIds.includes(p.id || '')))}
                disabled={selectedIds.length === 0}
                className={`w-full py-5 rounded-2xl items-center mb-8 absolute bottom-0 left-4 right-4 shadow-lg ${selectedIds.length > 0 ? (isDark ? 'bg-yellow-400 shadow-yellow-400/20' : 'bg-yellow-400 shadow-yellow-400/30') : (isDark ? 'bg-slate-900 border border-slate-800 opacity-50' : 'bg-slate-200 opacity-70')}`}
            >
                <Text className={`font-black text-lg uppercase ${selectedIds.length > 0 ? 'text-slate-900' : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>{t('tools.speed_checker.btn_continue') as string}</Text>
            </TouchableOpacity>
        </View>
    );
}