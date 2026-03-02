import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from "expo-blur";
import { SearchIcon, SearchIconActive } from '../../../../../assets/icons';

const SEARCH_GRAD_NORMAL = ['rgba(0, 0, 0, 0.4)', 'rgba(64, 64, 64, 0.4)'] as const;
const SEARCH_GRAD_FOCUS = ['rgba(0, 0, 0, 0.7)', 'rgba(64, 64, 64, 0.6)'] as const;

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    className?: string;
    optimizeForList?: boolean;
}

export const SearchInput = ({ value, onChangeText, placeholder, className = '', optimizeForList = false }: SearchInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const isAndroidTurbo = Platform.OS === 'android' && optimizeForList;

    return (
        <View
            className={`flex-row items-center px-4 h-[52px] rounded-full overflow-hidden border ${
                isFocused ? 'border-brand-orange/50' : 'border-surface-border'
            } ${className}`}
        >
            {!isAndroidTurbo && (
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            )}

            <LinearGradient
                colors={isFocused ? SEARCH_GRAD_FOCUS : SEARCH_GRAD_NORMAL}
                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
            />

            <View className="mr-3 z-10">
                {isFocused || value.length > 0 ? (
                    <SearchIconActive width={24} height={24} fill="#F5F5F5" />
                ) : (
                    <SearchIcon width={24} height={24} fill="#A3A3A3" />
                )}
            </View>

            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#A3A3A3"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-1 text-text-main text-body h-full font-evolventa z-10"
                selectionColor="#FF6D00"
            />
        </View>
    );
};