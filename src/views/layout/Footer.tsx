import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type TabType = 'HOME' | 'PLAYERS' | 'SESSIONS' | 'SETTINGS';

interface FooterProps {
    activeTab: TabType;
    onSwitch: (tab: TabType) => void;
}

export const Footer = ({ activeTab, onSwitch }: FooterProps) => {
    const tabs: { id: TabType; label: string; iconName: keyof typeof Ionicons.glyphMap }[] = [
        { id: 'HOME', label: 'Головна', iconName: 'home' },
        { id: 'PLAYERS', label: 'Команди', iconName: 'people' },
        { id: 'SESSIONS', label: 'Сесії', iconName: 'stats-chart' },
        { id: 'SETTINGS', label: 'Налашт.', iconName: 'settings' },
    ];

    return (
        <View className="bg-slate-900 border-t border-slate-800 flex-row justify-around py-4 pb-2">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                const iconColor = isActive ? '#facc15' : '#64748b';

                return (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => onSwitch(tab.id)}
                        className="items-center min-w-[60px]"
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isActive ? tab.iconName : `${tab.iconName}-outline` as any} // (Опціонально) Заповнена іконка для активного, контурна для пасивного
                            size={24}
                            color={iconColor}
                            style={{ marginBottom: 4 }}
                        />

                        <Text className={`text-[10px] font-bold uppercase ${isActive ? 'text-yellow-400' : 'text-slate-500'}`}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};