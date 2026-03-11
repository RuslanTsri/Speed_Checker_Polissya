import React, { useEffect } from 'react';
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

export default function HomeScreen({ onNavigate, externalTool, setExternalTool, onNavigateLayout }: any) {
    const { t } = useTranslation();
    const {
        currentTool, connected, status, recentActivity, sensors,
        openTimer, openBluetooth, openSpeedCheck, closeTool,
        goToPlayers, goToSessions, openRecentActivity,
    } = useHomeScreen(onNavigate);

    // 1. Слухаємо команди зверху (з App.tsx / useAppLogic)
    // Якщо externalTool змінився на null (наприклад, через кнопку Назад), закриваємо тул
    useEffect(() => {
        if (externalTool === null && currentTool !== 'MENU') {
            closeTool();
        } else if (externalTool && currentTool !== externalTool) {
            if (externalTool === 'SPEEDCHECK') openSpeedCheck();
            if (externalTool === 'BLUETOOTH') openBluetooth();
            if (externalTool === 'TIMER') openTimer();
        }
    }, [externalTool]);


    useEffect(() => {
        if (setExternalTool) {
            if (currentTool === 'MENU') {
                setExternalTool(null);
            } else {
                setExternalTool(currentTool);
            }
        }
    }, [currentTool, setExternalTool]);

    const handleClose = () => {
        closeTool();
    };

    const handleOpenSpeedCheck = () => {
        if (onNavigateLayout) onNavigateLayout('SPEEDCHECK');
        else openSpeedCheck();
    };

    const handleOpenBluetooth = () => {
        if (onNavigateLayout) onNavigateLayout('BLUETOOTH');
        else openBluetooth();
    };

    const handleOpenTimer = () => {
        if (onNavigateLayout) onNavigateLayout('TIMER');
        else openTimer();
    };

    if (currentTool === 'TIMER') return <TimerTool onBack={handleClose} />;

    if (currentTool === 'SPEEDCHECK') return <SpeedCheckerTool onBack={handleClose} onOpenBluetooth={handleOpenBluetooth} onNavigate={onNavigate} />;
    if (currentTool === 'BLUETOOTH') return <BluetoothTool onBack={handleClose} />;

    const gateSensors = sensors ? sensors.filter((s: any) => s.id !== 0) : [];
    const displaySlotsCount = Math.max(2, gateSensors.length);

    return (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <View className="mx-4 mt-2">
                <Mod title={status.title} subtitle={status.desc}>
                    <View className="mt-2">
                        {connected ? (
                            <View className="gap-3">
                                <View className="flex-row items-center justify-center gap-3 mb-3">
                                    {Array.from({ length: displaySlotsCount }).map((_, idx) => {
                                        const gate = gateSensors[idx];
                                        let bgColorClass = 'bg-surface-card';
                                        let borderClass = 'border-surface-border';
                                        let iconColor = '#717171';

                                        if (gate) {
                                            if (gate.status === 'active') {
                                                bgColorClass = 'bg-status-success/10'; borderClass = 'border-status-success/40'; iconColor = '#34d399';
                                            } else if (gate.status === 'timeout') {
                                                bgColorClass = 'bg-status-error/10'; borderClass = 'border-status-error/40'; iconColor = '#f87171';
                                            }
                                        }

                                        return (
                                            <View key={idx} className={`w-8 h-8 rounded-xl items-center justify-center border ${bgColorClass} ${borderClass}`}>
                                                <MaterialCommunityIcons name="laser-pointer" size={12} color={iconColor} style={{ transform: [{ rotate: '-45deg' }] }} />
                                            </View>
                                        );
                                    })}
                                </View>
                                <Button variant="light" title={status.btnText} onPress={handleOpenBluetooth} className="w-full py-2.5" />
                                <Button variant="outline" title={t('screens.home.stopwatch')} onPress={handleOpenTimer} icon={<Feather name="clock" size={14} color="#F5F5F5" />} className="w-full py-2.5" />
                            </View>
                        ) : (
                            <View className="flex-row gap-1.5">
                                <Button variant="light" title={t('screens.home.status_btn_connect')} onPress={handleOpenBluetooth} icon={<Feather name="bluetooth" size={14} color="#0A0A0A" />} className="flex-1 py-2.5 px-0" style={{ fontSize: 10, letterSpacing: -0.5 }} />
                                <Button variant="outline" title={t('screens.home.stopwatch')} onPress={handleOpenTimer} icon={<Feather name="clock" size={14} color="#F5F5F5" />} className="flex-1 py-2.5 px-0" style={{ fontSize: 10, letterSpacing: -0.5 }} />
                            </View>
                        )}
                    </View>
                </Mod>
            </View>

            <View className="mx-4 mt-8 mb-2">
                <Text className="text-text-sub text-caption tracking-widest uppercase mb-4 ml-2 font-evolventa-bold">
                    {t('screens.home.quick_actions')}
                </Text>
                <Mod
                    title={t('screens.home.start_test')}
                    subtitle={t('screens.home.start_test_desc')}
                    icon={<StartIcon width={32} height={32} fill="#F5F5F5" />}
                    activeIcon={<StartIconActive width={32} height={32} fill="#FF6D00" />}
                    onPress={handleOpenSpeedCheck}
                    className="mb-3"
                />
                <View className="flex-row gap-3">
                    <Mod title={t('screens.home.teams')} subtitle={t('screens.home.teams_desc')} onPress={goToPlayers} className="flex-1" />
                    <Mod title={t('screens.home.results')} subtitle={t('screens.home.results_desc')} onPress={goToSessions} className="flex-1" />
                </View>
            </View>

            <View className="mx-4 mt-6 mb-10">
                <Text className="text-text-sub text-caption tracking-widest uppercase mb-4 ml-2 font-evolventa-bold">
                    {t('screens.home.recent_activity')}
                </Text>
                {recentActivity ? (
                    <Mod title={recentActivity.teamName} subtitle={`${recentActivity.date} • ${recentActivity.time}`} icon={<TeamsIcon width={28} height={28} fill="#F5F5F5" />} activeIcon={<TeamsIconActive width={28} height={28} fill="#FF6D00" />} onPress={openRecentActivity} />
                ) : (
                    <View className="p-8 rounded-3xl items-center justify-center border border-surface-border bg-surface-card/40">
                        <Feather name="inbox" size={24} color="#717171" />
                        <Text className="text-h5 text-text-sub mt-2 font-evolventa">{t('screens.home.empty_activity')}</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}