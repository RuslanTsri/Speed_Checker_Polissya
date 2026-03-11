import React from 'react';
import { Pressable, View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PhotoIcon, PenIcon, PenIconActive, CrossIconActive } from '../../../../../assets/icons';

const GRAD_COLORS = ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)'] as const;

interface PlayerModProps {
    name: string;
    subtitle?: string | React.ReactNode;
    rightIcon?: React.ReactNode;
    onPress?: () => void;
    onEditPress?: () => void;
    onDeletePress?: () => void;
    className?: string;
    optimizeForList?: boolean;
}

export const PlayerMod = ({ name, subtitle, rightIcon, onPress, onEditPress, onDeletePress, className = '', optimizeForList = false }: PlayerModProps) => {
    const isAndroid = Platform.OS === 'android' && optimizeForList;

    const isSingleWordName = name ? !name.trim().includes(' ') : false;

    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [styles.wrapper, { transform: [{ scale: pressed && onPress ? 0.98 : 1 }] }]}
            className={className}
        >
            {({ pressed }) => (
                <View style={styles.container} className="rounded-2xl overflow-hidden border border-surface-border">
                    {!isAndroid ? (
                        <>
                            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                            <LinearGradient colors={GRAD_COLORS} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
                        </>
                    ) : (
                        <View style={StyleSheet.absoluteFill} className="bg-surface-card" />
                    )}

                    <View className="p-3 flex-row items-center justify-between z-10 gap-2">
                        <View className="flex-1 flex-row items-center gap-3">
                            <PhotoIcon width={36} height={36} />
                            <View className="flex-1">
                                <Text
                                    className="text-text-main text-h4 font-unbounded-bold"
                                    numberOfLines={isSingleWordName ? 1 : 2}
                                    adjustsFontSizeToFit={true}
                                    minimumFontScale={isSingleWordName ? 0.5 : 0.8}
                                >
                                    {name}
                                </Text>
                                {typeof subtitle === 'string' ? (
                                    <Text className="text-text-sub text-body font-evolventa">{subtitle}</Text>
                                ) : (subtitle)}
                            </View>
                        </View>

                        <View className="flex-row items-center gap-1 shrink-0">
                            {rightIcon || (
                                <>
                                    {onEditPress && (
                                        <Pressable onPress={onEditPress} className="p-2">
                                            {({ pressed: p }) => (p ? <PenIconActive width={22} height={22} /> : <PenIcon width={22} height={22} />)}
                                        </Pressable>
                                    )}
                                    {onDeletePress && (
                                        <Pressable onPress={onDeletePress} className="p-2">
                                            <CrossIconActive width={22} height={22} />
                                        </Pressable>
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                    {pressed && onPress && <View style={styles.pressedOverlay} />}
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    wrapper: { width: '100%' },
    container: { minHeight: 64 },
    pressedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 20 }
});