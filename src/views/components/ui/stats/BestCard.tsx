import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// 🔥 Кольори градієнта в константах для швидкості
const CARD_GRADIENT = ['#1C1C1E', '#161617'] as const;

interface BestCardProps {
    title: string;
    time: string;
    playerName: string;
    teamName?: string;
    optimizeForList?: boolean;
}

export const BestCard = ({ title, time, playerName, teamName, optimizeForList = false }: BestCardProps) => {
    const isAndroidTurbo = Platform.OS === 'android' && optimizeForList;

    return (
        <View className="w-[48%] p-4 rounded-2xl relative overflow-hidden border border-status-success/30">
            {/* 1. БАЗОВИЙ ГРАДІЄНТ (Твій surface-card) */}
            <LinearGradient colors={CARD_GRADIENT} style={StyleSheet.absoluteFill} />

            {/* 2. ЕФЕКТ СКЛА (Для iOS/Android без оптимізації) */}
            {!isAndroidTurbo && (
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} experimentalBlurMethod="dimezisBlurView" />
            )}

            {/* 3. ЗЕЛЕНЕ ТОНУВАННЯ */}
            <View style={StyleSheet.absoluteFill} className="bg-status-success/5" />

            <View className="relative z-10">
                <View className="flex-row items-center mb-1">
                    <Feather name="trending-up" size={16} color="#34d399" />
                    <Text className="text-caption font-bold uppercase ml-1 text-status-success font-evolventa">
                        {title}
                    </Text>
                </View>

                {/* Великі секунди: Unbounded */}
                <Text className="text-h1 font-bold text-text-main font-unbounded leading-none">
                    {time}
                </Text>

                {/* Ім'я: Evolventa */}
                <Text className="text-body mt-1 font-bold text-text-main font-evolventa" numberOfLines={1}>
                    {playerName}
                </Text>

                {teamName && (
                    <Text className="text-caption font-bold mt-0.5 text-text-sub font-evolventa" numberOfLines={1}>
                        {teamName}
                    </Text>
                )}
            </View>

            {/* Фонова іконка-декор */}
            <View className="absolute -right-2 -bottom-2 opacity-10">
                <MaterialCommunityIcons name="lightning-bolt" size={70} color="#34d399" />
            </View>
        </View>
    );
};