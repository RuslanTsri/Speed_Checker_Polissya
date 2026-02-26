import React, { useRef, useEffect } from 'react';
import { Pressable, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

    const handlePress = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            className="items-center justify-center"
            // Розмір 20x20px (w-5 h-5 з твого коду)
            style={{ width: 20, height: 20 }}
        >
            {checked ? (
                <LinearGradient
                    colors={['#CA4402', '#FF6D00', '#FCAE0E', '#FFF958']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full h-full items-center justify-center"
                    style={{ borderRadius: 4 }} // Закруглення 4px
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }] }}>
                        {/* Саморобна біла галочка (можеш замінити на свою SVG іконку) */}
                        <View
                            className="w-[10px] h-[5px] border-l-[2px] border-b-[2px] border-[#F5F5F5] -rotate-45"
                            style={{ marginBottom: 2 }} // Центруємо галочку
                        />
                    </Animated.View>
                </LinearGradient>
            ) : (
                <View
                    className="w-full h-full bg-[#F5F5F5] rounded border border-[#C3C3C3] items-center justify-center"
                    style={{ borderRadius: 4 }}
                >
                    {disabled && (
                        <View
                            className="w-[10px] h-[5px] border-l-[2px] border-b-[2px] border-[#C3C3C3] -rotate-45"
                            style={{ marginBottom: 2 }}
                        />
                    )}
                </View>
            )}
        </Pressable>
    );
};