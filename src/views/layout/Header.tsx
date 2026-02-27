import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Pressable, Modal, Image } from 'react-native';
import { Feather } from "@expo/vector-icons";
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';

// 🔥 Імпортуємо наш TextField
import { TextField } from '../components/ui/TextField';

interface HeaderProps {
    onGoHome: () => void;
    onLogout?: () => void;
    onChangePin?: () => void;
}

export const Header = ({ onGoHome, onLogout, onChangePin }: HeaderProps) => {
    const { t } = useTranslation();
    const { profile } = useUser();

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
        <View className="z-50 py-4 px-6 flex-row justify-between items-center bg-transparent">

            {/* ЛОГОТИП */}
            <TouchableOpacity onPress={onGoHome} activeOpacity={0.6} className="justify-center">
                <Text className="text-lg font-black tracking-[0.2em] uppercase italic text-[#FF6D00]">
                    Tempo Metrics
                </Text>
                <Text className="text-[9px] font-black tracking-[0.3em] uppercase mt-0.5 ml-0.5 text-[#A3A3A3]">
                    {t('layouts.header.preview_version') as string}
                </Text>
            </TouchableOpacity>

            {/* Контейнер для статусу та аватарки */}
            <View className="flex-row items-center gap-3 relative">

                {/* 🔥 СТАТУС ІНТЕРНЕТУ (Втиснутий TextField) */}
                <View className="items-end justify-center mr-1">
                    {/* Контейнер, який обрізає все зайве і задає оригінальний розмір плашки */}
                    <View className="w-[100px] h-[32px] overflow-hidden rounded-xl justify-start items-center">

                        {/* Зменшуємо TextField на 35% і тягнемо вгору (margin-top), щоб сховати блок помилки */}
                        <View style={{ width: 145, transform: [{ scale: 0.65 }], marginTop: -11 }}>
                            <TextField
                                disabled={true}
                                value={isOnline ? (t('layouts.header.status_online') as string) : (t('layouts.header.status_offline') as string)}
                                icon={
                                    <View className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                }
                            />
                        </View>
                    </View>

                    {/* Попередження про бета-версію */}
                    {!isOnline && (
                        <Text className="text-orange-400 text-[7px] font-bold uppercase tracking-wider mt-1 text-right w-24">
                            {t('layouts.header.status_beta_warning') as string}
                        </Text>
                    )}
                </View>

                {/* АВАТАРКА / МЕНЮ */}
                <View className="relative">
                    <TouchableOpacity
                        onPress={() => setIsMenuOpen(true)}
                        activeOpacity={0.8}
                        className={`w-10 h-10 rounded-full items-center justify-center border overflow-hidden transition-colors ${
                            isMenuOpen
                                ? 'border-[#FF6D00] bg-white/10'
                                : 'border-white/10 bg-white/5'
                        }`}
                    >
                        {profile?.avatar_url && profile.avatar_url.includes('http') ? (
                            <Image source={{ uri: profile.avatar_url }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <Text
                                className="font-bold text-xs text-[#F5F5F5]"
                                style={{ fontFamily: 'Unbounded' }}
                            >
                                {userInitials}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* ВИПАДАЮЧЕ МЕНЮ */}
                    <Modal
                        transparent
                        visible={isMenuOpen}
                        animationType="fade"
                        onRequestClose={closeMenu}
                    >
                        <Pressable className="flex-1" onPress={closeMenu}>
                            <Pressable
                                className="absolute top-[60px] right-4 border border-white/10 rounded-xl shadow-2xl w-48 overflow-hidden py-1 bg-[#0A0A0A]/95"
                                onPress={(e) => e.stopPropagation()}
                            >
                                <View className="px-4 py-2 border-b border-white/5 mb-1">
                                    <Text
                                        className="font-bold text-sm truncate text-[#F5F5F5]"
                                        style={{ fontFamily: 'Unbounded' }}
                                        numberOfLines={1}
                                    >
                                        {profile?.full_name || (t('layouts.header.default_user') as string)}
                                    </Text>
                                    <Text
                                        className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#FF6D00] mt-1"
                                        style={{ fontFamily: 'Evolventa' }}
                                    >
                                        {profile?.role || "COACH"}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => { closeMenu(); onChangePin?.(); }}
                                    className="flex-row items-center px-4 py-3 active:bg-white/5"
                                >
                                    <Feather name="lock" size={16} color="#A3A3A3" />
                                    <Text
                                        className="ml-3 font-medium text-sm text-[#F5F5F5]"
                                        style={{ fontFamily: 'Evolventa' }}
                                    >
                                        {t('layouts.header.menu_change_pin') as string}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => { closeMenu(); if (onLogout) onLogout(); }}
                                    className="flex-row items-center px-4 py-3 border-t border-white/5 mt-1 active:bg-red-500/10"
                                >
                                    <Feather name="log-out" size={16} color="#ef4444" />
                                    <Text
                                        className="text-red-500 ml-3 font-medium text-sm"
                                        style={{ fontFamily: 'Evolventa' }}
                                    >
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