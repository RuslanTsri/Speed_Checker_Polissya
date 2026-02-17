import { useState, useEffect, useMemo } from 'react';
import { teamService } from '../../services/teamService';

export interface TeamCardData {
    id: string;
    teamName: string;
    playerCount: number;
    hasResults: boolean;
}

export const useTeamsList = (searchQuery: string) => {
    const [teams, setTeams] = useState<TeamCardData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        setIsLoading(true);
        const { data } = await teamService.getMyTeamsWithStatus();
        if (data) setTeams(data);
        setIsLoading(false);
    };

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