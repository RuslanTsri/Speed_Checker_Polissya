import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface SubTabsProps {
    distances: (number | 'ALL')[]; // 🔥 Тепер приймає і 'ALL'
    selectedDistance: number | 'ALL';
    onSelect: (distance: number | 'ALL') => void;
}

export const SubTabs = ({ distances, selectedDistance, onSelect }: SubTabsProps) => {
    const { t } = useTranslation();

    return (
        <View className="w-full">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {distances.map(dist => {
                    const isActive = selectedDistance === dist;
                    // 🔥 Визначаємо, що писати на кнопці
                    const label = dist === 'ALL' ? t('tools.sessions.all_distances', 'Усі') : `${dist} м`;

                    return (
                        <TouchableOpacity
                            key={dist}
                            onPress={() => onSelect(dist)}
                            activeOpacity={0.7}
                            className={`rounded-2xl overflow-hidden px-5 py-2.5 border ${
                                isActive
                                    ? 'bg-brand-orange border-brand-orange shadow-sm shadow-brand-orange/30'
                                    : 'bg-surface-card border-surface-border'
                            }`}
                        >
                            <Text className={`text-sm font-unbounded-bold ${
                                isActive ? 'text-[#0A0A0A]' : 'text-text-sub'
                            }`}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        gap: 10,
        flexGrow: 1,
        paddingHorizontal: 4,
        paddingBottom: 4 // Для тіні
    }
});