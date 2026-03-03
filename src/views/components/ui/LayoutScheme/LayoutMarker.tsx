import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface LayoutMarkerProps {
    position: number;
    totalDistance: number;
    label: string;
    type: 'start' | 'finish' | 'gate';
}

export const LayoutMarker = ({ position, totalDistance, label, type }: LayoutMarkerProps) => {
    const percent = totalDistance > 0 ? (position / totalDistance) * 100 : 0;

    // 🔥 Визначаємо стилі через токени Tailwind
    const isStart = type === 'start';
    const isFinish = type === 'finish';

    // Динамічні класи для кольорів
    const markerBgClass = isStart ? 'bg-brand-orange' : isFinish ? 'bg-status-success' : 'bg-text-sub';
    const textColorClass = isStart ? 'text-brand-orange' : isFinish ? 'text-status-success' : 'text-text-sub';

    // Колір тіні для стилів (StyleSheet), бо Tailwind не вміє в динамічні тіні RN
    const shadowColor = isStart ? '#FF6D00' : isFinish ? '#34d399' : '#A3A3A3';

    return (
        <View
            className="absolute top-0 bottom-0 w-24 -ml-12 items-center justify-center"
            style={{ left: `${percent}%` }}
        >
            {/* 1. МЕТРАЖ (використовуємо caption для гейтів і small для старт/фініш) */}
            {!isStart && !isFinish ? (
                <View className="mb-2 bg-surface-card/80 px-2 py-0.5 rounded-full border border-surface-border">
                    <Text className="text-text-main text-caption font-evolventa-bold">
                        {position} м
                    </Text>
                </View>
            ) : (
                <Text className="text-text-main text-small font-bold mb-2 font-evolventa">
                    {position} м
                </Text>
            )}

            {/* 2. ПАЛИЧКА ГЕЙТА */}
            <View
                className={`w-1 h-6 rounded-full ${markerBgClass}`}
                style={{
                    shadowColor: shadowColor,
                    shadowOpacity: 0.5,
                    shadowRadius: 6,
                    elevation: 4
                }}
            />

            {/* 3. ПІДПИС (Start / Finish / Gate X) */}
            <Text className={`mt-2 text-small font-evolventa-bold ${textColorClass}`}>
                {label}
            </Text>
        </View>
    );
};