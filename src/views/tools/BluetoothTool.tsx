import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useBle } from '../../context/BleContext';

// Утиліти та Компоненти
import { formatTime } from '../../utils/time';
import { AppModal } from '../components/AppModal';
import { Button } from '../components/ui/Button';
import { SensorCard } from '../components/SensorCard';
import {
    ArrowIcon, ArrowIconActive,
    BleIcon,
    ConnectionIcon, ConnectionIconActive
} from '../../../assets/icons';

export default function BluetoothTool({ onBack }: { onBack: () => void }) {
    const { t } = useTranslation();
    const {
        connected, state, sensors, elapsedTime, scannedDevices,
        startDiscovery, stopScanning, connectToDevice, disconnect, cancelConnecting,
        finishInitialization, startTraining, stopTraining, resetSession
    } = useBle();

    const [configStep, setConfigStep] = useState<'select' | 'check'>('select');
    const [targetGates, setTargetGates] = useState<number>(2);
    const [isIconActive, setIsIconActive] = useState(false);

    const isModalVisible = ['discovering', 'connecting', 'initializing_sensors'].includes(state);

    useEffect(() => {
        if (state === 'connecting') setConfigStep('select');
    }, [state]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state === 'initializing_sensors' && configStep === 'select') {
            interval = setInterval(() => setIsIconActive(prev => !prev), 500);
        }
        return () => clearInterval(interval);
    }, [state, configStep]);

    // 🔥 ОНОВЛЕНА ЛОГІКА ПІДРАХУНКУ (Тепер враховуємо і Мастер, і Слейви)
    const requiredTotalSensors = targetGates; // Якщо вибрали 2 ворота, значить чекаємо 2 датчики (Мастер + 1 Слейв)
    const foundTotalSensors = sensors.length; // Починається з 0
    const progressPercent = Math.min((foundTotalSensors / requiredTotalSensors) * 100, 100);

    const handleCloseModal = () => {
        if (state === 'connecting') cancelConnecting();
        else if (state === 'discovering') stopScanning();
        else disconnect();
    };

    return (
        <View className="flex-1 pt-4 relative">
            {/* HEADER */}
            <View className="flex-row items-center justify-between px-4 mb-6 z-10">
                <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                    {({ pressed }) => (
                        <View style={styles.rotateNeg90}>
                            {pressed ? <ArrowIconActive width={28} height={28} fill="#F5F5F5" /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                        </View>
                    )}
                </Pressable>
                <Text className="text-h3 flex-1 text-center text-text-main font-unbounded-bold">
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
                                    <Text className="text-body text-text-main font-unbounded-bold">
                                        {connected ? t('tools.bluetooth.master_connected') : t('tools.bluetooth.ble_disconnected')}
                                    </Text>
                                </View>
                            </View>
                            {connected && (
                                <TouchableOpacity onPress={disconnect} className="p-3 rounded-2xl bg-status-error/10 border border-status-error/20 active:bg-status-error/20">
                                    <Feather name="log-out" size={18} color="#f87171" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {['ready', 'active', 'finished'].includes(state) && (
                            <View className="mb-6">
                                <Text className="text-text-sub text-caption uppercase mb-3 ml-2 tracking-widest font-evolventa-bold">
                                    {t('tools.timer.title')}
                                </Text>
                                <View className="p-6 rounded-3xl border border-surface-border bg-surface-card items-center shadow-sm">
                                    <Text className="text-brand-orange text-h1 tracking-tighter font-unbounded-black">
                                        {formatTime(elapsedTime)}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => <SensorCard item={item} optimizeForList={true} />}
                ListEmptyComponent={
                    !connected ? (
                        <View className="items-center justify-center py-10 opacity-50">
                            <MaterialCommunityIcons name="radar" size={48} color="#A3A3A3" />
                            <Text className="mt-4 text-text-sub font-evolventa">
                                {t('tools.bluetooth.no_devices')}
                            </Text>
                        </View>
                    ) : null
                }
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

            <AppModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                title={state === 'discovering' ? t('tools.bluetooth.searching') : t('tools.bluetooth.connecting_title')}
                type="bottom"
            >
                <View className="min-h-[350px] mt-2">
                    {state === 'discovering' && (
                        <View className="flex-1">
                            <View className="flex-row items-center mb-4 ml-1">
                                <ActivityIndicator size="small" color="#FF6D00" className="mr-3" />
                                <Text className="text-text-sub font-evolventa">{t('tools.bluetooth.search_a_free_systems')}</Text>
                            </View>
                            <FlatList
                                data={scannedDevices}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => connectToDevice(item)}
                                        className="p-5 mb-3 rounded-2xl border border-surface-border bg-surface-card flex-row justify-between items-center active:bg-surface-card/80"
                                    >
                                        <View>
                                            <Text className="text-text-main text-body font-unbounded-bold">{item.name}</Text>
                                            <Text className="text-text-muted text-caption font-mono mt-1">{item.id}</Text>
                                        </View>
                                        <Feather name="chevron-right" size={24} color="#FF6D00" />
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}

                    {state === 'connecting' && (
                        <View className="items-center py-10">
                            <ActivityIndicator size="large" color="#FF6D00" />
                            <Text className="text-text-main text-h4 mt-6 font-unbounded-bold">{t('tools.bluetooth.connecting_to_device')}</Text>
                            <Text className="text-text-sub text-body mt-2 font-evolventa">{t('tools.bluetooth.stay_close')}</Text>
                        </View>
                    )}

                    {state === 'initializing_sensors' && (
                        <View className="flex-1">
                            {configStep === 'select' ? (
                                <View className="items-center">
                                    <View className="w-20 h-20 bg-status-success/10 rounded-full items-center justify-center mb-6 border border-status-success/30">
                                        {isIconActive ? (
                                            <ConnectionIconActive width={32} height={32} fill="#34d399" />
                                        ) : (
                                            <ConnectionIcon width={32} height={32} fill="#34d399" />
                                        )}
                                    </View>
                                    <Text className="text-h3 text-text-main mb-2 text-center font-unbounded-bold">Система підключена</Text>
                                    <Text className="text-text-sub mb-8 text-center font-evolventa">{t('tools.bluetooth.use_gates_configuration')}</Text>

                                    <Text className="text-text-sub text-caption uppercase font-bold tracking-widest self-start mb-3 ml-1 font-evolventa">{t('tools.bluetooth.gates_config')}</Text>
                                    <View className="flex-row gap-3 mb-8 w-full">
                                        <Button
                                            variant={targetGates === 2 ? 'light' : 'outline'}
                                            title={t("tools.bluetooth.two_gates")}
                                            onPress={() => setTargetGates(2)}
                                            className="flex-1"
                                            icon={targetGates === 2 ? <ConnectionIconActive width={20} height={20} fill="#0A0A0A" /> : <ConnectionIcon width={20} height={20} fill="#F5F5F5" />}
                                        />
                                        <Button
                                            variant={targetGates === 3 ? 'light' : 'outline'}
                                            title={t("tools.bluetooth.three_gates")}
                                            onPress={() => setTargetGates(3)}
                                            className="flex-1"
                                            icon={targetGates === 3 ? <ConnectionIconActive width={20} height={20} fill="#0A0A0A" /> : <ConnectionIcon width={20} height={20} fill="#F5F5F5" />}
                                        />
                                    </View>
                                    <Button variant="primary" title={t('tools.speed_checker.btn_continue')} onPress={() => setConfigStep('check')} className="w-full" />
                                </View>
                            ) : (
                                <View>
                                    <Text className="text-h3 text-text-main mb-2 font-unbounded-bold">
                                        Ініціалізація воріт
                                    </Text>

                                    {/* 🔥 ДИНАМІЧНА ПІДКАЗКА */}
                                    <Text className="text-text-sub mb-8 font-evolventa text-body">
                                        {foundTotalSensors === 0
                                            ? "Проведіть рукою повз головний МАЙСТЕР-датчик (Старт)."
                                            : foundTotalSensors < requiredTotalSensors
                                                ? `Тепер проведіть рукою повз ДАТЧИК ${foundTotalSensors} (Ворота ${foundTotalSensors}).`
                                                : "✅ Всі датчики успішно ініціалізовано!"
                                        }
                                    </Text>

                                    <View className="p-5 rounded-3xl border border-surface-border bg-surface-card mb-8">
                                        <View className="flex-row justify-between mb-4">
                                            <Text className="text-text-main font-evolventa-bold">{t('tools.bluetooth.system')}</Text>
                                            <Text className="text-brand-orange font-evolventa-bold text-h4">
                                                {`${foundTotalSensors} / ${requiredTotalSensors}`}
                                            </Text>
                                        </View>

                                        <View className="h-3 w-full bg-surface-bg rounded-full overflow-hidden mb-5">
                                            <View className="h-full bg-brand-orange rounded-full" style={{ width: `${progressPercent}%` }} />
                                        </View>

                                        <View className="flex-row items-center justify-center gap-2">
                                            {foundTotalSensors < requiredTotalSensors ? (
                                                <>
                                                    <ActivityIndicator size="small" color="#A3A3A3" />
                                                    <Text className="text-text-sub text-caption font-evolventa-bold">{t('tools.bluetooth.status_waiting')}</Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Feather name="check-circle" size={18} color="#34d399" />
                                                    <Text className="text-status-success text-body font-evolventa-bold">Готово до роботи</Text>
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    <View className="flex-row gap-3">
                                        <Button
                                            variant="light"
                                            title={t('tools.bluetooth.finish_setup')}
                                            onPress={finishInitialization}
                                            disabled={foundTotalSensors < requiredTotalSensors}
                                            className="flex-1"
                                        />
                                        <Button variant="outline" title={t('tools.speed_checker.btn_go_back')} onPress={disconnect} className="flex-1 border-surface-border" />
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </AppModal>
        </View>
    );
}

const styles = StyleSheet.create({ rotateNeg90: { transform: [{ rotate: '-90deg' }] } });