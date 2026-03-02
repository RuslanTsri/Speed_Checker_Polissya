import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Platform, Pressable, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useBle } from '../../context/BleContext';

import { formatTime } from '../../utils/time';
import { AppModal } from '../components/AppModal';
import { Button } from '../components/ui/Button';
import { SensorCard } from '../components/SensorCard';
import { ArrowIcon, ArrowIconActive, BleIcon, ConnectionIcon, ConnectionIconActive } from '../../../assets/icons';

export default function BluetoothTool({ onBack }: { onBack: () => void }) {
    const { t } = useTranslation();
    const {
        connected, state, sensors, elapsedTime, scannedDevices,
        startDiscovery, stopScanning, connectToDevice, disconnect, cancelConnecting,
        finishInitialization, startTraining, stopTraining, resetSession, simulateWebTrigger
    } = useBle();

    const [configStep, setConfigStep] = useState<'select' | 'check'>('select');
    const [targetGates, setTargetGates] = useState<number>(2);
    const [isIconActive, setIsIconActive] = useState(false);

    const isModalVisible = ['discovering', 'connecting', 'initializing_sensors'].includes(state);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state === 'initializing_sensors' && configStep === 'select') {
            interval = setInterval(() => setIsIconActive(prev => !prev), 500);
        }
        return () => clearInterval(interval);
    }, [state, configStep]);

    const requiredSensors = targetGates - 1;
    const foundSensors = Math.max(0, sensors.length - 1);
    const progressPercent = Math.min((foundSensors / requiredSensors) * 100, 100);

    return (
        <View className="flex-1 pt-4 relative bg-surface-bg">
            <View className="flex-row items-center justify-between px-4 mb-6 z-10">
                <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                    {({ pressed }) => (
                        <View style={styles.rotateNeg90}>
                            {pressed ? <ArrowIconActive width={28} height={28} fill="#F5F5F5" /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                        </View>
                    )}
                </Pressable>
                <Text className="text-h3 font-bold flex-1 text-center text-text-main font-unbounded">
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
                        <View className="mb-6 p-4 rounded-3xl border border-surface-border bg-surface-card flex-row items-center justify-between shadow-sm">
                            <View className="flex-row items-center gap-3 flex-1">
                                <View className={`w-12 h-12 rounded-full items-center justify-center border ${connected ? 'bg-status-success/10 border-status-success/30' : 'bg-surface-card border-surface-border'}`}>
                                    <BleIcon width={24} height={24} fill={connected ? "#34d399" : "#717171"} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-body font-bold text-text-main font-unbounded">
                                        {connected ? t('tools.bluetooth.master_connected') : t('tools.bluetooth.ble_disconnected')}
                                    </Text>
                                </View>
                            </View>
                            {connected && (
                                <TouchableOpacity onPress={disconnect} className="p-3 rounded-2xl bg-status-error/10 border border-status-error/20">
                                    <Feather name="log-out" size={18} color="#f87171" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {['ready', 'active', 'finished'].includes(state) && (
                            <View className="mb-6">
                                <Text className="text-text-muted text-caption font-bold tracking-widest uppercase mb-3 ml-2 font-evolventa">
                                    {t('tools.timer.title')}
                                </Text>
                                <View className="p-6 rounded-3xl border border-surface-border bg-surface-card items-center shadow-sm">
                                    <Text className="text-brand-orange text-h1 font-black tracking-tighter" style={{ fontFamily: 'monospace' }}>
                                        {formatTime(elapsedTime)}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => <SensorCard item={item} optimizeForList={true} />}
            />

            <View className="absolute bottom-28 left-4 right-4 z-50">
                {!connected ? (
                    <Button variant="primary" title={t('tools.bluetooth.find_master')} onPress={startDiscovery} icon={<Feather name="search" size={20} color="#F5F5F5" />} />
                ) : (
                    <View className="flex-row gap-3">
                        {state === 'ready' && <Button variant="primary" title={t('tools.bluetooth.start')} onPress={startTraining} className="flex-1" />}
                        {state === 'active' && <Button variant="outline" title={t('tools.bluetooth.stop')} onPress={stopTraining} className="flex-1 border-status-error/50" />}
                        {state === 'finished' && <Button variant="light" title={t('tools.bluetooth.reset')} onPress={resetSession} className="flex-1" />}
                    </View>
                )}
            </View>

            <AppModal visible={isModalVisible} onClose={() => {}} title={state === 'discovering' ? t('tools.bluetooth.searching') : t('tools.bluetooth.connecting_title')}>
                <View className="min-h-[300px]">
                    {state === 'discovering' && (
                        <FlatList
                            data={scannedDevices}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => connectToDevice(item)} className="p-5 mb-3 rounded-2xl border border-surface-border bg-surface-card flex-row justify-between items-center">
                                    <View>
                                        <Text className="font-bold text-body text-text-main font-unbounded">{item.name}</Text>
                                        <Text className="text-text-muted text-caption font-evolventa">{item.id}</Text>
                                    </View>
                                    <Feather name="chevron-right" size={24} color="#FF6D00" />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                    {state === 'connecting' && (
                        <View className="items-center py-10">
                            <ActivityIndicator size="large" color="#FF6D00" />
                            <Text className="text-text-main font-bold text-h4 mt-6 font-unbounded">{t('tools.bluetooth.connecting_to_device')}</Text>
                        </View>
                    )}
                </View>
            </AppModal>
        </View>
    );
}

const styles = StyleSheet.create({ rotateNeg90: { transform: [{ rotate: '-90deg' }] } });