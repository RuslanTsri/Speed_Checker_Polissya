import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { teamService } from '../../services/teamService';
import { syncManager } from '../../services/SyncManager';

export interface UITeamItem { id: string; name: string; players: number; lastSession: string; }

export const useTeamSelection = () => {
    const { t } = useTranslation();
    const [teams, setTeams] = useState<UITeamItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 🔥 Додано параметр silent
    const loadTeams = async (silent = false) => {
        if (!silent) setIsLoading(true);

        const { data, error } = await teamService.getMyTeams();

        if (error) {
            if (!silent) Alert.alert(t('tools.speed_checker.alert_error') as string, t('tools.speed_checker.error_load_teams') as string);
        } else {
            const formattedTeams: UITeamItem[] = (data || []).map((team: any) => ({
                id: team.id, name: team.name, players: team.players ? team.players.length : 0, lastSession: t('tools.speed_checker.no_data') as string
            }));
            setTeams(formattedTeams);
        }

        if (!silent) setIsLoading(false);
    };

    // При першому завантаженні екрану - показуємо лоадер
    useEffect(() => { loadTeams(); }, []);

    // При фоновій синхронізації - оновлюємо ТИХО
    useEffect(() => {
        const unsubscribe = syncManager.subscribe(() => {
            if (!syncManager.getIsSyncing()) {
                loadTeams(true); // 🔥 true = silent
            }
        });
        return unsubscribe;
    }, []);

    const filteredTeams = useMemo(() => teams.filter(team => team.name.toLowerCase().includes(search.toLowerCase())), [teams, search]);

    return { teams: filteredTeams, search, setSearch, selectedId, setSelectedId, isLoading };
};