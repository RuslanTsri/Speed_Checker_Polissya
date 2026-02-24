import React from 'react';
import { View } from 'react-native';
import SpeedCheckerModeSelector from './TempoMetrics/SpeedCheckerModeSelector';
import QuickTestConfig from './TempoMetrics/QuickTestConfig';
import TeamSelector from './TempoMetrics/TeamSelector';
import PlayerSelector from './TempoMetrics/PlayerSelector';
import SpeedTestRun from './TempoMetrics/SpeedTestRun';
import { useSpeedCheckerRouter } from '../../hooks/tools/useSpeedCheckerRouter';
import { useTheme } from '../../context/ThemeContext';

// Динамічний контейнер
const ScreenContainer = ({ children, isDark }: { children: React.ReactNode, isDark: boolean }) => (
    <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>{children}</View>
);

export default function SpeedCheckerTool({ onBack }: { onBack: () => void }) {
    const { isDark } = useTheme();
    const {
        currentScreen, testConfig, handleModeSelect, handleTeamSelect,
        handlePlayersSelect, handleStartTest, handleBackFromConfig,
        handleBackFromPlayers, handleBackFromTeam, handleBackFromRun
    } = useSpeedCheckerRouter();

    switch (currentScreen) {
        case 'MODE_SELECT':
            return (
                <ScreenContainer isDark={isDark}>
                    <SpeedCheckerModeSelector onBack={onBack} onSelect={handleModeSelect} />
                </ScreenContainer>
            );
        case 'TEAM_SELECT':
            return (
                <ScreenContainer isDark={isDark}>
                    <TeamSelector onBack={handleBackFromTeam} onSelect={handleTeamSelect} />
                </ScreenContainer>
            );
        case 'PLAYER_SELECT':
            return (
                <ScreenContainer isDark={isDark}>
                    <PlayerSelector teamId={testConfig.teamId || ''} onBack={handleBackFromPlayers} onSelect={handlePlayersSelect} />
                </ScreenContainer>
            );
        case 'QUICK_CONFIG':
            return (
                <ScreenContainer isDark={isDark}>
                    <QuickTestConfig onBack={handleBackFromConfig} onStart={handleStartTest} playerCount={testConfig.selectedPlayers.length} testType={testConfig.type} />
                </ScreenContainer>
            );
        case 'TEST_RUN':
            return (
                <ScreenContainer isDark={isDark}>
                    <SpeedTestRun config={testConfig} onBack={handleBackFromRun} onFinish={onBack} />
                </ScreenContainer>
            );
        default:
            return null;
    }
}