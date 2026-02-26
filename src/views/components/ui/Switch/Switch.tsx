import React, { useRef, useEffect } from 'react';
import { Pressable, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SwitchProps {
    active: boolean;
    onChange: (value: boolean) => void;
}

export const Switch = ({ active, onChange }: SwitchProps) => {
    // Анімація: 18px відступ зліва (увімкнено), 2px (вимкнено)
    const translateX = useRef(new Animated.Value(active ? 18 : 2)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: active ? 18 : 2,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [active]);

    return (
        <Pressable
            onPress={() => onChange(!active)}
            className="justify-center"
            // w-9 (36px) h-5 (20px) — точні розміри з Фігми
            style={{ width: 36, height: 20 }}
        >
            {active ? (
                // УВІМКНЕНИЙ СТАН (Додали borderRadius в style)
                <LinearGradient
                    colors={['#CA4402', '#FF6D00', '#FCAE0E', '#FFF958']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full h-full justify-center"
                    style={{ borderRadius: 9999 }} // <--- ОСЬ ВАЖЛИВИЙ ФІКС
                >
                    <Animated.View
                        style={{ transform: [{ translateX }] }}
                        className="w-4 h-4 bg-[#F5F5F5] rounded-full shadow-sm"
                    />
                </LinearGradient>
            ) : (
                // ВИМКНЕНИЙ СТАН
                <View className="w-full h-full rounded-full bg-[#C3C3C3] justify-center">
                    <Animated.View
                        style={{ transform: [{ translateX }] }}
                        className="w-4 h-4 bg-[#F5F5F5] rounded-full shadow-sm"
                    />
                </View>
            )}
        </Pressable>
    );
};