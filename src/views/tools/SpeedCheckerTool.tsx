import React from 'react';
import { View } from 'react-native';

import SpeedCheckerModeSelector from './TempoMetrics/SpeedCheckerModeSelector';
import QuickTestConfig from './TempoMetrics/QuickTestConfig';
import TeamSelector from './TempoMetrics/TeamSelector';
import PlayerSelector from './TempoMetrics/PlayerSelector';
import SpeedTestRun from './TempoMetrics/SpeedTestRun';

import { useSpeedCheckerRouter } from '../../hooks/tools/useSpeedCheckerRouter';

export default function SpeedCheckerTool({ onBack }: { onBack: () => void }) {
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

    const Container = ({ children }: { children: React.ReactNode }) => (
        <View className="flex-1 bg-slate-950">{children}</View>
    );

    switch (currentScreen) {
        case 'MODE_SELECT':
            return (
                <Container>
                    <SpeedCheckerModeSelector onBack={onBack} onSelect={handleModeSelect} />
                </Container>
            );

        case 'TEAM_SELECT':
            return (
                <Container>
                    <TeamSelector onBack={handleBackFromTeam} onSelect={handleTeamSelect} />
                </Container>
            );

        case 'PLAYER_SELECT':
            return (
                <Container>
                    <PlayerSelector
                        teamId={testConfig.teamId || ''}
                        onBack={handleBackFromPlayers}
                        onSelect={handlePlayersSelect}
                    />
                </Container>
            );

        case 'QUICK_CONFIG':
            return (
                <Container>
                    <QuickTestConfig
                        onBack={handleBackFromConfig}
                        onStart={handleStartTest}
                        // Передаємо параметри точно за іменами в інтерфейсі QuickTestConfig
                        playerCount={testConfig.selectedPlayers.length}
                        testType={testConfig.type}
                    />
                </Container>
            );

        case 'TEST_RUN':
            return (
                <Container>
                    <SpeedTestRun
                        config={testConfig}
                        onBack={handleBackFromRun}
                        onFinish={onBack}
                    />
                </Container>
            );

        default:
            return null;
    }
}