import { useState } from 'react';

const DUMMY_TEAMS = [
    { id: '1', name: 'ФК «Динамо» U17', players: 24, lastSession: 'Вчора' },
    { id: '2', name: 'СДЮШОР «Зміна»', players: 0, lastSession: null },
];

export const useTeamSelection = () => {
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    
    const filteredTeams = DUMMY_TEAMS.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    return {
        teams: filteredTeams,
        search,
        setSearch,
        selectedId,
        setSelectedId
    };
};