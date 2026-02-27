import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface ModProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    activeIcon?: React.ReactNode;
    rightHeader?: React.ReactNode;
    onPress?: () => void;
    className?: string;
    children?: React.ReactNode;
    // 🔥 ДОДАЛИ ВАРІАНТ ДИЗАЙНУ
    variant?: 'default' | 'ghost';
}

export const Mod = ({
                        title, subtitle, icon, activeIcon, rightHeader, onPress,
                        className = '', children, variant = 'default'
                    }: ModProps) => {
    const isClickable = !!onPress;
    const isDefault = variant === 'default';

    return (
        <Pressable
            onPress={onPress}
            disabled={!isClickable}
            style={({ pressed }) => [
                { transform: [{ scale: pressed && isClickable ? 0.97 : 1 }] }
            ]}
            className={`w-full ${className}`}
        >
            {({ pressed }) => {
                const isPressed = pressed && isClickable;
                const currentIcon = isPressed && activeIcon ? activeIcon : icon;

                return (
                    <View
                        style={styles.container}
                        // Якщо це ghost (для модалки) — робимо просто легкий фон bg-white/5
                        className={`rounded-3xl overflow-hidden ${
                            isDefault
                                ? 'border border-white/10 shadow-sm'
                                : 'border border-white/5 bg-white/5'
                        }`}
                    >
                        {/* 🔥 Блюр і градієнт рендеримо ТІЛЬКИ для default варіанту */}
                        {isDefault && (
                            <>
                                <BlurView intensity={30} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
                                <LinearGradient
                                    colors={isPressed
                                        ? ['rgba(0, 0, 0, 0.7)', 'rgba(64, 64, 64, 0.6)']
                                        : ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)']}
                                    start={{ x: 0, y: 0.5 }}
                                    end={{ x: 1, y: 0.5 }}
                                    style={StyleSheet.absoluteFill}
                                />
                                {isPressed && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />}
                            </>
                        )}

                        {/* 🔥 Ефект натискання для ghost варіанту */}
                        {!isDefault && isPressed && (
                            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
                        )}

                        <View className="p-5">
                            <View className="flex-row items-center justify-between w-full">
                                <View className="flex-row items-center gap-4 flex-1">
                                    {currentIcon && (
                                        <View className="items-center justify-center">
                                            {currentIcon}
                                        </View>
                                    )}

                                    <View className="flex-1 flex-col justify-center items-start gap-1">
                                        <Text className="text-[#F5F5F5] text-xl font-bold leading-6" style={{ fontFamily: 'Unbounded' }}>
                                            {title}
                                        </Text>
                                        {subtitle && (
                                            <Text className="text-[#A3A3A3] text-sm font-normal leading-5 tracking-wide" style={{ fontFamily: 'Evolventa' }}>
                                                {subtitle}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                {rightHeader && (
                                    <View className="ml-3 items-end">
                                        {rightHeader}
                                    </View>
                                )}
                            </View>

                            {children && (
                                <View className="mt-4 w-full">
                                    {children}
                                </View>
                            )}
                        </View>
                    </View>
                );
            }}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: { minHeight: 80 }
});