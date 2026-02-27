import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface RatingModProps {
    rank: number | string;
    name: string;
    subtitle?: string;
    resultValue: string; // Наприклад "4.04"
    secondaryValue?: string; // Наприклад "25.1 km/h"
    onPress?: () => void;
    className?: string;
}

export const RatingMod = ({
                              rank,
                              name,
                              subtitle,
                              resultValue,
                              secondaryValue,
                              onPress,
                              className = ''
                          }: RatingModProps) => {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [{ transform: [{ scale: pressed && onPress ? 0.98 : 1 }] }]}
            className={`w-full ${className}`}
        >
            {({ pressed }) => (
                <View style={styles.container} className="rounded-2xl overflow-hidden border border-[#262626] shadow-sm">
                    <BlurView
                        intensity={30}
                        tint="dark"
                        experimentalBlurMethod="dimezisBlurView"
                        style={StyleSheet.absoluteFill}
                    />


                    <LinearGradient
                        colors={pressed && onPress
                            ? ['rgba(0, 0, 0, 0.7)', 'rgba(64, 64, 64, 0.6)']
                            : ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={StyleSheet.absoluteFill}
                    />

                    <View className="p-3 flex-row items-center justify-between">
                        {/* ЛІВА ЧАСТИНА: Ранг + Ім'я */}
                        <View className="flex-1 flex-row items-center gap-3">
                            <View className="w-8 items-center justify-center">
                                <Text
                                    className="text-[#F5F5F5] text-base font-bold"
                                    style={{ fontFamily: 'Unbounded' }}
                                >
                                    {rank}
                                </Text>
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

                        {/* ПРАВА ЧАСТИНА: Результати */}
                        <View className="items-end gap-0.5">
                            <Text
                                className="text-[#F5F5F5] text-base font-bold leading-4"
                                style={{ fontFamily: 'Unbounded' }}
                            >
                                {resultValue}
                            </Text>
                            {secondaryValue && (
                                <Text
                                    className="text-[#A3A3A3] text-[10px] font-normal"
                                    style={{ fontFamily: 'Evolventa' }}
                                >
                                    {secondaryValue}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: { minHeight: 64 }
});