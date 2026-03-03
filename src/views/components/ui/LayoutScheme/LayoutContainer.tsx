import React from 'react';
import { View,Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const GRADIENT_BG = ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)'] as const;

interface LayoutContainerProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const LayoutContainer = ({ children, title, subtitle }: LayoutContainerProps) => {
    const isAndroid = Platform.OS === 'android';

    return (
        <View className="rounded-3xl overflow-hidden border border-surface-border shadow-sm mb-6 min-h-[160px]">
            {!isAndroid ? (
                <>
                    <BlurView intensity={30} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
                    <LinearGradient colors={GRADIENT_BG} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
                </>
            ) : (
                <View style={StyleSheet.absoluteFill} className="bg-surface-card" />
            )}

            <View className="p-5">
                <Text className="text-text-main text-h3 font-unbounded-bold mb-1">
                    {title}
                </Text>
                <Text className="text-text-sub text-body font-evolventa tracking-wide mb-6">
                    {subtitle}
                </Text>

                <View className="h-20 justify-center relative mx-4">
                    {children}
                </View>
            </View>
        </View>
    );
};