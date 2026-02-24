import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    // Логіка підтвердження видалення
    const handleDeletePress = () => {
        Alert.alert(
            t('screens.player_info.delete_title') as string,
            t('screens.player_info.delete_msg', { name: player.name }) as string,
            [
                { text: t('screens.player_info.btn_cancel') as string, style: "cancel" },
                {
                    text: t('screens.player_info.btn_delete') as string,
                    style: "destructive",
                    onPress: () => onDelete(player.id)
                }
            ]
        );
    };

    // Форматування позиції для UI
    const positionLabel = {
        'GK': t('screens.player_info.pos_gk') as string,
        'DEF': t('screens.player_info.pos_def') as string,
        'MID': t('screens.player_info.pos_mid') as string,
        'FWD': t('screens.player_info.pos_fwd') as string
    }[player.position] || player.position;

    return {
        player,
        positionLabel,
        handleDeletePress,
        handleBack: onBack
    };
};