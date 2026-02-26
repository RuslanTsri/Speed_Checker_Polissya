import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AppBackgroundProps {
    children?: React.ReactNode;
    className?: string;
}

export const AppBackground = ({ children, className = '' }: AppBackgroundProps) => {
    return (
        <View className={`flex-1 ${className}`} style={styles.container}>
            <LinearGradient
                colors={['#000000', '#121212', '#2A2A2A']}
                locations={[0, 0.6, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* 2. СВІТЛОВА ПЛЯМА ЗНИЗУ (Ellipse 4) */}
            <View style={styles.glowContainer}>
                <Svg height="100%" width="100%">
                    <Defs>
                        <RadialGradient
                            id="grad"
                            cx="50%"
                            cy="50%"
                            rx="50%"
                            ry="50%"
                            fx="50%"
                            fy="50%"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
                            <Stop offset="21%" stopColor="#E7E5E4" stopOpacity="0.08" />
                            <Stop offset="100%" stopColor="#E7E5E4" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Ellipse
                        cx={SCREEN_WIDTH / 2}
                        cy={420}
                        rx={420}
                        ry={420}
                        fill="url(#grad)"
                    />
                </Svg>
            </View>

            {/* 3. КОНТЕНТ ЕКРАНУ */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
    },
    glowContainer: {
        position: 'absolute',
        bottom: -400,
        left: 0,
        right: 0,
        height: 841,
        width: '100%',
        pointerEvents: 'none',
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
});