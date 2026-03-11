import React, { useRef, useEffect } from 'react';
import { View, Pressable, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const RADIO_GRADIENT = ['#CA4402', '#FF6D00', '#FCAE0E', '#FFF958'] as const;

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
            className="items-center justify-center shrink-0"
            style={styles.radioWrapper}
        >
            {selected ? (
                <LinearGradient
                    colors={RADIO_GRADIENT}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[styles.radioCircle, { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }]}
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }] }}>
                        <View className="w-2.5 h-2.5 bg-text-main rounded-full" />
                    </Animated.View>
                </LinearGradient>
            ) : (
                <View
                    style={styles.radioCircle}
                    className="w-full h-full bg-white/5 border border-surface-border items-center justify-center"
                />
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    radioWrapper: { width: 24, height: 24 },
    radioCircle: { borderRadius: 12 }
});