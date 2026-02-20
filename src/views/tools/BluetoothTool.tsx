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

    const renderHeader = () => (
        <View className="px-4 pt-2">

            <View className={`p-6 rounded-3xl border shadow-lg mb-6 items-center ${
                connected ? 'bg-slate-900 border-green-500/20' : 'bg-slate-900 border-slate-800'
            }`}>
                <View className="mb-4 items-center justify-center h-24 w-24 relative">
                    {state === 'discovering' && (
                        <View className="absolute w-full h-full items-center justify-center pointer-events-none">
                            <PulseRing delay={0} />
                            <PulseRing delay={1000} />
                        </View>
                    )}
                    <View className={`w-20 h-20 rounded-full items-center justify-center border-2 z-10 ${
                        connected ? 'bg-green-500/10 border-green-500' : 'bg-slate-800 border-slate-700'
                    }`}>
                        <MaterialCommunityIcons
                            name={connected ? "bluetooth-connect" : "bluetooth-off"}
                            size={36}
                            color={connected ? "#4ade80" : "#64748b"}
                        />
                    </View>
                </View>

                {state === 'discovering' ? (
                    <View className="items-center w-full">
                        <Text className="text-white text-xl font-bold mb-2">Пошук пристроїв</Text>
                        <ActivityIndicator size="small" color="#facc15" className="mb-2" />
                        <Text className="text-slate-500 text-center text-xs font-medium uppercase tracking-widest">
                            {pingProgress || 'Скануємо ефір...'}
                        </Text>
                    </View>
                ) : (
                    <View className="items-center w-full">
                        <Text className="text-white text-2xl font-black mb-1 tracking-wide">
                            {connected ? 'STM32 Master' : 'Не підключено'}
                        </Text>
                        <Text className={`text-xs mb-5 uppercase tracking-widest font-bold ${
                            connected ? 'text-green-400' : 'text-slate-500'
                        }`}>
                            {connected ? 'Система готова' : 'Очікування з\'єднання'}
                        </Text>

                        {connected && (
                            <TouchableOpacity
                                onPress={disconnect}
                                className="bg-slate-950 border border-slate-800 px-6 py-2.5 rounded-full flex-row items-center active:bg-slate-800"
                            >
                                <Feather name="power" size={14} color="#ef4444" style={{marginRight: 6}} />
                                <Text className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Відключити</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {(state === 'active' || state === 'armed' || state === 'finished') && (
                <View className={`mb-6 p-6 rounded-3xl border-2 items-center justify-center ${
                    state === 'armed' ? 'bg-yellow-900/10 border-yellow-500/50' :
                        state === 'active' ? 'bg-green-900/10 border-green-500/50' :
                            'bg-slate-900 border-slate-700'
                }`}>
                    <View className="flex-row items-center mb-2">
                        <Feather
                            name={state === 'armed' ? "clock" : state === 'active' ? "play-circle" : "flag"}
                            size={14}
                            color={state === 'armed' ? "#facc15" : state === 'active' ? "#4ade80" : "#94a3b8"}
                        />
                        <Text className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase ml-2">Час заїзду</Text>
                    </View>

                    <Text className={`text-6xl font-mono font-black tracking-tighter ${
                        state === 'armed' ? 'text-yellow-400' :
                            state === 'active' ? 'text-green-400' :
                                'text-white'
                    }`}>
                        {formatTime(elapsedTime)}
                    </Text>

                    {state === 'armed' && (
                        <View className="mt-3 bg-yellow-500/20 px-4 py-1.5 rounded-full">
                            <Text className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                Очікування старту...
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {connected && (
                <View className="flex-row justify-between items-end mb-3 mt-2 px-1">
                    <Text className="text-slate-500 text-[11px] font-bold tracking-widest uppercase">Датчики телеметрії</Text>
                    <View className="bg-slate-800 px-2.5 py-1 rounded-md flex-row items-center">
                        <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                        <Text className="text-slate-300 text-[10px] font-bold">
                            АКТИВНІ: {sensors.filter(s => s.status === 'active').length}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-slate-950 pt-4">
            <View className="px-4 mb-2 flex-row items-center justify-between z-10">
                <TouchableOpacity onPress={onBack} className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-slate-800">
                    <Feather name="chevron-left" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-slate-300 font-bold text-sm tracking-widest uppercase">Телеметрія</Text>
                <View className="w-10" />
            </View>

            <FlatList
                data={connected ? sensors : []}
                keyExtractor={item => item.id.toString()}
                ListHeaderComponent={renderHeader}
                renderItem={({item}) => (
                    <View className="px-4">
                        <SensorCard item={item} />
                    </View>
                )}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
            />

            <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-slate-950/90 border-t border-slate-900">

                {!connected && state !== 'discovering' && (
                    <TouchableOpacity onPress={startDiscovery} className="bg-yellow-400 w-full py-4 rounded-2xl shadow-lg shadow-yellow-400/20 active:bg-yellow-500 flex-row items-center justify-center">
                        <Feather name="search" size={20} color="#0f172a" style={{marginRight: 8}} />
                        <Text className="text-slate-900 font-black text-base uppercase tracking-wider">Знайти пристрій</Text>
                    </TouchableOpacity>
                )}

                {state === 'discovering' && (
                    <TouchableOpacity onPress={stopPing} className="bg-slate-800 border border-red-500/30 w-full py-4 rounded-2xl active:bg-slate-700 flex-row items-center justify-center">
                        <Feather name="x" size={20} color="#ef4444" style={{marginRight: 8}} />
                        <Text className="text-red-400 font-bold text-base uppercase tracking-wider">Скасувати пошук</Text>
                    </TouchableOpacity>
                )}

                {connected && (state === 'idle' || state === 'ready') && (
                    <View className="flex-row space-x-3">
                        <TouchableOpacity onPress={startDiscovery} className="w-16 bg-slate-900 border border-slate-700 rounded-2xl items-center justify-center active:bg-slate-800">
                            <MaterialCommunityIcons name="radar" size={24} color="#facc15" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={startTraining} className="flex-1 bg-green-500 py-4 rounded-2xl items-center shadow-lg shadow-green-500/20 active:bg-green-600 flex-row justify-center">
                            <Feather name="play" size={20} color="#0f172a" style={{marginRight: 8}} />
                            <Text className="text-slate-900 font-black text-base uppercase tracking-wider">Почати заїзд</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {connected && state === 'active' && (
                    <TouchableOpacity onPress={stopTraining} className="bg-red-500 py-4 rounded-2xl items-center shadow-lg shadow-red-500/30 active:bg-red-600 flex-row justify-center">
                        <Feather name="square" size={20} color="white" style={{marginRight: 8}} />
                        <Text className="text-white font-black text-base uppercase tracking-widest">СТОП</Text>
                    </TouchableOpacity>
                )}

                {connected && (state === 'armed' || state === 'finished') && (
                    <View className="flex-row space-x-3">
                        <TouchableOpacity onPress={stopTraining} className="flex-1 bg-slate-900 border border-slate-700 py-4 rounded-2xl items-center justify-center active:bg-slate-800">
                            <Text className="text-slate-300 font-bold uppercase tracking-wider">Скинути</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={resetSession} className="flex-[2] bg-yellow-400 py-4 rounded-2xl items-center active:bg-yellow-500 shadow-lg shadow-yellow-400/20 flex-row justify-center">
                            <Feather name="rotate-ccw" size={18} color="#0f172a" style={{marginRight: 8}} />
                            <Text className="text-slate-900 font-black text-base uppercase tracking-wider">Новий заїзд</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}