import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Pressable, Modal, Image } from 'react-native';
import { Feather } from "@expo/vector-icons";
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
    onGoHome: () => void;
    onLogout?: () => void;
    onChangePin?: () => void;
}

export const Header = ({ onGoHome, onLogout, onChangePin }: HeaderProps) => {
    const { t } = useTranslation();
    const { profile } = useUser();
    const { isDark } = useTheme();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(!!state.isConnected && !!state.isInternetReachable);
        });
        return () => unsubscribe();
    }, []);

    const closeMenu = () => setIsMenuOpen(false);

    const userInitials = useMemo(() => {
        if (!profile?.full_name) return "TM";
        const names = profile.full_name.trim().split(' ');
        if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
        const first = names[0]?.[0] || "";
        const last = names[names.length - 1]?.[0] || "";
        return (first + last).toUpperCase();
    }, [profile?.full_name]);

    return (
        <View className={`z-50 py-4 px-6 border-b flex-row justify-between items-center ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>

            <TouchableOpacity onPress={onGoHome} activeOpacity={0.6} className="justify-center">
                <Text className={`text-lg font-black tracking-[0.2em] uppercase italic ${
                    isDark ? 'text-yellow-400' : 'text-yellow-500'
                }`}>
                    Tempo Metrics
                </Text>
                <Text className={`text-[9px] font-black tracking-[0.3em] uppercase mt-0.5 ml-0.5 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>
                    {t('layouts.header.preview_version') as string}
                </Text>
            </TouchableOpacity>

            {/* Контейнер для статусу та аватарки */}
            <View className="flex-row items-center relative">

                {/* СТАТУС ІНТЕРНЕТУ */}
                <View className="items-end justify-center mr-3">
                    <View className={`flex-row items-center px-2 py-1 rounded-full border ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                    }`}>
                        <View className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {isOnline ? (t('layouts.header.status_online') as string) : (t('layouts.header.status_offline') as string)}
                        </Text>
                    </View>

                    {!isOnline && (
                        <Text className="text-orange-400 text-[7px] font-bold uppercase tracking-wider mt-1 text-right w-24">
                            {t('layouts.header.status_beta_warning') as string}
                        </Text>
                    )}
                </View>

                {/* Аватарка / Меню */}
                <View className="relative">
                    <TouchableOpacity
                        onPress={() => setIsMenuOpen(true)}
                        activeOpacity={0.8}
                        className={`w-10 h-10 rounded-full items-center justify-center border overflow-hidden transition-colors ${
                            isMenuOpen
                                ? (isDark ? 'border-yellow-400 bg-slate-800' : 'border-yellow-500 bg-slate-100')
                                : (isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100')
                        }`}
                    >
                        {profile?.avatar_url && profile.avatar_url.includes('http') ? (
                            <Image source={{ uri: profile.avatar_url }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <Text className={`font-bold text-xs ${
                                isDark ? 'text-yellow-400' : 'text-yellow-600'
                            }`}>
                                {userInitials}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <Modal
                        transparent
                        visible={isMenuOpen}
                        animationType="fade"
                        onRequestClose={closeMenu}
                    >
                        <Pressable className="flex-1" onPress={closeMenu}>
                            <Pressable
                                className={`absolute top-[60px] right-4 border rounded-xl shadow-2xl w-48 overflow-hidden py-1 ${
                                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                                }`}
                                onPress={(e) => e.stopPropagation()}
                            >
                                <View className={`px-4 py-2 border-b mb-1 ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                                    <Text className={`font-bold text-sm truncate ${isDark ? 'text-slate-300' : 'text-slate-900'}`} numberOfLines={1}>
                                        {profile?.full_name || (t('layouts.header.default_user') as string)}
                                    </Text>
                                    <Text className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {profile?.role || "COACH"}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => { closeMenu(); onChangePin?.(); }}
                                    className={`flex-row items-center px-4 py-3 ${isDark ? 'active:bg-slate-700' : 'active:bg-slate-50'}`}
                                >
                                    <Feather name="lock" size={16} color={isDark ? "#94a3b8" : "#64748b"} />
                                    <Text className={`ml-3 font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {t('layouts.header.menu_change_pin') as string}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => { closeMenu(); if (onLogout) onLogout(); }}
                                    className={`flex-row items-center px-4 py-3 border-t mt-1 ${
                                        isDark ? 'active:bg-red-900/20 border-slate-700/50' : 'active:bg-red-50 border-slate-100'
                                    }`}
                                >
                                    <Feather name="log-out" size={16} color="#ef4444" />
                                    <Text className="text-red-500 ml-3 font-medium text-sm">
                                        {t('layouts.header.menu_logout') as string}
                                    </Text>
                                </TouchableOpacity>
                            </Pressable>
                        </Pressable>
                    </Modal>
                </View>
            </View>
        </View>
    );
};