import { useState } from 'react';
import { Alert } from 'react-native';

const DUMMY_PLAYERS = Array.from({ length: 10 }).map((_, i) => ({
    id: i.toString(),
    name: `Гравець ${i + 1}`,
    number: i + 1
}));

export const usePlayerSelection = () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isAddModalVisible, setAddModalVisible] = useState(false);

    // Тут в майбутньому буде запит до бази даних за ID команди
    const players = DUMMY_PLAYERS;

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedIds.length === players.length) setSelectedIds([]);
        else setSelectedIds(players.map(p => p.id));
    };

    const handleImport = () => Alert.alert("Імпорт", "Функція в розробці");

    return {
        players,
        selectedIds,
        toggleSelection,
        toggleAll,
        isEmpty: players.length === 0,
        isAddModalVisible,
        setAddModalVisible,
        handleImport
    };
};