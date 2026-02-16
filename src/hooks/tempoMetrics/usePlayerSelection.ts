import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { playerService, Player } from '../../services/playerService';

export const usePlayerSelection = (teamId: string) => {
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Для модалок додавання (якщо список пустий)
    const [isAddModalVisible, setAddModalVisible] = useState(false);

    useEffect(() => {
        if (teamId) {
            loadPlayers();
        }
    }, [teamId]);

    const loadPlayers = async () => {
        setIsLoading(true);
        const { data, error } = await playerService.getByTeam(teamId);

        if (error) {
            Alert.alert("Помилка", "Не вдалося завантажити гравців");
        } else {
            // Сортуємо за іменем
            setAllPlayers(data || []);
        }
        setIsLoading(false);
    };

    // Фільтрація
    const filteredPlayers = useMemo(() => {
        return allPlayers.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [allPlayers, search]);

    // Логіка вибору (Toggle Selection)
    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Обрати всіх / Зняти вибір з усіх
    const toggleAll = () => {
        if (selectedIds.length === allPlayers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(allPlayers.map(p => p.id || '')); // id optional у типі, але в базі точно є
        }
    };

    const handleImport = () => {
        Alert.alert("Інфо", "Тут відкриється імпорт CSV (використайте логіку з PlayersScreen)");
    };

    return {
        players: filteredPlayers,
        selectedIds,
        search,
        setSearch,
        toggleSelection,
        toggleAll,
        isEmpty: allPlayers.length === 0 && !isLoading,
        isLoading,
        // Для Empty State
        setAddModalVisible,
        handleImport
    };
};