import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import TimerTool from '../tools/TimerTool';
import BluetoothTool from '../tools/BluetoothTool';
import SpeedCheckerTool from '../tools/SpeedCheckerTool';
import { useHomeScreen, TabType } from '../../hooks/useHomeScreen';
import { useTheme } from '../../context/ThemeContext';

interface HomeScreenProps {
    onNavigate: (tab: TabType, params?: any) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const {
        currentTool, connected, status, recentActivity,
        sensors,
        openTimer, openBluetooth, openSpeedCheck, closeTool,
        goToPlayers, goToSessions, openRecentActivity
    } = useHomeScreen(onNavigate);

    if (currentTool === 'TIMER') return <TimerTool onBack={closeTool} />;
    if (currentTool === 'BLUETOOTH') return <BluetoothTool onBack={closeTool} />;
    if (currentTool === 'SPEEDCHECK') return <SpeedCheckerTool onBack={closeTool} />;

    // 🔥 ФІКС: Додали розрахунок активних сенсорів
    const activeSensorsCount = sensors && sensors.length > 0 ? sensors.length - 1 : 0;

    return (
        <ScrollView className={`flex-1 pt-4 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>

            {/* 1. БЛОК СТАТУСУ ПІДКЛЮЧЕННЯ */}
            <View className={`mx-4 mt-2 rounded-3xl p-6 items-center border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} ${status.border}`}>

                {/* Іконка */}
                <View className={`w-12 h-12 rounded-full items-center justify-center mb-4 border ${isDark ? 'border-slate-700' : 'border-slate-200'} ${status.bgIcon}`}>
                    <Feather name="bluetooth" size={20} color={status.iconColor} />
                </View>

                {/* Заголовок */}
                <Text className={`text-xl font-bold mb-1 ${status.textCol || (isDark ? 'text-white' : 'text-slate-900')}`}>
                    {status.title}
                </Text>
                <Text className={`text-center text-sm mb-4 px-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    {status.desc}
                </Text>

                {/* Індикатор лазерів */}
                {connected && (
                    <View className="flex-row items-center space-x-1 mb-6">
                        {Array.from({ length: Math.max(2, activeSensorsCount) }).map((_, idx) => {
                            const isActive = idx < activeSensorsCount;
                            return (
                                <View key={idx} className={`w-8 h-8 rounded-full items-center justify-center border ${
                                    isActive
                                        ? (isDark ? 'bg-green-500/20 border-green-500/50' : 'bg-green-100 border-green-400')
                                        : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200')
                                }`}>
                                    <MaterialCommunityIcons
                                        name="laser-pointer"
                                        size={14}
                                        color={isActive ? "#4ade80" : (isDark ? "#475569" : "#94a3b8")}
                                        style={{ transform: [{ rotate: '-45deg' }] }}
                                    />
                                </View>
                            );
                        })}
                    </View>
                )}

                <TouchableOpacity onPress={openBluetooth} className={`w-full py-4 rounded-xl items-center border mb-3 ${status.btnClass}`}>
                    <Text className={`font-bold text-base ${status.btnTextClass}`}>
                        {status.btnText}
                    </Text>
                </TouchableOpacity>

                {/* Секундомір залишаємо як був */}
            </View>

            {/* 2. ШВИДКІ ДІЇ */}
            <View className="mx-4 mt-8 mb-2">
                <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-4">
                    {t('screens.home.quick_actions') as string}
                </Text>

                <TouchableOpacity onPress={openSpeedCheck} className={`p-5 rounded-3xl flex-row items-center mb-4 shadow-sm border ${isDark ? 'bg-slate-900 border-slate-800 active:bg-slate-800' : 'bg-white border-slate-200 active:bg-slate-50'}`}>
                    <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                        <Ionicons name="flash" size={24} color={isDark ? "#facc15" : "#eab308"} />
                    </View>
                    <View className="flex-1">
                        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {t('screens.home.start_test') as string}
                        </Text>
                        <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {t('screens.home.start_test_desc') as string}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View className="flex-row justify-between">
                    <TouchableOpacity onPress={goToPlayers} className={`p-5 rounded-3xl w-[48%] h-36 justify-between border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800 active:bg-slate-800' : 'bg-white border-slate-200 active:bg-slate-50'}`}>
                        <View className={`w-10 h-10 rounded-xl items-center justify-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                            <Feather name="users" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                        </View>
                        <View>
                            <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {t('screens.home.teams') as string}
                            </Text>
                            <Text className={`text-[10px] uppercase font-bold mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {t('screens.home.teams_desc') as string}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={goToSessions} className={`p-5 rounded-3xl w-[48%] h-36 justify-between border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800 active:bg-slate-800' : 'bg-white border-slate-200 active:bg-slate-50'}`}>
                        <View className={`w-10 h-10 rounded-xl items-center justify-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                            <Feather name="bar-chart-2" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                        </View>
                        <View>
                            <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {t('screens.home.results') as string}
                            </Text>
                            <Text className={`text-[10px] uppercase font-bold mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {t('screens.home.results_desc') as string}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 🔥 3. ОСТАННЯ АКТИВНІСТЬ */}
            <View className="mx-4 mt-6 mb-10">
                <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-4">
                    {t('screens.home.recent_activity') as string}
                </Text>

                {recentActivity ? (
                    <View className={`p-4 rounded-3xl flex-row items-center border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                            <Feather name="activity" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
                        </View>
                        <View className="flex-1 mr-2">
                            <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={1}>{recentActivity.teamName}</Text>
                            <Text className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{recentActivity.date} • {recentActivity.time}</Text>
                        </View>
                        <TouchableOpacity onPress={openRecentActivity} className={`px-4 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 active:bg-slate-700' : 'bg-slate-100 border-slate-200 active:bg-slate-200'}`}>
                            <Text className={`text-xs font-bold uppercase ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                {t('screens.home.open') as string}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className={`p-6 rounded-3xl items-center justify-center border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <Feather name="inbox" size={24} color={isDark ? "#475569" : "#94a3b8"} className="mb-2" />
                        <Text className={`font-medium text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {t('screens.home.empty_activity') as string}
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}