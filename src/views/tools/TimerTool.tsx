import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useStopwatch } from '../../hooks/tools/useStopwatch';

export default function TimerTool({ onBack }: { onBack: () => void }) {
    const { timeObj, isActive, toggle, reset } = useStopwatch();

    return (
        <View className="flex-1 bg-slate-950 pt-4">
            {/* Header */}
            <View className="px-4 mb-10 flex-row items-center">
                <TouchableOpacity onPress={onBack} className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-slate-800">
                    <Feather name="chevron-left" size={28} color="white" />
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-6 items-center">
                {/* Timer Card */}
                <View className="w-full bg-slate-900 border border-slate-800 rounded-[40px] p-8 items-center justify-center shadow-lg shadow-black/50 mb-12 relative overflow-hidden">
                    <View className="absolute w-64 h-64 bg-slate-800/50 rounded-full" />
                    <View className="absolute w-48 h-48 bg-slate-800 rounded-full" />
                    <View className="items-center z-10">
                        <Text className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">Секундомір</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-white text-7xl font-black font-mono tracking-tighter">{timeObj.main}</Text>
                            <Text className="text-yellow-400 text-4xl font-black font-mono mb-1">{timeObj.decimal}</Text>
                        </View>
                    </View>
                </View>

                {/* Controls */}
                <View className="flex-row w-full justify-between px-4">
                    <TouchableOpacity onPress={reset} className="w-20 h-20 rounded-full items-center justify-center bg-slate-800 border border-slate-700 active:bg-slate-700">
                        <Ionicons name="refresh" size={24} color="#94a3b8" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggle} className={`h-20 flex-1 mx-6 rounded-2xl items-center justify-center shadow-lg flex-row ${isActive ? 'bg-red-500 shadow-red-500/20' : 'bg-green-500 shadow-green-500/20'}`}>
                        <Feather name={isActive ? "pause" : "play"} size={24} color={isActive ? "white" : "#0f172a"} style={{marginRight: 8}} />
                        <Text className={`font-black text-xl uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-900'}`}>{isActive ? 'Стоп' : 'Старт'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}