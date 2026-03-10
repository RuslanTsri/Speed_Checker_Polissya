import React from 'react';
import { View } from 'react-native';
import SpeedCheckerModeSelector from './TempoMetrics/SpeedCheckerModeSelector';
import QuickTestConfig from './TempoMetrics/QuickTestConfig';
import TeamSelector from './TempoMetrics/TeamSelector';
import PlayerSelector from './TempoMetrics/PlayerSelector';
import SpeedTestRun from './TempoMetrics/SpeedTestRun';
import { useSpeedCheckerRouter } from '../../hooks/tools/useSpeedCheckerRouter';

const ScreenContainer = ({ children }: { children: React.ReactNode }) => (
    <View className="flex-1">{children}</View>
);

export default function SpeedCheckerTool({ onBack, onOpenBluetooth }: { onBack: () => void, onOpenBluetooth: () => void }) {
    const {
        currentScreen, testConfig, handleModeSelect, handleTeamSelect,
        handlePlayersSelect, handleStartTest, handleBackFromConfig,
        handleBackFromPlayers, handleBackFromTeam, handleBackFromRun
    } = useSpeedCheckerRouter();

    switch (currentScreen) {
        case 'MODE_SELECT':
            return (
                <ScreenContainer>
                    <SpeedCheckerModeSelector
                        onBack={onBack}
                        onSelect={handleModeSelect}
                        onOpenBluetooth={onOpenBluetooth}
                    />
                </ScreenContainer>
            );
        case 'TEAM_SELECT':
            return (
                <ScreenContainer>
                    <TeamSelector onBack={handleBackFromTeam} onSelect={handleTeamSelect} />
                </ScreenContainer>
            );
        case 'PLAYER_SELECT':
            return (
                <ScreenContainer>
                    <PlayerSelector teamId={testConfig.teamId || ''} onBack={handleBackFromPlayers} onSelect={handlePlayersSelect} />
                </ScreenContainer>
            );
        case 'QUICK_CONFIG':
            return (
                <ScreenContainer>
                    <QuickTestConfig onBack={handleBackFromConfig} onStart={handleStartTest} playerCount={testConfig.selectedPlayers.length} testType={testConfig.type} onOpenBluetooth={onOpenBluetooth} />
                </ScreenContainer>
            );
        case 'TEST_RUN':
            return (
                <ScreenContainer>
                    <SpeedTestRun config={testConfig} onBack={handleBackFromRun} onFinish={onBack} />
                </ScreenContainer>
            );
        default:
            return null;
    }
}