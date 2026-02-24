import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Player } from '../../services/playerService';

export type SpeedCheckerScreen = 'MODE_SELECT' | 'QUICK_CONFIG' | 'TEAM_SELECT' | 'PLAYER_SELECT' | 'TEST_RUN';

export interface TestConfig {
    mode: 'DEVICE' | 'MANUAL'; type: 'QUICK' | 'TEAM'; distance: number; teamId: string | null; teamName: string; selectedPlayers: Player[];
}

export const useSpeedCheckerRouter = () => {
    const { t } = useTranslation();
    const [currentScreen, setCurrentScreen] = useState<SpeedCheckerScreen>('MODE_SELECT');

    // 🔥 Використовуємо функцію-ініціалізатор, щоб переклад підтягнувся коректно
    const [testConfig, setTestConfig] = useState<TestConfig>(() => ({
        mode: 'DEVICE', type: 'QUICK', distance: 30, teamId: null,
        teamName: t('tools.speed_checker.free_training') as string,
        selectedPlayers: []
    }));

    const goToModeSelect = () => setCurrentScreen('MODE_SELECT');

    const handleModeSelect = (mode: 'DEVICE' | 'MANUAL', type: 'QUICK' | 'TEAM') => {
        setTestConfig(prev => ({ ...prev, mode, type }));
        setCurrentScreen(type === 'QUICK' ? 'QUICK_CONFIG' : 'TEAM_SELECT');
    };

    const handleTeamSelect = (teamId: string, teamName: string) => {
        setTestConfig(prev => ({ ...prev, teamId, teamName }));
        setCurrentScreen('PLAYER_SELECT');
    };

    const handlePlayersSelect = (players: Player[]) => {
        setTestConfig(prev => ({ ...prev, selectedPlayers: players }));
        setCurrentScreen('QUICK_CONFIG');
    };

    const handleStartTest = (distance: number) => {
        if (testConfig.type === 'QUICK' && testConfig.selectedPlayers.length === 0) {
            setTestConfig(prev => ({
                ...prev, distance,
                selectedPlayers: [{ id: 'guest', name: t('tools.speed_checker.guest') as string, team_id: '' }]
            }));
        } else {
            setTestConfig(prev => ({ ...prev, distance }));
        }
        setCurrentScreen('TEST_RUN');
    };

    const handleBackFromConfig = () => setCurrentScreen(testConfig.type === 'QUICK' ? 'MODE_SELECT' : 'PLAYER_SELECT');
    const handleBackFromPlayers = () => setCurrentScreen('TEAM_SELECT');
    const handleBackFromTeam = () => setCurrentScreen('MODE_SELECT');
    const handleBackFromRun = () => setCurrentScreen('QUICK_CONFIG');

    return {
        currentScreen, testConfig, goToModeSelect, handleModeSelect,
        handleTeamSelect, handlePlayersSelect, handleStartTest,
        handleBackFromConfig, handleBackFromPlayers, handleBackFromTeam, handleBackFromRun
    };
};