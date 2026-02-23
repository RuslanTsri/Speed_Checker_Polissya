import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useBle } from '../../context/BleContext';
import { SensorCard } from '../components/SensorCard';
import { formatTime } from '../../utils/time';
import { PulseRing } from '../components/PulseRing';
import { useTheme } from '../../context/ThemeContext'; // 🔥 Імпорт теми

interface BluetoothToolProps {
    onBack: () => void;
}

export default function BluetoothTool({ onBack }: BluetoothToolProps) {
    const { isDark } = useTheme(); // 🔥 Стейт
    const {
        connected, state, sensors, elapsedTime, pingProgress,
        startDiscovery, startTraining, stopTraining, stopPing,
        resetSession, disconnect
    } = useBle();

    const renderHeader = () => (
        <View className="px-4 pt-2">
            <View className={`p-6 rounded-3xl border shadow-lg mb-6 items-center ${
                connected ? (isDark ? 'bg-slate-900 border-green-500/20' : 'bg-white border-green-500') : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')
            }`}>
                <View className="mb-4 items-center justify-center h-24 w-24 relative">
                    {state === 'discovering' && (
                        <View className="absolute w-full h-full items-center justify-center pointer-events-none">
                            <PulseRing delay={0} />
                            <PulseRing delay={1000} />
                        </View>
                    )}
                    <View className={`w-20 h-20 rounded-full items-center justify-center border-2 z-10 ${
                        connected ? (isDark ? 'bg-green-500/10 border-green-500' : 'bg-green-100 border-green-500') : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200')
                    }`}>
                        <MaterialCommunityIcons
                            name={connected ? "bluetooth-connect" : "bluetooth-off"}
                            size={36}
                            color={connected ? (isDark ? "#4ade80" : "#16a34a") : (isDark ? "#64748b" : "#94a3b8")}
                        />
                    </View>
                </View>

                {state === 'discovering' ? (
                    <View className="items-center w-full">
                        <Text className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Пошук пристроїв</Text>
                        <ActivityIndicator size="small" color={isDark ? "#facc15" : "#eab308"} className="mb-2" />
                        <Text className={`text-center text-xs font-medium uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {pingProgress || 'Скануємо ефір...'}
                        </Text>
                    </View>
                ) : (
                    <View className="items-center w-full">
                        <Text className={`text-2xl font-black mb-1 tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {connected ? 'STM32 Master' : 'Не підключено'}
                        </Text>
                        <Text className={`text-xs mb-5 uppercase tracking-widest font-bold ${
                            connected ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-slate-500' : 'text-slate-500')
                        }`}>
                            {connected ? 'Система готова' : 'Очікування з\'єднання'}
                        </Text>

                        {connected && (
                            <TouchableOpacity
                                onPress={disconnect}
                                className={`border px-6 py-2.5 rounded-full flex-row items-center ${isDark ? 'bg-slate-950 border-slate-800 active:bg-slate-800' : 'bg-slate-50 border-slate-200 active:bg-slate-100'}`}
                            >
                                <Feather name="power" size={14} color="#ef4444" style={{marginRight: 6}} />
                                <Text className={`font-bold text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Відключити</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            {(state === 'active' || state === 'armed' || state === 'finished') && (
                <View className={`mb-6 p-6 rounded-3xl border-2 items-center justify-center shadow-sm ${
                    state === 'armed' ? (isDark ? 'bg-yellow-900/10 border-yellow-500/50' : 'bg-yellow-50 border-yellow-400') :
                        state === 'active' ? (isDark ? 'bg-green-900/10 border-green-500/50' : 'bg-green-50 border-green-400') :
                            (isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200')
                }`}>
                    <View className="flex-row items-center mb-2">
                        <Feather
                            name={state === 'armed' ? "clock" : state === 'active' ? "play-circle" : "flag"}
                            size={14}
                            color={state === 'armed' ? (isDark ? "#facc15" : "#eab308") : state === 'active' ? (isDark ? "#4ade80" : "#16a34a") : (isDark ? "#94a3b8" : "#64748b")}
                        />
                        <Text className={`text-[10px] font-bold tracking-[0.2em] uppercase ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Час заїзду</Text>
                    </View>

                    <Text className={`text-6xl font-mono font-black tracking-tighter ${
                        state === 'armed' ? (isDark ? 'text-yellow-400' : 'text-yellow-500') :
                            state === 'active' ? (isDark ? 'text-green-400' : 'text-green-600') :
                                (isDark ? 'text-white' : 'text-slate-900')
                    }`}>
                        {formatTime(elapsedTime)}
                    </Text>

                    {state === 'armed' && (
                        <View className={`mt-3 px-4 py-1.5 rounded-full ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                            <Text className={`text-[10px] font-bold uppercase tracking-widest animate-pulse ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                Очікування старту...
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {connected && (
                <View className="flex-row justify-between items-end mb-3 mt-2 px-1">
                    <Text className={`text-[11px] font-bold tracking-widest uppercase ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Датчики телеметрії</Text>
                    <View className={`px-2.5 py-1 rounded-md flex-row items-center ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                        <Text className={`text-[10px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            АКТИВНІ: {sensors.filter(s => s.status === 'active').length}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <View className={`flex-1 pt-4 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <View className="px-4 mb-2 flex-row items-center justify-between z-10">
                <TouchableOpacity onPress={onBack} className={`w-10 h-10 items-center justify-center -ml-2 rounded-full ${isDark ? 'active:bg-slate-800' : 'active:bg-slate-200'}`}>
                    <Feather name="chevron-left" size={28} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
                <Text className={`font-bold text-sm tracking-widest uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Телеметрія</Text>
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

            <View className={`absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4 border-t ${isDark ? 'bg-slate-950/90 border-slate-900' : 'bg-white/90 border-slate-200'}`}>
                {!connected && state !== 'discovering' && (
                    <TouchableOpacity onPress={startDiscovery} className={`w-full py-4 rounded-2xl shadow-lg flex-row items-center justify-center ${isDark ? 'bg-yellow-400 shadow-yellow-400/20 active:bg-yellow-500' : 'bg-yellow-400 shadow-yellow-400/30 active:bg-yellow-500'}`}>
                        <Feather name="search" size={20} color="#0f172a" style={{marginRight: 8}} />
                        <Text className="text-slate-900 font-black text-base uppercase tracking-wider">Знайти пристрій</Text>
                    </TouchableOpacity>
                )}

                {state === 'discovering' && (
                    <TouchableOpacity onPress={stopPing} className={`border w-full py-4 rounded-2xl flex-row items-center justify-center ${isDark ? 'bg-slate-800 border-red-500/30 active:bg-slate-700' : 'bg-white border-red-500/50 active:bg-red-50'}`}>
                        <Feather name="x" size={20} color="#ef4444" style={{marginRight: 8}} />
                        <Text className="text-red-500 font-bold text-base uppercase tracking-wider">Скасувати пошук</Text>
                    </TouchableOpacity>
                )}

                {connected && (state === 'idle' || state === 'ready') && (
                    <View className="flex-row space-x-3">
                        <TouchableOpacity onPress={startDiscovery} className={`w-16 border rounded-2xl items-center justify-center ${isDark ? 'bg-slate-900 border-slate-700 active:bg-slate-800' : 'bg-white border-slate-300 active:bg-slate-100'}`}>
                            <MaterialCommunityIcons name="radar" size={24} color={isDark ? "#facc15" : "#eab308"} />
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
                        <TouchableOpacity onPress={stopTraining} className={`flex-1 border py-4 rounded-2xl items-center justify-center ${isDark ? 'bg-slate-900 border-slate-700 active:bg-slate-800' : 'bg-white border-slate-300 active:bg-slate-100'}`}>
                            <Text className={`font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Скинути</Text>
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