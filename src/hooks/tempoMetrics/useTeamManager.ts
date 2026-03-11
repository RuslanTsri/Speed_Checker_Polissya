import { useState } from 'react';

const DUMMY_PLAYERS_DATA = Array.from({ length: 10 }).map((_, i) => ({
    id: i.toString(),
    name: `Гравець ${i + 1}`,
    number: i + 1
}));

export const useTeamManager = () => {
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
    const [isAddModalVisible, setAddModalVisible] = useState(false);

    const players = DUMMY_PLAYERS_DATA;

    const togglePlayerSelection = (id: string) => {
        setSelectedPlayerIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAllPlayers = () => {
        if (selectedPlayerIds.length === players.length) {
            setSelectedPlayerIds([]);
        } else {
            setSelectedPlayerIds(players.map(p => p.id));
        }
    };

    return {
        players,
        selectedPlayerIds,
        isAddModalVisible,
        setAddModalVisible,
        togglePlayerSelection,
        toggleAllPlayers,
        isEmpty: players.length === 0
    };
};