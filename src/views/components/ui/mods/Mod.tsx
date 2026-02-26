import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface ModProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    activeIcon?: React.ReactNode;
    onPress?: () => void;
    className?: string;
    children?: React.ReactNode;
}

export const Mod = ({ title, subtitle, icon, activeIcon, onPress, className = '', children }: ModProps) => {
    const isClickable = !!onPress;

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
                // Магія зміни іконки
                const currentIcon = isPressed && activeIcon ? activeIcon : icon;

                return (
                    <View
                        style={styles.container}
                        // outline-Neutral-800 з Фігми це приблизно #262626
                        className="rounded-2xl overflow-hidden border border-[#262626] shadow-sm"
                    >
                        {/* 1. БЛЮР ФОНУ (Матове скло) */}
                        <BlurView
                            intensity={20} // Легке розмиття, щоб було видно градієнт фону
                            tint="dark"
                            style={StyleSheet.absoluteFill}
                        />

                        {/* 2. ГРАДІЄНТ З ФІГМИ (from-Neutral-1000 to-Neutral-700) */}
                        <LinearGradient
                            colors={isPressed
                                ? ['rgba(0, 0, 0, 0.6)', 'rgba(64, 64, 64, 0.6)'] // Clicked (60%)
                                : ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)']} // Default (40%)
                            start={{ x: 0, y: 0.5 }} // bg-linear-87 (зліва направо)
                            end={{ x: 1, y: 0.5 }}
                            style={StyleSheet.absoluteFill}
                        />

                        {/* 3. КОНТЕНТ (p-3 з Фігми) */}
                        <View className="p-3">
                            {/* gap-2 з Фігми */}
                            <View className="flex-row items-center gap-2">

                                {/* Tap Space для іконки */}
                                {currentIcon && (
                                    <View className="p-1 items-center justify-center">
                                        {currentIcon}
                                    </View>
                                )}

                                {/* Тексти */}
                                <View className="flex-1 flex-col justify-center items-start gap-1">
                                    <Text
                                        className="text-[#F5F5F5] text-base font-bold leading-4"
                                        style={{ fontFamily: 'Unbounded' }}
                                    >
                                        {title}
                                    </Text>

                                    {subtitle && (
                                        <Text
                                            className="text-[#A3A3A3] text-sm font-normal leading-5"
                                            style={{ fontFamily: 'Evolventa' }}
                                        >
                                            {subtitle}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Внутрішні елементи (Кнопки "Під'єднати", "Ручний режим") */}
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
    container: {
        // Мінімальна висота, щоб не злипалося, якщо немає підпису
        minHeight: 64,
    }
});