import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur';

interface TeamsModProps {
    teamName: string;
    date?: string;
    time?: string;
    tags?: React.ReactNode;
    icon?: React.ReactNode;
    activeIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;       // 🔥 Додали праву іконку
    rightActiveIcon?: React.ReactNode; // 🔥 Додали праву активну іконку
    onPress?: () => void;
    className?: string;
}

export const TeamsMod = ({
                             teamName, date = '', time = '', tags, icon, activeIcon, rightIcon, rightActiveIcon, onPress, className = ''
                         }: TeamsModProps) => {
    const isClickable = !!onPress;

    return (
        <Pressable
            onPress={onPress}
            disabled={!isClickable}
            style={({ pressed }) => [{ transform: [{ scale: pressed && isClickable ? 0.97 : 1 }] }]}
            className={`w-full ${className}`}
        >
            {({ pressed }) => {
                const isPressed = pressed && isClickable;
                const currentIcon = isPressed && activeIcon ? activeIcon : icon;
                const currentRightIcon = isPressed && rightActiveIcon ? rightActiveIcon : rightIcon; // 🔥 Логіка зміни правої іконки

                return (
                    <View style={styles.container} className="rounded-2xl overflow-hidden border border-[#262626] shadow-sm">

                        {/* <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} /> */}

                        <LinearGradient
                            colors={isPressed ? ['rgba(0, 0, 0, 0.7)', 'rgba(64, 64, 64, 0.6)'] : ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)']}
                            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                            style={StyleSheet.absoluteFill}
                        />

                        {isPressed && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />}

                        <View className="p-3">
                            {/* 🔥 Змінили структуру: додали justify-between для рознесення контенту і стрілки */}
                            <View className="flex-row items-center justify-between gap-3">

                                {/* ЛІВА ЧАСТИНА (Іконка + Текст) */}
                                <View className="flex-row items-center gap-3 flex-1">
                                    {currentIcon && (
                                        <View className="p-1 items-center justify-center">
                                            {currentIcon}
                                        </View>
                                    )}

                                    <View className="flex-1 flex-col justify-start items-start gap-1.5">
                                        <Text className="text-[#F5F5F5] text-base font-bold leading-4" style={{ fontFamily: 'Unbounded' }} numberOfLines={1}>
                                            {teamName}
                                        </Text>

                                        {(date || time || tags) && (
                                            <View className="flex-row justify-start items-center gap-2 flex-wrap">
                                                {!!date && <Text className="text-[#DCDCDC] text-sm font-normal leading-5" style={{ fontFamily: 'Evolventa' }}>{date}</Text>}
                                                {!!date && !!time && <View className="w-1 h-1 rounded-full bg-[#DCDCDC]" />}
                                                {!!time && <Text className="text-[#DCDCDC] text-sm font-normal leading-5" style={{ fontFamily: 'Evolventa' }}>{time}</Text>}

                                                {tags && <>{tags}</>}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* 🔥 ПРАВА ЧАСТИНА (Стрілка з поворотом на 90 градусів) */}
                                {currentRightIcon && (
                                    <View style={{ transform: [{ rotate: '90deg' }] }} className="mr-2">
                                        {currentRightIcon}
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
    container: { minHeight: 64 }
});