import React, { useState } from 'react';
import { View } from 'react-native';

// Імпорти наших під-екранів
import SpeedCheckerModeSelector from './SpeedChecker/SpeedCheckerModeSelector';
import QuickTestConfig from './SpeedChecker/QuickTestConfig';
import TeamSelector from './SpeedChecker/TeamSelector';
import PlayerSelector from './SpeedChecker/PlayerSelector';
import SpeedTestRun from './SpeedChecker/SpeedTestRun';

// Типи екранів
type SpeedCheckerScreen =
    | 'MODE_SELECT'
    | 'QUICK_CONFIG'
    | 'TEAM_SELECT'
    | 'PLAYER_SELECT'
    | 'TEST_RUN';

// 🔥 ВИПРАВЛЕНО: Головний тул приймає тільки onBack
interface SpeedCheckerToolProps {
    onBack: () => void;
}

export default function SpeedCheckerTool({ onBack }: SpeedCheckerToolProps) {
    const [currentScreen, setCurrentScreen] = useState<SpeedCheckerScreen>('MODE_SELECT');

    // Стан конфігурації тесту
    const [testConfig, setTestConfig] = useState({
        mode: 'DEVICE' as 'DEVICE' | 'MANUAL',
        type: 'QUICK' as 'QUICK' | 'TEAM',
        distance: 30,
        teamId: null as string | null,
        selectedPlayers: [] as string[]
    });

    // --- НАВІГАЦІЯ ---

    const handleModeSelect = (mode: 'DEVICE' | 'MANUAL', type: 'QUICK' | 'TEAM') => {
        setTestConfig(prev => ({ ...prev, mode, type }));
        if (type === 'QUICK') {
            setCurrentScreen('QUICK_CONFIG');
        } else {
            setCurrentScreen('TEAM_SELECT');
        }
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

    // --- РЕНДЕР ---
    switch (currentScreen) {
        case 'MODE_SELECT':
            return <SpeedCheckerModeSelector onBack={onBack} onSelect={handleModeSelect} />;

        case 'TEAM_SELECT':
            return <TeamSelector onBack={() => setCurrentScreen('MODE_SELECT')} onSelect={handleTeamSelect} />;

        case 'PLAYER_SELECT':
            return <PlayerSelector onBack={() => setCurrentScreen('TEAM_SELECT')} onSelect={handlePlayersSelect} />;

        case 'QUICK_CONFIG':
            return (
                <QuickTestConfig
                    onBack={() => setCurrentScreen(testConfig.type === 'QUICK' ? 'MODE_SELECT' : 'PLAYER_SELECT')}
                    onStart={handleStartTest}
                    testType={testConfig.type}
                    selectedPlayersCount={testConfig.selectedPlayers.length}
                />
            );

        case 'TEST_RUN':
            return (
                <SpeedTestRun
                    config={testConfig}
                    onBack={() => setCurrentScreen('QUICK_CONFIG')}
                    onFinish={() => setCurrentScreen('MODE_SELECT')}
                />
            );

        default:
            return null;
    }
}