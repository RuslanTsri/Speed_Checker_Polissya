import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StartIcon, StartIconActive } from '../../../../../assets/icons/';

const START_GRADIENT = ['#CA4402', '#FF6D00', '#FFF958'] as const;

interface PrimaryProps {
    onPress?: () => void;
    variant?: 'gradient' | 'dark';
    isActive?: boolean;
    className?: string;
}

export const Primary = ({ onPress, variant = 'gradient', isActive = false, className = '' }: PrimaryProps) => {
    const isGradient = variant === 'gradient';
    const borderRadius = 32;
    const IconComponent = isActive ? StartIconActive : StartIcon;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.94 : 1 }], borderRadius }]}
        >
            {({ pressed }) => (
                <View
                    style={styles.container}
                    className={`${className} overflow-hidden items-center justify-center`}
                >
                    {isGradient ? (
                        <LinearGradient
                            colors={START_GRADIENT}
                            locations={[0, 0.4, 1]}
                            style={StyleSheet.absoluteFill}
                        />
                    ) : (
                        <View
                            style={StyleSheet.absoluteFill}
                            className="bg-white/5 border border-white/10"
                        />
                    )}

                    {pressed && <View style={styles.pressedOverlay} />}

                    <IconComponent
                        width={32}
                        height={32}
                        fill="#FFFFFF"
                        style={{ zIndex: 2 }}
                    />
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: { width: 64, height: 64, borderRadius: 32 },
    pressedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.15)', zIndex: 1 }
});