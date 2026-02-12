import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import TimerTool from '../tools/TimerTool';
import BluetoothTool from '../tools/BluetoothTool';
import SpeedCheckerTool from '../tools/SpeedCheckerTool';

// 🔥 Імпортуємо контекст
import { useBle } from '../../context/BleContext';

// Тип для табів (має співпадати з тим, що у Footer)
type TabType = 'HOME' | 'PLAYERS' | 'SESSIONS' | 'SETTINGS';

// Типи локальних інструментів
type ToolType = 'MENU' | 'BLUETOOTH' | 'TIMER' | 'SPEEDCHECK';

interface HomeScreenProps {
    onNavigate: (tab: TabType, params?: any) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
    const [currentTool, setCurrentTool] = useState<ToolType>('MENU');

    // 🔥 Отримуємо дані з глобального контексту
    const { connected, pingProgress, device } = useBle();

    // --- РЕНДЕР ІНСТРУМЕНТІВ ---
    if (currentTool === 'TIMER') {
        return <TimerTool onBack={() => setCurrentTool('MENU')} />;
    }

    if (currentTool === 'BLUETOOTH') {
        return <BluetoothTool onBack={() => setCurrentTool('MENU')} />;
    }

    if (currentTool === 'SPEEDCHECK') {
        // Тут все вірно, SpeedCheckerTool приймає тільки onBack в оновленій версії
        return <SpeedCheckerTool onBack={() => setCurrentTool('MENU')} />;
    }

    // --- ЛОГІКА СТАТУСУ ---
    let statusTitle = "Пристрій не підключено";
    let statusDesc = "Підключіть Tempo Metrics, щоб почати тест.";
    let statusIconColor = "#64748b"; // slate-500
    let statusBgIcon = "bg-slate-800";
    let statusBorder = "border-slate-800";
    let statusTextCol = "text-white";

    if (connected) {
        if (pingProgress) {
            statusTitle = "Перевірка зв'язку...";
            statusDesc = pingProgress;
            statusIconColor = "#facc15"; // yellow-400
            statusBorder = "border-yellow-500/30";
        } else {
            statusTitle = "Tempo Metrics Online";
            statusDesc = device?.name || "Готовий до роботи";
            statusIconColor = "#4ade80"; // green-400
            statusBgIcon = "bg-green-500/10";
            statusBorder = "border-green-500/30";
            statusTextCol = "text-green-400";
        }
    }

    // --- ГОЛОВНЕ МЕНЮ ---
    return (
        <ScrollView className="flex-1 bg-slate-950 pt-4">

            {/* 1. БЛОК СТАТУСУ ПІДКЛЮЧЕННЯ (ЖИВИЙ) */}
            <View className={`mx-4 mt-2 bg-slate-900 rounded-3xl p-6 items-center border ${statusBorder}`}>
                <View className={`w-12 h-12 rounded-full items-center justify-center mb-4 border border-slate-700 ${statusBgIcon}`}>
                    {pingProgress ? (
                        <ActivityIndicator size="small" color="#facc15" />
                    ) : (
                        <Feather name="bluetooth" size={20} color={statusIconColor} />
                    )}
                </View>

                <Text className={`text-xl font-bold mb-2 ${connected ? statusTextCol : 'text-white'}`}>
                    {statusTitle}
                </Text>
                <Text className="text-slate-500 text-center text-sm mb-6 px-4">
                    {statusDesc}
                </Text>

                {/* Кнопка Підключити (Змінюється якщо підключено) */}
                <TouchableOpacity
                    onPress={() => setCurrentTool('BLUETOOTH')}
                    className={`w-full py-4 rounded-xl items-center border mb-3 active:bg-slate-700 ${connected ? 'bg-slate-900 border-slate-700' : 'bg-slate-800 border-slate-700'}`}
                >
                    <Text className={`font-bold text-base ${connected ? 'text-slate-400' : 'text-white'}`}>
                        {connected ? 'Налаштування з\'єднання' : 'Підключити'}
                    </Text>
                </TouchableOpacity>

                {/* КНОПКА: СЕКУНДОМІР */}
                <TouchableOpacity
                    onPress={() => setCurrentTool('TIMER')}
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

                {/* Швидкий тест */}
                <TouchableOpacity
                    onPress={() => setCurrentTool('SPEEDCHECK')}
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

                {/* Два квадрати (Команди і Результати) */}
                <View className="flex-row justify-between">
                    <TouchableOpacity
                        onPress={() => onNavigate('PLAYERS')}
                        className="bg-slate-900 border border-slate-800 p-5 rounded-3xl w-[48%] h-36 justify-between active:bg-slate-800"
                    >
                        <View className="w-10 h-10 bg-slate-800 rounded-xl items-center justify-center border border-slate-700">
                            <Feather name="users" size={20} color="#94a3b8" />
                        </View>
                        <View>
                            <Text className="text-white text-base font-bold">Команди </Text>
                            <Text className="text-slate-500 text-[10px] uppercase font-bold mt-1">Склад, Імпорт</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onNavigate('SESSIONS', { subTab: 'GENERAL' })}
                        className="bg-slate-900 border border-slate-800 p-5 rounded-3xl w-[48%] h-36 justify-between active:bg-slate-800"
                    >
                        <View className="w-10 h-10 bg-slate-800 rounded-xl items-center justify-center border border-slate-700">
                            <Feather name="bar-chart-2" size={20} color="#94a3b8" />
                        </View>
                        <View>
                            <Text className="text-white text-base font-bold">Результати

                            </Text>
                            <Text className="text-slate-500 text-[10px] uppercase font-bold mt-1">Рейтинг, CSV</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 3. ОСТАННЯ АКТИВНІСТЬ (Заглушка, можна теж підключити до реальних даних пізніше) */}
            <View className="mx-4 mt-6 mb-10">
                <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-4">ОСТАННЯ АКТИВНІСТЬ</Text>

                <View className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex-row items-center">
                    <View className="w-12 h-12 bg-slate-800 rounded-full items-center justify-center mr-4 border border-slate-700">
                        <Feather name="activity" size={20} color="#94a3b8" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-base font-bold">ФК «Динамо» U17</Text>
                        <Text className="text-slate-500 text-xs">12.10.2023 • 10:30</Text>
                    </View>
                    <TouchableOpacity className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
                        <Text className="text-slate-300 text-xs font-bold uppercase">Відкрити</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </ScrollView>
    );
}