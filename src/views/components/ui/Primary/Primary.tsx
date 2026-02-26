import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Імпортуємо обидві іконки
import { StartIcon, StartIconActive } from '../../../../../assets/icons/';

interface PrimaryProps {
    onPress?: () => void;
    variant?: 'gradient' | 'dark';
    isActive?: boolean;
    className?: string;
}

export const Primary = ({
                            onPress,
                            variant = 'gradient',
                            isActive = false,
                            className = ''
                        }: PrimaryProps) => {
    const isGradient = variant === 'gradient';
    const borderRadius = 32;

    const IconComponent = isActive ? StartIconActive : StartIcon;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.94 : 1 }], borderRadius },
            ]}
        >
            {({ pressed }) => (
                <View
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius,
                        overflow: 'hidden',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    className={className}
                >
                    {isGradient ? (
                        <LinearGradient
                            colors={['#C2410C', '#FF9100', '#FDE047']}
                            locations={[0, 0.3, 1]}
                            style={StyleSheet.absoluteFill}
                        />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }]} />
                    )}

                    {pressed && (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.15)', zIndex: 1 }]} />
                    )}

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