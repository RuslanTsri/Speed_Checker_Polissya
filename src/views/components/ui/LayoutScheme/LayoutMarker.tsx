
import React from 'react';
import { View, Text } from 'react-native';

export interface LayoutMarkerProps {
    position: number;
    totalDistance: number;
    label: string;
    type: 'start' | 'finish' | 'gate';
}

export const LayoutMarker = ({ position, totalDistance, label, type }: LayoutMarkerProps) => {
    // Рахуємо позицію у відсотках
    const percent = totalDistance > 0 ? (position / totalDistance) * 100 : 0;

    // Визначаємо колір залежно від типу
    let color = '#A3A3A3'; // gate (сірий)
    let shadowColor = 'rgba(163, 163, 163, 0.5)';

    if (type === 'start') {
        color = '#FF6D00'; // Помаранчевий
        shadowColor = 'rgba(255, 109, 0, 0.5)';
    } else if (type === 'finish') {
        color = '#34d399'; // Зелений
        shadowColor = 'rgba(52, 211, 153, 0.5)';
    }

    return (

        <View className="absolute top-0 bottom-0 w-24 -ml-12 items-center justify-center" style={{ left: `${percent}%` }}>

            {/* Метраж (стилізований по-різному для гейтів та старту/фінішу) */}
            {type !== 'start' && type !== 'finish' && (
                <View className="mb-2 bg-[#1C1C1E]/80 px-2 py-0.5 rounded-full border border-white/10">
                    <Text className="text-white text-[10px] font-bold" style={{ fontFamily: 'Evolventa' }}>
                        {position} м
                    </Text>
                </View>
            )}
            {(type === 'start' || type === 'finish') && (
                <Text className="text-white text-[12px] font-bold mb-2" style={{ fontFamily: 'Evolventa' }}>
                    {position} м
                </Text>
            )}

            {/* Палочка гейта */}
            <View
                className="w-1 h-6 rounded-full"
                style={{
                    backgroundColor: color,
                    shadowColor: shadowColor,
                    shadowOpacity: 1,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 5
                }}
            />

            {/* Підпис (Start / Finish / Gate X) */}
            <Text className="mt-2 text-[12px] font-bold" style={{ color: color, fontFamily: 'Evolventa' }}>
                {label}
            </Text>
        </View>
    );
};