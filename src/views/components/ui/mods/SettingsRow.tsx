import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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
            // Використовуємо твій surface-border для ліній
            className={`flex-row items-center justify-between py-4 ${!isLast ? 'border-b border-surface-border' : ''}`}
            style={({ pressed }) => [{ opacity: pressed && onPress ? 0.7 : 1 }]}
        >
            {({ pressed }) => (
                <>
                    {/* Ліва частина: Іконка + Заголовок */}
                    <View className="flex-row items-center gap-4 flex-1">
                        <View className="w-8 h-8 items-center justify-center">
                            {pressed && activeIcon ? activeIcon : icon}
                        </View>
                        <Text className={`text-h4 font-bold font-evolventa ${destructive ? 'text-status-error' : 'text-text-main'}`}>
                            {title}
                        </Text>
                    </View>

                    {/* Права частина: Значення + Стрілка/Елемент */}
                    <View className="flex-row items-center gap-2">
                        {value && (
                            <Text className="text-text-sub text-body font-evolventa mr-1">
                                {value}
                            </Text>
                        )}

                        {rightElement || (onPress && (
                            <View style={styles.rotate90}>
                                {pressed ? (
                                    <ArrowIconActive width={18} height={18} fill="#F5F5F5" />
                                ) : (
                                    <ArrowIcon width={18} height={18} fill="#A3A3A3" />
                                )}
                            </View>
                        ))}
                    </View>
                </>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    rotate90: {
        transform: [{ rotate: '90deg' }]
    }
});