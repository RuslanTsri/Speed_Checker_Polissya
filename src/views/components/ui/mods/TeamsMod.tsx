import React from 'react';
import { Pressable, View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const GRADIENT_NORMAL = ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)'] as const;
const GRADIENT_PRESSED = ['rgba(0, 0, 0, 0.7)', 'rgba(64, 64, 64, 0.6)'] as const;

interface TeamsModProps {
    teamName: string;
    date?: string;
    time?: string;
    tags?: React.ReactNode;
    icon?: React.ReactNode;
    activeIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    rightActiveIcon?: React.ReactNode;
    onPress?: () => void;
    className?: string;
    optimizeForList?: boolean;
}

export const TeamsMod = ({
                             teamName, date = '', time = '', tags, icon, activeIcon,
                             rightIcon, rightActiveIcon, onPress, className = '',
                             optimizeForList = false
                         }: TeamsModProps) => {

    const isClickable = !!onPress;
    const isAndroidTurbo = Platform.OS === 'android' && optimizeForList;

    const isSingleWordTeam = teamName ? !teamName.trim().includes(' ') : false;

    return (
        <Pressable
            onPress={onPress}
            disabled={!isClickable}
            style={({ pressed }) => [{ transform: [{ scale: pressed && isClickable ? 0.97 : 1 }] }]}
            className={`w-full ${className}`}
        >
            {({ pressed }) => {
                const isPressed = pressed && isClickable;

                return (
                    <View style={styles.container} className="rounded-2xl overflow-hidden border border-surface-border shadow-sm">
                        {isAndroidTurbo ? (
                            <View
                                style={StyleSheet.absoluteFill}
                                className={isPressed ? 'bg-surface-cardPressed' : 'bg-surface-card'}
                            />
                        ) : (
                            <>
                                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                                <LinearGradient
                                    colors={isPressed ? GRADIENT_PRESSED : GRADIENT_NORMAL}
                                    start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                                    style={StyleSheet.absoluteFill}
                                />
                            </>
                        )}

                        <View className="p-3">
                            <View className="flex-row items-center justify-between gap-3">
                                <View className="flex-row items-center gap-3 flex-1">
                                    {icon && (
                                        <View className="p-1 items-center justify-center">
                                            {isPressed && activeIcon ? activeIcon : icon}
                                        </View>
                                    )}

                                    <View className="flex-1 flex-col justify-start items-start gap-1">
                                        <Text
                                            className="text-text-main text-h4 font-unbounded-bold"
                                            numberOfLines={isSingleWordTeam ? 1 : 2}
                                            adjustsFontSizeToFit={true}
                                            minimumFontScale={isSingleWordTeam ? 0.5 : 0.8}
                                        >
                                            {teamName}
                                        </Text>

                                        {(date || time || tags) && (
                                            <View className="flex-row justify-start items-center gap-2 flex-wrap">
                                                {!!date && <Text className="text-text-sub text-body font-evolventa">{date}</Text>}
                                                {!!date && !!time && <View className="w-1 h-1 rounded-full bg-text-sub" />}
                                                {!!time && <Text className="text-text-sub text-body font-evolventa">{time}</Text>}
                                                {tags && <>{tags}</>}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {(rightIcon || rightActiveIcon) && (
                                    <View style={styles.rotate90} className="mr-2 shrink-0">
                                        {isPressed && rightActiveIcon ? rightActiveIcon : rightIcon}
                                    </View>
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
    container: { minHeight: 64 },
    rotate90: { transform: [{ rotate: '90deg' }] }
});