import { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services/teamService';
import { syncManager } from '../../services/SyncManager';

export interface TeamCardData {
    id: string;
    teamName: string;
    playerCount: number;
    hasResults: boolean;
}

export const useTeamsList = (searchQuery: string) => {
    const [teams, setTeams] = useState<TeamCardData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadTeams = async () => {
        setIsLoading(true);
        const { data } = await teamService.getMyTeamsWithStatus();
        if (data) setTeams(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadTeams();
    }, []);

    // 🔥 АВТО-ОНОВЛЕННЯ ПІСЛЯ СИНХРОНІЗАЦІЇ
    useEffect(() => {
        const unsubscribe = syncManager.subscribe(() => {
            if (!syncManager.getIsSyncing()) {
                console.log("♻️ [useTeamsList] Синхронізація завершена, оновлюємо список команд...");
                loadTeams();
            }
        });
        return unsubscribe;
    }, []);

    const filteredTeams = useMemo(() => {
        if (!searchQuery) return teams;
        return teams.filter(t =>
            t.teamName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [teams, searchQuery]);

    return {
        teams: filteredTeams,
        isLoading,
        refresh: loadTeams
    };
};