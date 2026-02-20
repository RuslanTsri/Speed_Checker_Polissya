import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Pressable, Modal, Image } from 'react-native';
import { Feather } from "@expo/vector-icons";
import NetInfo from '@react-native-community/netinfo';
import { useUser } from '../../context/UserContext';

interface HeaderProps {
    onGoHome: () => void;
    onLogout?: () => void;
    onChangePin?: () => void;
}

export const Header = ({ onGoHome, onLogout, onChangePin }: HeaderProps) => {
    const { profile } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Стан для відслідковування Інтернету
    const [isOnline, setIsOnline] = useState(true);

    // Підписуємось на зміни мережі
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
        <View className="z-50 bg-slate-900 py-4 px-6 border-b border-slate-800 flex-row justify-between items-center">

            {/* 🔥 ЛОГОТИП + PREVIEW */}
            <TouchableOpacity onPress={onGoHome} activeOpacity={0.6} className="justify-center">
                <Text className="text-yellow-400 text-lg font-black tracking-[0.2em] uppercase italic">
                    Tempo Metrics
                </Text>
                {/* Напис Preview для презентацій */}
                <Text className="text-slate-500 text-[9px] font-black tracking-[0.3em] uppercase mt-0.5 ml-0.5">
                    Preview Version
                </Text>
            </TouchableOpacity>

            {/* Контейнер для статусу та аватарки */}
            <View className="flex-row items-center relative">

                {/* 🔥 СТАТУС ІНТЕРНЕТУ + ПОПЕРЕДЖЕННЯ ПРО BETA */}
                <View className="items-end justify-center mr-3">
                    <View className="flex-row items-center px-2 py-1 bg-slate-800 rounded-full border border-slate-700">
                        <View className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className="text-xs text-slate-300 font-medium">
                            {isOnline ? 'Онлайн' : 'Офлайн'}
                        </Text>
                    </View>

                    {/* Текст з'являється ТІЛЬКИ в офлайні прямо під плашкою */}
                    {!isOnline && (
                        <Text className="text-orange-400 text-[7px] font-bold uppercase tracking-wider mt-1 text-right w-24">
                            Beta: можливі помилки
                        </Text>
                    )}
                </View>

                {/* Аватарка / Меню */}
                <View className="relative">
                    <TouchableOpacity
                        onPress={() => setIsMenuOpen(true)}
                        activeOpacity={0.8}
                        className={`w-10 h-10 rounded-full items-center justify-center border overflow-hidden transition-colors ${
                            isMenuOpen ? 'border-yellow-400' : 'border-slate-700 bg-slate-800'
                        }`}
                    >
                        {profile?.avatar_url && profile.avatar_url.includes('http') ? (
                            <Image source={{ uri: profile.avatar_url }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <Text className={`font-bold text-xs ${isMenuOpen ? 'text-yellow-400' : 'text-yellow-400'}`}>
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
                                className="absolute top-[60px] right-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-48 overflow-hidden py-1"
                                onPress={(e) => e.stopPropagation()}
                            >
                                <View className="px-4 py-2 border-b border-slate-700/50 mb-1">
                                    <Text className="text-slate-300 font-bold text-sm truncate" numberOfLines={1}>
                                        {profile?.full_name || "Користувач"}
                                    </Text>
                                    <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                        {profile?.role || "COACH"}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => { closeMenu(); onChangePin?.(); }}
                                    className="flex-row items-center px-4 py-3 active:bg-slate-700"
                                >
                                    <Feather name="lock" size={16} color="#94a3b8" />
                                    <Text className="text-white ml-3 font-medium text-sm">Зміна PIN</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        closeMenu();
                                        if (onLogout) onLogout();
                                    }}
                                    className="flex-row items-center px-4 py-3 active:bg-red-900/20 border-t border-slate-700/50 mt-1"
                                >
                                    <Feather name="log-out" size={16} color="#ef4444" />
                                    <Text className="text-red-400 ml-3 font-medium text-sm">Вихід</Text>
                                </TouchableOpacity>
                            </Pressable>
                        </Pressable>
                    </Modal>
                </View>
            </View>
        </View>
    );
};