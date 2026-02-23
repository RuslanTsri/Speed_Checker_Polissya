import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTestConfiguration } from '../../../hooks/tempoMetrics/useTestConfiguration';
import { useTheme } from '../../../context/ThemeContext'; // 🔥 Тема

interface Props {
    onBack: () => void;
    onStart: (distance: number) => void;
    playerCount: number;
    testType?: string;
}

export default function QuickTestConfig({ onBack, onStart, playerCount, testType }: Props) {
    const { isDark } = useTheme(); // 🔥 Стейт
    const {
        distance, setDistance, splitPositions, adjustSplit,
        sensorsCount, intermediateCount
    } = useTestConfiguration();

    return (
        <View className="flex-1 px-4 pt-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity onPress={onBack} className={`p-2 -ml-2 rounded-full ${isDark ? 'active:bg-slate-800' : 'active:bg-slate-200'}`}>
                    <Feather name="chevron-left" size={28} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Налаштування тесту</Text>
                <View className="w-10" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Info Chips */}
                <View className="flex-row justify-center space-x-2 mb-8">
                    {testType === 'TEAM' && (
                        <View className={`border px-3 py-1.5 rounded-lg flex-row items-center ${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                            <Feather name="users" size={12} color={isDark ? "#60a5fa" : "#3b82f6"} style={{ marginRight: 6 }} />
                            <Text className={`text-xs font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Гравців: {playerCount}</Text>
                        </View>
                    )}
                    <View className={`border px-3 py-1.5 rounded-lg flex-row items-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                        <MaterialCommunityIcons name="layers" size={12} color={isDark ? "#94a3b8" : "#64748b"} style={{ marginRight: 6 }} />
                        <Text className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{sensorsCount} гейти</Text>
                    </View>
                    <View className={`border px-3 py-1.5 rounded-lg flex-row items-center ${isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
                        <Feather name="wifi" size={12} color={isDark ? "#4ade80" : "#16a34a"} style={{ marginRight: 6 }} />
                        <Text className={`text-xs font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>З пристроєм</Text>
                    </View>
                </View>

                {/* Distance Selector */}
                <Text className={`text-xs font-bold uppercase mb-3 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Загальна дистанція</Text>
                <View className="flex-row space-x-3 mb-8">
                    {[30, 60, 100].map(d => (
                        <TouchableOpacity
                            key={d}
                            onPress={() => setDistance(d)}
                            className={`flex-1 py-4 rounded-2xl items-center border shadow-sm ${
                                distance === d
                                    ? (isDark ? 'bg-yellow-400 border-yellow-400' : 'bg-yellow-400 border-yellow-400')
                                    : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')
                            }`}
                        >
                            <Text className={`text-lg font-black ${distance === d ? 'text-slate-900' : (isDark ? 'text-slate-500' : 'text-slate-500')}`}>{d} м</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Gate Scheme Visualization */}
                <View className={`border rounded-3xl p-6 mb-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Схема розташування</Text>
                        {intermediateCount > 0 && (
                            <Text className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Можна змінювати</Text>
                        )}
                    </View>

                    <View className="h-40 relative mx-4">
                        <View className={`h-[2px] w-full absolute top-1/2 mt-[-1px] ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />

                        <View className="absolute top-0 bottom-0 w-20 -ml-10 items-center justify-center" style={{ left: '0%' }}>
                            <View className={`mb-2 px-2 py-0.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                                <Text className={`font-bold text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>0 м</Text>
                            </View>
                            <View className={`w-1.5 h-8 rounded-full ${isDark ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]'}`} />
                            <Text className={`mt-2 text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>START</Text>
                        </View>

                        {splitPositions.map((pos, i) => {
                            const percent = (pos / distance) * 100;
                            return (
                                <View key={i} className="absolute top-0 bottom-0 w-20 -ml-10 items-center justify-center" style={{ left: `${percent}%` }}>
                                    <View className={`mb-2 px-2 py-0.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                                        <Text className={`font-bold text-[10px] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{pos} м</Text>
                                    </View>
                                    <View className={`w-1.5 h-8 rounded-full ${isDark ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
                                    <Text className={`mt-2 text-[10px] font-bold opacity-60 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>GATE {i+1}</Text>
                                </View>
                            );
                        })}

                        <View className="absolute top-0 bottom-0 w-20 -ml-10 items-center justify-center" style={{ left: '100%' }}>
                            <View className={`mb-2 px-2 py-0.5 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                                <Text className={`font-bold text-[10px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{distance} м</Text>
                            </View>
                            <View className={`w-1.5 h-8 rounded-full ${isDark ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
                            <Text className={`mt-2 text-[10px] font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>FINISH</Text>
                        </View>
                    </View>
                </View>

                {/* Manual Distribution Controls */}
                {intermediateCount > 0 && (
                    <View className="mb-8">
                        <Text className={`text-xs font-bold uppercase mb-3 ml-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Налаштування сплітів</Text>
                        {splitPositions.map((pos, index) => (
                            <View key={index} className={`border rounded-2xl p-4 mb-3 flex-row items-center justify-between shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <View className="flex-row items-center">
                                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 border ${isDark ? 'bg-blue-500/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                                        <Text className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{index + 1}</Text>
                                    </View>
                                    <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Гейт {index + 1}</Text>
                                </View>

                                <View className={`flex-row items-center rounded-xl border p-1 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                    <TouchableOpacity onPress={() => adjustSplit(index, -5)} className={`w-10 h-10 items-center justify-center rounded-lg ${isDark ? 'active:bg-slate-800' : 'active:bg-slate-200'}`}>
                                        <Feather name="minus" size={18} color={isDark ? "white" : "black"} />
                                    </TouchableOpacity>
                                    <View className="w-16 items-center">
                                        <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{pos}м</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => adjustSplit(index, 5)} className={`w-10 h-10 items-center justify-center rounded-lg ${isDark ? 'active:bg-slate-800' : 'active:bg-slate-200'}`}>
                                        <Feather name="plus" size={18} color={isDark ? "white" : "black"} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={() => onStart(distance)} className={`w-full py-5 rounded-2xl items-center mb-10 shadow-lg flex-row justify-center ${isDark ? 'bg-yellow-400 active:bg-yellow-500 shadow-yellow-400/20' : 'bg-yellow-400 active:bg-yellow-500 shadow-yellow-400/30'}`}>
                    <Feather name="play" size={20} color="#0f172a" style={{ marginRight: 8 }} />
                    <Text className="text-slate-900 font-black text-lg uppercase">Почати тест</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}