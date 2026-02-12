import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppModal } from '../components/AppModal';

// --- МОДЕЛІ ДАНИХ ---
interface Team {
    id: string;
    name: string;
    lastSessionDate: string;
}

interface Player {
    id: string;
    teamId: string;
    name: string;
    stats?: {
        bestTime: string;
        lastTime: string;
    }
}

// --- МОКОВІ ДАНІ ---
const DUMMY_TEAMS: Team[] = [
    { id: 't1', name: 'ФК «Динамо» U17', lastSessionDate: 'Вчора' },
    { id: 't2', name: 'СДЮШОР «Зміна»', lastSessionDate: 'Немає даних' },
];

const DUMMY_PLAYERS: Player[] = [
    { id: 'p1', teamId: 't1', name: 'Денис Бойко' },
    { id: 'p2', teamId: 't1', name: 'Артем Шабанов' },
    { id: 'p3', teamId: 't1', name: 'Богдан Кушніренко' },
];

// 🔥 Мокова роль користувача (зміни на реальну з контексту/хука авторизації)
const USER_ROLE: 'admin' | 'coach' | 'viewer' = 'admin';

export default function PlayersScreen() {
    // --- СТАНИ ДЛЯ ДАНИХ ---
    const [teams, setTeams] = useState<Team[]>(DUMMY_TEAMS);
    const [players, setPlayers] = useState<Player[]>(DUMMY_PLAYERS);

    // --- СТАН НАВІГАЦІЇ ---
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- СТАНИ МОДАЛОК ---
    const [isAddTeamModalVisible, setAddTeamModalVisible] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [isAddPlayerOptionsVisible, setAddPlayerOptionsVisible] = useState(false);
    const [isAddManualVisible, setAddManualVisible] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [isImportVisible, setImportVisible] = useState(false);

    const [isDropdownVisible, setDropdownVisible] = useState(false);

    // ==========================================
    // ЛОГІКА КОМАНД
    // ==========================================
    const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleCreateTeam = () => {
        if (!newTeamName.trim()) return;
        const newTeam: Team = {
            id: Date.now().toString(),
            name: newTeamName.trim(),
            lastSessionDate: 'Ще не було'
        };
        setTeams([newTeam, ...teams]);
        setNewTeamName('');
        setAddTeamModalVisible(false);
    };

    const handleDeleteTeam = () => {
        setDropdownVisible(false); // Закриваємо меню
        if (USER_ROLE !== 'admin') {
            Alert.alert("Відмовлено в доступі", "Тільки адміністратор або власник може видалити команду.");
            return;
        }

        Alert.alert(
            "Видалення команди",
            `Ви дійсно хочете видалити команду "${selectedTeam?.name}" та всіх її гравців? Цю дію не можна скасувати.`,
            [
                { text: "Скасувати", style: "cancel" },
                {
                    text: "Видалити",
                    style: "destructive",
                    onPress: () => {
                        if (!selectedTeam) return;
                        // Видаляємо команду
                        setTeams(prev => prev.filter(t => t.id !== selectedTeam.id));
                        // Видаляємо гравців команди
                        setPlayers(prev => prev.filter(p => p.teamId !== selectedTeam.id));
                        // Повертаємось на головний екран
                        setSelectedTeam(null);
                    }
                }
            ]
        );
    };

    const handleEditTeam = () => {
        setDropdownVisible(false);
        Alert.alert("Редагування", "Функціонал зміни назви команди в розробці.");
    };

    // ==========================================
    // ЛОГІКА ГРАВЦІВ
    // ==========================================
    const teamPlayers = players.filter(p => p.teamId === selectedTeam?.id);

    const handleAddManualPlayer = () => {
        if (!newPlayerName.trim() || !selectedTeam) return;
        const newPlayer: Player = {
            id: Date.now().toString(),
            teamId: selectedTeam.id,
            name: newPlayerName.trim(),
        };
        setPlayers([newPlayer, ...players]);
        setNewPlayerName('');
        setAddManualVisible(false);
    };

    const handleMockImport = () => {
        Alert.alert("Імпорт", "Тут буде логіка парсингу CSV файлу. Поки що додамо 2 тестових гравців.");
        if (!selectedTeam) return;

        const newP1: Player = { id: Date.now().toString() + '1', teamId: selectedTeam.id, name: 'Імпортований Гравець 1' };
        const newP2: Player = { id: Date.now().toString() + '2', teamId: selectedTeam.id, name: 'Імпортований Гравець 2' };

        setPlayers([...players, newP1, newP2]);
        setImportVisible(false);
        setAddPlayerOptionsVisible(false);
    };

    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name ? name[0].toUpperCase() : 'Г';
    };

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

                <Modal visible={isDropdownVisible} transparent animationType="fade">
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={() => setDropdownVisible(false)}
                    >
                        {/* Позиціонування меню в правому верхньому куті */}
                        <View className="absolute top-16 right-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden min-w-[160px]">
                            <TouchableOpacity onPress={handleEditTeam} className="flex-row items-center px-4 py-3 border-b border-slate-700/50">
                                <Feather name="edit-2" size={16} color="#e2e8f0" style={{ marginRight: 10 }} />
                                <Text className="text-slate-200 font-medium text-sm">Змінити</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleDeleteTeam} className="flex-row items-center px-4 py-3">
                                <Feather name="trash-2" size={16} color="#ef4444" style={{ marginRight: 10 }} />
                                <Text className="text-red-400 font-medium text-sm">Видалити</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Статистика команди */}
                <View className="flex-row justify-between px-6 pb-4 border-b border-slate-800 mb-4">
                    <Text className="text-slate-400 text-xs font-bold tracking-widest">ГРАВЦІВ: {teamPlayers.length}</Text>
                    <Text className="text-slate-400 text-xs font-bold tracking-widest">ОСТАННЯ СЕСІЯ: {selectedTeam.lastSessionDate.toUpperCase()}</Text>
                </View>

                {/* Кнопка додавання */}
                <View className="flex-row px-4 mb-6 space-x-3">
                    <TouchableOpacity
                        onPress={() => setAddPlayerOptionsVisible(true)}
                        className="flex-1 bg-slate-900 border border-slate-700 py-3 rounded-xl flex-row justify-center items-center mr-2"
                    >
                        <Feather name="user-plus" size={16} color="#facc15" style={{ marginRight: 8 }} />
                        <Text className="text-white font-bold text-sm">Додати гравців</Text>
                    </TouchableOpacity>
                </View>

                {/* Список гравців */}
                <FlatList
                    data={teamPlayers}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <View className="bg-slate-900 mb-3 rounded-2xl p-4 flex-row items-center border border-slate-800">
                            <View className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center mr-4 border border-slate-700">
                                <Text className="text-slate-400 font-bold">{getInitials(item.name)}</Text>
                            </View>
                            <Text className="text-white text-base font-medium flex-1">{item.name}</Text>
                            <TouchableOpacity className="p-2">
                                <Feather name="edit-2" size={16} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-10">
                            <Feather name="users" size={48} color="#334155" />
                            <Text className="text-slate-500 mt-4">У цій команді ще немає гравців</Text>
                        </View>
                    )}
                />

                {/* МОДАЛКА 1: ОПЦІЇ ДОДАВАННЯ ГРАВЦЯ (Bottom) */}
                <AppModal type="bottom" visible={isAddPlayerOptionsVisible} onClose={() => setAddPlayerOptionsVisible(false)} title="Гравці">
                    <Text className="text-slate-400 text-xs mb-6 -mt-4">Команда: {selectedTeam.name}</Text>
                    <Text className="text-slate-400 text-center text-sm font-bold tracking-widest mb-6">ДОДАНО: <Text className="text-white">0</Text> ГРАВЦІВ</Text>

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

                    <TouchableOpacity className="flex-row justify-center items-center py-4 mb-6">
                        <Feather name="download" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                        <Text className="text-blue-400 font-bold">Завантажити шаблон</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setAddPlayerOptionsVisible(false)} className="bg-yellow-400 p-4 rounded-xl items-center shadow-lg shadow-yellow-400/20">
                        <Text className="text-slate-900 font-bold text-lg">Готово</Text>
                    </TouchableOpacity>
                </AppModal>

                {/* МОДАЛКА 2: РУЧНЕ ДОДАВАННЯ (Center) */}
                <AppModal type="center" visible={isAddManualVisible} onClose={() => setAddManualVisible(false)} title="Новий гравець">
                    <TextInput value={newPlayerName} onChangeText={setNewPlayerName} className="bg-slate-950 text-white p-4 rounded-xl border border-yellow-600/50 mb-6 text-base" placeholder="Ім'я та Прізвище" placeholderTextColor="#64748b" autoFocus />
                    <View className="flex-row space-x-3 mt-2">
                        <TouchableOpacity onPress={() => { setAddManualVisible(false); setNewPlayerName(''); }} className="flex-1 bg-slate-800 p-4 rounded-xl items-center mr-2"><Text className="text-slate-300 font-bold text-base">Скасувати</Text></TouchableOpacity>
                        <TouchableOpacity onPress={handleAddManualPlayer} className="flex-1 bg-yellow-600 p-4 rounded-xl items-center ml-2"><Text className="text-slate-900 font-bold text-base">Додати</Text></TouchableOpacity>
                    </View>
                </AppModal>

                {/* МОДАЛКА 3: ІМПОРТ (Bottom) */}
                <AppModal type="bottom" visible={isImportVisible} onClose={() => setImportVisible(false)} title="Імпорт гравців">
                    <View className="bg-slate-950 border border-slate-800 rounded-3xl p-5 mb-6 mt-2">
                        <Text className="text-white font-bold text-lg mb-1">Шаблон</Text>
                        <Text className="text-slate-500 text-sm mb-4">Завантажте шаблон і заповніть список гравців.</Text>
                        <View className="flex-row">
                            <TouchableOpacity className="flex-1 bg-slate-900 border border-slate-800 py-3 rounded-xl flex-row justify-center items-center mr-2"><Feather name="file-text" size={16} color="#4ade80" style={{ marginRight: 8 }} /><Text className="text-slate-300 font-bold text-sm">Excel (.xlsx)</Text></TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-slate-900 border border-slate-800 py-3 rounded-xl flex-row justify-center items-center ml-2"><Feather name="file-text" size={16} color="#60a5fa" style={{ marginRight: 8 }} /><Text className="text-slate-300 font-bold text-sm">CSV (.csv)</Text></TouchableOpacity>
                        </View>
                    </View>
                    <Text className="text-white font-bold text-lg mb-3">Файл для імпорту</Text>
                    <TouchableOpacity className="border border-dashed border-slate-700 bg-slate-950/50 rounded-3xl py-12 items-center justify-center mb-2">
                        <Feather name="upload" size={28} color="#94a3b8" className="mb-3" />
                        <Text className="text-blue-400 font-bold">Обрати файл</Text>
                    </TouchableOpacity>
                    <Text className="text-slate-500 text-xs mb-8">Оберіть заповнений Excel або CSV.</Text>
                    <TouchableOpacity onPress={handleMockImport} className="bg-yellow-400 p-4 rounded-xl items-center"><Text className="text-slate-900 font-bold text-lg">Продовжити</Text></TouchableOpacity>
                </AppModal>
            </View>
        );
    }

    // ==========================================
    // РЕНДЕР: 1. СПИСОК КОМАНД (Скрін 1)
    // ==========================================
    return (
        <View className="flex-1 bg-slate-950 pt-4 relative">

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 mb-6">
                {/* 🔥 Прибрали стрілку "назад" за твоїм проханням */}
                <Text className="text-white text-3xl font-bold flex-1">Команди</Text>

                <TouchableOpacity onPress={() => setAddTeamModalVisible(true)} className="w-10 h-10 bg-slate-900 rounded-full border border-slate-800 items-center justify-center">
                    <Feather name="plus" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="px-4 mb-6">
                <View className="bg-slate-900 flex-row items-center px-4 rounded-2xl border border-slate-800 h-14">
                    <Feather name="search" size={20} color="#64748b" className="mr-3" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Пошук команди"
                        placeholderTextColor="#64748b"
                        className="flex-1 text-white text-base h-full"
                    />
                </View>
            </View>

            {/* List of Teams */}
            <FlatList
                data={filteredTeams}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                renderItem={({ item }) => {
                    const count = players.filter(p => p.teamId === item.id).length;
                    return (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setSelectedTeam(item)}
                            className="bg-slate-900 p-5 rounded-3xl mb-4 border border-slate-800 flex-row justify-between items-center"
                        >
                            <View className="flex-1">
                                <Text className="text-white text-lg font-bold mb-1">{item.name}</Text>
                                <Text className="text-slate-400 text-sm">Гравців: {count} • {item.lastSessionDate}</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#64748b" />
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={() => (
                    <View className="items-center justify-center py-10">
                        <Feather name="shield" size={48} color="#334155" />
                        <Text className="text-slate-500 mt-4">Команд не знайдено</Text>
                    </View>
                )}
            />

            {/* МОДАЛКА 4: ДОДАТИ КОМАНДУ (Fullscreen) */}
            <AppModal type="fullscreen" visible={isAddTeamModalVisible} onClose={() => setAddTeamModalVisible(false)} title="Нова команда">
                <View className="mt-4">
                    <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-2 ml-1">Назва команди</Text>
                    <TextInput value={newTeamName} onChangeText={setNewTeamName} className={`bg-slate-900 text-white p-5 rounded-2xl text-lg mb-8 border ${newTeamName ? 'border-yellow-600/50' : 'border-slate-800'}`} placeholder="Наприклад: FC Polissya U-17" placeholderTextColor="#475569" autoFocus />
                    <TouchableOpacity onPress={handleCreateTeam} disabled={!newTeamName.trim()} className={`p-5 rounded-2xl items-center ${newTeamName.trim() ? 'bg-yellow-400' : 'bg-slate-800'}`}>
                        <Text className={`font-bold text-lg ${newTeamName.trim() ? 'text-slate-900' : 'text-slate-500'}`}>Створити команду</Text>
                    </TouchableOpacity>
                </View>
            </AppModal>
        </View>
    );
}