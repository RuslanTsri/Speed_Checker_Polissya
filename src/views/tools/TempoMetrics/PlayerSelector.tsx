import React from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePlayerSelection } from '../../../hooks/tempoMetrics/usePlayerSelection';
import { Player } from '../../../services/playerService';

interface Props {
    teamId: string;
    onBack: () => void;
    onSelect: (players: Player[]) => void; // Очікуємо масив об'єктів
}

export default function PlayerSelector({ teamId, onBack, onSelect }: Props) {
    const {
        players, selectedIds, toggleSelection, toggleAll,
        isEmpty, setAddModalVisible, handleImport,
        isLoading, search, setSearch
    } = usePlayerSelection(teamId);

    // Екран-заглушка (Empty State)
    if (isEmpty) {
        return (
            <View className="flex-1 bg-slate-950 pt-4 px-4">
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity onPress={onBack} className="p-2 -ml-2"><Feather name="chevron-left" size={28} color="white" /></TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Команда пуста</Text>
                    <View className="w-10" />
                </View>
                <View className="items-center justify-center flex-1 mb-20">
                    <Text className="text-slate-500 font-bold uppercase tracking-widest mb-8 text-center px-6">У цій команді ще немає гравців. {'\n'}Додайте їх, щоб почати тест.</Text>
                    <TouchableOpacity onPress={onBack} className="bg-slate-900 border border-slate-700 py-4 px-8 rounded-2xl">
                        <Text className="text-white font-bold">Повернутися назад</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-950 pt-4 px-4">
            <View className="flex-row items-center justify-between mb-2">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2"><Feather name="chevron-left" size={28} color="white" /></TouchableOpacity>
                <Text className="text-white text-lg font-bold">Оберіть гравців</Text>
                <View className="w-10" />
            </View>

            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-blue-500 font-bold text-base">ОБРАНО: <Text className="text-white">{selectedIds.length}</Text> з {players.length}</Text>
            </View>

            <View className="bg-slate-900 flex-row items-center px-4 rounded-2xl border border-slate-800 h-14 mb-4">
                <Feather name="search" size={20} color="#64748b" className="mr-3" />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Пошук гравця"
                    placeholderTextColor="#64748b"
                    className="flex-1 text-white text-base h-full"
                />
            </View>

            <View className="flex-row justify-between mb-4 px-1">
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Список гравців</Text>
                <TouchableOpacity onPress={toggleAll}>
                    <Text className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest">{selectedIds.length === players.length && players.length > 0 ? 'Зняти вибір з усіх' : 'Обрати всіх'}</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#facc15" className="mt-10" />
            ) : (
                <FlatList
                    data={players}
                    keyExtractor={item => item.id || Math.random().toString()}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => {
                        const isSelected = selectedIds.includes(item.id || '');
                        return (
                            <TouchableOpacity
                                // 🔥 ВИПРАВЛЕНО 1: Тут викликаємо toggleSelection, а не onSelect
                                onPress={() => toggleSelection(item.id || '')}
                                activeOpacity={0.7}
                                className={`p-4 rounded-2xl mb-3 border flex-row items-center ${isSelected ? 'bg-slate-900 border-yellow-600' : 'bg-slate-900 border-slate-800'}`}
                            >
                                <View className={`w-6 h-6 rounded-md items-center justify-center mr-4 ${isSelected ? 'bg-yellow-400' : 'bg-slate-800 border border-slate-700'}`}>
                                    {isSelected && <Feather name="check" size={16} color="#0f172a" />}
                                </View>
                                <View>
                                    <Text className="text-white font-bold text-base">{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}

            <TouchableOpacity
                // 🔥 ВИПРАВЛЕНО 2: Тут перетворюємо ID в об'єкти і переходимо далі
                onPress={() => {
                    const selectedObjects = players.filter(p => selectedIds.includes(p.id || ''));
                    onSelect(selectedObjects);
                }}
                disabled={selectedIds.length === 0}
                className={`w-full py-5 rounded-2xl items-center mb-8 absolute bottom-0 left-4 right-4 ${selectedIds.length > 0 ? 'bg-yellow-400' : 'bg-slate-900 border border-slate-800 opacity-50'}`}
            >
                <Text className={`font-black text-lg uppercase ${selectedIds.length > 0 ? 'text-slate-900' : 'text-slate-600'}`}>Продовжити</Text>
            </TouchableOpacity>
        </View>
    );
}