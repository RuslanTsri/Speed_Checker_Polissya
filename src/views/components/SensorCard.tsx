import React, { memo } from 'react';
import { View, Text } from 'react-native';

import { SensorInfo } from '../../types/telemetry';
import { formatTime } from '../../utils/time';

export const SensorCard = memo(({ item }: { item: SensorInfo }) => {
// Стилі
    let borderClass = "border-slate-700";
    let bgClass = "bg-slate-800";
    let statusText = "UNKNOWN";
    let statusColor = "text-slate-500";

    if (item.status === 'active') {
        borderClass = "border-green-500/50";
        bgClass = "bg-green-900/10";
        statusText = "ACTIVE";
        statusColor = "text-green-400";

    } else if (item.status === 'timeout') {
        borderClass = "border-red-500/50";
        bgClass = "bg-red-900/10";
        statusText = "TIMEOUT";
        statusColor = "text-red-400";

    }

    return (

        <View className={`mb-3 p-4 rounded-xl border ${borderClass} ${bgClass} flex-row justify-between items-center`}>
            {/* Left: ID */}
            <View>
                <Text className="text-white font-bold text-lg">
                    {item.id === 0 ? 'MASTER NODE' : `SENSOR ${item.id}`}
                </Text>

                {item.rssi !== undefined && (
                    <Text className="text-slate-400 text-xs mt-1">
                        Signal: <Text className="text-yellow-400">{item.rssi} dBm</Text>
                    </Text>

                )}
            </View>

            {/* Right: Status & Time */}
            <View className="items-end">
                <View className={`px-2 py-1 rounded bg-slate-900/50 mb-1`}>
                    <Text className={`text-[10px] font-black ${statusColor}`}>
                        {statusText}
                    </Text>
                </View>

                {/* Показуємо час тільки якщо він є */}
                {item.triggerTime !== undefined ? (
                    <Text className="text-2xl font-mono font-black text-white">
                        {formatTime(item.triggerTime)}
                    </Text>
                ) : (

                    <Text className="text-2xl font-mono font-black text-slate-700">
                        --:--:--
                    </Text>

                )}

                {item.splitTime ? (
                    <Text className="text-green-400 font-mono text-xs font-bold">
                        +{(item.splitTime / 1000).toFixed(3)}s
                    </Text>
                ) : null}
            </View>
        </View>

    );

}, (prev, next) => {

// Функція порівняння: перемальовуємо ТІЛЬКИ якщо змінився статус, час або сигнал
    return (
        prev.item.status === next.item.status &&
        prev.item.triggerTime === next.item.triggerTime &&
        prev.item.rssi === next.item.rssi
    );
});

