import React, { memo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { formatTime } from '../../utils/time';

const GRAD_ACTIVE = ['rgba(52, 211, 153, 0.12)', 'rgba(52, 211, 153, 0.03)'] as const;
const GRAD_INACTIVE = ['rgba(28, 28, 30, 0.6)', 'rgba(10, 10, 10, 0.8)'] as const;
const GRAD_LOST = ['rgba(248, 113, 113, 0.15)', 'rgba(248, 113, 113, 0.05)'] as const;

export const SensorCard = memo(({ item, optimizeForList = false }: { item: any, optimizeForList?: boolean }) => {
    const { t } = useTranslation();
    const isAndroid = Platform.OS === 'android';
    const isActive = item.status === 'active';
    const isLost = item.status === 'timeout';

    const currentGradient = isActive ? GRAD_ACTIVE : (isLost ? GRAD_LOST : GRAD_INACTIVE);
    const currentBg = isActive ? 'bg-surface-card' : (isLost ? 'bg-status-error/10' : 'bg-surface-card/80');
    const currentBorder = isActive ? 'border-status-success/40 shadow-lg shadow-status-success/10' : (isLost ? 'border-status-error/40 shadow-lg shadow-status-error/10' : 'border-surface-border');
    const dotColor = isActive ? 'bg-status-success shadow-sm shadow-status-success' : (isLost ? 'bg-status-error shadow-sm shadow-status-error' : 'bg-text-muted/30');

    return (
        <View className={`mb-3 rounded-3xl overflow-hidden border ${currentBorder} min-h-[85px]`}>
            {!isAndroid ? (
                <>
                    <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
                    <LinearGradient
                        colors={currentGradient}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                </>
            ) : (
                <View style={StyleSheet.absoluteFill} className={currentBg} />
            )}

            <View className="p-4">
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-3">
                        <View className={`w-9 h-9 rounded-2xl items-center justify-center border ${isActive ? 'bg-status-success/20 border-status-success/50' : (isLost ? 'bg-status-error/20 border-status-error/50' : 'bg-surface-bg border-surface-border')}`}>
                            <Feather
                                name={isActive ? "check" : (isLost ? "alert-circle" : "radio")}
                                size={16}
                                color={isActive ? "#34d399" : (isLost ? "#f87171" : "#717171")}
                            />
                        </View>
                        <Text className="text-h4 text-text-main font-unbounded-bold">
                            {item.id === 0 ? t('tools.bluetooth.master_node') : t('tools.bluetooth.gate_id', { id: item.id })}
                        </Text>
                    </View>

                    <View className={`w-2 h-2 rounded-full ${dotColor}`} />
                </View>

                <View className="flex-row justify-between items-end">
                    <View className="flex-row items-center pb-1 gap-1.5">
                        <Feather name="wifi" size={14} color={isLost ? "#f87171" : "#717171"} />
                        <Text className="text-caption text-text-sub font-evolventa">
                            {t('tools.bluetooth.signal')} <Text className={`font-evolventa-bold ${isLost ? 'text-status-error' : 'text-text-main'}`}>{item.rssi ?? '--'} dBm</Text>
                        </Text>
                    </View>

                    <Text className="text-h2 tracking-tighter text-text-main font-unbounded-black">
                        {item.triggerTime !== undefined ? formatTime(item.triggerTime) : '--:--:--'}
                        <Text className="text-small text-text-muted font-unbounded-medium">s</Text>
                    </Text>
                </View>

                {isLost && (
                    <View className="mt-4 pt-3 border-t border-status-error/20 flex-row items-start gap-2">
                        <Feather name="info" size={14} color="#f87171" style={{ marginTop: 2 }} />
                        <Text className="text-status-error text-caption font-evolventa flex-1 leading-tight">
                            {t('tools.bluetooth.connection_lost_msg')}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}, (prev, next) => (
    prev.item.status === next.item.status &&
    prev.item.triggerTime === next.item.triggerTime &&
    prev.item.rssi === next.item.rssi
));