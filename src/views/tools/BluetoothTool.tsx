import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTrainingBle } from '../../hooks/useTrainingBle';
import { SensorCard } from '../components/SensorCard';
import { AppModal } from '../components/AppModal';
import { useTheme } from '../../context/ThemeContext';
import { formatTime } from '../../utils/time';

export default function BluetoothTool({ onBack }: { onBack: () => void }) {
    const { isDark } = useTheme();
    const {
        connected, state, sensors, elapsedTime, scannedDevices, canFinish,
        startDiscovery, stopScanning, connectToDevice, disconnect,
        finishInitialization, startTraining, stopTraining, resetSession, simulateWebTrigger
    } = useTrainingBle();

    const isScanning = state === 'discovering';

    const renderHeader = () => (
        <View className="px-4 pt-2">
            {/* Status Card */}
            <View className={`p-6 rounded-3xl border mb-6 items-center shadow-md ${
                connected ? (isDark ? 'bg-slate-900 border-green-500/20' : 'bg-white border-green-500') : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')
            }`}>
                <MaterialCommunityIcons name={connected ? "bluetooth-connect" : "bluetooth-off"} size={48} color={connected ? "#4ade80" : "#64748b"} />
                <Text className={`text-xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {connected ? 'STM32 Master Підключено' : 'BLE Не підключено'}
                </Text>
                {connected && (
                    <TouchableOpacity onPress={disconnect} className="mt-3 bg-red-500/10 px-4 py-1.5 rounded-full">
                        <Text className="text-red-500 font-bold uppercase text-[10px]">Розірвати зв'язок</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* LEARNING MODE UI */}
            {state === 'initializing_sensors' && (
                <View className="mb-6 p-6 bg-blue-500/10 border border-blue-500/30 rounded-3xl items-center">
                    <MaterialCommunityIcons name="gesture-double-tap" size={40} color="#3b82f6" className="mb-2" />
                    <Text className="text-blue-400 font-black text-xl text-center uppercase">Активуйте датчик №{sensors.length}</Text>
                    <Text className="text-slate-500 text-center mt-1 text-xs mb-4 px-6">
                        Потрібно мінімум 2 датчики (Master + 1 сателіт). Зараз: {sensors.length}
                    </Text>

                    {Platform.OS === 'web' && (
                        <TouchableOpacity onPress={simulateWebTrigger} className="bg-yellow-400 px-6 py-2 rounded-xl mb-4 active:bg-yellow-500">
                            <Text className="text-slate-900 font-bold text-xs uppercase">Simulate Wave</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={finishInitialization}
                        disabled={!canFinish}
                        className={`px-8 py-3 rounded-xl shadow-lg ${canFinish ? 'bg-blue-500 shadow-blue-500/30' : 'bg-slate-800 opacity-50'}`}
                    >
                        <Text className={`font-bold uppercase text-xs ${canFinish ? 'text-white' : 'text-slate-500'}`}>
                            {canFinish ? 'Завершити налаштування' : 'Додайте ще датчик'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* TIMER */}
            {['ready', 'armed', 'active', 'finished'].includes(state) && (
                <View className={`mb-6 p-6 rounded-3xl border-2 items-center shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <Text className={`text-5xl font-mono font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatTime(elapsedTime)}</Text>
                </View>
            )}
        </View>
    );

    return (
        <View className={`flex-1 pt-4 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <View className="px-4 mb-4 flex-row items-center justify-between">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2"><Feather name="chevron-left" size={28} color={isDark ? "white" : "black"} /></TouchableOpacity>
                <Text className={`font-bold uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Lora Телеметрія</Text>
                <View className="w-10" />
            </View>

            <FlatList
                data={sensors}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                renderItem={({item}) => <View className="px-4 mb-2"><SensorCard item={item} /></View>}
                contentContainerStyle={{ paddingBottom: 140 }}
            />

            <View className={`absolute bottom-0 left-0 right-0 p-4 pb-10 border-t ${isDark ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200'}`}>
                {!connected ? (
                    <TouchableOpacity onPress={startDiscovery} className="bg-yellow-400 w-full py-5 rounded-2xl items-center shadow-lg active:bg-yellow-500">
                        <Text className="text-slate-900 font-black text-lg uppercase tracking-widest">Знайти Master</Text>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-row space-x-3">
                        {state === 'ready' && <TouchableOpacity onPress={startTraining} className="flex-1 bg-green-500 py-5 rounded-2xl items-center shadow-lg"><Text className="text-slate-900 font-black text-lg uppercase">Старт</Text></TouchableOpacity>}
                        {state === 'active' && <TouchableOpacity onPress={stopTraining} className="flex-1 bg-red-500 py-5 rounded-2xl items-center shadow-lg"><Text className="text-white font-black text-lg uppercase">Стоп</Text></TouchableOpacity>}
                        {state === 'finished' && <TouchableOpacity onPress={resetSession} className="flex-1 bg-yellow-400 py-5 rounded-2xl items-center shadow-lg"><Text className="text-slate-900 font-black text-lg uppercase">Скинути</Text></TouchableOpacity>}
                    </View>
                )}
            </View>

            <AppModal visible={isScanning} onClose={stopScanning} title="Вибір STM32 Master" type="bottom">
                <View className="min-h-[300px]">
                    <FlatList
                        data={scannedDevices}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => connectToDevice(item)} className={`p-5 mb-3 rounded-2xl border flex-row justify-between items-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                                <View><Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</Text><Text className="text-slate-500 text-xs">{item.id}</Text></View>
                                <Feather name="plus-circle" size={24} color="#facc15" />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <View className="py-12 items-center"><ActivityIndicator color="#facc15" size="large" /><Text className="text-slate-500 mt-4">Шукаємо пристрої...</Text></View>
                        )}
                    />
                </View>
            </AppModal>
        </View>
    );
}