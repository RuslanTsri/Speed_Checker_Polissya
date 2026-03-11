import React from 'react';
import { Pressable, View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const GRADIENT_NORMAL = ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)'] as const;
const GRADIENT_PRESSED = ['rgba(0, 0, 0, 0.7)', 'rgba(64, 64, 64, 0.6)'] as const;

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
    optimizeForList?: boolean;
}

export const Mod = ({
                        title, subtitle, icon, activeIcon, rightHeader, onPress,
                        className = '', children, variant = 'default', optimizeForList = false
                    }: ModProps) => {
    const isClickable = !!onPress;
    const isDefault = variant === 'default';
    const hasHeader = title && title.length > 0;
    const isAndroid = Platform.OS === 'android' && optimizeForList;

    const isSingleWordTitle = title ? !title.trim().includes(' ') : false;

    return (
        <Pressable
            onPress={onPress}
            disabled={!isClickable}
            style={({ pressed }) => [{ transform: [{ scale: pressed && isClickable ? 0.98 : 1 }] }]}
            className={`w-full ${className}`}
        >
            {({ pressed }) => (
                <View
                    style={[!hasHeader && { minHeight: 0 }]}
                    className={`rounded-3xl overflow-hidden ${
                        isDefault
                            ? `shadow-sm border ${isAndroid ? 'border-surface-border' : 'border-white/10'}`
                            : 'border border-white/5 bg-white/5'
                    }`}
                >
                    {isDefault && (
                        isAndroid ? (
                            <View style={StyleSheet.absoluteFill} className={pressed ? 'bg-surface-cardPressed' : 'bg-surface-card'} />
                        ) : (
                            <>
                                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                                <LinearGradient
                                    colors={pressed ? GRADIENT_PRESSED : GRADIENT_NORMAL}
                                    start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                                    style={StyleSheet.absoluteFill}
                                />
                            </>
                        )
                    )}

                    <View className={hasHeader ? "p-5" : "px-5 py-2"}>
                        {hasHeader && (
                            <View className="flex-row items-center justify-between w-full gap-2">
                                <View className="flex-row items-center gap-4 flex-1">
                                    {pressed && activeIcon ? activeIcon : icon}
                                    <View className="flex-1">
                                        <Text
                                            className="text-text-main text-h3 font-unbounded-bold"
                                            numberOfLines={isSingleWordTitle ? 1 : 2}
                                            adjustsFontSizeToFit={true}
                                            minimumFontScale={isSingleWordTitle ? 0.5 : 0.8}
                                        >
                                            {title}
                                        </Text>
                                        {subtitle && <Text className="text-text-sub text-body font-evolventa">{subtitle}</Text>}
                                    </View>
                                </View>
                                {rightHeader && <View className="ml-3 shrink-0">{rightHeader}</View>}
                            </View>
                        )}
                        {children && <View className={hasHeader ? "mt-2 w-full" : "w-full"}>{children}</View>}
                    </View>
                </View>
            )}
        </Pressable>
    );
};