import React, { useRef, useEffect } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface RadioButtonProps {
    selected: boolean;
    onSelect?: () => void;
}

export const RadioButton = ({ selected, onSelect }: RadioButtonProps) => {
    const fadeAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: selected ? 1 : 0,
            duration: 150,
            useNativeDriver: true,
        }).start();
    }, [selected]);

    return (
        <Pressable
            onPress={onSelect}
            className="items-center justify-center"
            style={{ width: 24, height: 24, borderRadius: 12, overflow: 'hidden' }} // 🔥 Явно робимо круглим
        >
            {selected ? (
                <LinearGradient
                    colors={['#CA4402', '#FF6D00', '#FCAE0E', '#FFF958']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full h-full items-center justify-center"
                    style={{ borderRadius: 12 }} // 🔥 Залізобетонне закруглення для градієнта
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }] }}>
                        {/* Внутрішня біла крапка */}
                        <View className="w-2.5 h-2.5 bg-[#F5F5F5] rounded-full" />
                    </Animated.View>
                </LinearGradient>
            ) : (
                // Стан без вибору
                <View
                    className="w-full h-full bg-white/5 border border-white/20 items-center justify-center"
                    style={{ borderRadius: 12 }}
                />
            )}
        </Pressable>
    );
};