import { useState } from 'react';

type SpeedCheckerScreen = 'MODE_SELECT' | 'QUICK_CONFIG' | 'TEAM_SELECT' | 'PLAYER_SELECT' | 'TEST_RUN';

export const useSpeedCheckerRouter = () => {
    const [currentScreen, setCurrentScreen] = useState<SpeedCheckerScreen>('MODE_SELECT');

    const [testConfig, setTestConfig] = useState({
        mode: 'DEVICE' as 'DEVICE' | 'MANUAL',
        type: 'QUICK' as 'QUICK' | 'TEAM',
        distance: 30,
        teamId: null as string | null,
        selectedPlayers: [] as string[]
    });

    const goToModeSelect = () => setCurrentScreen('MODE_SELECT');

    const handleModeSelect = (mode: 'DEVICE' | 'MANUAL', type: 'QUICK' | 'TEAM') => {
        setTestConfig(prev => ({ ...prev, mode, type }));
        setCurrentScreen(type === 'QUICK' ? 'QUICK_CONFIG' : 'TEAM_SELECT');
    };

    const handleTeamSelect = (teamId: string) => {
        setTestConfig(prev => ({ ...prev, teamId }));
        setCurrentScreen('PLAYER_SELECT');
    };

    const handlePlayersSelect = (playerIds: string[]) => {
        setTestConfig(prev => ({ ...prev, selectedPlayers: playerIds }));
        setCurrentScreen('QUICK_CONFIG');
    };

    const handleStartTest = (distance: number) => {
        setTestConfig(prev => ({ ...prev, distance }));
        setCurrentScreen('TEST_RUN');
    };

    const handleBackFromConfig = () => {
        setCurrentScreen(testConfig.type === 'QUICK' ? 'MODE_SELECT' : 'PLAYER_SELECT');
    };

    const handleBackFromPlayers = () => setCurrentScreen('TEAM_SELECT');
    const handleBackFromTeam = () => setCurrentScreen('MODE_SELECT');
    const handleBackFromRun = () => setCurrentScreen('QUICK_CONFIG');

    return {
        currentScreen,
        testConfig,
        goToModeSelect,
        handleModeSelect,
        handleTeamSelect,
        handlePlayersSelect,
        handleStartTest,
        handleBackFromConfig,
        handleBackFromPlayers,
        handleBackFromTeam,
        handleBackFromRun
    };
};