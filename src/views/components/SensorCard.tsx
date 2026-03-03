import React, { memo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { formatTime } from '../../utils/time';

// Градієнти підтягуємо під твою палітру (status-success та surface-card)
const GRAD_ACTIVE = ['rgba(52, 211, 153, 0.12)', 'rgba(52, 211, 153, 0.03)'] as const;
const GRAD_INACTIVE = ['rgba(28, 28, 30, 0.6)', 'rgba(10, 10, 10, 0.8)'] as const;

export const SensorCard = memo(({ item, optimizeForList = false }: { item: any, optimizeForList?: boolean }) => {
    const { t } = useTranslation();
    const isAndroid = Platform.OS === 'android'; // NativeWind вже добре оптимізує стилі
    const isActive = item.status === 'active';
    const isLost = item.status === 'timeout';

    return (
        <View className={`mb-3 rounded-3xl overflow-hidden border ${isActive ? 'border-status-success/40 shadow-lg shadow-status-success/10' : 'border-surface-border'} min-h-[85px]`}>
            {/* ФОНОВІ ЕФЕКТИ (Blur для iOS/Web, чистий колір для Android) */}
            {!isAndroid ? (
                <>
                    <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
                    <LinearGradient
                        colors={isActive ? GRAD_ACTIVE : GRAD_INACTIVE}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                </>
            ) : (
                <View style={StyleSheet.absoluteFill} className={isActive ? 'bg-surface-card' : 'bg-surface-card/80'} />
            )}

            <View className="p-4">
                {/* ВЕРХНЯ ЧАСТИНА: ІКОНКА ТА НАЗВА */}
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-3">
                        <View className={`w-9 h-9 rounded-2xl items-center justify-center border ${isActive ? 'bg-status-success/20 border-status-success/50' : 'bg-surface-bg border-surface-border'}`}>
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

                    {/* СТАТУСНИЙ ТОЧКОВИЙ ІНДИКАТОР */}
                    <View className={`w-2 h-2 rounded-full ${isActive ? 'bg-status-success shadow-sm shadow-status-success' : 'bg-text-muted/30'}`} />
                </View>

                {/* НИЖНЯ ЧАСТИНА: RSSI ТА ЧАС ТРИГЕРА */}
                <View className="flex-row justify-between items-end">
                    <View className="flex-row items-center pb-1 gap-1.5">
                        <Feather name="wifi" size={14} color="#717171" />
                        <Text className="text-caption text-text-sub font-evolventa">
                            {t('tools.bluetooth.signal')} <Text className="text-text-main font-evolventa-bold">{item.rssi ?? '--'} dBm</Text>
                        </Text>
                    </View>

                    {/* 🔥 ЧАС: Unbounded Black для максимальної читаємості */}
                    <Text className="text-h2 tracking-tighter text-text-main font-unbounded-black">
                        {item.triggerTime !== undefined ? formatTime(item.triggerTime) : '--:--:--'}
                        <Text className="text-small text-text-muted font-unbounded-medium">s</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
}, (prev, next) => (
    prev.item.status === next.item.status &&
    prev.item.triggerTime === next.item.triggerTime &&
    prev.item.rssi === next.item.rssi
));