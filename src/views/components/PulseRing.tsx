import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const PulseRing = ({ delay }: { delay: number }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.parallel([
                Animated.timing(scaleAnim, { toValue: 2.5, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true, delay }),
                Animated.timing(opacityAnim, { toValue: 0, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true, delay })
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [delay]);

    return (
        <Animated.View
            style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}
            className="absolute w-full h-full rounded-full border-2 border-brand-yellow bg-brand-yellow/20"
        />
    );
};