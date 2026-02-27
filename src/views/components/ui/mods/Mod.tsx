import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface ModProps {
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    activeIcon?: React.ReactNode;
    rightHeader?: React.ReactNode;
    onPress?: () => void;
    className?: string;
    children?: React.ReactNode;
    variant?: 'default' | 'ghost';
}

export const Mod = ({
                        title, subtitle, icon, activeIcon, rightHeader, onPress,
                        className = '', children, variant = 'default'
                    }: ModProps) => {
    const isClickable = !!onPress;
    const isDefault = variant === 'default';

    // 🔥 Якщо заголовка немає (title=""), ми не резервуємо під нього місце
    const hasHeader = title && title.length > 0;

    return (
        <Pressable
            onPress={onPress}
            disabled={!isClickable}
            style={({ pressed }) => [
                { transform: [{ scale: pressed && isClickable ? 0.98 : 1 }] }
            ]}
            className={`w-full ${className}`}
        >
            {({ pressed }) => {
                const isPressed = pressed && isClickable;
                const currentIcon = isPressed && activeIcon ? activeIcon : icon;

                return (
                    <View
                        // 🔥 Прибираємо фіксовану висоту, якщо це просто контейнер для рядів
                        style={[!hasHeader && { minHeight: 0 }]}
                        className={`rounded-3xl overflow-hidden ${
                            isDefault ? 'border border-white/10 shadow-sm' : 'border border-white/5 bg-white/5'
                        }`}
                    >
                        {isDefault ? (
                            <>
                                <BlurView intensity={30} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
                                <LinearGradient
                                    colors={isPressed
                                        ? ['rgba(0, 0, 0, 0.7)', 'rgba(64, 64, 64, 0.6)']
                                        : ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)']}
                                    start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                                    style={StyleSheet.absoluteFill}
                                />
                            </>
                        ) : null}

                        <View className={hasHeader ? "p-5" : "px-5 py-2"}>
                            {hasHeader ? (
                                <View className="flex-row items-center justify-between w-full">
                                    <View className="flex-row items-center gap-4 flex-1">
                                        {currentIcon ? <View className="items-center justify-center">{currentIcon}</View> : null}
                                        <View className="flex-1 flex-col justify-center items-start gap-1">
                                            <Text className="text-[#F5F5F5] text-xl font-bold leading-6" style={{ fontFamily: 'Unbounded' }}>
                                                {title}
                                            </Text>
                                            {subtitle ? (
                                                <Text className="text-[#A3A3A3] text-sm font-normal leading-5 tracking-wide" style={{ fontFamily: 'Evolventa' }}>
                                                    {subtitle}
                                                </Text>
                                            ) : null}
                                        </View>
                                    </View>
                                    {rightHeader ? <View className="ml-3 items-end">{rightHeader}</View> : null}
                                </View>
                            ) : null}

                            {/* 🔥 Рендеримо дітей (SettingsRow) */}
                            {children ? (
                                <View className={hasHeader ? "mt-2 w-full" : "w-full"}>
                                    {children}
                                </View>
                            ) : null}
                        </View>
                    </View>
                );
            }}
        </Pressable>
    );
};