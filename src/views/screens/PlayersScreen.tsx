import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';


import InfoScreen from './InfoScreen';


interface Player {
    id: string;
    name: string;
    number: string;
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    photoUrl: string;
    stats?: {
        bestTime: string;
        lastTime: string;
        totalSessions: number;
    }
}

// 2. Оновлені дані
const DUMMY_PLAYERS: Player[] = [
    { id: '1', name: 'Денис Бойко', number: '71', position: 'GK', photoUrl: 'https://placehold.co/100/1e293b/fbbf24?text=GK', stats: { bestTime: '13.50s', lastTime: '13.80s', totalSessions: 12 } },
    { id: '2', name: 'Артем Шабанов', number: '30', position: 'DEF', photoUrl: 'https://placehold.co/100/1e293b/fbbf24?text=DEF', stats: { bestTime: '12.90s', lastTime: '13.10s', totalSessions: 24 } },
    { id: '3', name: 'Богдан Кушніренко', number: '5', position: 'MID', photoUrl: 'https://placehold.co/100/1e293b/fbbf24?text=MID', stats: { bestTime: '12.10s', lastTime: '12.35s', totalSessions: 18 } },
    { id: '4', name: 'Пилип Будківський', number: '28', position: 'FWD', photoUrl: 'https://placehold.co/100/1e293b/fbbf24?text=FWD', stats: { bestTime: '11.80s', lastTime: '12.05s', totalSessions: 30 } },
    { id: '5', name: 'Олександр Назаренко', number: '7', position: 'MID', photoUrl: 'https://placehold.co/100/1e293b/fbbf24?text=MID', stats: { bestTime: '11.20s', lastTime: '11.25s', totalSessions: 45 } },
    { id: '6', name: 'Бені Макуана', number: '10', position: 'FWD', photoUrl: 'https://placehold.co/100/1e293b/fbbf24?text=FWD', stats: { bestTime: '10.95s', lastTime: '11.10s', totalSessions: 42 } },
    { id: '7', name: 'Руслан Бабенко', number: '20', position: 'MID', photoUrl: 'https://placehold.co/100/1e293b/fbbf24?text=MID', stats: { bestTime: '12.40s', lastTime: '12.60s', totalSessions: 28 } },
];

const POSITIONS = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];

