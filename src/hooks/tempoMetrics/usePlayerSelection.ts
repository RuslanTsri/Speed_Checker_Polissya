import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { playerService, Player } from '../../services/playerService';
import { syncManager } from '../../services/SyncManager'; // 🔥 Додали імпорт

export const usePlayerSelection = (teamId: string) => {
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isAddModalVisible, setAddModalVisible] = useState(false);

    const loadPlayers = async () => {
        setIsLoading(true);
        // Запит до сервісу (він сам розбереться з офлайн/онлайн)
        const { data, error } = await playerService.getByTeam(teamId);

        if (error) {
            Alert.alert("Помилка", "Не вдалося завантажити гравців");
        } else {
            setAllPlayers(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (teamId) {
            loadPlayers();
        }
    }, [teamId]);

    // 🔥 АВТО-ОНОВЛЕННЯ ПІСЛЯ СИНХРОНІЗАЦІЇ
    useEffect(() => {
        const unsubscribe = syncManager.subscribe(() => {
            if (!syncManager.getIsSyncing() && teamId) {
                console.log("♻️ [usePlayerSelection] Синхронізація завершена, оновлюємо гравців...");
                loadPlayers();
            }
        });
        return unsubscribe;
    }, [teamId]);

    const filteredPlayers = useMemo(() => {
        return allPlayers.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [allPlayers, search]);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const toggleAll = () => {
        if (selectedIds.length === allPlayers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(allPlayers.map(p => p.id || ''));
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
        setAddModalVisible,
        handleImport
    };
};