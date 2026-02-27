import React from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import TimerTool from '../tools/TimerTool';
import BluetoothTool from '../tools/BluetoothTool';
import SpeedCheckerTool from '../tools/SpeedCheckerTool';
import { useHomeScreen, TabType } from '../../hooks/useHomeScreen';
import { useTheme } from '../../context/ThemeContext';

// 🔥 Імпортуємо UI-компоненти та Іконки
import { Mod } from '../components/ui/mods';
import { Button } from '../components/ui/Button';
import { StartIcon, StartIconActive, TeamsIcon, TeamsIconActive, BleIconActive, BleIcon } from '../../../assets/icons';

interface HomeScreenProps {
    onNavigate: (tab: TabType, params?: any) => void;
}

export default function HomeScreen({ onNavigate, externalTool, setExternalTool }: any) {
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const {
        currentTool, connected, status, recentActivity,
        sensors,
        openTimer, openBluetooth, openSpeedCheck, closeTool,
        goToPlayers, goToSessions, openRecentActivity,

    } = useHomeScreen(onNavigate);

    // Синхронізація футера та екрана (залишаємо як було)
    React.useEffect(() => {
        if (externalTool === 'SPEEDCHECK' && currentTool !== 'SPEEDCHECK') openSpeedCheck();
        else if (externalTool === null && currentTool === 'SPEEDCHECK') closeTool();
    }, [externalTool]);

    React.useEffect(() => {
        if (currentTool === 'SPEEDCHECK') {
            if (setExternalTool && externalTool !== 'SPEEDCHECK') setExternalTool('SPEEDCHECK');
        } else if (currentTool === null) {
            if (setExternalTool && externalTool !== null) setExternalTool(null);
        }
    }, [currentTool]);
    React.useEffect(() => {
        if (setExternalTool) {
            // Передаємо currentTool (це може бути 'SPEEDCHECK', 'BLUETOOTH', 'TIMER' або null)
            // Якщо футер очікує ці значення, він автоматично перемкне активну іконку
            if (externalTool !== currentTool) {
                setExternalTool(currentTool);
            }
        }
    }, [currentTool]);

    const handleClose = () => {
        closeTool();
        if (setExternalTool) setExternalTool(null);
    };

    if (currentTool === 'TIMER') return <TimerTool onBack={handleClose} />;
    if (currentTool === 'SPEEDCHECK') return (
        <SpeedCheckerTool
            onBack={handleClose}
            onOpenBluetooth={openBluetooth} // 🔥 Передаємо функцію відкриття Bluetooth
        />
    );
    if (currentTool === 'BLUETOOTH') return <BluetoothTool onBack={closeTool}/>;

    const activeSensorsCount = sensors && sensors.length > 0 ? sensors.length - 1 : 0;

    return (
        <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <View className="mx-4 mt-2">
                <Mod
                    title={status.title}
                    subtitle={status.desc}
                >
                    {connected ? (
                        <View className="mt-2">
                            <View className="flex-row items-center justify-center gap-3 mb-6">
                                {Array.from({ length: Math.max(2, activeSensorsCount) }).map((_, idx) => {
                                    const isActive = idx < activeSensorsCount;
                                    return (
                                        <View key={idx} className={`w-10 h-10 rounded-full items-center justify-center border ${
                                            isActive ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10'
                                        }`}>
                                            <MaterialCommunityIcons
                                                name="laser-pointer"
                                                size={16}
                                                color={isActive ? "#34d399" : "#475569"}
                                                style={{ transform: [{ rotate: '-45deg' }] }}
                                            />
                                        </View>
                                    );
                                })}
                            </View>

                            <View className="gap-3">
                                <Button variant="light" title={status.btnText} onPress={openBluetooth} className="w-full" />

                                <Button
                                    variant="outline"
                                    title={t('screens.home.stopwatch')}
                                    onPress={openTimer}
                                    icon={<Feather name="clock" size={20} color="#F5F5F5" />}
                                    className="w-full"
                                />
                            </View>
                        </View>
                    ) : (
                        <View className="flex-row gap-3 mt-2">

                            {/* 1. Кнопка Під'єднати (Тепер через Feather) */}
                            <View className="flex-1">
                                <Button
                                    variant="light"
                                    title={t('screens.home.status_btn_connect')}
                                    onPress={openBluetooth}
                                    icon={<Feather name="bluetooth" size={20} color="#0A0A0A" />}
                                    className="w-full"
                                />
                            </View>

                            <View className="flex-1">
                                <Button
                                    variant="outline"
                                    title={t('screens.home.stopwatch')}
                                    onPress={openTimer}
                                    icon={<Feather name="clock" size={20} color="#F5F5F5" />}
                                    className="w-full"
                                />
                            </View>

                        </View>
                    )}
                </Mod>
            </View>
            {/* 2. ШВИДКІ ДІЇ */}
            <View className="mx-4 mt-8 mb-2">
                <Text className="text-slate-500 text-[11px] font-bold tracking-[0.1em] uppercase mb-4 ml-2">
                    {t('screens.home.quick_actions')}
                </Text>

                <Mod
                    title={t('screens.home.start_test')} // "Швидкий тест"
                    subtitle={t('screens.home.start_test_desc')}
                    icon={<StartIcon width={34} height={34} fill="#F5F5F5" />}
                    activeIcon={<StartIconActive width={34} height={34} fill="#F5F5F5" />}
                    onPress={openSpeedCheck}
                    className="mb-3"
                />

                <View className="flex-row gap-3">
                    <Mod
                        title={t('screens.home.teams')} // "Команди"
                        subtitle={t('screens.home.teams_desc')}
                        onPress={goToPlayers}
                        className="flex-1"
                    />
                    <Mod
                        title={t('screens.home.results')} // "Результати"
                        subtitle={t('screens.home.results_desc')}
                        onPress={goToSessions}
                        className="flex-1"
                    />
                </View>
            </View>

            {/* 3. ОСТАННЯ АКТИВНІСТЬ */}
            <View className="mx-4 mt-6 mb-10">
                <Text className="text-slate-500 text-[11px] font-bold tracking-[0.1em] uppercase mb-4 ml-2">
                    {t('screens.home.recent_activity')}
                </Text>

                {recentActivity ? (
                    <Mod
                        title={recentActivity.teamName} // "ФК Динамо U17"
                        subtitle={`${recentActivity.date} • ${recentActivity.time}`}
                        icon={<TeamsIcon width={30} height={30} fill="#F5F5F5" />}
                        activeIcon={<TeamsIconActive width={30} height={30} fill="#F5F5F5" />}
                        onPress={openRecentActivity}
                    />
                ) : (
                    <View className="p-6 rounded-3xl items-center justify-center border border-white/10 shadow-sm bg-black/40">
                        <Feather name="inbox" size={24} color="#475569" className="mb-2" />
                        <Text className="font-medium text-sm text-slate-500">
                            {t('screens.home.empty_activity')}
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}