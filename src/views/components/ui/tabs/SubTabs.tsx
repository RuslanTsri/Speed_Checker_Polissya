import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

interface SubTabsProps {
    distances: number[];
    selectedDistance: number;
    onSelect: (distance: number) => void;
}

export const SubTabs = ({ distances, selectedDistance, onSelect }: SubTabsProps) => {
    return (
        <View className="w-full mb-4">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    gap: 8,
                    flexGrow: 1,
                    justifyContent: 'center'
                }}
            >
                {distances.map(dist => {
                    const isActive = selectedDistance === dist;
                    return (
                        <TouchableOpacity
                            key={dist}
                            onPress={() => onSelect(dist)}
                            activeOpacity={0.7}
                            className={`rounded-full overflow-hidden border ${
                                isActive
                                    ? 'border-[#FF6D00]/60'
                                    : 'border-white/10'
                            }`}
                        >
                            {/* 🔥 Сильний блюр */}
                            <BlurView
                                intensity={50}
                                tint="dark"
                                experimentalBlurMethod="dimezisBlurView"
                                style={StyleSheet.absoluteFill}
                            />

                            {/* 🔥 Тонування скла: помаранчеве для активного, сіре для неактивного */}
                            <View className={`px-5 py-1.5 ${
                                isActive ? 'bg-[#FF6D00]/20' : 'bg-white/5'
                            }`}>
                                <Text
                                    className={`text-xs font-bold ${isActive ? 'text-[#FF6D00]' : 'text-[#A3A3A3]'}`}
                                    style={{ fontFamily: 'Evolventa' }}
                                >
                                    {dist} м
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};