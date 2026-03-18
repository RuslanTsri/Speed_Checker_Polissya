import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const GRADIENT_BG = ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)'] as const;

interface LayoutContainerProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    headerRight?: React.ReactNode;
}

export const LayoutContainer = ({ children, title, subtitle, headerRight }: LayoutContainerProps) => {
    const isAndroid = Platform.OS === 'android';

    return (
        <View className="rounded-3xl border border-surface-border shadow-sm mb-6 min-h-[160px]">
            <View className="absolute inset-0 rounded-3xl overflow-hidden">
                {!isAndroid ? (
                    <>
                        <BlurView intensity={30} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
                        <LinearGradient colors={GRADIENT_BG} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
                    </>
                ) : (
                    <View style={StyleSheet.absoluteFill} className="bg-surface-card" />
                )}
            </View>

            <View className="p-5">
                <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-text-main text-h3 font-unbounded-bold flex-1 pr-2">
                        {title}
                    </Text>
                    {headerRight && <View className="mt-0.5">{headerRight}</View>}
                </View>

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