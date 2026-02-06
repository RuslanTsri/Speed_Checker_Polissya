import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function TimerTool({ onBack }: { onBack: () => void }) {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(sec => sec + 0.01); // Оновлюємо кожні 10мс
            }, 10);
        } else if (!isActive && interval) {
            clearInterval(interval);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isActive]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        const ms = Math.floor((totalSeconds % 1) * 100);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <View className="flex-1 px-4 pt-4">
            {/* Кнопка Назад */}
            <TouchableOpacity onPress={onBack} className="mb-8 flex-row items-center">
                <Text className="text-yellow-400 text-lg font-bold">❮ Назад</Text>
            </TouchableOpacity>

            <View className="flex-1 items-center justify-center -mt-20">
                <Text className="text-slate-400 text-sm uppercase tracking-widest mb-4">Секундомір</Text>

                {/* Циферблат */}
                <View className="w-64 h-64 rounded-full border-4 border-slate-700 items-center justify-center bg-slate-800 shadow-xl shadow-yellow-400/10 mb-10">
                    <Text className="text-white text-5xl font-black font-mono">
                        {formatTime(seconds)}
                    </Text>
                </View>

                {/* Кнопки керування */}
                <View className="flex-row gap-6">
                    <TouchableOpacity
                        onPress={() => setIsActive(!isActive)}
                        className={`w-20 h-20 rounded-full items-center justify-center ${isActive ? 'bg-red-500' : 'bg-green-500'}`}
                    >
                        <Text className="text-white font-bold text-xs uppercase">
                            {isActive ? 'Стоп' : 'Старт'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { setIsActive(false); setSeconds(0); }}
                        className="w-20 h-20 rounded-full items-center justify-center bg-slate-700 border border-slate-600"
                    >
                        <Text className="text-white font-bold text-xs uppercase">Скидання</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}