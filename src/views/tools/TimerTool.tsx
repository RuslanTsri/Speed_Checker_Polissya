import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useStopwatch } from '../../hooks/tools/useStopwatch';
import { useTheme } from '../../context/ThemeContext'; // 🔥 Тема

export default function TimerTool({ onBack }: { onBack: () => void }) {
    const { isDark } = useTheme(); // 🔥 Стейт
    const { timeObj, isActive, toggle, reset } = useStopwatch();

    return (
        <View className={`flex-1 pt-4 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {/* Header */}
            <View className="px-4 mb-10 flex-row items-center">
                <TouchableOpacity onPress={onBack} className={`w-10 h-10 items-center justify-center -ml-2 rounded-full ${isDark ? 'active:bg-slate-800' : 'active:bg-slate-200'}`}>
                    <Feather name="chevron-left" size={28} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-6 items-center">
                {/* Timer Card */}
                <View className={`w-full border rounded-[40px] p-8 items-center justify-center shadow-lg mb-12 relative overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-300/50'}`}>
                    <View className={`absolute w-64 h-64 rounded-full ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/50'}`} />
                    <View className={`absolute w-48 h-48 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    <View className="items-center z-10">
                        <Text className={`text-xs font-bold tracking-[0.3em] uppercase mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Секундомір</Text>
                        <View className="flex-row items-baseline">
                            <Text className={`text-7xl font-black font-mono tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{timeObj.main}</Text>
                            <Text className={`text-4xl font-black font-mono mb-1 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`}>{timeObj.decimal}</Text>
                        </View>
                    </View>
                </View>

                {/* Controls */}
                <View className="flex-row w-full justify-between px-4">
                    <TouchableOpacity onPress={reset} className={`w-20 h-20 rounded-full items-center justify-center border ${isDark ? 'bg-slate-800 border-slate-700 active:bg-slate-700' : 'bg-white border-slate-200 active:bg-slate-100 shadow-sm'}`}>
                        <Ionicons name="refresh" size={24} color={isDark ? "#94a3b8" : "#64748b"} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggle} className={`h-20 flex-1 mx-6 rounded-2xl items-center justify-center shadow-lg flex-row ${isActive ? 'bg-red-500 shadow-red-500/20' : (isDark ? 'bg-green-500 shadow-green-500/20' : 'bg-green-500 shadow-green-400/30')}`}>
                        <Feather name={isActive ? "pause" : "play"} size={24} color={isActive ? "white" : "#0f172a"} style={{marginRight: 8}} />
                        <Text className={`font-black text-xl uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-900'}`}>{isActive ? 'Стоп' : 'Старт'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}