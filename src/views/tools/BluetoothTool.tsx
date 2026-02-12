import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { useBle } from '../../context/BleContext';
import { SensorCard } from '../components/SensorCard';
import { formatTime } from '../../utils/time';
import { PulseRing } from '../components/PulseRing';

interface BluetoothToolProps {
    onBack: () => void;
}

export default function BluetoothTool({ onBack }: BluetoothToolProps) {
    const {
        connected, state, sensors, elapsedTime, pingProgress,
        startDiscovery, startTraining, stopTraining, stopPing,
        resetSession, disconnect
    } = useBle();

    return (
        <View className="flex-1 bg-slate-950 pt-4 relative">
            {/* Header */}
            <View className="px-4 mb-6 flex-row items-center justify-between">
                <TouchableOpacity onPress={onBack} className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-slate-800">
                    <Feather name="chevron-left" size={28} color="white" />
                </TouchableOpacity>
                {connected && (
                    <View className="px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                        <Text className="text-green-400 text-[10px] font-bold uppercase">Connected</Text>
                    </View>
                )}
            </View>

            <View className="flex-1 px-4">
                {/* Main Status Card */}
                <View className={`p-6 rounded-3xl border items-center shadow-lg mb-6 ${connected ? 'bg-slate-900 border-green-500/30' : 'bg-slate-900 border-slate-800'}`}>
                    <View className="mb-4 items-center justify-center h-24 w-24 relative">
                        {state === 'discovering' && (
                            <View className="absolute w-full h-full items-center justify-center pointer-events-none">
                                <PulseRing delay={0} />
                                <PulseRing delay={1000} />
                            </View>
                        )}
                        <View className={`w-20 h-20 rounded-full items-center justify-center border-2 z-10 ${connected ? 'bg-green-500/10 border-green-500' : 'bg-slate-800 border-slate-700'}`}>
                            <MaterialCommunityIcons name={connected ? "bluetooth" : "bluetooth-off"} size={32} color={connected ? "#4ade80" : "#94a3b8"} />
                        </View>
                    </View>

                    {state === 'discovering' ? (
                        <>
                            <Text className="text-white text-xl font-bold mb-2">Пошук пристроїв...</Text>
                            <ActivityIndicator size="small" color="#facc15" className="mb-2" />
                            <Text className="text-slate-500 text-center text-xs font-medium mb-4">{pingProgress || 'Скануємо ефір...'}</Text>
                            <TouchableOpacity onPress={stopPing} className="bg-red-500/10 border border-red-500/50 px-6 py-2 rounded-xl">
                                <Text className="text-red-400 font-bold text-xs uppercase">Скасувати</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text className="text-white text-2xl font-bold mb-1">{connected ? 'STM32 Master' : 'Не підключено'}</Text>
                            <Text className="text-slate-500 text-xs mb-6 uppercase tracking-widest font-bold">
                                {connected ? 'Готовий до роботи' : 'Очікування з\'єднання'}
                            </Text>
                            {!connected ? (
                                <TouchableOpacity onPress={startDiscovery} className="bg-yellow-400 w-full py-4 rounded-2xl shadow-lg shadow-yellow-400/20 active:bg-yellow-500 items-center">
                                    <Text className="text-slate-900 font-bold text-lg uppercase">Знайти пристрій</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={disconnect} className="bg-slate-800 border border-slate-700 w-full py-3 rounded-2xl items-center flex-row justify-center active:bg-slate-700">
                                    <Feather name="power" size={16} color="#ef4444" style={{marginRight: 8}} />
                                    <Text className="text-slate-300 font-bold text-sm uppercase">Відключитися</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>

                {/* Timer Display */}
                {(state === 'active' || state === 'armed' || state === 'finished') && (
                    <View className={`mb-6 p-6 rounded-3xl border-2 items-center justify-center ${state === 'armed' ? 'bg-yellow-900/10 border-yellow-500' : state === 'active' ? 'bg-green-900/10 border-green-500' : 'bg-slate-900 border-slate-700'}`}>
                        <Text className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Час заїзду</Text>
                        <Text className={`text-6xl font-mono font-black ${state === 'armed' ? 'text-yellow-400' : state === 'active' ? 'text-green-400' : 'text-white'}`}>
                            {formatTime(elapsedTime)}
                        </Text>
                        {state === 'armed' && (
                            <View className="mt-2 bg-yellow-500/20 px-3 py-1 rounded-lg">
                                <Text className="text-yellow-400 text-xs font-bold uppercase animate-pulse">Очікування старту</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Sensors List */}
                {connected && (
                    <View className="flex-1">
                        <View className="flex-row justify-between items-end mb-4 px-1">
                            <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase">Датчики</Text>
                            <View className="bg-slate-800 px-2 py-0.5 rounded text-xs">
                                <Text className="text-slate-400 text-[10px] font-bold">АКТИВНІ: {sensors.filter(s => s.status === 'active').length}</Text>
                            </View>
                        </View>
                        <FlatList
                            data={sensors}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({item}) => <SensorCard item={item} />}
                            className="flex-1"
                            contentContainerStyle={{ paddingBottom: 120 }}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}
            </View>

            {/* Bottom Controls */}
            {connected && state !== 'discovering' && (
                <View className="absolute bottom-8 left-4 right-4 shadow-xl">
                    {state === 'idle' || state === 'ready' ? (
                        <View className="flex-row space-x-3">
                            <TouchableOpacity onPress={startDiscovery} className="w-16 bg-slate-800 border border-slate-700 rounded-2xl items-center justify-center active:bg-slate-700">
                                <MaterialCommunityIcons name="radar" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={startTraining} className="flex-1 bg-green-500 py-4 rounded-2xl items-center shadow-lg shadow-green-500/20 active:bg-green-600 flex-row justify-center">
                                <Feather name="play" size={20} color="#0f172a" style={{marginRight: 8}} />
                                <Text className="text-slate-900 font-black text-lg uppercase">Почати заїзд</Text>
                            </TouchableOpacity>
                        </View>
                    ) : state === 'active' ? (
                        <TouchableOpacity onPress={stopTraining} className="bg-red-500 py-5 rounded-3xl items-center shadow-lg shadow-red-500/30 active:bg-red-600 flex-row justify-center">
                            <Feather name="square" size={24} color="white" style={{marginRight: 10}} />
                            <Text className="text-white font-black text-xl uppercase tracking-widest">СТОП</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="flex-row space-x-3">
                            <TouchableOpacity onPress={stopTraining} className="flex-1 bg-red-500/20 border border-red-500/50 py-4 rounded-2xl items-center active:bg-red-500/30">
                                <Text className="text-red-400 font-bold uppercase">Стоп</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={resetSession} className="flex-[2] bg-yellow-400 py-4 rounded-2xl items-center active:bg-yellow-500 shadow-lg shadow-yellow-400/20">
                                <Text className="text-slate-900 font-black text-lg uppercase">Новий заїзд</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}