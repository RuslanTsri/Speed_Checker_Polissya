import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTestConfiguration } from '../../../hooks/tempoMetrics/useTestConfiguration';

interface Props {
    onBack: () => void;
    onStart: (distance: number) => void;
    testType: string;
    selectedPlayersCount: number;
}

export default function QuickTestConfig({ onBack, onStart, testType, selectedPlayersCount }: Props) {
    // Вся логіка тут
    const {
        distance, setDistance,
        splitPositions, adjustSplit,
        sensorsCount, intermediateCount
    } = useTestConfiguration();

    return (
        <View className="flex-1 bg-slate-950 pt-4 px-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
                    <Feather name="chevron-left" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Налаштування тесту</Text>
                <View className="w-10" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Info Chips */}
                <View className="flex-row justify-center space-x-2 mb-8">
                    {testType === 'TEAM' && (
                        <View className="bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg flex-row items-center">
                            <Feather name="users" size={12} color="#60a5fa" style={{ marginRight: 6 }} />
                            <Text className="text-blue-400 text-xs font-bold">Гравців: {selectedPlayersCount}</Text>
                        </View>
                    )}
                    <View className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex-row items-center">
                        <MaterialCommunityIcons name="layers" size={12} color="#94a3b8" style={{ marginRight: 6 }} />
                        <Text className="text-slate-400 text-xs font-bold">{sensorsCount} гейти</Text>
                    </View>
                    <View className="bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-lg flex-row items-center">
                        <Feather name="wifi" size={12} color="#4ade80" style={{ marginRight: 6 }} />
                        <Text className="text-green-400 text-xs font-bold">З пристроєм</Text>
                    </View>
                </View>

                {/* Distance Selector */}
                <Text className="text-slate-500 text-xs font-bold uppercase mb-3 ml-1">Загальна дистанція</Text>
                <View className="flex-row space-x-3 mb-8">
                    {[30, 60, 100].map(d => (
                        <TouchableOpacity
                            key={d}
                            onPress={() => setDistance(d)}
                            className={`flex-1 py-4 rounded-2xl items-center border ${distance === d ? 'bg-yellow-400 border-yellow-400' : 'bg-slate-900 border-slate-800'}`}
                        >
                            <Text className={`text-lg font-black ${distance === d ? 'text-slate-900' : 'text-slate-500'}`}>{d} м</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Gate Scheme Visualization */}
                <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white font-bold text-lg">Схема розташування</Text>
                        {intermediateCount > 0 && (
                            <Text className="text-slate-500 text-[10px] uppercase font-bold">Можна змінювати</Text>
                        )}
                    </View>

                    {/* 🔥 TRACK CONTAINER */}
                    <View className="h-40 relative mx-4">
                        <View className="h-[2px] bg-slate-700 w-full absolute top-1/2 mt-[-1px]" />

                        {/* START MARKER */}
                        <View className="absolute top-0 bottom-0 w-20 -ml-10 items-center justify-center" style={{ left: '0%' }}>
                            <View className="mb-2 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                <Text className="text-slate-500 font-bold text-[10px]">0 м</Text>
                            </View>
                            <View className="w-1.5 h-8 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                            <Text className="mt-2 text-[10px] font-bold text-slate-500">START</Text>
                        </View>

                        {/* INTERMEDIATE MARKERS */}
                        {splitPositions.map((pos, i) => {
                            const percent = (pos / distance) * 100;
                            return (
                                <View key={i} className="absolute top-0 bottom-0 w-20 -ml-10 items-center justify-center" style={{ left: `${percent}%` }}>
                                    <View className="mb-2 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                        <Text className="text-blue-400 font-bold text-[10px]">{pos} м</Text>
                                    </View>
                                    <View className="w-1.5 h-8 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                                    <Text className="mt-2 text-[10px] font-bold text-blue-400 opacity-60">GATE {i+1}</Text>
                                </View>
                            );
                        })}

                        {/* FINISH MARKER */}
                        <View className="absolute top-0 bottom-0 w-20 -ml-10 items-center justify-center" style={{ left: '100%' }}>
                            <View className="mb-2 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                <Text className="text-white font-bold text-[10px]">{distance} м</Text>
                            </View>
                            <View className="w-1.5 h-8 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                            <Text className="mt-2 text-[10px] font-bold text-green-400">FINISH</Text>
                        </View>
                    </View>
                </View>

                {/* Manual Distribution Controls */}
                {intermediateCount > 0 && (
                    <View className="mb-8">
                        <Text className="text-slate-500 text-xs font-bold uppercase mb-3 ml-1">Налаштування сплітів</Text>
                        {splitPositions.map((pos, index) => (
                            <View key={index} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center mr-3 border border-blue-500/30">
                                        <Text className="text-blue-400 font-bold">{index + 1}</Text>
                                    </View>
                                    <Text className="text-white font-bold">Гейт {index + 1} (Спліт)</Text>
                                </View>

                                <View className="flex-row items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                                    <TouchableOpacity onPress={() => adjustSplit(index, -5)} className={`w-10 h-10 items-center justify-center rounded-lg ${(index === 0 && pos <= 5) || (index > 0 && pos <= splitPositions[index-1] + 5) ? 'bg-slate-900 opacity-50' : 'bg-slate-900 active:bg-slate-800'}`}>
                                        <Feather name="minus" size={18} color="white" />
                                    </TouchableOpacity>
                                    <View className="w-16 items-center">
                                        <Text className="text-white font-bold text-lg">{pos} <Text className="text-slate-500 text-xs">м</Text></Text>
                                    </View>
                                    <TouchableOpacity onPress={() => adjustSplit(index, 5)} className={`w-10 h-10 items-center justify-center rounded-lg ${(index === splitPositions.length - 1 && pos >= distance - 5) || (index < splitPositions.length - 1 && pos >= splitPositions[index+1] - 5) ? 'bg-slate-900 opacity-50' : 'bg-slate-900 active:bg-slate-800'}`}>
                                        <Feather name="plus" size={18} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity onPress={() => onStart(distance)} className="bg-yellow-400 w-full py-5 rounded-2xl items-center mb-10 shadow-lg shadow-yellow-400/20 active:bg-yellow-500 flex-row justify-center">
                    <Feather name="play" size={20} color="#0f172a" style={{ marginRight: 8 }} />
                    <Text className="text-slate-900 font-black text-lg uppercase">Почати тест</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}