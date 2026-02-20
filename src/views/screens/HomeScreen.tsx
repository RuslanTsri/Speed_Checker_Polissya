import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

import TimerTool from '../tools/TimerTool';
import BluetoothTool from '../tools/BluetoothTool';
import SpeedCheckerTool from '../tools/SpeedCheckerTool';

import { useHomeScreen, TabType } from '../../hooks/useHomeScreen';

interface HomeScreenProps {
    onNavigate: (tab: TabType, params?: any) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
    const {
        currentTool, connected, pingProgress, status, recentActivity,
        openTimer, openBluetooth, openSpeedCheck, closeTool,
        goToPlayers, goToSessions, openRecentActivity
    } = useHomeScreen(onNavigate);

    if (currentTool === 'TIMER') return <TimerTool onBack={closeTool} />;
    if (currentTool === 'BLUETOOTH') return <BluetoothTool onBack={closeTool} />;
    if (currentTool === 'SPEEDCHECK') return <SpeedCheckerTool onBack={closeTool} />;

    return (
        <ScrollView className="flex-1 bg-slate-950 pt-4">

            {/* 1. БЛОК СТАТУСУ ПІДКЛЮЧЕННЯ */}
            <View className={`mx-4 mt-2 bg-slate-900 rounded-3xl p-6 items-center border ${status.border}`}>
                <View className={`w-12 h-12 rounded-full items-center justify-center mb-4 border border-slate-700 ${status.bgIcon}`}>
                    {pingProgress ? (
                        <ActivityIndicator size="small" color="#facc15" />
                    ) : (
                        <Feather name="bluetooth" size={20} color={status.iconColor} />
                    )}
                </View>

                <Text className={`text-xl font-bold mb-2 ${status.textCol}`}>
                    {status.title}
                </Text>
                <Text className="text-slate-500 text-center text-sm mb-6 px-4">
                    {status.desc}
                </Text>

                <TouchableOpacity
                    onPress={openBluetooth}
                    className={`w-full py-4 rounded-xl items-center border mb-3 active:bg-slate-700 ${status.btnClass}`}
                >
                    <Text className={`font-bold text-base ${status.btnTextClass}`}>
                        {status.btnText}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={openTimer}
                    className="bg-slate-900 w-full py-4 rounded-xl items-center border border-slate-800 active:bg-slate-800"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="timer-outline" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                        <Text className="text-slate-400 font-bold text-base">Секундомір</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* 2. ШВИДКІ ДІЇ */}
            <View className="mx-4 mt-8 mb-2">
                <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-4">швидкі дії</Text>

                <TouchableOpacity
                    onPress={openSpeedCheck}
                    className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex-row items-center mb-4 shadow-sm active:bg-slate-800"
                >
                    <View className="w-12 h-12 bg-yellow-500/20 rounded-2xl items-center justify-center mr-4">
                        <Ionicons name="flash" size={24} color="#facc15" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-lg font-bold">Почати тестування</Text>
                        <Text className="text-slate-500 text-xs">З командами. Почнімо забіг!</Text>
                    </View>
                </TouchableOpacity>

                <View className="flex-row justify-between">
                    <TouchableOpacity onPress={goToPlayers} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl w-[48%] h-36 justify-between active:bg-slate-800">
                        <View className="w-10 h-10 bg-slate-800 rounded-xl items-center justify-center border border-slate-700">
                            <Feather name="users" size={20} color="#94a3b8" />
                        </View>
                        <View>
                            <Text className="text-white text-base font-bold">Команди</Text>
                            <Text className="text-slate-500 text-[10px] uppercase font-bold mt-1">Склад, Імпорт</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={goToSessions} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl w-[48%] h-36 justify-between active:bg-slate-800">
                        <View className="w-10 h-10 bg-slate-800 rounded-xl items-center justify-center border border-slate-700">
                            <Feather name="bar-chart-2" size={20} color="#94a3b8" />
                        </View>
                        <View>
                            <Text className="text-white text-base font-bold">Результати</Text>
                            <Text className="text-slate-500 text-[10px] uppercase font-bold mt-1">Рейтинг, CSV</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 🔥 3. ОСТАННЯ АКТИВНІСТЬ (Динамічна) */}
            <View className="mx-4 mt-6 mb-10">
                <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-4">ОСТАННЯ АКТИВНІСТЬ</Text>

                {recentActivity ? (
                    <View className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex-row items-center">
                        <View className="w-12 h-12 bg-slate-800 rounded-full items-center justify-center mr-4 border border-slate-700">
                            <Feather name="activity" size={20} color="#94a3b8" />
                        </View>
                        <View className="flex-1 mr-2">
                            <Text className="text-white text-base font-bold" numberOfLines={1}>{recentActivity.teamName}</Text>
                            <Text className="text-slate-500 text-xs mt-0.5">{recentActivity.date} • {recentActivity.time}</Text>
                        </View>
                        <TouchableOpacity onPress={openRecentActivity} className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 active:bg-slate-700">
                            <Text className="text-slate-300 text-xs font-bold uppercase">Відкрити</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="bg-slate-900 border border-slate-800 p-6 rounded-3xl items-center justify-center">
                        <Feather name="inbox" size={24} color="#475569" className="mb-2" />
                        <Text className="text-slate-500 font-medium text-sm">Тут з'явиться останнє тренування</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}