import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export interface TabItem { id: string; label: string; }

interface HeaderTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;
    optimizeForList?: boolean;
}

export const HeaderTabs = ({ tabs, activeTab, onTabChange, className = '', optimizeForList = false }: HeaderTabsProps) => {
    const isAndroidTurbo = Platform.OS === 'android' && optimizeForList;

    return (
        <View className={`w-full ${className}`}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => onTabChange(tab.id)}
                            activeOpacity={0.7}
                            className={`rounded-full overflow-hidden border ${
                                isActive ? 'border-brand-orange/70' : 'border-surface-border'
                            }`}
                        >
                            {!isAndroidTurbo ? (
                                <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
                            ) : (
                                <View style={StyleSheet.absoluteFill} className="bg-surface-card" />
                            )}

                            <View className={`px-5 py-2 ${isActive ? 'bg-brand-orange/40' : 'bg-surface-card/40'}`}>
                                <Text className={`text-body font-evolventa-bold ${
                                    isActive ? 'text-text-main' : 'text-text-sub'
                                }`}>
                                    {tab.label}
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
    scrollContent: { gap: 8, flexGrow: 1, justifyContent: 'center' }
});