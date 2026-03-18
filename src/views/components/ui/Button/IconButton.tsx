import React from 'react';
import { Pressable, View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const GRADIENT_NORMAL = ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)'] as const;
const GRADIENT_PRESSED = ['rgba(0, 0, 0, 0.7)', 'rgba(64, 64, 64, 0.6)'] as const;

interface IconButtonProps {
    icon: React.ReactNode;
    onPress?: () => void;
    className?: string;
    optimizeForList?: boolean;
}

export const IconButton = ({ icon, onPress, className = '', optimizeForList = false }: IconButtonProps) => {
    const isAndroid = Platform.OS === 'android';
    const useRealBlur = !(optimizeForList && isAndroid);

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.92 : 1 }] }]}
        >
            {({ pressed }) => (
                <View className={`w-12 h-12 rounded-full overflow-hidden items-center justify-center border border-white/10 ${className}`}>

                    {isAndroid && optimizeForList ? (
                        <View style={StyleSheet.absoluteFill} className={pressed ? 'bg-surface-cardPressed' : 'bg-surface-card'} />
                    ) : (
                        <>
                            {useRealBlur && (
                                <BlurView intensity={30} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
                            )}
                            <LinearGradient
                                colors={pressed ? GRADIENT_PRESSED : GRADIENT_NORMAL}
                                style={StyleSheet.absoluteFill}
                            />
                        </>
                    )}

                    <View className="z-10">{icon}</View>
                </View>
            )}
        </Pressable>
    );
};