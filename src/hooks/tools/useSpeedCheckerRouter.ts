import { useState } from 'react';
import { Player } from '../../services/playerService'; // Імпорт типу Player

export type SpeedCheckerScreen =
    | 'MODE_SELECT' | 'QUICK_CONFIG' | 'TEAM_SELECT' | 'PLAYER_SELECT' | 'TEST_RUN';

export interface TestConfig {
    mode: 'DEVICE' | 'MANUAL';
    type: 'QUICK' | 'TEAM';
    distance: number;
    teamId: string | null;
    teamName: string;             // 🔥 Додали ім'я команди
    selectedPlayers: Player[];    // 🔥 Зберігаємо цілі об'єкти гравців, а не просто ID
}

export const useSpeedCheckerRouter = () => {
    const [currentScreen, setCurrentScreen] = useState<SpeedCheckerScreen>('MODE_SELECT');

    const [testConfig, setTestConfig] = useState<TestConfig>({
        mode: 'DEVICE',
        type: 'QUICK',
        distance: 30,
        teamId: null,
        teamName: 'Вільне тренування',
        selectedPlayers: []
    });

    const goToModeSelect = () => setCurrentScreen('MODE_SELECT');

    const handleModeSelect = (mode: 'DEVICE' | 'MANUAL', type: 'QUICK' | 'TEAM') => {
        setTestConfig(prev => ({ ...prev, mode, type }));
        setCurrentScreen(type === 'QUICK' ? 'QUICK_CONFIG' : 'TEAM_SELECT');
    };

    // 🔥 Отримуємо ще й назву команди
    const handleTeamSelect = (teamId: string, teamName: string) => {
        setTestConfig(prev => ({ ...prev, teamId, teamName }));
        setCurrentScreen('PLAYER_SELECT');
    };

    // 🔥 Отримуємо масив об'єктів гравців
    const handlePlayersSelect = (players: Player[]) => {
        setTestConfig(prev => ({ ...prev, selectedPlayers: players }));
        setCurrentScreen('QUICK_CONFIG');
    };

    const handleStartTest = (distance: number) => {
        // Якщо режим швидкий і гравців немає - додаємо "Гостя"
        if (testConfig.type === 'QUICK' && testConfig.selectedPlayers.length === 0) {
            setTestConfig(prev => ({
                ...prev,
                distance,
                selectedPlayers: [{ id: 'guest', name: 'Гість', team_id: '' }]
            }));
        } else {
            setTestConfig(prev => ({ ...prev, distance }));
        }
        setCurrentScreen('TEST_RUN');
    };

    // Навігація назад (без змін)
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