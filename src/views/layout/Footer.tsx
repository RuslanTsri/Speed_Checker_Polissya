import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext'; // 🔥 Імпортуємо наш контекст

export type TabType = 'HOME' | 'PLAYERS' | 'SESSIONS' | 'SETTINGS';

interface FooterProps {
    activeTab: TabType;
    onSwitch: (tab: TabType) => void;
}

export const Footer = ({ activeTab, onSwitch }: FooterProps) => {
    // 🔥 Беремо стан теми
    const { isDark } = useTheme();

    const tabs: { id: TabType; label: string; iconName: keyof typeof Ionicons.glyphMap }[] = [
        { id: 'HOME', label: 'Головна', iconName: 'home' },
        { id: 'PLAYERS', label: 'Команди', iconName: 'people' },
        { id: 'SESSIONS', label: 'Результати', iconName: 'stats-chart' },
        { id: 'SETTINGS', label: 'Налашт.', iconName: 'settings' },
    ];

    return (
        <View className={`flex-row justify-around py-4 pb-2 border-t ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                // Колір іконки залежить від теми та активності
                const iconColor = isActive
                    ? (isDark ? '#facc15' : '#eab308') // Жовтий (світліший для dark)
                    : (isDark ? '#64748b' : '#94a3b8'); // Сірий

                return (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => onSwitch(tab.id)}
                        className="items-center min-w-[60px]"
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isActive ? tab.iconName : `${tab.iconName}-outline` as any}
                            size={24}
                            color={iconColor}
                            style={{ marginBottom: 4 }}
                        />

                        <Text className={`text-[10px] font-bold uppercase ${
                            isActive
                                ? (isDark ? 'text-yellow-400' : 'text-yellow-600')
                                : (isDark ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};