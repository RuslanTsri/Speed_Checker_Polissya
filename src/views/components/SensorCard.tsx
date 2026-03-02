import React, { memo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { formatTime } from '../../utils/time';

const GRAD_ACTIVE = ['rgba(52, 211, 153, 0.15)', 'rgba(52, 211, 153, 0.05)'] as const;
const GRAD_INACTIVE = ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)'] as const;

export const SensorCard = memo(({ item, optimizeForList = false }: { item: any, optimizeForList?: boolean }) => {
    const { t } = useTranslation();
    const isAndroid = Platform.OS === 'android' && optimizeForList;
    const isActive = item.status === 'active';
    const isLost = item.status === 'timeout';

    return (
        <View className={`mb-3 rounded-3xl overflow-hidden border ${isActive ? 'border-status-success/30' : 'border-surface-border'} min-h-[80px]`}>
            {!isAndroid ? (
                <>
                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                    <LinearGradient
                        colors={isActive ? GRAD_ACTIVE : GRAD_INACTIVE}
                        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                        style={StyleSheet.absoluteFill}
                    />
                </>
            ) : (
                <View style={StyleSheet.absoluteFill} className={isActive ? 'bg-surface-card border-status-success/10' : 'bg-surface-card'} />
            )}

            <View className="p-4">
                <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center gap-3">
                        <View className={`w-8 h-8 rounded-full items-center justify-center border ${isActive ? 'bg-status-success/20 border-status-success/50' : 'bg-surface-card border-surface-border'}`}>
                            <Feather name={isActive ? "check" : (isLost ? "alert-circle" : "radio")} size={14} color={isActive ? "#34d399" : (isLost ? "#f87171" : "#A3A3A3")} />
                        </View>
                        <Text className="text-text-main font-bold text-h4 font-unbounded">
                            {item.id === 0 ? t('tools.bluetooth.master_node') : t('tools.bluetooth.gate_id', { id: item.id })}
                        </Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-end">
                    <View className="flex-row items-center pb-1 gap-1.5">
                        <Feather name="wifi" size={14} color="#A3A3A3" />
                        <Text className="text-caption text-text-sub font-evolventa">
                            {t('tools.bluetooth.signal')} <Text className="font-bold text-text-main">{item.rssi ?? '--'} dBm</Text>
                        </Text>
                    </View>

                    <Text className="text-h2 font-black tracking-widest text-text-main font-unbounded">
                        {item.triggerTime !== undefined ? formatTime(item.triggerTime) : '--:--:--'}
                    </Text>
                </View>
            </View>
        </View>
    );
}, (prev, next) => prev.item.status === next.item.status && prev.item.triggerTime === next.item.triggerTime && prev.item.rssi === next.item.rssi);