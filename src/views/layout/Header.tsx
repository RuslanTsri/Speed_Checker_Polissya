import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Pressable, Modal, Image } from 'react-native';
import { Feather } from "@expo/vector-icons";
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import { TextField } from '../components/ui/TextField';

// 🔥 Додали onOpenPinChange, бо саме так цей пропс називається в App.js
export const Header = ({ onGoHome, onLogout, onChangePin, onOpenPinChange }: any) => {
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

    const userInitials = useMemo(() => {
        if (!profile?.full_name) return "TM";
        const names = profile.full_name.trim().split(' ');
        return names.length === 1
            ? names[0].substring(0, 2).toUpperCase()
            : (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }, [profile?.full_name]);

    // Універсальний обробник для ПІН-коду
    const handlePinChange = () => {
        setIsMenuOpen(false);
        if (onOpenPinChange) onOpenPinChange();
        else if (onChangePin) onChangePin();
    };

    const handleLogout = () => {
        setIsMenuOpen(false);
        if (onLogout) onLogout();
    };

    return (
        <View className="z-50 py-4 px-6 flex-row justify-between items-center bg-transparent">
            {/* ЛОГОТИП */}
            <TouchableOpacity onPress={onGoHome} activeOpacity={0.6}>
                <Text className="text-h4 tracking-[0.2em] uppercase italic text-brand-orange font-unbounded-black">
                    Tempo Metrics
                </Text>
                <Text className="text-[9px] tracking-[0.3em] uppercase mt-0.5 ml-0.5 text-text-sub font-evolventa-bold">
                    {t('layouts.header.preview_version')}
                </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-3">
                {/* СТАТУС ІНТЕРНЕТУ */}
                <View className="items-end justify-center mr-1">
                    <View className="w-[100px] h-[32px] overflow-hidden rounded-xl">
                        <View style={{ width: 145, transform: [{ scale: 0.65 }], marginTop: -11 }}>
                            <TextField
                                disabled={true}
                                value={isOnline ? t('layouts.header.status_online') : t('layouts.header.status_offline')}
                                icon={<View className={`w-3 h-3 rounded-full ${isOnline ? 'bg-status-success' : 'bg-status-error'}`} />}
                            />
                        </View>
                    </View>
                    {!isOnline && (
                        <Text className="text-status-warning text-[7px] uppercase tracking-wider mt-1 text-right w-24 font-evolventa-bold">
                            {t('layouts.header.status_beta_warning')}
                        </Text>
                    )}
                </View>

                {/* АВАТАРКА / МЕНЮ */}
                <View>
                    <TouchableOpacity
                        onPress={() => setIsMenuOpen(true)}
                        activeOpacity={0.8}
                        className={`w-10 h-10 rounded-full items-center justify-center border overflow-hidden ${
                            isMenuOpen ? 'border-brand-orange bg-surface-card' : 'border-surface-border bg-surface-card/50'
                        }`}
                    >
                        {profile?.avatar_url && profile.avatar_url.includes('http') ? (
                            <Image source={{ uri: profile.avatar_url }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <Text className="text-caption text-text-main font-unbounded-bold">
                                {userInitials}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* ВИПАДАЮЧЕ МЕНЮ */}
                    <Modal transparent visible={isMenuOpen} animationType="fade" onRequestClose={() => setIsMenuOpen(false)}>
                        <Pressable className="flex-1" onPress={() => setIsMenuOpen(false)}>
                            <Pressable
                                className="absolute top-[60px] right-4 border border-surface-border rounded-xl shadow-2xl w-48 overflow-hidden py-1 bg-surface-bg/95"
                                onPress={e => e.stopPropagation()}
                            >
                                <View className="px-4 py-2 border-b border-surface-border/30 mb-1">
                                    <Text className="text-sm text-text-main font-unbounded-bold" numberOfLines={1}>
                                        {profile?.full_name || t('layouts.header.default_user')}
                                    </Text>
                                    <Text className="text-[10px] uppercase tracking-[0.15em] text-brand-orange mt-1 font-evolventa-bold">
                                        {profile?.role || "COACH"}
                                    </Text>
                                </View>

                                {/* Кнопка зміни ПІН-коду */}
                                <TouchableOpacity onPress={handlePinChange} className="flex-row items-center px-4 py-3 active:bg-white/5">
                                    <Feather name="lock" size={16} color="#A3A3A3" />
                                    <Text className="ml-3 text-sm text-text-main font-evolventa">
                                        {t('layouts.header.menu_change_pin')}
                                    </Text>
                                </TouchableOpacity>

                                {/* Кнопка виходу */}
                                <TouchableOpacity onPress={handleLogout} className="flex-row items-center px-4 py-3 border-t border-surface-border/30 mt-1 active:bg-status-error/10">
                                    <Feather name="log-out" size={16} color="#f87171" />
                                    <Text className="text-status-error ml-3 text-sm font-evolventa">
                                        {t('layouts.header.menu_logout')}
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