export default function PlayersScreen() {
    const [players, setPlayers] = useState<Player[]>(DUMMY_PLAYERS);
    const [filter, setFilter] = useState('ALL');
    const [modalVisible, setModalVisible] = useState(false);


    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    // Форма
    const [newName, setNewName] = useState('');
    const [newNumber, setNewNumber] = useState('');
    const [newPosition, setNewPosition] = useState<'GK' | 'DEF' | 'MID' | 'FWD'>('MID');

    const filteredPlayers = filter === 'ALL'
        ? players
        : players.filter(p => p.position === filter);

    const handleDelete = (id: string) => {
        Alert.alert(
            "Видалення гравця",
            "Ви впевнені? Це дію не можна скасувати.",
            [
                { text: "Скасувати", style: "cancel" },
                {
                    text: "Видалити",
                    style: 'destructive',
                    onPress: () => {
                        setPlayers(prev => prev.filter(p => p.id !== id));
                        setSelectedPlayer(null); // Якщо були на сторінці гравця - виходимо
                    }
                }
            ]
        );
    };

    const handleAddPlayer = () => {
        if (!newName || !newNumber) {
            Alert.alert("Помилка", "Введіть ім'я та номер гравця");
            return;
        }

        const newPlayer: Player = {
            id: Date.now().toString(),
            name: newName,
            number: newNumber,
            position: newPosition,
            photoUrl: `https://placehold.co/100/1e293b/fbbf24?text=${newPosition}`,
            stats: { bestTime: '--', lastTime: '--', totalSessions: 0 }
        };

        setPlayers([newPlayer, ...players]);
        setNewName('');
        setNewNumber('');
        setModalVisible(false);
    };

    const getPositionIcon = (pos: string) => {
        switch (pos) {
            case 'GK': return 'hand-back-left';
            case 'DEF': return 'shield-check';
            case 'MID': return 'shoe-cleat';
            case 'FWD': return 'target';
            default: return 'soccer';
        }
    };

    if (selectedPlayer) {
        return (
            <InfoScreen
                player={selectedPlayer}
                onBack={() => setSelectedPlayer(null)} // Кнопка назад зануляє вибраного гравця
                onDelete={handleDelete}
            />
        );
    }

    const renderPlayerCard = ({ item }: { item: Player }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedPlayer(item)}
            className="bg-slate-800 mb-4 rounded-2xl p-4 flex-row items-center border border-slate-700 shadow-md overflow-hidden relative"
        >
            <Image source={{ uri: item.photoUrl }} className="w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-600 mr-4" />

            <View className="flex-1 z-10">
                <Text className="text-white text-lg font-bold">{item.name}</Text>
                <View className="flex-row items-center mt-1.5">
                    <View className="bg-yellow-500/20 px-2 py-1 rounded flex-row items-center mr-3 border border-yellow-500/30">
                        {/* @ts-ignore */}
                        <MaterialCommunityIcons name={getPositionIcon(item.position)} size={12} color="#facc15" style={{ marginRight: 4 }} />
                        <Text className="text-yellow-400 text-xs font-bold">{item.position}</Text>
                    </View>
                </View>
            </View>

            <Text className="text-yellow-400/20 text-6xl font-black italic absolute -right-2 -bottom-2 z-0 transform -rotate-6">
                {item.number}
            </Text>

            <Feather name="chevron-right" size={24} color="#475569" className="z-20" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 px-4 pt-4 relative bg-slate-900">

            <View className="flex-row justify-between items-end mb-4">
                <View className="flex-row items-center">
                    <Ionicons name="people" size={28} color="white" style={{ marginRight: 10 }} />
                    <Text className="text-white text-3xl font-bold">Команда</Text>
                </View>
                <View className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    <Text className="text-slate-400 text-sm font-bold">{filteredPlayers.length} гравців</Text>
                </View>
            </View>


            <View className="mb-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {POSITIONS.map((pos) => (
                        <TouchableOpacity
                            key={pos}
                            onPress={() => setFilter(pos)}
                            className={`mr-3 px-4 py-2 rounded-xl border ${filter === pos ? 'bg-yellow-400 border-yellow-400' : 'bg-slate-800 border-slate-700'}`}
                        >
                            <Text className={`font-bold text-xs ${filter === pos ? 'text-slate-900' : 'text-slate-400'}`}>
                                {pos === 'ALL' ? 'Всі гравці' : pos}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredPlayers}
                keyExtractor={(item) => item.id}
                renderItem={renderPlayerCard}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            />


            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="absolute bottom-6 right-6 bg-yellow-400 w-16 h-16 rounded-full items-center justify-center shadow-lg shadow-yellow-400/30 z-50"
            >
                <Feather name="plus" size={32} color="#0f172a" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/80">
                    <View className="bg-slate-900 rounded-t-3xl p-6 border-t border-slate-700 h-[60%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-xl font-bold">Новий гравець</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-slate-400 text-xs uppercase font-bold mb-2 ml-1">ПІБ Гравця</Text>
                        <TextInput value={newName} onChangeText={setNewName} className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 mb-4 text-lg" placeholder="Наприклад: Олександр Усик" placeholderTextColor="#475569" />

                        <Text className="text-slate-400 text-xs uppercase font-bold mb-2 ml-1">Номер</Text>
                        <TextInput value={newNumber} onChangeText={setNewNumber} keyboardType="numeric" className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 mb-6 text-lg" placeholder="XX" placeholderTextColor="#475569" />

                        <Text className="text-slate-400 text-xs uppercase font-bold mb-2 ml-1">Позиція</Text>
                        <View className="flex-row justify-between mb-8">
                            {['GK', 'DEF', 'MID', 'FWD'].map((pos) => (
                                // @ts-ignore
                                <TouchableOpacity key={pos} onPress={() => setNewPosition(pos)} className={`w-[23%] py-3 rounded-xl items-center border ${newPosition === pos ? 'bg-yellow-400 border-yellow-400' : 'bg-slate-800 border-slate-700'}`}>
                                    <Text className={`font-bold ${newPosition === pos ? 'text-slate-900' : 'text-slate-400'}`}>{pos}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity onPress={handleAddPlayer} className="bg-yellow-400 p-4 rounded-xl items-center">
                            <Text className="text-slate-900 font-bold text-lg uppercase">Додати до складу</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}