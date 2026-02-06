import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function SpeedCheckerTool({ onBack }: { onBack: () => void }) {
    return (
        <View className="flex-1 px-4 pt-4">
            <TouchableOpacity onPress={onBack} className="mb-6"><Text className="text-yellow-400 text-lg">❮ Назад</Text></TouchableOpacity>

            <View className="flex-1 items-center justify-center">
                <Text className="text-8xl mb-4">🏃💨</Text>
                <Text className="text-white text-3xl font-black uppercase italic mb-2">Speed Checker</Text>
                <Text className="text-slate-400 text-center px-10">
                    Тут буде інтерфейс для заміру швидкості через датчики.
                </Text>

                <TouchableOpacity className="mt-8 bg-yellow-400 px-8 py-4 rounded-xl">
                    <Text className="text-slate-900 font-bold uppercase">Готовий до старту</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}