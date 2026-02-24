import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSpeedCheckerMode } from '../../../hooks/tempoMetrics/useSpeedCheckerMode';
import { useTheme } from '../../../context/ThemeContext'; // 🔥 Тема

interface Props {
    onBack: () => void;
    onSelect: (mode: 'DEVICE' | 'MANUAL', type: 'QUICK' | 'TEAM') => void;
}

export default function SpeedCheckerModeSelector({ onBack, onSelect }: Props) {
    const { isDark } = useTheme(); // 🔥 Стейт
    const { mode, setMode, handleCheckConnection, pingProgress, status } = useSpeedCheckerMode();

    return (
        <View className="flex-1 px-4 pt-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={onBack} className={`p-2 -ml-2 rounded-full ${isDark ? 'active:bg-slate-800' : 'active:bg-slate-200'}`}>
                    <Feather name="chevron-left" size={28} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Вибір режиму</Text>
                <View className="w-10" />
            </View>

            {/* Status Card (Кольори приходять зі status, тому залишаємо як є, або переписуємо в хуку) */}
            <View className={`${status.bg} border ${status.border} p-5 rounded-2xl flex-row justify-between items-center mb-8 shadow-sm`}>
                <View className="flex-1 mr-2">
                    <Text className={`${status.textCol} font-bold text-base mb-1`}>{status.title}</Text>
                    <Text className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{status.subtitle}</Text>
                </View>

                <TouchableOpacity
                    onPress={handleCheckConnection}
                    disabled={!!pingProgress}
                    className={`border px-4 py-2 rounded-lg flex-row items-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300 shadow-sm'}`}
                >
                    {pingProgress ? (
                        <ActivityIndicator size="small" color={isDark ? "#facc15" : "#eab308"} />
                    ) : (
                        <Text className={`text-xs font-bold uppercase ${isDark ? 'text-white' : 'text-slate-700'}`}>{status.btnText}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Mode Switcher */}
            <View className={`p-1 rounded-2xl flex-row mb-8 border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
                {/* Тепер це просто View, а не TouchableOpacity */}
                <View className={`flex-1 py-3 rounded-xl flex-row justify-center items-center ${mode === 'DEVICE' ? (isDark ? 'bg-yellow-400' : 'bg-white shadow-sm') : ''}`}>
                    <Feather
                        name="wifi"
                        size={16}
                        color={mode === 'DEVICE' ? (isDark ? '#0f172a' : '#1e293b') : (isDark ? '#64748b' : '#94a3b8')}
                        style={{ marginRight: 8 }}
                    />
                    <Text className={`font-bold ${mode === 'DEVICE' ? (isDark ? 'text-slate-900' : 'text-slate-900') : (isDark ? 'text-slate-500' : 'text-slate-500')}`}>
                        Тестування з пристроєм
                    </Text>
                </View>
            </View>

            {/* Action Cards */}
            <TouchableOpacity onPress={() => onSelect(mode, 'QUICK')} activeOpacity={0.8} className={`border p-6 rounded-3xl flex-row items-center mb-4 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800 active:bg-slate-800/80' : 'bg-white border-slate-200 active:bg-slate-50'}`}>
                <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-5 border ${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}>
                    <Ionicons name="flash" size={28} color={isDark ? "#facc15" : "#eab308"} />
                </View>
                <View className="flex-1">
                    <Text className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Швидкий тест</Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Без команди. Почніть одразу.</Text>
                </View>
                <Feather name="chevron-right" size={24} color={isDark ? "#475569" : "#94a3b8"} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onSelect(mode, 'TEAM')} activeOpacity={0.8} className={`border p-6 rounded-3xl flex-row items-center shadow-sm ${isDark ? 'bg-slate-900 border-slate-800 active:bg-slate-800/80' : 'bg-white border-slate-200 active:bg-slate-50'}`}>
                <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                    <MaterialCommunityIcons name="clipboard-list" size={28} color={isDark ? "#94a3b8" : "#64748b"} />
                </View>
                <View className="flex-1">
                    <Text className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Тест команди</Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Вибір команди та список присутніх.</Text>
                </View>
                <Feather name="chevron-right" size={24} color={isDark ? "#475569" : "#94a3b8"} />
            </TouchableOpacity>
        </View>
    );
}