import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, Pressable, Animated } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AppModal } from '../components/AppModal';
import { useSettingsScreen } from '../../hooks/useSettingsScreen';
import { useOTAUpdate } from '../../hooks/useOTAUpdate';
import { Switch } from '../components/ui/Switch';
import { Mod, SettingsRow } from "../components/ui/mods";
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';

import SupportScreen from './SupportScreen';

import {
    NotificationsIcon, NotificationsIconActive,
    BleIcon, BleIconActive,
    PenIcon, PenIconActive,
    QuestionsIcon,
    ArrowIcon, ArrowIconActive
} from '../../../assets/icons';

const PRESET_AVATARS = [
    'https://img.icons8.com/color/480/wolf.png',
    'https://img.icons8.com/color/480/coach.png',
    'https://img.icons8.com/color/480/football-2.png',
    'https://img.icons8.com/color/480/strategy-board.png',
    'https://img.icons8.com/color/480/whistle.png',
    'https://img.icons8.com/fluency/480/user-male-circle.png',
    'https://img.icons8.com/fluency/480/user-female-circle.png',
];

export default function SettingsScreen({ onLogout, onOpenPinChange, onOpenBluetooth }: any) {
    const { t } = useTranslation();

    const [isSupportVisible, setSupportVisible] = useState(false);

    // Анімація для прогрес-бару оновлення
    const [progressAnim] = useState(new Animated.Value(0));

    const {
        isLoading, userProfile, isNotifEnabled, isDark, setIsDarkMode, toggleNotif,
        isEditModalVisible, setEditModalVisible, tempName, setTempName, tempAvatar, setTempAvatar, currentLang,
        openEditModal, handleSaveProfile, handleConnectionPress, handleFAQ, toggleLanguage
    } = useSettingsScreen({
        onOpenPinChange,
        onOpenBluetooth,
        onOpenSupport: () => setSupportVisible(true)
    });

    // Підключаємо хук для оновлень
    const { status: updateStatus, checkForUpdates, restartApp } = useOTAUpdate();

    // Логіка зміни ширини прогрес-бару в залежності від статусу оновлення
    useEffect(() => {
        let toValue = 0;
        if (updateStatus === 'checking') toValue = 33;
        else if (updateStatus === 'downloading') toValue = 66;
        else if (updateStatus === 'ready') toValue = 100;

        Animated.timing(progressAnim, {
            toValue,
            duration: 400,
            useNativeDriver: false // width не підтримує native driver
        }).start();
    }, [updateStatus]);

    const getUpdateStatusText = () => {
        switch (updateStatus) {
            case 'checking': return t('screens.settings.update_checking', 'Шукаємо оновлення...');
            case 'downloading': return t('screens.settings.update_downloading', 'Завантаження бандлу...');
            case 'ready': return t('screens.settings.update_ready', 'Оновлено! Натисніть для перезапуску');
            case 'error': return t('screens.settings.update_error', 'Помилка завантаження');
            default: return t('screens.settings.update_idle', 'Перевірити зараз');
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#FF6D00" />
            </View>
        );
    }

    if (isSupportVisible) {
        return <SupportScreen onBack={() => setSupportVisible(false)} />;
    }

    return (
        <View className="flex-1 pt-4 relative">
            <View className="px-4 mb-6">
                <Text className="text-h2 text-text-main font-unbounded-bold">
                    {t('screens.settings.title')}
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* ПРОФІЛЬ */}
                <Mod
                    title={userProfile.name}
                    subtitle={userProfile.role}
                    icon={
                        <View className="w-14 h-14 rounded-2xl overflow-hidden border border-surface-border">
                            <Image source={{ uri: userProfile.avatar }} className="w-full h-full" />
                        </View>
                    }
                    rightHeader={
                        <Pressable onPress={openEditModal}>
                            {({ pressed }) => (
                                <View className="bg-surface-card p-2 rounded-xl border border-surface-border">
                                    {pressed ? (
                                        <PenIconActive width={20} height={20} />
                                    ) : (
                                        <PenIcon width={20} height={20} />
                                    )}
                                </View>
                            )}
                        </Pressable>
                    }
                    onPress={openEditModal}
                    className="mb-8"
                />

                {/* ОБЛАДНАННЯ */}
                <Text className="text-text-sub text-caption uppercase mb-4 ml-2 tracking-widest font-evolventa-bold">
                    {t('screens.settings.section_equipment')}
                </Text>
                <Mod title="" className="mb-8">
                    <SettingsRow
                        title={t('screens.settings.item_ble')}
                        value={t('screens.settings.item_ble_val')}
                        icon={<BleIcon width={22} height={22} />}
                        activeIcon={<BleIconActive width={22} height={22} />}
                        onPress={handleConnectionPress}
                        isLast
                    />
                </Mod>

                {/* СИСТЕМА */}
                <Text className="text-text-sub text-caption uppercase mb-4 ml-2 tracking-widest font-evolventa-bold">
                    {t('screens.settings.section_system')}
                </Text>
                <Mod title="" className="mb-8">
                    <SettingsRow
                        title={t('screens.settings.item_lang')}
                        value={currentLang === 'uk' ? 'UA' : 'EN'}
                        icon={<Ionicons name="language" size={22} color="#A3A3A3" />}
                        onPress={toggleLanguage}
                    />
                    <SettingsRow
                        title={t('screens.settings.item_faq')}
                        icon={<QuestionsIcon width={22} height={22} />}
                        onPress={handleFAQ}
                        isLast
                    />
                </Mod>

                {/* ОНОВЛЕННЯ */}
                <Text className="text-text-sub text-caption uppercase mb-4 ml-2 tracking-widest font-evolventa-bold">
                    {t('screens.settings.section_updates', 'Оновлення (OTA)')}
                </Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={updateStatus === 'ready' ? restartApp : checkForUpdates}
                    disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
                    className="bg-surface-card border border-surface-border p-4 rounded-3xl mb-8 overflow-hidden"
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 border ${updateStatus === 'ready' ? 'bg-status-success/10 border-status-success/20' : 'bg-brand-orange/10 border-brand-orange/20'}`}>
                                <Feather
                                    name={updateStatus === 'ready' ? "check" : "download-cloud"}
                                    size={20}
                                    color={updateStatus === 'ready' ? "#34d399" : "#FF6D00"}
                                />
                            </View>
                            <View>
                                <Text className="text-body text-text-main font-unbounded-bold">
                                    {t('screens.settings.update_app', 'Оновлення системи')}
                                </Text>
                                <Text className={`text-[10px] font-evolventa mt-0.5 ${updateStatus === 'ready' ? 'text-status-success' : updateStatus === 'error' ? 'text-status-error' : 'text-text-sub'}`}>
                                    {getUpdateStatusText()}
                                </Text>
                            </View>
                        </View>

                        {updateStatus === 'checking' || updateStatus === 'downloading' ? (
                            <ActivityIndicator color="#FF6D00" size="small" />
                        ) : (
                            <Feather name={updateStatus === 'ready' ? "refresh-cw" : "chevron-right"} size={20} color="#717171" />
                        )}
                    </View>

                    {/* Прогрес-бар */}
                    {(updateStatus !== 'idle' && updateStatus !== 'error') && (
                        <View className="w-full h-1 bg-surface-border mt-4 rounded-full overflow-hidden">
                            <Animated.View
                                style={{
                                    height: '100%',
                                    backgroundColor: updateStatus === 'ready' ? '#34d399' : '#FF6D00',
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%']
                                    })
                                }}
                                className="rounded-full"
                            />
                        </View>
                    )}
                </TouchableOpacity>

                {/* ІНШЕ */}
                <Text className="text-text-sub text-caption uppercase mb-4 ml-2 tracking-widest font-evolventa-bold">
                    {t('screens.settings.section_other')}
                </Text>
                <Mod title="" className="mb-4">
                    <SettingsRow
                        title={t('screens.settings.item_logout')}
                        icon={<Feather name="log-out" size={22} color="#f87171" />}
                        onPress={onLogout}
                        destructive
                        isLast
                    />
                </Mod>
            </ScrollView>

            {/* МОДАЛКА РЕДАГУВАННЯ ПРОФІЛЮ */}
            <AppModal
                type="bottom"
                visible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                title={t('screens.settings.edit_modal_title')}
            >
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                    <View className="items-center mb-6 mt-2">
                        <View className="w-24 h-24 rounded-3xl border-2 border-brand-orange items-center justify-center overflow-hidden mb-6 shadow-xl bg-surface-card">
                            <Image source={{ uri: tempAvatar || userProfile.avatar }} className="w-full h-full" />
                        </View>

                        <Text className="text-text-sub text-caption uppercase mb-4 tracking-widest text-center font-evolventa-bold">
                            {t('screens.settings.edit_avatar') || "ОБРАТИ АВАТАР"}
                        </Text>

                        <View className="flex-row flex-wrap justify-center mb-8">
                            {PRESET_AVATARS.map((avatarUrl, index) => (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.7}
                                    onPress={() => setTempAvatar(avatarUrl)}
                                    className={`w-[52px] h-[52px] m-1.5 rounded-2xl overflow-hidden border-2 ${
                                        tempAvatar === avatarUrl ? 'border-brand-orange' : 'border-surface-border opacity-40'
                                    }`}
                                >
                                    <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="w-full gap-y-4">
                            <TextField
                                label={t('screens.settings.edit_name_label')}
                                value={tempName}
                                onChangeText={setTempName}
                            />
                            <TextField
                                label={t('screens.settings.edit_role_label') || "Роль у команді"}
                                value={userProfile.role}
                                disabled={true}
                            />
                            <View className="mt-4">
                                <Button
                                    variant="primary"
                                    title={t('screens.settings.edit_btn_save')}
                                    onPress={handleSaveProfile}
                                    isLoading={isLoading}
                                    className="w-full"
                                />
                            </View>
                        </View>

                    </View>
                </ScrollView>
            </AppModal>
        </View>
    );
}