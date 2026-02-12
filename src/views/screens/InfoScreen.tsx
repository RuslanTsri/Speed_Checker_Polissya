import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePlayerInfo, Player } from '../../hooks/players/usePlayerInfo';

interface InfoScreenProps {
    player: Player;
    onBack: () => void;
    onDelete: (id: string) => void;
}

export default function InfoScreen({ player, onBack, onDelete }: InfoScreenProps) {
    // Вся логіка тут
    const {
        positionLabel,
        handleDeletePress,
        handleBack
    } = usePlayerInfo(player, onBack, onDelete);

    return (
        <ScrollView className="flex-1 bg-slate-900 pt-4 px-4">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={handleBack} className="flex-row items-center">
                    <Feather name="arrow-left" size={24} color="#facc15" />
                    <Text className="text-yellow-400 font-bold ml-2 text-lg">Назад</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleDeletePress}
                    className="bg-slate-800 p-2 rounded-lg border border-slate-700"
                >
                    <Feather name="trash-2" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            {/* Main Info */}
            <View className="items-center mb-8">
                <View className="w-48 h-48 rounded-full border-4 border-yellow-400 shadow-2xl shadow-yellow-400/20 items-center justify-center overflow-hidden mb-6 bg-slate-800">
                    <Image source={{ uri: player.photoUrl }} className="w-full h-full" resizeMode="cover" />
                </View>

                <Text className="text-white text-3xl font-black text-center mb-1">{player.name}</Text>
                <Text className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-6">Гравець основного складу</Text>

                <View className="flex-row items-center gap-4">
                    <View className="bg-slate-800 px-6 py-3 rounded-2xl border border-slate-700 items-center min-w-[90px]">
                        <Text className="text-slate-400 text-xs uppercase font-bold mb-1">Номер</Text>
                        <Text className="text-yellow-400 font-black text-3xl">#{player.number}</Text>
                    </View>
                    <View className="bg-yellow-400 px-6 py-3 rounded-2xl items-center min-w-[90px] shadow-lg shadow-yellow-400/20">
                        <Text className="text-slate-900 text-xs uppercase font-bold mb-1">Позиція</Text>
                        <Text className="text-slate-900 font-black text-2xl">{positionLabel}</Text>
                    </View>
                </View>
            </View>

            <View className="border-t border-slate-800 my-2" />

            <Text className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4 mt-4">Особисті показники</Text>

            {/* Stats Grid */}
            <View className="flex-row justify-between mb-4">
                <View className="w-[48%] bg-slate-800 p-5 rounded-3xl border border-slate-700 items-center shadow-sm">
                    <View className="w-12 h-12 bg-green-500/10 rounded-full items-center justify-center mb-3">
                        <Feather name="award" size={24} color="#4ade80" />
                    </View>
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Найкращий час</Text>
                    <Text className="text-white text-3xl font-black">{player.stats?.bestTime || '--'}</Text>
                </View>

                <View className="w-[48%] bg-slate-800 p-5 rounded-3xl border border-slate-700 items-center shadow-sm">
                    <View className="w-12 h-12 bg-blue-500/10 rounded-full items-center justify-center mb-3">
                        <Feather name="clock" size={24} color="#60a5fa" />
                    </View>
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Останній час</Text>
                    <Text className="text-white text-3xl font-black">{player.stats?.lastTime || '--'}</Text>
                </View>
            </View>

            {/* Total Activity */}
            <View className="bg-slate-800 p-5 rounded-3xl border border-slate-700 flex-row justify-between items-center mb-20 shadow-sm">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-slate-700 rounded-full items-center justify-center mr-4">
                        <MaterialCommunityIcons name="run-fast" size={24} color="#cbd5e1" />
                    </View>
                    <View>
                        <Text className="text-slate-400 text-xs uppercase font-bold">Активність</Text>
                        <Text className="text-white font-bold text-base">Всього забігів</Text>
                    </View>
                </View>
                <Text className="text-yellow-400 font-black text-3xl">{player.stats?.totalSessions || 0}</Text>
            </View>

        </ScrollView>
    );
}