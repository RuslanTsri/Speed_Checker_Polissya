import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// 🔥 Імпортуємо всі необхідні
import {
    PhotoIcon,
    PenIcon,
    PenIconActive,
    CrossIconActive
} from '../../../../../assets/icons';

interface PlayerModProps {
    name: string;
    subtitle?: string;
    onPress?: () => void;
    onEditPress?: () => void;   // Клік на олівець
    onDeletePress?: () => void; // Клік на хрестик
    className?: string;
}

export const PlayerMod = ({
                              name,
                              subtitle,
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
                            style={StyleSheet.absoluteFill}
                        />

                        {/* 2. НАПІВПРОЗОРИЙ ГРАДІЄНТ */}


                        {/* 3. КОНТЕНТ */}
                        <View className="p-3 flex-row items-center justify-between">
                            {/* ЛІВА ЧАСТИНА: Аватар + Інфо */}
                            <View className="flex-1 flex-row items-center gap-3">
                                <View className="items-center justify-center">
                                    {isPressed ? (
                                        <PhotoIcon width={36} height={36} />
                                    ) : (
                                        <PhotoIcon width={36} height={36} />
                                    )}
                                </View>

                                <View className="flex-1 flex-col justify-center items-start gap-1">
                                    <Text
                                        className="text-[#F5F5F5] text-base font-bold leading-4"
                                        style={{ fontFamily: 'Unbounded' }}
                                        numberOfLines={1}
                                    >
                                        {name}
                                    </Text>
                                    {subtitle && (
                                        <Text
                                            className="text-[#A3A3A3] text-sm font-normal leading-4"
                                            style={{ fontFamily: 'Evolventa' }}
                                        >
                                            {subtitle}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* ПРАВА ЧАСТИНА: Кнопки дій */}
                            <View className="flex-row items-center gap-1">
                                {/* Кнопка Редагування */}
                                {onEditPress && (
                                    <Pressable
                                        onPress={onEditPress}
                                        className="p-2 active:opacity-60"
                                    >
                                        {({ pressed: isBtnPressed }) => (
                                            // Іконка стає активною, якщо натиснута сама кнопка АБО вся картка
                                            isBtnPressed || isPressed ? (
                                                <PenIconActive width={22} height={22} />
                                            ) : (
                                                <PenIcon width={22} height={22} />
                                            )
                                        )}
                                    </Pressable>
                                )}

                                {/* Кнопка Видалення */}
                                {onDeletePress && (
                                    <Pressable
                                        onPress={onDeletePress}
                                        className="p-2 active:opacity-60"
                                    >
                                        <CrossIconActive width={22} height={22} />
                                    </Pressable>
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