import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { SensorInfo } from '../../types/telemetry';
import { formatTime } from '../../utils/time';
import { useTheme } from '../../context/ThemeContext';

interface ExtendedSensorInfo extends SensorInfo {
    rssi?: number;
    splitTime?: number;
}

export const SensorCard = memo(({ item }: { item: ExtendedSensorInfo }) => {
    const { t } = useTranslation();
    const { isDark } = useTheme();

    // Дефолтні стилі (Невідомий/Очікування)
    let borderClass = isDark ? "border-slate-800" : "border-slate-200";
    let bgClass = isDark ? "bg-slate-900" : "bg-white";
    let statusText = t('components.sensor_card.status_waiting') as string;
    let statusColor = isDark ? "text-slate-500" : "text-slate-400";
    let statusBg = isDark ? "bg-slate-800/50" : "bg-slate-100";
    let iconName: keyof typeof Feather.glyphMap = "radio";
    let iconColor = isDark ? "#64748b" : "#94a3b8";

    if (item.status === 'active') {
        borderClass = isDark ? "border-green-500/30" : "border-green-300";
        bgClass = isDark ? "bg-green-500/5" : "bg-green-50";
        statusText = t('components.sensor_card.status_active') as string;
        statusColor = isDark ? "text-green-400" : "text-green-600";
        statusBg = isDark ? "bg-green-500/10 border border-green-500/20" : "bg-green-100 border border-green-200";
        iconName = "check-circle";
        iconColor = isDark ? "#4ade80" : "#16a34a";

    } else if (item.status === 'timeout') {
        borderClass = isDark ? "border-red-500/30" : "border-red-300";
        bgClass = isDark ? "bg-red-500/5" : "bg-red-50";
        statusText = t('components.sensor_card.status_lost') as string;
        statusColor = isDark ? "text-red-400" : "text-red-600";
        statusBg = isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-100 border border-red-200";
        iconName = "alert-circle";
        iconColor = isDark ? "#ef4444" : "#dc2626";
    }

    return (
        <View className={`mb-3 p-4 rounded-2xl border ${borderClass} ${bgClass} shadow-sm`}>

            {/* Верхній рядок: Назва та Статус */}
            <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                    <Feather name={iconName} size={16} color={iconColor} style={{ marginRight: 8 }} />
                    <Text className={`font-bold text-base tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.id === 0 ? (t('components.sensor_card.master_node') as string) : (t('components.sensor_card.sensor_id', { id: item.id }) as string)}
                    </Text>
                </View>

                {/* Status Pill */}
                <View className={`px-2 py-0.5 rounded-md ${statusBg}`}>
                    <Text className={`text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>
                        {statusText}
                    </Text>
                </View>
            </View>

            {/* Нижній рядок: Сигнал та Час */}
            <View className="flex-row justify-between items-end">

                {/* Сигнал */}
                <View className="flex-row items-center pb-1">
                    <Feather name="wifi" size={12} color={isDark ? "#94a3b8" : "#cbd5e1"} style={{ marginRight: 4 }} />
                    <Text className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {t('components.sensor_card.signal') as string} <Text className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {item.rssi !== undefined ? item.rssi : '--'} dBm
                    </Text>
                    </Text>
                </View>

                {/* Час та Спліт */}
                <View className="items-end">
                    {item.triggerTime !== undefined ? (
                        <Text className={`text-2xl font-mono font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {formatTime(item.triggerTime)}
                        </Text>
                    ) : (
                        <Text className={`text-2xl font-mono font-black tracking-tighter ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>
                            --:--:--
                        </Text>
                    )}

                    {/* Спліт */}
                    {item.splitTime ? (
                        <View className="flex-row items-center mt-0.5">
                            <Feather name="chevrons-right" size={10} color={isDark ? "#facc15" : "#eab308"} style={{ marginRight: 2 }} />
                            <Text className={`font-mono text-[11px] font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                +{(item.splitTime / 1000).toFixed(3)}s
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </View>
    );

}, (prev: { item: ExtendedSensorInfo }, next: { item: ExtendedSensorInfo }) => {
    return (
        prev.item.status === next.item.status &&
        prev.item.triggerTime === next.item.triggerTime &&
        prev.item.rssi === next.item.rssi &&
        prev.item.splitTime === next.item.splitTime
    );
});