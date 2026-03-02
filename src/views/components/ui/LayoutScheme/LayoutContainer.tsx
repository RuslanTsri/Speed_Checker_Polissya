import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface LayoutContainerProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const LayoutContainer = ({ children, title, subtitle }: LayoutContainerProps) => {
    return (
        <View className="rounded-3xl overflow-hidden border border-white/10 shadow-sm mb-6 min-h-[160px]">
            <BlurView intensity={30} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
            <LinearGradient
                colors={['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)']}
                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
            />
            <View className="p-5">
                <Text className="text-[#F5F5F5] text-xl font-bold leading-6 mb-1" style={{ fontFamily: 'Unbounded' }}>
                    {title}
                </Text>
                <Text className="text-[#A3A3A3] text-sm tracking-wide mb-6" style={{ fontFamily: 'Evolventa' }}>
                    {subtitle}
                </Text>

                {/* Контейнер для самої лінії та маркерів */}
                <View className="h-20 justify-center relative mx-4">
                    {children}
                </View>
            </View>
        </View>
    );
};