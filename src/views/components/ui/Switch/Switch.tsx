import React, { useRef, useEffect } from 'react';
import { Pressable, View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SWITCH_GRADIENT = ['#CA4402', '#FF6D00', '#FFF958'] as const;

interface SwitchProps {
    active: boolean;
    onChange: (value: boolean) => void;
}

export const Switch = ({ active, onChange }: SwitchProps) => {
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
            style={styles.switchContainer}
            className="justify-center shrink-0"
        >
            {active ? (
                <LinearGradient
                    colors={SWITCH_GRADIENT}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[styles.background, { width: '100%', height: '100%', justifyContent: 'center' }]}
                >
                    <Animated.View
                        style={{ transform: [{ translateX }] }}
                        className="w-4 h-4 bg-text-main rounded-full shadow-sm"
                    />
                </LinearGradient>
            ) : (
                <View style={styles.background} className="w-full h-full bg-brand-gray justify-center">
                    <Animated.View
                        style={{ transform: [{ translateX }] }}
                        className="w-4 h-4 bg-text-main rounded-full shadow-sm"
                    />
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    switchContainer: { width: 36, height: 20 },
    background: { borderRadius: 10 }
});