import React, { useRef, useEffect } from 'react';
import { Pressable, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CHECKED_GRADIENT = ['#CA4402', '#FF6D00', '#FCAE0E', '#FFF958'] as const;

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export const Checkbox = ({ checked, onChange, disabled = false }: CheckboxProps) => {
    const fadeAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: checked ? 1 : 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
    }, [checked]);

    return (
        <Pressable
            onPress={() => !disabled && onChange(!checked)}
            className="items-center justify-center w-5 h-5 shrink-0"
        >
            {checked ? (
                <LinearGradient
                    colors={CHECKED_GRADIENT}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }] }}>
                        <View className="w-[10px] h-[5px] border-l-2 border-b-2 border-brand-light -rotate-45 -mt-0.5" />
                    </Animated.View>
                </LinearGradient>
            ) : (
                <View className="w-full h-full bg-brand-light rounded-[4px] border border-brand-gray items-center justify-center">
                    {disabled && <View className="w-[10px] h-[5px] border-l-2 border-b-2 border-brand-gray -rotate-45 -mt-0.5" />}
                </View>
            )}
        </Pressable>
    );
};