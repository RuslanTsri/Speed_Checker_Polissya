import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
// Імпорт іконок
import { Feather } from '@expo/vector-icons';

export default function BluetoothTool({ onBack }: { onBack: () => void }) {
    return (
        <View className="flex-1 px-4 pt-4">
            <TouchableOpacity onPress={onBack} className="mb-6 flex-row items-center">
                <Feather name="arrow-left" size={24} color="#facc15" />
                <Text className="text-yellow-400 text-lg ml-2 font-bold">Назад</Text>
            </TouchableOpacity>

            <View className="bg-slate-800 p-8 rounded-3xl border border-slate-700 items-center shadow-lg">
                <View className="w-24 h-24 bg-blue-500/20 rounded-full items-center justify-center mb-6 border border-blue-500/30">
                    <Feather name="bluetooth" size={32} color="white" />
                </View>

                <Text className="text-white text-2xl font-bold mb-2">Пошук датчиків...</Text>

                <ActivityIndicator size="large" color="#facc15" className="my-6 scale-125" />

                <Text className="text-slate-400 text-center leading-5 px-4">
                    Переконайтеся, що модулі ESP32 увімкнені та знаходяться в радіусі дії (до 10м).
                </Text>
            </View>
        </View>
    );
}