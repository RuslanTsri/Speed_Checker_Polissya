import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface SubTabsProps {
    distances: (number | 'ALL')[];
    selectedDistance: number | 'ALL';
    onSelect: (distance: number | 'ALL') => void;
    optimizeForList?: boolean;

}

export const SubTabs = ({ distances, selectedDistance, onSelect, optimizeForList = false }: SubTabsProps) => {
    const isAndroidTurbo = Platform.OS === 'android' && optimizeForList;

    return (
        <View className="w-full mb-4">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {distances.map(dist => {
                    const isActive = selectedDistance === dist;
                    return (
                        <TouchableOpacity
                            key={dist}
                            onPress={() => onSelect(dist)}
                            activeOpacity={0.7}
                            className={`rounded-full overflow-hidden border ${
                                isActive ? 'border-brand-orange/60' : 'border-surface-border'
                            }`}
                        >
                            {isAndroidTurbo ? (
                                <View style={StyleSheet.absoluteFill} className="bg-surface-card" />
                            ) : (
                                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                            )}

                            <View className={`px-5 py-1.5 ${isActive ? 'bg-brand-orange/20' : 'bg-surface-card/20'}`}>
                                <Text className={`text-small font-evolventa-bold ${
                                    isActive ? 'text-brand-orange' : 'text-text-sub'
                                }`}>
                                    {dist} м
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        gap: 8,
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 4
    }
});