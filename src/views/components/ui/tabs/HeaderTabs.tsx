import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

export interface TabItem {
    id: string;
    label: string;
}

interface HeaderTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;

}

export const HeaderTabs = ({ tabs, activeTab, onTabChange, className = '' }: HeaderTabsProps) => {
    return (
        <View className={`w-full ${className}`}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    gap: 8,
                    flexGrow: 1,
                    justifyContent: 'center'
                }}
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => onTabChange(tab.id)}
                            activeOpacity={0.7}
                            className={`rounded-full overflow-hidden border ${
                                isActive
                                    ? 'border-[#FF6D00]/70' // Напівпрозора помаранчева рамка
                                    : 'border-white/10' // Ледь помітна біла рамка
                            }`}
                        >
                            <BlurView
                                intensity={50}
                                tint="dark"
                                experimentalBlurMethod="dimezisBlurView"
                                style={StyleSheet.absoluteFill}
                            />
                            <View className={`px-5 py-2 ${
                                isActive ? 'bg-[#FF6D00]/40' : 'bg-white/10'
                            }`}>
                                <Text
                                    className={`text-sm font-bold ${isActive ? 'text-white' : 'text-[#A3A3A3]'}`}
                                    style={{ fontFamily: 'Evolventa' }}
                                >
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