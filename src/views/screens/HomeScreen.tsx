import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
// 👇 1. Імпортуємо бібліотеку іконок
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import TimerTool from '../tools/TimerTool';
import BluetoothTool from '../tools/BluetoothTool';
import SpeedCheckerTool from '../tools/SpeedCheckerTool';

type ToolType = 'MENU' | 'BLUETOOTH' | 'TIMER' | 'SPEEDCHECK';

export default function HomeScreen() {
    const [currentTool, setCurrentTool] = useState<ToolType>('MENU');

    if (currentTool === 'TIMER') return <TimerTool onBack={() => setCurrentTool('MENU')} />;
    if (currentTool === 'BLUETOOTH') return <BluetoothTool onBack={() => setCurrentTool('MENU')} />;
    if (currentTool === 'SPEEDCHECK') return <SpeedCheckerTool onBack={() => setCurrentTool('MENU')} />;

    return (
        <ScrollView className="flex-1 px-4 pt-6">
            <View className="mb-8">
                <Text className="text-white text-2xl font-bold">Панель керування</Text>
                <Text className="text-slate-400">Оберіть інструмент для роботи</Text>
            </View>

            <View className="gap-4">
                {/* 1. BLUETOOTH */}
                <TouchableOpacity
                    onPress={() => setCurrentTool('BLUETOOTH')}
                    className="bg-blue-900/20 border border-blue-500/50 p-6 rounded-3xl flex-row items-center active:bg-blue-900/40"
                >
                    <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center mr-6 shadow-lg shadow-blue-500/30">
                        <Feather name="bluetooth" size={32} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-xl font-bold">Bluetooth</Text>
                        <Text className="text-blue-300 text-sm">Підключення сенсорів</Text>
                    </View>
                    <Feather name="chevron-right" size={24} color="#3b82f6" />
                </TouchableOpacity>

                {/* 2. TIMER */}
                <TouchableOpacity
                    onPress={() => setCurrentTool('TIMER')}
                    className="bg-slate-800 border border-slate-700 p-6 rounded-3xl flex-row items-center active:bg-slate-700"
                >
                    <View className="w-16 h-16 bg-slate-700 rounded-full items-center justify-center mr-6">
                        {/* 👇 Іконка таймера */}
                        <Ionicons name="timer-outline" size={32} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-xl font-bold">Таймер</Text>
                        <Text className="text-slate-400 text-sm">Секундомір тренера</Text>
                    </View>
                    <Feather name="chevron-right" size={24} color="#475569" />
                </TouchableOpacity>

                {/* 3. SPEED CHECKER */}
                <TouchableOpacity
                    onPress={() => setCurrentTool('SPEEDCHECK')}
                    className="bg-yellow-400 p-6 rounded-3xl flex-row items-center shadow-xl shadow-yellow-400/20 active:bg-yellow-500"
                >
                    <View className="w-16 h-16 bg-slate-900 rounded-full items-center justify-center mr-6">
                        {/* 👇 Іконка бігуна */}
                        <MaterialCommunityIcons name="run-fast" size={32} color="#facc15" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-slate-900 text-2xl font-black italic uppercase">Speed Checker</Text>
                        <Text className="text-slate-800 font-medium text-sm">Заміри телеметрії</Text>
                    </View>
                    <Feather name="chevron-right" size={24} color="#0f172a" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}