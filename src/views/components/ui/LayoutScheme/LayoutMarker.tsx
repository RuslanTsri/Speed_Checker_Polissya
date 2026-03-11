import React from 'react';
import { View, Text } from 'react-native';

export interface LayoutMarkerProps {
    position: number | string;
    totalDistance: number | string;
    label: string;
    type: 'start' | 'finish' | 'gate';
}

export const LayoutMarker = ({ position, totalDistance, label, type }: LayoutMarkerProps) => {
    const safePos = parseFloat(position as string) || 0;
    const safeTotal = parseFloat(totalDistance as string) || 0;

    let percent = 0;

    if (type === 'start') {
        percent = 0;
    } else if (type === 'finish') {
        percent = 100;
    } else {
        if (safeTotal > 0) {
            percent = (safePos / safeTotal) * 100;
        } else {
            percent = 50;
        }
    }

    percent = Math.max(0, Math.min(100, percent));

    console.log(`[Marker] ${label}: pos=${safePos}, total=${safeTotal} -> left=${percent}%`);

    const isStart = type === 'start';
    const isFinish = type === 'finish';

    const markerBgClass = isStart ? 'bg-brand-orange' : isFinish ? 'bg-status-success' : 'bg-text-sub';
    const textColorClass = isStart ? 'text-brand-orange' : isFinish ? 'text-status-success' : 'text-text-sub';
    const shadowColor = isStart ? '#FF6D00' : isFinish ? '#34d399' : '#A3A3A3';

    return (
        <View
            className={`absolute top-0 bottom-0 w-24 -ml-12 items-center justify-center ${type === 'gate' ? 'z-20' : 'z-10'}`}
            style={{ left: `${percent}%` }}
        >
            {!isStart && !isFinish ? (
                <View className="mb-2 bg-surface-card/90 px-2 py-0.5 rounded-full border border-surface-border shadow-sm">
                    <Text className="text-text-main text-caption font-evolventa-bold">
                        {safePos} м
                    </Text>
                </View>
            ) : (
                <Text className="text-text-main text-small font-bold mb-2 font-evolventa">
                    {safePos} м
                </Text>
            )}

            <View
                className={`w-1 h-6 rounded-full ${markerBgClass}`}
                style={{
                    shadowColor: shadowColor,
                    shadowOpacity: 0.6,
                    shadowRadius: 6,
                    elevation: 4
                }}
            />

            <Text className={`mt-2 text-small font-evolventa-bold ${textColorClass}`}>
                {label}
            </Text>
        </View>
    );
};