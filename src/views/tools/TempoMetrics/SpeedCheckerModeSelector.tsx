import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSpeedCheckerMode } from '../../../hooks/tempoMetrics/useSpeedCheckerMode';

interface Props {
    onBack: () => void;
    onSelect: (mode: 'DEVICE' | 'MANUAL', type: 'QUICK' | 'TEAM') => void;
}

export default function SpeedCheckerModeSelector({ onBack, onSelect }: Props) {
    // Вся логіка винесена
    const { mode, setMode, handleCheckConnection, pingProgress, status } = useSpeedCheckerMode();

    return (
        <View className="flex-1 bg-slate-950 pt-4 px-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
                    <Feather name="chevron-left" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Вибір режиму</Text>
                <View className="w-10" />
            </View>

            {/* Status Card */}
            <View className={`${status.bg} border ${status.border} p-5 rounded-2xl flex-row justify-between items-center mb-8`}>
                <View className="flex-1 mr-2">
                    <Text className={`${status.textCol} font-bold text-base mb-1`}>{status.title}</Text>
                    <Text className="text-slate-400 text-xs font-medium">{status.subtitle}</Text>
                </View>

                <TouchableOpacity
                    onPress={handleCheckConnection}
                    disabled={!!pingProgress}
                    className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg flex-row items-center"
                >
                    {pingProgress ? (
                        <ActivityIndicator size="small" color="#facc15" />
                    ) : (
                        <Text className="text-white text-xs font-bold uppercase">{status.btnText}</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Mode Switcher */}
            <View className="bg-slate-900 p-1 rounded-2xl flex-row mb-8 border border-slate-800">
                <TouchableOpacity onPress={() => setMode('DEVICE')} className={`flex-1 py-3 rounded-xl flex-row justify-center items-center ${mode === 'DEVICE' ? 'bg-yellow-400' : ''}`}>
                    <Feather name="wifi" size={16} color={mode === 'DEVICE' ? '#0f172a' : '#64748b'} style={{ marginRight: 8 }} />
                    <Text className={`font-bold ${mode === 'DEVICE' ? 'text-slate-900' : 'text-slate-500'}`}>З пристроєм</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMode('MANUAL')} className={`flex-1 py-3 rounded-xl flex-row justify-center items-center ${mode === 'MANUAL' ? 'bg-yellow-400' : ''}`}>
                    <Feather name="clock" size={16} color={mode === 'MANUAL' ? '#0f172a' : '#64748b'} style={{ marginRight: 8 }} />
                    <Text className={`font-bold ${mode === 'MANUAL' ? 'text-slate-900' : 'text-slate-500'}`}>Ручний</Text>
                </TouchableOpacity>
            </View>

            {/* Action Cards */}
            <TouchableOpacity onPress={() => onSelect(mode, 'QUICK')} activeOpacity={0.8} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex-row items-center mb-4 active:bg-slate-800/80">
                <View className="w-14 h-14 bg-yellow-500/10 rounded-2xl items-center justify-center mr-5 border border-yellow-500/20">
                    <Ionicons name="flash" size={28} color="#facc15" />
                </View>
                <View className="flex-1">
                    <Text className="text-white text-xl font-bold mb-1">Швидкий тест</Text>
                    <Text className="text-slate-500 text-sm">Без команди. Почніть одразу.</Text>
                </View>
                <Feather name="chevron-right" size={24} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onSelect(mode, 'TEAM')} activeOpacity={0.8} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex-row items-center active:bg-slate-800/80">
                <View className="w-14 h-14 bg-slate-800 rounded-2xl items-center justify-center mr-5 border border-slate-700">
                    <MaterialCommunityIcons name="clipboard-list" size={28} color="#94a3b8" />
                </View>
                <View className="flex-1">
                    <Text className="text-white text-xl font-bold mb-1">Тест команди</Text>
                    <Text className="text-slate-500 text-sm">Вибір команди та список присутніх.</Text>
                </View>
                <Feather name="chevron-right" size={24} color="#475569" />
            </TouchableOpacity>
        </View>
    );
}