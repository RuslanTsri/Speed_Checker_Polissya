import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AppBackgroundProps {
    children?: React.ReactNode;
    className?: string;
}

export const AppBackground = ({ children, className = '' }: AppBackgroundProps) => {
    return (
        <View className={`flex-1 bg-black ${className}`}>
            <LinearGradient
                colors={['#000000', '#0A0A0A', '#1C1C1E']}
                locations={[0, 0.6, 1]}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.glowContainer}>
                <Svg height="100%" width="100%">
                    <Defs>
                        <RadialGradient
                            id="grad"
                            cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
                            <Stop offset="21%" stopColor="#A3A3A3" stopOpacity="0.06" />
                            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Ellipse cx={SCREEN_WIDTH / 2} cy={420} rx={420} ry={420} fill="url(#grad)" />
                </Svg>
            </View>

            <View className="flex-1 z-10">
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    glowContainer: {
        position: 'absolute',
        bottom: -400,
        left: 0, right: 0,
        height: 841, width: '100%',
        pointerEvents: 'none',
    },
});