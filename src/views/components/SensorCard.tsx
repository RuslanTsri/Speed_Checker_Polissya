import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { SensorInfo } from '../../types/telemetry';
import { formatTime } from '../../utils/time';

export const SensorCard = memo(({ item }: { item: SensorInfo }) => {
    // Дефолтні стилі (Невідомий/Очікування)
    let borderClass = "border-slate-800";
    let bgClass = "bg-slate-900";
    let statusText = "ОЧІКУВАННЯ";
    let statusColor = "text-slate-500";
    let statusBg = "bg-slate-800/50";
    let iconName: keyof typeof Feather.glyphMap = "radio";
    let iconColor = "#64748b"; // slate-500

    if (item.status === 'active') {
        borderClass = "border-green-500/30";
        bgClass = "bg-green-500/5"; // Легкий зелений фон
        statusText = "АКТИВНИЙ";
        statusColor = "text-green-400";
        statusBg = "bg-green-500/10 border border-green-500/20";
        iconName = "check-circle";
        iconColor = "#4ade80"; // green-400

    } else if (item.status === 'timeout') {
        borderClass = "border-red-500/30";
        bgClass = "bg-red-500/5"; // Легкий червоний фон
        statusText = "ВТРАЧЕНО";
        statusColor = "text-red-400";
        statusBg = "bg-red-500/10 border border-red-500/20";
        iconName = "alert-circle";
        iconColor = "#ef4444"; // red-500
    }

    return (
        <View className={`mb-3 p-4 rounded-2xl border ${borderClass} ${bgClass}`}>

            {/* Верхній рядок: Назва та Статус */}
            <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                    <Feather name={iconName} size={16} color={iconColor} style={{ marginRight: 8 }} />
                    <Text className="text-white font-bold text-base tracking-wide">
                        {item.id === 0 ? 'Master Node' : `Сенсор ${item.id}`}
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
                    <Feather name="wifi" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
                    <Text className="text-slate-400 text-xs font-medium">
                        Сигнал: <Text className="text-slate-300 font-bold">{item.rssi !== undefined ? item.rssi : '--'} dBm</Text>
                    </Text>
                </View>

                {/* Час та Спліт */}
                <View className="items-end">
                    {item.triggerTime !== undefined ? (
                        <Text className="text-2xl font-mono font-black text-white tracking-tighter">
                            {formatTime(item.triggerTime)}
                        </Text>
                    ) : (
                        <Text className="text-2xl font-mono font-black text-slate-700 tracking-tighter">
                            --:--:--
                        </Text>
                    )}

                    {/* Спліт (різниця в часі між сенсорами) */}
                    {item.splitTime ? (
                        <View className="flex-row items-center mt-0.5">
                            <Feather name="chevrons-right" size={10} color="#facc15" style={{ marginRight: 2 }} />
                            <Text className="text-yellow-400 font-mono text-[11px] font-bold">
                                +{(item.splitTime / 1000).toFixed(3)}s
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </View>
    );

}, (prev, next) => {
    // Перемальовуємо ТІЛЬКИ якщо змінився статус, час, спліт або сигнал
    return (
        prev.item.status === next.item.status &&
        prev.item.triggerTime === next.item.triggerTime &&
        prev.item.rssi === next.item.rssi &&
        prev.item.splitTime === next.item.splitTime // 🔥 Додали перевірку спліта
    );
});