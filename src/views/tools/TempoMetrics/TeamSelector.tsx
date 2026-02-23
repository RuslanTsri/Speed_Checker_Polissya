import React from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTeamSelection } from '../../../hooks/tempoMetrics/useTeamSelection';
import { useTheme } from '../../../context/ThemeContext'; // 🔥 Тема

interface Props {
    onBack: () => void;
    onSelect: (teamId: string, teamName: string) => void;
}

export default function TeamSelector({ onBack, onSelect }: Props) {
    const { isDark } = useTheme(); // 🔥 Стейт
    const { teams, search, setSearch, selectedId, setSelectedId } = useTeamSelection();

    return (
        <View className="flex-1 px-4 pt-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity onPress={onBack} className={`p-2 -ml-2 rounded-full ${isDark ? 'active:bg-slate-800' : 'active:bg-slate-200'}`}>
                    <Feather name="chevron-left" size={28} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Вибір команди</Text>
                <TouchableOpacity className={`w-10 h-10 rounded-full items-center justify-center border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <Feather name="plus" size={20} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View className={`flex-row items-center px-4 rounded-2xl border h-14 mb-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <Feather name="search" size={20} color={isDark ? "#64748b" : "#94a3b8"} className="mr-3" />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Пошук команди"
                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                    className={`flex-1 text-base h-full ${isDark ? 'text-white' : 'text-slate-900'}`}
                />
            </View>

            {/* List */}
            <FlatList
                data={teams}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => setSelectedId(item.id)}
                        activeOpacity={0.8}
                        className={`p-5 rounded-2xl mb-3 border shadow-sm ${
                            selectedId === item.id
                                ? (isDark ? 'bg-slate-800 border-yellow-400' : 'bg-slate-100 border-yellow-500')
                                : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')
                        }`}
                    >
                        <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</Text>
                        <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Гравців: {item.players} • {item.lastSession || 'Немає даних'}</Text>
                    </TouchableOpacity>
                )}
            />

            {/* Continue Button */}
            <TouchableOpacity
                onPress={() => {
                    const team = teams.find(t => t.id === selectedId);
                    if (team) onSelect(team.id, team.name);
                }}
                disabled={!selectedId}
                className={`w-full py-5 rounded-2xl items-center mb-8 shadow-sm ${
                    selectedId
                        ? (isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-800 border-slate-700')
                        : (isDark ? 'bg-slate-900 opacity-50' : 'bg-slate-200 opacity-70')
                }`}
            >
                <Text className={`font-bold text-lg uppercase ${selectedId ? 'text-white' : (isDark ? 'text-slate-600' : 'text-slate-400')}`}>Продовжити</Text>
            </TouchableOpacity>
        </View>
    );
}