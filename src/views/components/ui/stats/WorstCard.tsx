import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface WorstCardProps {
    title: string;
    time: string;
    playerName: string;
    teamName?: string;
}

export const WorstCard = ({ title, time, playerName, teamName }: WorstCardProps) => {
    return (
        <View className="w-[48%] p-4 rounded-2xl relative overflow-hidden border border-red-500/30">
            {/* Матове скло з червоним відтінком */}
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} experimentalBlurMethod="dimezisBlurView" />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(220, 38, 38, 0.1)' }]} />

            <View className="flex-row items-center mb-1 relative z-10">
                <Feather name="trending-down" size={16} color="#f87171" />
                <Text
                    className="text-xs font-bold uppercase ml-1 text-red-400"
                    style={{ fontFamily: 'Evolventa' }}
                >
                    {title}
                </Text>
            </View>

            <Text
                className="text-3xl font-bold text-white relative z-10"
                style={{ fontFamily: 'Unbounded' }}
            >
                {time}
            </Text>

            <Text
                className="text-sm mt-1 font-bold text-[#F5F5F5] relative z-10"
                numberOfLines={1}
                style={{ fontFamily: 'Evolventa' }}
            >
                {playerName}
            </Text>

            {teamName && (
                <Text
                    className="text-[10px] font-bold mt-0.5 text-[#A3A3A3] relative z-10"
                    numberOfLines={1}
                    style={{ fontFamily: 'Evolventa' }}
                >
                    {teamName}
                </Text>
            )}

            <View className="absolute -right-2 -bottom-2 opacity-10">
                <MaterialCommunityIcons name="timer-sand" size={70} color="#f87171" />
            </View>
        </View>
    );
};