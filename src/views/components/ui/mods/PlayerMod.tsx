import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import {
    PhotoIcon, // або UserIcon, залежно від того, що ти використовуєш
    PenIcon,
    PenIconActive,
    CrossIconActive
} from '../../../../../assets/icons';

interface PlayerModProps {
    name: string;
    // 🔥 ДОЗВОЛЯЄМО ПЕРЕДАВАТИ ЯК ТЕКСТ, ТАК І ВЕРСТКУ
    subtitle?: string | React.ReactNode;
    rightIcon?: React.ReactNode; // Додано для кастомних елементів справа
    onPress?: () => void;
    onEditPress?: () => void;
    onDeletePress?: () => void;
    className?: string;
}

export const PlayerMod = ({
                              name,
                              subtitle,
                              rightIcon, // Не забуваємо дістати цей пропс
                              onPress,
                              onEditPress,
                              onDeletePress,
                              className = ''
                          }: PlayerModProps) => {
    const isClickable = !!onPress;

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

                return (
                    <View
                        style={styles.container}
                        className="rounded-2xl overflow-hidden border border-white/10 shadow-sm"
                    >
                        {/* 1. ШАР БЛЮРУ (Матове скло) */}
                        <BlurView
                            intensity={30}
                            tint="dark"
                            experimentalBlurMethod="dimezisBlurView"
                            style={StyleSheet.absoluteFill}
                        />

                        {/* 2. НАПІВПРОЗОРИЙ ГРАДІЄНТ */}
                        <LinearGradient
                            colors={isPressed
                                ? ['rgba(0, 0, 0, 0.7)', 'rgba(64, 64, 64, 0.6)']
                                : ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={StyleSheet.absoluteFill}
                        />

                        {/* 3. КОНТЕНТ */}
                        <View className="p-3 flex-row items-center justify-between">
                            {/* ЛІВА ЧАСТИНА: Аватар + Інфо */}
                            <View className="flex-1 flex-row items-center gap-3">
                                <View className="items-center justify-center">
                                    {/* Використовуй свою іконку */}
                                    <PhotoIcon width={36} height={36} />
                                </View>

                                <View className="flex-1 flex-col justify-center items-start gap-1">
                                    <Text
                                        className="text-[#F5F5F5] text-base font-bold leading-4"
                                        style={{ fontFamily: 'Unbounded' }}
                                        numberOfLines={1}
                                    >
                                        {name}
                                    </Text>

                                    {/* 🔥 РОЗУМНИЙ РЕНДЕР SUBTITLE */}
                                    {subtitle && (
                                        typeof subtitle === 'string' ? (
                                            <Text
                                                className="text-[#A3A3A3] text-sm font-normal leading-4"
                                                style={{ fontFamily: 'Evolventa' }}
                                            >
                                                {subtitle}
                                            </Text>
                                        ) : (
                                            <View>{subtitle}</View>
                                        )
                                    )}
                                </View>
                            </View>

                            {/* ПРАВА ЧАСТИНА: Кнопки дій АБО Кастомний rightIcon (для результатів) */}
                            <View className="flex-row items-center gap-1">

                                {/* Якщо передали кастомний елемент (цифри результатів), показуємо його */}
                                {rightIcon ? (
                                    rightIcon
                                ) : (
                                    /* Інакше показуємо стандартні кнопки редагування/видалення */
                                    <>
                                        {onEditPress && (
                                            <Pressable
                                                onPress={onEditPress}
                                                className="p-2 active:opacity-60"
                                            >
                                                {({ pressed: isBtnPressed }) => (
                                                    isBtnPressed || isPressed ? (
                                                        <PenIconActive width={22} height={22} />
                                                    ) : (
                                                        <PenIcon width={22} height={22} />
                                                    )
                                                )}
                                            </Pressable>
                                        )}

                                        {onDeletePress && (
                                            <Pressable
                                                onPress={onDeletePress}
                                                className="p-2 active:opacity-60"
                                            >
                                                <CrossIconActive width={22} height={22} />
                                            </Pressable>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                );
            }}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: 64,
    }
});