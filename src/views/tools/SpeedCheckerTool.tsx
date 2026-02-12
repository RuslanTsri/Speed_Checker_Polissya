import React from 'react';
import { View } from 'react-native';

// Екрани
import SpeedCheckerModeSelector from './TempoMetrics/SpeedCheckerModeSelector';
import QuickTestConfig from './TempoMetrics/QuickTestConfig';
import TeamSelector from './TempoMetrics/TeamSelector';
import PlayerSelector from './TempoMetrics/PlayerSelector';
import SpeedTestRun from './TempoMetrics/SpeedTestRun';


import { useSpeedCheckerRouter } from '../../hooks/tools/useSpeedCheckerRouter';

interface SpeedCheckerToolProps {
    onBack: () => void;
}

export default function SpeedCheckerTool({ onBack }: SpeedCheckerToolProps) {
    const {
        currentScreen,
        testConfig,
        handleModeSelect,
        handleTeamSelect,
        handlePlayersSelect,
        handleStartTest,
        handleBackFromConfig,
        handleBackFromPlayers,
        handleBackFromTeam,
        handleBackFromRun
    } = useSpeedCheckerRouter();

    switch (currentScreen) {
        case 'MODE_SELECT':
            return <SpeedCheckerModeSelector onBack={onBack} onSelect={handleModeSelect} />;

        case 'TEAM_SELECT':
            return <TeamSelector onBack={handleBackFromTeam} onSelect={handleTeamSelect} />;

        case 'PLAYER_SELECT':
            return <PlayerSelector onBack={handleBackFromPlayers} onSelect={handlePlayersSelect} />;

        case 'QUICK_CONFIG':
            return (
                <QuickTestConfig
                    onBack={handleBackFromConfig}
                    onStart={handleStartTest}
                    testType={testConfig.type}
                    selectedPlayersCount={testConfig.selectedPlayers.length}
                />
            );

        case 'TEST_RUN':
            return (
                <SpeedTestRun
                    config={testConfig}
                    onBack={handleBackFromRun}
                    onFinish={onBack} // По завершенню повертаємося в головне меню (або можна на результати)
                />
            );

        default:
            return null;
    }
}