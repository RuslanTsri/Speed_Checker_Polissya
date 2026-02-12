import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Мокові дані (пізніше заміниш на реальні з бази/контексту)
const DUMMY_TEAMS = [
    { id: '1', name: 'ФК «Динамо» U17', players: 24, lastSession: 'Вчора' },
    { id: '2', name: 'СДЮШОР «Зміна»', players: 0, lastSession: null },
];

interface Props {
    onBack: () => void;
    onSelect: (teamId: string) => void;
}

export default function TeamSelector({ onBack, onSelect }: Props) {
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <View className="flex-1 bg-slate-950 pt-4 px-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
                    <Feather name="chevron-left" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Вибір команди</Text>
                <TouchableOpacity className="w-10 h-10 bg-slate-900 rounded-full items-center justify-center border border-slate-800">
                    <Feather name="plus" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="bg-slate-900 flex-row items-center px-4 rounded-2xl border border-slate-800 h-14 mb-6">
                <Feather name="search" size={20} color="#64748b" className="mr-3" />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Пошук команди"
                    placeholderTextColor="#64748b"
                    className="flex-1 text-white text-base h-full"
                />
            </View>

            {/* List */}
            <FlatList
                data={DUMMY_TEAMS}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => setSelectedId(item.id)}
                        activeOpacity={0.8}
                        className={`p-5 rounded-2xl mb-3 border ${selectedId === item.id ? 'bg-slate-800 border-yellow-400' : 'bg-slate-900 border-slate-800'}`}
                    >
                        <Text className="text-white text-lg font-bold mb-1">{item.name}</Text>
                        <Text className="text-slate-500 text-sm">Гравців: {item.players} • {item.lastSession || 'Немає даних'}</Text>
                    </TouchableOpacity>
                )}
            />

            {/* Continue Button */}
            <TouchableOpacity
                onPress={() => selectedId && onSelect(selectedId)}
                disabled={!selectedId}
                className={`w-full py-5 rounded-2xl items-center mb-8 ${selectedId ? 'bg-slate-800 border border-slate-700' : 'bg-slate-900 opacity-50'}`}
            >
                <Text className={`font-bold text-lg uppercase ${selectedId ? 'text-white' : 'text-slate-600'}`}>Продовжити</Text>
            </TouchableOpacity>
        </View>
    );
}