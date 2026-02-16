import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { teamService } from '../../services/teamService';

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

    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        setIsLoading(true);
        const { data, error } = await teamService.getMyTeams();

        if (error) {
            Alert.alert("Помилка", "Не вдалося завантажити команди");
        } else {
            // Мапимо дані з Supabase у формат для UI
            const formattedTeams: UITeamItem[] = (data || []).map((t: any) => ({
                id: t.id,
                name: t.name,
                // Supabase повертає масив об'єктів гравців, беремо довжину
                players: t.players ? t.players.length : 0,
                lastSession: 'Немає даних' // Поки заглушка, бо в teamService цього немає
            }));
            setTeams(formattedTeams);
        }
        setIsLoading(false);
    };

    // Фільтрація пошуку
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