import React, { useState, useEffect } from 'react'; // 🔥 Додали хуки
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useBle } from '../../context/BleContext';
import { SensorCard } from '../components/SensorCard';
import { AppModal } from '../components/AppModal';
import { useTheme } from '../../context/ThemeContext';
import { formatTime } from '../../utils/time';

export default function BluetoothTool({ onBack }: { onBack: () => void }) {
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const {
        connected, state, sensors, elapsedTime, scannedDevices, canFinish,
        startDiscovery, stopScanning, connectToDevice, disconnect,
        finishInitialization, startTraining, stopTraining, resetSession, simulateWebTrigger
    } = useBle();

    // 🔥 ТАЙМЕР ПІДКЛЮЧЕННЯ (15 секунд)
    const [connectionTimer, setConnectionTimer] = useState(15);
    const isScanning = state === 'discovering';
    const isConnecting = state === 'connecting'; // Переконайся, що в хуку setState('connecting')

    // Логіка відліку для модалки
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isConnecting && connectionTimer > 0) {
            interval = setInterval(() => {
                setConnectionTimer(prev => prev - 1);
            }, 1000);
        } else if (!isConnecting) {
            setConnectionTimer(15); // Скидаємо таймер, коли підключення завершено/перервано
        }
        return () => clearInterval(interval);
    }, [isConnecting, connectionTimer]);

    const renderHeader = () => (
        <View className="px-4 pt-2">
            <View className={`p-6 rounded-3xl border mb-6 items-center shadow-md ${
                connected ? (isDark ? 'bg-slate-900 border-green-500/20' : 'bg-white border-green-500') : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200')
            }`}>
                <MaterialCommunityIcons name={connected ? "bluetooth-connect" : "bluetooth-off"} size={48} color={connected ? "#4ade80" : "#64748b"} />
                <Text className={`text-xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {connected ? (t('tools.bluetooth.master_connected') as string) : (t('tools.bluetooth.ble_disconnected') as string)}
                </Text>
                {connected && (
                    <TouchableOpacity onPress={disconnect} className="mt-3 bg-red-500/10 px-4 py-1.5 rounded-full">
                        <Text className="text-red-500 font-bold uppercase text-[10px]">{t('tools.bluetooth.disconnect') as string}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {state === 'initializing_sensors' && (
                <View className="mb-6 p-6 bg-blue-500/10 border border-blue-500/30 rounded-3xl items-center">
                    <MaterialCommunityIcons name="gesture-double-tap" size={40} color="#3b82f6" className="mb-2" />
                    <Text className="text-blue-400 font-black text-xl text-center uppercase">
                        {t('tools.bluetooth.activate_sensor', { id: sensors.length }) as string}
                    </Text>
                    <Text className="text-slate-500 text-center mt-1 text-xs mb-4 px-6">
                        {t('tools.bluetooth.sensor_requirement', { count: sensors.length }) as string}
                    </Text>

                    {Platform.OS === 'web' && (
                        <TouchableOpacity onPress={simulateWebTrigger} className="bg-yellow-400 px-6 py-2 rounded-xl mb-4 active:bg-yellow-500">
                            <Text className="text-slate-900 font-bold text-xs uppercase">{t('tools.bluetooth.simulate_wave') as string}</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={finishInitialization}
                        disabled={!canFinish}
                        className={`px-8 py-3 rounded-xl shadow-lg ${canFinish ? 'bg-blue-500 shadow-blue-500/30' : 'bg-slate-800 opacity-50'}`}
                    >
                        <Text className={`font-bold uppercase text-xs ${canFinish ? 'text-white' : 'text-slate-500'}`}>
                            {canFinish ? (t('tools.bluetooth.finish_setup') as string) : (t('tools.bluetooth.add_more_sensor') as string)}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

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
                <Text className={`font-bold uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('tools.bluetooth.title') as string}</Text>
                <View className="w-10" />
            </View>

            <FlatList
                data={sensors} keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                renderItem={({item}) => <View className="px-4 mb-2"><SensorCard item={item} /></View>}
                contentContainerStyle={{ paddingBottom: 140 }}
            />

            <View className={`absolute bottom-0 left-0 right-0 p-4 pb-10 border-t ${isDark ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200'}`}>
                {!connected ? (
                    <TouchableOpacity onPress={startDiscovery} className="bg-yellow-400 w-full py-5 rounded-2xl items-center shadow-lg active:bg-yellow-500">
                        <Text className="text-slate-900 font-black text-lg uppercase tracking-widest">{t('tools.bluetooth.find_master') as string}</Text>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-row space-x-3">
                        {state === 'ready' && <TouchableOpacity onPress={startTraining} className="flex-1 bg-green-500 py-5 rounded-2xl items-center shadow-lg"><Text className="text-slate-900 font-black text-lg uppercase">{t('tools.bluetooth.start') as string}</Text></TouchableOpacity>}
                        {state === 'active' && <TouchableOpacity onPress={stopTraining} className="flex-1 bg-red-500 py-5 rounded-2xl items-center shadow-lg"><Text className="text-white font-black text-lg uppercase">{t('tools.bluetooth.stop') as string}</Text></TouchableOpacity>}
                        {state === 'finished' && <TouchableOpacity onPress={resetSession} className="flex-1 bg-yellow-400 py-5 rounded-2xl items-center shadow-lg"><Text className="text-slate-900 font-black text-lg uppercase">{t('tools.bluetooth.reset') as string}</Text></TouchableOpacity>}
                    </View>
                )}
            </View>

            {/* 🔥 ОНОВЛЕНА МОДАЛКА: ПОШУК + ПІДКЛЮЧЕННЯ */}
            <AppModal
                visible={isScanning || isConnecting}
                onClose={isConnecting ? () => {} : stopScanning} // Блокуємо закриття при підключенні
                title={isConnecting ? t('tools.bluetooth.connecting_title') : t('tools.bluetooth.select_master')}
                type="bottom"
            >
                <View className="min-h-[320px] pb-6">
                    {isConnecting ? (
                        /* --- СТАН ПІДКЛЮЧЕННЯ (ТАЙМЕР) --- */
                        <View className="items-center justify-center py-10">
                            <View className="relative items-center justify-center">
                                {/* Великий лоадер */}
                                <ActivityIndicator size={120} color="#facc15" style={{ transform: [{ scale: 2.5 }] }} />
                                {/* Таймер по центру */}
                                <View className="absolute">
                                    <Text className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {connectionTimer}
                                    </Text>
                                </View>
                            </View>
                            <Text className={`text-xl font-bold mt-12 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {t('tools.bluetooth.establishing')}
                            </Text>
                            <Text className="text-slate-500 text-center mt-2 px-10">
                                {t('tools.bluetooth.stay_close')}
                            </Text>
                        </View>
                    ) : (
                        /* --- СТАН ПОШУКУ (СПИСОК) --- */
                        <View className="flex-1">
                            <View className="flex-row items-center justify-center py-4 mb-2">
                                <ActivityIndicator size="small" color="#facc15" className="mr-3" />
                                <Text className="text-slate-500 font-medium">{t('tools.bluetooth.searching')}</Text>
                            </View>
                            <FlatList
                                data={scannedDevices}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => connectToDevice(item)}
                                        className={`p-5 mb-3 rounded-2xl border flex-row justify-between items-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                        <View>
                                            <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</Text>
                                            <Text className="text-slate-500 text-xs">{item.id}</Text>
                                        </View>
                                        <Feather name="plus-circle" size={24} color="#facc15" />
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={() => (
                                    <View className="py-16 items-center">
                                        <MaterialCommunityIcons name="radar" size={50} color={isDark ? "#334155" : "#cbd5e1"} />
                                        <Text className="text-slate-500 mt-4">{t('tools.bluetooth.no_devices')}</Text>
                                    </View>
                                )}
                            />
                        </View>
                    )}
                </View>
            </AppModal>
        </View>
    );
}