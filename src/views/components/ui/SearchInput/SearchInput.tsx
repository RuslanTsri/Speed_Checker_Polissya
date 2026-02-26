import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur'; // ⏳ ДЛЯ EAS БІЛДУ

import { SearchIcon, SearchIconActive } from '../../../../../assets/icons';

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchInput = ({ value, onChangeText, placeholder, className = '' }: SearchInputProps) => {
    // Стан для відслідковування фокусу (активне поле чи ні)
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View
            className={`flex-row items-center px-4 h-[52px] rounded-full overflow-hidden border ${
                isFocused ? 'border-[#FF6D00]/50' : 'border-[#262626]'
            } ${className}`}
        >
            {/* ⏳ ТИМЧАСОВО ЗАКОМЕНТОВАНО ДО БІЛДУ */}
            {/* <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} /> */}

            {/* Градієнт: при фокусі стає трішки темнішим */}
            <LinearGradient
                colors={isFocused
                    ? ['rgba(0, 0, 0, 0.7)', 'rgba(64, 64, 64, 0.6)']
                    : ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Іконка (Змінюється залежно від фокусу) */}
            <View className="mr-3">
                {isFocused || value.length > 0 ? (
                    <SearchIconActive width={24} height={24} fill="#F5F5F5" />
                ) : (
                    <SearchIcon width={24} height={24} fill="#A3A3A3" />
                )}
            </View>

            {/* Поле вводу */}
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#A3A3A3"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-1 text-[#F5F5F5] text-base h-full"
                style={{ fontFamily: 'Evolventa' }}
                selectionColor="#FF6D00" // Помаранчевий курсор
            />
        </View>
    );
};