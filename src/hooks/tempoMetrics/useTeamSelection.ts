import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { teamService } from '../../services/teamService';
import { syncManager } from '../../services/SyncManager'; // 🔥 Додали імпорт

export interface UITeamItem {
    id: string;
    name: string;
    players: number;
    lastSession: string;
}

export const useTeamSelection = () => {
    const [teams, setTeams] = useState<UITeamItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadTeams = async () => {
        setIsLoading(true);
        // Сервіс сам дістає з кешу або бази
        const { data, error } = await teamService.getMyTeams();

        if (error) {
            Alert.alert("Помилка", "Не вдалося завантажити команди");
        } else {
            const formattedTeams: UITeamItem[] = (data || []).map((t: any) => ({
                id: t.id,
                name: t.name,
                players: t.players ? t.players.length : 0,
                lastSession: 'Немає даних'
            }));
            setTeams(formattedTeams);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadTeams();
    }, []);

    // 🔥 АВТО-ОНОВЛЕННЯ ПІСЛЯ СИНХРОНІЗАЦІЇ
    useEffect(() => {
        const unsubscribe = syncManager.subscribe(() => {
            if (!syncManager.getIsSyncing()) {
                console.log("♻️ [useTeamSelection] Синхронізація завершена, оновлюємо команди...");
                loadTeams();
            }
        });
        return unsubscribe;
    }, []);

    const filteredTeams = useMemo(() => {
        return teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
    }, [teams, search]);

    return {
        teams: filteredTeams,
        search,
        setSearch,
        selectedId,
        setSelectedId,
        isLoading
    };
};