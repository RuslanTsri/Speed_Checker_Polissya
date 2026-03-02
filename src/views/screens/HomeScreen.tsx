import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import TimerTool from '../tools/TimerTool';
import BluetoothTool from '../tools/BluetoothTool';
import SpeedCheckerTool from '../tools/SpeedCheckerTool';
import { useHomeScreen } from '../../hooks/useHomeScreen';

import { Mod } from '../components/ui/mods';
import { Button } from '../components/ui/Button';
import { StartIcon, StartIconActive, TeamsIcon, TeamsIconActive } from '../../../assets/icons';

export default function HomeScreen({ onNavigate, externalTool, setExternalTool }: any) {
    const { t } = useTranslation();
    const {
        currentTool, connected, status, recentActivity, sensors,
        openTimer, openBluetooth, openSpeedCheck, closeTool,
        goToPlayers, goToSessions, openRecentActivity,
    } = useHomeScreen(onNavigate);

    // Синхронізація футера (логіка без змін)
    React.useEffect(() => {
        if (externalTool === 'SPEEDCHECK' && currentTool !== 'SPEEDCHECK') openSpeedCheck();
        else if (externalTool === null && currentTool === 'SPEEDCHECK') handleClose();
    }, [externalTool]);

    const handleClose = () => { closeTool(); if (setExternalTool) setExternalTool(null); };

    if (currentTool === 'TIMER') return <TimerTool onBack={handleClose} />;
    if (currentTool === 'SPEEDCHECK') return <SpeedCheckerTool onBack={handleClose} onOpenBluetooth={openBluetooth} />;
    if (currentTool === 'BLUETOOTH') return <BluetoothTool onBack={handleClose} />;

    const activeSensorsCount = sensors && sensors.length > 0 ? sensors.length - 1 : 0;

    return (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <View className="mx-4 mt-2">
                <Mod title={status.title} subtitle={status.desc}>
                    <View className="mt-2">
                        {connected ? (
                            <>
                                <View className="flex-row items-center justify-center gap-3 mb-6">
                                    {Array.from({ length: Math.max(2, activeSensorsCount) }).map((_, idx) => {
                                        const isActive = idx < activeSensorsCount;
                                        return (
                                            <View key={idx} className={`w-10 h-10 rounded-full items-center justify-center border ${isActive ? 'bg-status-success/10 border-status-success/40' : 'bg-surface-card border-surface-border'}`}>
                                                <MaterialCommunityIcons name="laser-pointer" size={16} color={isActive ? "#34d399" : "#717171"} style={{ transform: [{ rotate: '-45deg' }] }} />
                                            </View>
                                        );
                                    })}
                                </View>
                                <View className="gap-3">
                                    <Button variant="light" title={status.btnText} onPress={openBluetooth} className="w-full" />
                                    <Button variant="outline" title={t('screens.home.stopwatch')} onPress={openTimer} icon={<Feather name="clock" size={20} color="#F5F5F5" />} className="w-full" />
                                </View>
                            </>
                        ) : (
                            <View className="flex-row gap-3">
                                <Button variant="light" title={t('screens.home.status_btn_connect')} onPress={openBluetooth} icon={<Feather name="bluetooth" size={20} color="#0A0A0A" />} className="flex-1" />
                                <Button variant="outline" title={t('screens.home.stopwatch')} onPress={openTimer} icon={<Feather name="clock" size={20} color="#F5F5F5" />} className="flex-1" />
                            </View>
                        )}
                    </View>
                </Mod>
            </View>

            <View className="mx-4 mt-8 mb-2">
                <Text className="text-text-muted text-caption font-bold tracking-widest uppercase mb-4 ml-2 font-evolventa">
                    {t('screens.home.quick_actions')}
                </Text>
                <Mod
                    title={t('screens.home.start_test')}
                    subtitle={t('screens.home.start_test_desc')}
                    icon={<StartIcon width={34} height={34} fill="#F5F5F5" />}
                    activeIcon={<StartIconActive width={34} height={34} fill="#F5F5F5" />}
                    onPress={openSpeedCheck}
                    className="mb-3"
                />
                <View className="flex-row gap-3">
                    <Mod title={t('screens.home.teams')} subtitle={t('screens.home.teams_desc')} onPress={goToPlayers} className="flex-1" />
                    <Mod title={t('screens.home.results')} subtitle={t('screens.home.results_desc')} onPress={goToSessions} className="flex-1" />
                </View>
            </View>

            <View className="mx-4 mt-6 mb-10">
                <Text className="text-text-muted text-caption font-bold tracking-widest uppercase mb-4 ml-2 font-evolventa">
                    {t('screens.home.recent_activity')}
                </Text>
                {recentActivity ? (
                    <Mod
                        title={recentActivity.teamName}
                        subtitle={`${recentActivity.date} • ${recentActivity.time}`}
                        icon={<TeamsIcon width={30} height={30} fill="#F5F5F5" />}
                        activeIcon={<TeamsIconActive width={30} height={30} fill="#F5F5F5" />}
                        onPress={openRecentActivity}
                    />
                ) : (
                    <View className="p-8 rounded-3xl items-center justify-center border border-surface-border bg-surface-card/40">
                        <Feather name="inbox" size={24} color="#717171" />
                        <Text className="font-medium text-body text-text-muted mt-2 font-evolventa">
                            {t('screens.home.empty_activity')}
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}