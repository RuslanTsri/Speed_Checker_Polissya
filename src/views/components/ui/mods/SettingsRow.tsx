import React from 'react';
import { View, Text, Pressable } from 'react-native';
// 🔥 Не забудь імпортувати іконки тут або передавати їх як пропси
import { ArrowIcon, ArrowIconActive } from '../../../../../assets/icons';

interface SettingsRowProps {
    title: string;
    value?: string;
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    isLast?: boolean;
    destructive?: boolean;
}

export const SettingsRow = ({
                                title, value, icon, activeIcon, onPress, rightElement, isLast, destructive
                            }: SettingsRowProps) => {
    return (
        <Pressable
            onPress={onPress}
            className={`flex-row items-center justify-between py-4 ${!isLast ? 'border-b border-white/5' : ''}`}
            style={({ pressed }) => [{ opacity: pressed && onPress ? 0.8 : 1 }]}
        >
            {({ pressed }) => {
                const currentIcon = pressed && activeIcon ? activeIcon : icon;
                return (
                    <>
                        <View className="flex-row items-center gap-4 flex-1">
                            <View className="w-8 h-8 items-center justify-center">
                                {currentIcon}
                            </View>
                            <Text
                                className={`text-base font-bold ${destructive ? 'text-red-500' : 'text-[#F5F5F5]'}`}
                                style={{ fontFamily: 'Evolventa' }}
                            >
                                {title}
                            </Text>
                        </View>

                        <View className="flex-row items-center gap-2">
                            {value ? (
                                <Text className="text-[#A3A3A3] text-sm mr-1" style={{ fontFamily: 'Evolventa' }}>
                                    {value}
                                </Text>
                            ) : null}

                            {/* 🔥 ПРАВА ЧАСТИНА: Світч або наша стрілка */}
                            {rightElement ? rightElement : (
                                onPress ? (
                                    <View style={{ transform: [{ rotate: '90deg' }] }}>
                                        {pressed ? (
                                            <ArrowIconActive width={18} height={18} fill="#F5F5F5" />
                                        ) : (
                                            <ArrowIcon width={18} height={18} fill="#64748b" />
                                        )}
                                    </View>
                                ) : null
                            )}
                        </View>
                    </>
                );
            }}
        </Pressable>
    );
};