import React, { ReactNode } from 'react';
import { Pressable, View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const GRAD_COLORS = ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)'] as const;

interface RatingModProps {
    rank: number | string;
    name: string;
    subtitle?: string | ReactNode;
    resultValue: string;
    secondaryValue?: string | ReactNode;
    onPress?: () => void;
    className?: string;
    optimizeForList?: boolean;
}

export const RatingMod = ({
                              rank,
                              name,
                              subtitle,
                              resultValue,
                              secondaryValue,
                              onPress,
                              className = '',
                              optimizeForList = false
                          }: RatingModProps) => {
    const isAndroid = Platform.OS === 'android' && optimizeForList;
    const isSingleWordName = name ? !name.trim().includes(' ') : false;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [{ transform: [{ scale: pressed && onPress ? 0.98 : 1 }] }]}
            className={`w-full ${className}`}
        >
            {({ pressed }) => (
                <View style={styles.container} className="rounded-2xl overflow-hidden border border-surface-border">
                    {isAndroid ? (
                        <View style={StyleSheet.absoluteFill} className={pressed ? 'bg-surface-cardPressed' : 'bg-surface-card'} />
                    ) : (
                        <>
                            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                            <LinearGradient colors={GRAD_COLORS} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
                        </>
                    )}

                    <View className="p-3 flex-row items-center justify-between gap-2">
                        <View className="flex-1 flex-row items-center gap-3">
                            <View className="w-8 items-center justify-center shrink-0">
                                <Text className="text-text-main text-h4 font-unbounded-bold">{rank}</Text>
                            </View>
                            <View className="flex-1">
                                <Text
                                    className="text-text-main text-h4 font-unbounded-bold"
                                    numberOfLines={isSingleWordName ? 1 : 2}
                                    adjustsFontSizeToFit={true}
                                    minimumFontScale={isSingleWordName ? 0.5 : 0.8}
                                >
                                    {name}
                                </Text>
                                {subtitle && <Text className="text-text-sub text-body font-evolventa">{subtitle}</Text>}
                            </View>
                        </View>

                        <View className="items-end shrink-0">
                            <Text className="text-text-main text-h4 font-unbounded-bold">{resultValue}</Text>
                            {secondaryValue && <Text className="text-text-sub text-caption font-evolventa">{secondaryValue}</Text>}
                        </View>
                    </View>
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: 64,
    },
});