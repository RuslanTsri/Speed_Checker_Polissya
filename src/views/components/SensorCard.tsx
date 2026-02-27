import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { SensorInfo } from '../../types/telemetry';
import { formatTime } from '../../utils/time';

interface ExtendedSensorInfo extends SensorInfo {
    rssi?: number;
    splitTime?: number;
}

export const SensorCard = memo(({ item }: { item: ExtendedSensorInfo }) => {
    const { t } = useTranslation();

    const isActive = item.status === 'active';
    const isLost = item.status === 'timeout';

    return (
        <View className="mb-3 rounded-3xl overflow-hidden border border-white/10 shadow-sm w-full min-h-[80px]">
            {/* Glass Background */}
            <BlurView intensity={30} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
            <LinearGradient
                colors={isActive ? ['rgba(52, 211, 153, 0.1)', 'rgba(52, 211, 153, 0.05)'] : ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)']}
                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
            />

            <View className="p-4">
                {/* Верхній рядок: Назва та Статус */}
                <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center gap-3">
                        <View className={`w-8 h-8 rounded-full items-center justify-center border ${isActive ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/10'}`}>
                            <Feather name={isActive ? "check" : (isLost ? "alert-circle" : "radio")} size={14} color={isActive ? "#34d399" : (isLost ? "#ef4444" : "#A3A3A3")} />
                        </View>
                        <Text className="text-[#F5F5F5] font-bold text-base" style={{ fontFamily: 'Unbounded' }}>
                            {item.id === 0
                                ? t('tools.bluetooth.master_node')
                                : t('tools.bluetooth.gate_id', { id: item.id })
                            }
                        </Text>
                    </View>


                </View>

                {/* Нижній рядок: Сигнал та Час */}
                <View className="flex-row justify-between items-end">
                    {/* Сигнал */}
                    <View className="flex-row items-center pb-1 gap-1.5">
                        <Feather name="wifi" size={14} color="#A3A3A3" />
                        <Text className="text-xs text-[#A3A3A3]" style={{ fontFamily: 'Evolventa' }}>
                            {t('tools.bluetooth.signal')} <Text className="font-bold text-[#F5F5F5]">{item.rssi !== undefined ? item.rssi : '--'} dBm</Text>
                        </Text>
                    </View>

                    {/* Час */}
                    <View className="items-end">
                        <Text className="text-2xl font-black tracking-widest text-[#F5F5F5]" style={{ fontFamily: 'monospace' }}>
                            {item.triggerTime !== undefined ? formatTime(item.triggerTime) : '--:--:--'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}, (prev, next) => prev.item.status === next.item.status && prev.item.triggerTime === next.item.triggerTime && prev.item.rssi === next.item.rssi);