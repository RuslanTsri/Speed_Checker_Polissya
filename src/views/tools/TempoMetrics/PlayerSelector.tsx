import React from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePlayerSelection } from '../../../hooks/tempoMetrics/usePlayerSelection';

interface Props {
    onBack: () => void;
    onSelect: (ids: string[]) => void;
}

export default function PlayerSelector({ onBack, onSelect }: Props) {
    const {
        players, selectedIds, toggleSelection, toggleAll,
        isEmpty, setAddModalVisible, handleImport
    } = usePlayerSelection();

    // Екран-заглушка (Empty State)
    if (isEmpty) {
        return (
            <View className="flex-1 bg-slate-950 pt-4 px-4">
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity onPress={onBack} className="p-2 -ml-2"><Feather name="chevron-left" size={28} color="white" /></TouchableOpacity>
                    <Text className="text-slate-500 text-xs uppercase font-bold">Команда: СДЮШОР «Зміна»</Text>
                    <View className="w-10" />
                </View>
                <View className="items-center justify-center flex-1 mb-20">
                    <Text className="text-slate-500 font-bold uppercase tracking-widest mb-8">Додано: 0 гравців</Text>
                    <View className="flex-row gap-4 w-full">
                        <TouchableOpacity onPress={handleImport} className="flex-1 bg-slate-900 border border-slate-800 p-6 rounded-3xl items-start">
                            <View className="bg-emerald-500/10 p-3 rounded-xl mb-4"><Feather name="file-text" size={24} color="#34d399" /></View>
                            <Text className="text-white font-bold text-lg mb-1">Імпорт з файлу</Text>
                            <Text className="text-slate-500 text-xs">CSV або Excel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAddModalVisible(true)} className="flex-1 bg-slate-900 border border-slate-800 p-6 rounded-3xl items-start">
                            <View className="bg-blue-500/10 p-3 rounded-xl mb-4"><Feather name="user-plus" size={24} color="#60a5fa" /></View>
                            <Text className="text-white font-bold text-lg mb-1">Додати вручну</Text>
                            <Text className="text-slate-500 text-xs">Для одного або кількох.</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity disabled className="bg-slate-900 w-full py-5 rounded-2xl items-center mb-8 opacity-50">
                    <Text className="text-slate-600 font-bold text-lg uppercase">Продовжити</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-950 pt-4 px-4">
            <View className="flex-row items-center justify-between mb-2">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2"><Feather name="chevron-left" size={28} color="white" /></TouchableOpacity>
                <Text className="text-white text-lg font-bold">Присутні гравці</Text>
                <View className="w-10" />
            </View>

            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-blue-500 font-bold text-base">ОБРАНО: <Text className="text-white">{selectedIds.length}</Text> з {players.length}</Text>
            </View>

            <View className="bg-slate-900 flex-row items-center px-4 rounded-2xl border border-slate-800 h-14 mb-4">
                <Feather name="search" size={20} color="#64748b" className="mr-3" />
                <TextInput placeholder="Пошук гравця" placeholderTextColor="#64748b" className="flex-1 text-white text-base h-full" />
            </View>

            <View className="flex-row justify-between mb-4 px-1">
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Список гравців</Text>
                <TouchableOpacity onPress={toggleAll}>
                    <Text className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest">{selectedIds.length === players.length ? 'Зняти вибір з усіх' : 'Обрати всіх'}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={players}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <TouchableOpacity
                            onPress={() => toggleSelection(item.id)}
                            activeOpacity={0.7}
                            className={`p-4 rounded-2xl mb-3 border flex-row items-center ${isSelected ? 'bg-slate-900 border-yellow-600' : 'bg-slate-900 border-slate-800'}`}
                        >
                            <View className={`w-6 h-6 rounded-md items-center justify-center mr-4 ${isSelected ? 'bg-yellow-400' : 'bg-slate-800 border border-slate-700'}`}>
                                {isSelected && <Feather name="check" size={16} color="#0f172a" />}
                            </View>
                            <View>
                                <Text className="text-white font-bold text-base">{item.name}</Text>
                                <Text className="text-slate-500 text-xs">№ {item.number}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            <TouchableOpacity
                onPress={() => onSelect(selectedIds)}
                disabled={selectedIds.length === 0}
                className={`w-full py-5 rounded-2xl items-center mb-8 absolute bottom-0 left-4 right-4 ${selectedIds.length > 0 ? 'bg-yellow-400' : 'bg-slate-900 border border-slate-800 opacity-50'}`}
            >
                <Text className={`font-black text-lg uppercase ${selectedIds.length > 0 ? 'text-slate-900' : 'text-slate-600'}`}>Продовжити</Text>
            </TouchableOpacity>
        </View>
    );
}