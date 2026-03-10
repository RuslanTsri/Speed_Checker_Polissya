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

    const isSingleWordTitle = title ? !title.trim().includes(' ') : false;

    return (
        <Pressable
            onPress={onPress}
            className={`flex-row items-center justify-between py-4 ${!isLast ? 'border-b border-surface-border' : ''}`}
            style={({ pressed }) => [{ opacity: pressed && onPress ? 0.7 : 1 }]}
        >
            {({ pressed }) => (
                <>
                    <View className="flex-row items-center gap-4 flex-1 pr-2">
                        <View className="w-8 h-8 items-center justify-center shrink-0">
                            {pressed && activeIcon ? activeIcon : icon}
                        </View>
                        <Text
                            className={`text-h4 font-evolventa-bold flex-1 ${destructive ? 'text-status-error' : 'text-text-main'}`}
                            numberOfLines={isSingleWordTitle ? 1 : 2}
                            adjustsFontSizeToFit={true}
                            minimumFontScale={isSingleWordTitle ? 0.5 : 0.8}
                        >
                            {title}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-2 shrink-0">
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