import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Platform, Pressable } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useBle } from '../../context/BleContext';

// Утиліти та Компоненти
import { formatTime } from '../../utils/time';
import { AppModal } from '../components/AppModal';
import { Button } from '../components/ui/Button';
import { Mod } from '../components/ui/mods';
import { SensorCard } from '../components/SensorCard';
import {
    ArrowIcon,
    ArrowIconActive,
    BleIcon,
    ConnectionIcon,
    ConnectionIconActive
} from '../../../assets/icons';

export default function BluetoothTool({ onBack }: { onBack: () => void }) {
    const { t } = useTranslation();
    const {
        connected, state, sensors, elapsedTime, scannedDevices, canFinish,
        startDiscovery, stopScanning, connectToDevice, disconnect, cancelConnecting,
        finishInitialization, startTraining, stopTraining, resetSession, simulateWebTrigger
    } = useBle();

    const [configStep, setConfigStep] = useState<'select' | 'check'>('select');
    const [targetGates, setTargetGates] = useState<number>(2);
    const [isIconActive, setIsIconActive] = useState(false);

    const isModalVisible = ['discovering', 'connecting', 'initializing_sensors'].includes(state);

    useEffect(() => {
        if (state === 'connecting') setConfigStep('select');
    }, [state]);

    // Ефект для блимання іконки
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state === 'initializing_sensors' && configStep === 'select') {
            interval = setInterval(() => {
                setIsIconActive(prev => !prev);
            }, 500);
        }
        return () => clearInterval(interval);
    }, [state, configStep]);

    const requiredSensors = targetGates - 1;
    const foundSensors = Math.max(0, sensors.length - 1);
    const progressPercent = Math.min((foundSensors / requiredSensors) * 100, 100);

    const handleCloseModal = () => {
        if (state === 'connecting') cancelConnecting();
        else if (state === 'discovering') stopScanning();
        else disconnect();
    };

    return (
        <View className="flex-1 pt-4 relative">
            {/* HEADER */}
            <View className="flex-row items-center justify-between px-4 mb-6 relative z-10">
                <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                    {({ pressed }) => (
                        <View style={{ transform: [{ rotate: '-90deg' }] }}>
                            {pressed ? <ArrowIconActive width={28} height={28} fill="#F5F5F5" /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                        </View>
                    )}
                </Pressable>
                <Text className="text-xl font-bold flex-1 text-center text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                    {t('tools.bluetooth.title')}
                </Text>
                <View className="w-10" />
            </View>

            <FlatList
                data={sensors}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 180 }}
                ListHeaderComponent={
                    <View className="mb-4">
                        {/* СТАТУС ПІДКЛЮЧЕННЯ (Компактний) */}
                        <View className="mb-6">
                            <View className="p-4 rounded-3xl border border-white/10 bg-white/5 flex-row items-center justify-between shadow-sm">
                                <View className="flex-row items-center gap-3 flex-1">
                                    <View className={`w-12 h-12 rounded-full items-center justify-center border ${connected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
                                        <BleIcon width={24} height={24} fill={connected ? "#34d399" : "#64748b"} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-base font-bold text-[#F5F5F5] leading-5" style={{ fontFamily: 'Unbounded' }}>
                                            {connected ? t('tools.bluetooth.master_connected') : t('tools.bluetooth.ble_disconnected')}
                                        </Text>

                                    </View>
                                </View>

                                {connected && (
                                    <TouchableOpacity
                                        onPress={disconnect}
                                        className="ml-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 active:bg-red-500/20"
                                    >
                                        <Feather name="log-out" size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* ТАЙМЕР (Центрований) */}
                        {['ready', 'armed', 'active', 'finished'].includes(state) && (
                            <View className="mb-6">
                                <Text className="text-[#A3A3A3] text-[10px] font-bold tracking-widest uppercase mb-3 ml-2" style={{ fontFamily: 'Evolventa' }}>
                                    {t('tools.timer.title')}
                                </Text>
                                <View className="p-6 rounded-3xl border border-white/10 bg-white/5 items-center justify-center shadow-sm">
                                    <Text className="text-[#A3A3A3] text-xs font-medium uppercase tracking-widest mb-1" style={{ fontFamily: 'Evolventa' }}>
                                        {state}
                                    </Text>
                                    <Text className="text-5xl font-black text-[#FF6D00] tracking-tighter" style={{ fontFamily: 'monospace' }}>
                                        {formatTime(elapsedTime)}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => <SensorCard item={item} />}
                ListEmptyComponent={
                    !connected ? (
                        <View className="items-center justify-center py-10 opacity-50">
                            <MaterialCommunityIcons name="radar" size={48} color="#A3A3A3" />
                            <Text className="mt-4 text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>
                                {t('tools.bluetooth.no_devices')}
                            </Text>
                        </View>
                    ) : null
                }
            />

            {/* НИЖНЯ ПАНЕЛЬ КНОПОК */}
            <View className="absolute bottom-28 left-4 right-4 z-50">
                {!connected ? (
                    <Button
                        variant="primary"
                        title={t('tools.bluetooth.find_master')}
                        onPress={startDiscovery}
                        icon={<Feather name="search" size={20} color="#F5F5F5" />}
                        className="shadow-xl shadow-black/50"
                    />
                ) : (
                    <View className="flex-row gap-3">
                        {state === 'ready' && <Button variant="primary" title={t('tools.bluetooth.start')} onPress={startTraining} className="flex-1 shadow-xl shadow-black/50" />}
                        {state === 'active' && <Button variant="outline" title={t('tools.bluetooth.stop')} onPress={stopTraining} className="flex-1 border-red-500/50 bg-[#0A0A0A]" />}
                        {state === 'finished' && <Button variant="light" title={t('tools.bluetooth.reset')} onPress={resetSession} className="flex-1 shadow-xl shadow-black/50" />}
                    </View>
                )}
            </View>

            {/* 🔥 МОДАЛКА РОЗУМНОГО ПІДКЛЮЧЕННЯ */}
            <AppModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                title={state === 'discovering' ? t('tools.bluetooth.searching') : t('tools.bluetooth.connecting_title')}
                type="bottom"
            >
                <View className="min-h-[300px]">

                    {/* СТАН 1: ПОШУК */}
                    {state === 'discovering' && (
                        <View className="flex-1">
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <ActivityIndicator size="small" color="#FF6D00" className="mr-3" />
                                    <Text className="text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>{t('tools.bluetooth.search_a_free_systems')}</Text>
                                </View>
                            </View>
                            <FlatList
                                data={scannedDevices}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => connectToDevice(item)}
                                        className="p-5 mb-3 rounded-2xl border border-white/10 bg-white/5 flex-row justify-between items-center active:bg-white/10"
                                    >
                                        <View>
                                            <Text className="font-bold text-lg text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>{item.name}</Text>
                                            <Text className="text-[#A3A3A3] text-xs font-mono">{item.id}</Text>
                                        </View>
                                        <Feather name="chevron-right" size={24} color="#FF6D00" />
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <View className="py-10 items-center">
                                        <Text className="text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>{t('tools.bluetooth.anything_search')}</Text>
                                    </View>
                                }
                            />
                        </View>
                    )}

                    {/* СТАН 2: ПІДКЛЮЧЕННЯ */}
                    {state === 'connecting' && (
                        <View className="flex-1 items-center justify-center py-10">
                            <ActivityIndicator size={60} color="#FF6D00" />
                            <Text className="text-[#F5F5F5] font-bold text-lg mt-6" style={{ fontFamily: 'Unbounded' }}>{t('tools.bluetooth.connecting_to_device')}</Text>
                            <Text className="text-[#A3A3A3] text-sm mt-2" style={{ fontFamily: 'Evolventa' }}>{t('tools.bluetooth.stay_close')}</Text>
                        </View>
                    )}

                    {/* СТАН 3: ІНІЦІАЛІЗАЦІЯ (ВИБІР ГЕЙТІВ ТА ПЕРЕВІРКА) */}
                    {state === 'initializing_sensors' && (
                        <View className="flex-1">
                            {configStep === 'select' ? (
                                <View className="items-center">
                                    <View className="w-20 h-20 bg-emerald-500/10 rounded-full items-center justify-center mb-6 border border-emerald-500/30">
                                        {isIconActive ? (
                                            <ConnectionIconActive width={32} height={32} fill="#34d399" />
                                        ) : (
                                            <ConnectionIcon width={32} height={32} fill="#34d399" />
                                        )}
                                    </View>

                                    <Text className="text-xl font-bold text-[#F5F5F5] mb-2" style={{ fontFamily: 'Unbounded' }}>{t('tools.bluetooth.master_connected')}</Text>
                                    <Text className="text-[#A3A3A3] mb-8" style={{ fontFamily: 'Evolventa' }}>{t('tools.bluetooth.use_gates_configuration')}</Text>

                                    <Text className="text-[#A3A3A3] text-[10px] font-bold tracking-widest uppercase self-start mb-3">{t('tools.bluetooth.gates_config')}</Text>
                                    <View className="flex-row gap-3 mb-6 w-full">
                                        <Button
                                            variant={targetGates === 2 ? 'light' : 'outline'}
                                            title={t("tools.bluetooth.two_gates")}
                                            onPress={() => setTargetGates(2)}
                                            className="flex-1"
                                            icon={targetGates === 2
                                                ? <ConnectionIconActive width={20} height={20} fill="#0A0A0A" />
                                                : <ConnectionIcon width={20} height={20} fill="#F5F5F5" />
                                            }
                                        />
                                        <Button
                                            variant={targetGates === 3 ? 'light' : 'outline'}
                                            title={t("tools.bluetooth.three_gates")}
                                            onPress={() => setTargetGates(3)}
                                            className="flex-1"
                                            icon={targetGates === 3
                                                ? <ConnectionIconActive width={20} height={20} fill="#0A0A0A" />
                                                : <ConnectionIcon width={20} height={20} fill="#F5F5F5" />
                                            }
                                        />
                                    </View>

                                    <Button variant="primary" title={t('tools.speed_checker.btn_continue')} onPress={() => setConfigStep('check')} className="w-full" />
                                </View>
                            ) : (
                                <View>
                                    <Text className="text-xl font-bold text-[#F5F5F5] mb-1" style={{ fontFamily: 'Unbounded' }}>{t('tools.bluetooth.check_gates')}</Text>
                                    <Text className="text-[#A3A3A3] mb-8" style={{ fontFamily: 'Evolventa' }}>{t('tools.bluetooth.task_gates')}</Text>

                                    <View className="p-5 rounded-3xl border border-white/10 bg-white/5 mb-8">
                                        <View className="flex-row justify-between mb-3">
                                            <Text className="text-[#F5F5F5] font-bold" style={{ fontFamily: 'Evolventa' }}>{t('tools.bluetooth.system')}</Text>
                                            <Text className="text-[#FF6D00] font-bold" style={{ fontFamily: 'Evolventa' }}>{t('tools.bluetooth.gate_id', { id: `${foundSensors} / ${requiredSensors}` })}</Text>
                                        </View>

                                        <View className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                                            <View className="h-full bg-[#FF6D00] rounded-full" style={{ width: `${progressPercent}%` }} />
                                        </View>

                                        <View className="flex-row items-center justify-center gap-2">
                                            <ActivityIndicator size="small" color="#A3A3A3" />
                                            <Text className="text-[#A3A3A3] text-sm" style={{ fontFamily: 'Evolventa' }}>{t('tools.bluetooth.status_waiting')}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row gap-3">
                                        <Button
                                            variant="light"
                                            title={t('tools.bluetooth.finish_setup')}
                                            onPress={finishInitialization}
                                            disabled={foundSensors < requiredSensors}
                                            className="flex-1"
                                        />
                                        <Button variant="outline" title={t('tools.speed_checker.btn_go_back')} onPress={disconnect} className="flex-1" />
                                    </View>

                                    {Platform.OS === 'web' && (
                                        <TouchableOpacity onPress={simulateWebTrigger} className="mt-4 p-3 bg-white/10 rounded-xl items-center">
                                            <Text className="text-white/50 text-xs">{t('tools.bluetooth.simulate_wave')}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </AppModal>
        </View>
    );
}