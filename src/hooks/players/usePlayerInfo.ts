import { Alert } from 'react-native';

export interface Player {
    id: string;
    name: string;
    number: string;
    position: 'GK' | 'DEF' | 'MID' | 'FWD';
    photoUrl: string;
    stats?: {
        bestTime: string;
        lastTime: string;
        totalSessions: number;
    }
}

export const usePlayerInfo = (player: Player, onBack: () => void, onDelete: (id: string) => void) => {

    // Логіка підтвердження видалення
    const handleDeletePress = () => {
        Alert.alert(
            "Видалити гравця?",
            `Ви впевнені, що хочете видалити гравця ${player.name}? Вся статистика буде втрачена.`,
            [
                { text: "Скасувати", style: "cancel" },
                {
                    text: "Видалити",
                    style: "destructive",
                    onPress: () => onDelete(player.id)
                }
            ]
        );
    };

    // Форматування позиції для UI
    const positionLabel = {
        'GK': 'Воротар',
        'DEF': 'Захисник',
        'MID': 'Півзахисник',
        'FWD': 'Нападник'
    }[player.position] || player.position;

    return {
        player,
        positionLabel,
        handleDeletePress,
        handleBack: onBack
    };
};