import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { playerService, Player } from '../../services/playerService';
import { syncManager } from '../../services/SyncManager';

export const usePlayerSelection = (teamId: string) => {
    const { t } = useTranslation();
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalVisible, setAddModalVisible] = useState(false);

    const loadPlayers = async (silent = false) => {
        if (!silent) setIsLoading(true);

        const { data, error } = await playerService.getByTeam(teamId);

        if (error) {
            if (!silent) Alert.alert(t('tools.speed_checker.alert_error') as string, t('tools.speed_checker.error_load_players') as string);
        } else {
            setAllPlayers(data || []);
        }

        if (!silent) setIsLoading(false);
    };

    useEffect(() => { if (teamId) loadPlayers(); }, [teamId]);

    useEffect(() => {
        const unsubscribe = syncManager.subscribe(() => {
            if (!syncManager.getIsSyncing() && teamId) {
                loadPlayers(true); // 🔥 true = silent
            }
        });
        return unsubscribe;
    }, [teamId]);

    const filteredPlayers = useMemo(() => allPlayers.filter(p => p.name.toLowerCase().includes(search.toLowerCase())), [allPlayers, search]);

    const toggleSelection = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    const toggleAll = () => setSelectedIds(selectedIds.length === allPlayers.length ? [] : allPlayers.map(p => p.id || ''));
    const handleImport = () => Alert.alert("Інфо", "Тут відкриється імпорт CSV");

    return { players: filteredPlayers, selectedIds, search, setSearch, toggleSelection, toggleAll, isEmpty: allPlayers.length === 0 && !isLoading, isLoading, setAddModalVisible, handleImport };
};