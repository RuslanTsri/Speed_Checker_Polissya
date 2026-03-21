import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, Pressable, Animated } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Updates from 'expo-updates'; // Додано для отримання URL та Каналу

import { AppModal } from '../components/AppModal';
import { useSettingsScreen } from '../../hooks/useSettingsScreen';
import { useOTAUpdate } from '../../hooks/useOTAUpdate';
import { Mod, SettingsRow } from "../components/ui/mods";
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';

import SupportScreen from './SupportScreen';

import {
    BleIcon, BleIconActive,
    PenIcon, PenIconActive,
    QuestionsIcon,
    ArrowIcon
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
    const [progressAnim] = useState(new Animated.Value(0));

    const {
        isLoading, userProfile, currentLang, isEditModalVisible, setEditModalVisible,
        tempName, setTempName, tempAvatar, setTempAvatar, openEditModal,
        handleSaveProfile, handleConnectionPress, handleFAQ, toggleLanguage
    } = useSettingsScreen({
        onOpenPinChange,
        onOpenBluetooth,
        onOpenSupport: () => setSupportVisible(true)
    });

    const {
        status: updateStatus,
        updateMetadata,
        errorDetails, // Отримуємо деталі помилки з хука
        checkForUpdates,
        downloadAndRestart,
        resetStatus
    } = useOTAUpdate();

    useEffect(() => {
        let toValue = 0;
        if (updateStatus === 'checking') toValue = 40;
        else if (updateStatus === 'downloading') toValue = 80;
        else if (updateStatus === 'ready' || updateStatus === 'up-to-date' || updateStatus === 'error') toValue = 100;

        Animated.timing(progressAnim, {
            toValue,
            duration: 400,
            useNativeDriver: false
        }).start();
    }, [updateStatus]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#FF6D00" />
            </View>
        );
    }

    if (isSupportVisible) return <SupportScreen onBack={() => setSupportVisible(false)} />;

    return (
        <View className="flex-1 pt-4 relative">
            <View className="px-4 mb-6">
                <Text className="text-h2 text-text-main font-unbounded-bold">{t('screens.settings.title')}</Text>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* ПРОФІЛЬ */}
                <Mod
                    title={userProfile.name}
                    subtitle={userProfile.role}
                    icon={<View className="w-14 h-14 rounded-2xl overflow-hidden border border-surface-border"><Image source={{ uri: userProfile.avatar }} className="w-full h-full" /></View>}
                    rightHeader={<Pressable onPress={openEditModal}>{({ pressed }) => (<View className="bg-surface-card p-2 rounded-xl border border-surface-border">{pressed ? <PenIconActive width={20} height={20} /> : <PenIcon width={20} height={20} />}</View>)}</Pressable>}
                    onPress={openEditModal}
                    className="mb-8"
                />

                {/* ОБЛАДНАННЯ */}
                <Text className="text-text-sub text-caption uppercase mb-4 ml-2 tracking-widest font-evolventa-bold">{t('screens.settings.section_equipment')}</Text>
                <Mod title="" className="mb-8">
                    <SettingsRow title={t('screens.settings.item_ble')} value={t('screens.settings.item_ble_val')} icon={<BleIcon width={22} height={22} />} activeIcon={<BleIconActive width={22} height={22} />} onPress={handleConnectionPress} isLast />
                </Mod>

                {/* СИСТЕМА */}
                <Text className="text-text-sub text-caption uppercase mb-4 ml-2 tracking-widest font-evolventa-bold">{t('screens.settings.section_system')}</Text>
                <Mod title="" className="mb-8">
                    <SettingsRow title={t('screens.settings.item_lang')} value={currentLang === 'uk' ? 'UA' : 'EN'} icon={<Ionicons name="language" size={22} color="#A3A3A3" />} onPress={toggleLanguage} />
                    <SettingsRow title={t('screens.settings.item_faq')} icon={<QuestionsIcon width={22} height={22} />} onPress={handleFAQ} isLast />
                </Mod>

                {/* ОНОВЛЕННЯ */}
                <Text className="text-text-sub text-caption uppercase mb-4 ml-2 tracking-widest font-evolventa-bold">{t('screens.settings.section_update')}</Text>
                <Mod title="" className="mb-8">
                    <SettingsRow
                        title={t('screens.settings.item_update')}
                        value={
                            updateStatus === 'checking' ? t('screens.settings.update_status_checking') :
                                updateStatus === 'downloading' ? t('screens.settings.update_status_downloading') :
                                    'v1.0.0'
                        }
                        icon={
                            updateStatus === 'checking' || updateStatus === 'downloading'
                                ? <ActivityIndicator size="small" color="#FF6D00" />
                                : <Feather name="refresh-cw" size={22} color={updateStatus === 'error' ? "#f87171" : "#A3A3A3"} />
                        }
                        onPress={checkForUpdates}
                        isLast={true}
                    />

                    {/* Тонкий прогрес-бар */}
                    {(updateStatus === 'checking' || updateStatus === 'downloading') && (
                        <View className="h-[2px] w-full bg-surface-border overflow-hidden absolute bottom-0 left-0 right-0 rounded-b-2xl">
                            <Animated.View style={{ width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), backgroundColor: '#FF6D00' }} className="h-full" />
                        </View>
                    )}
                </Mod>

                {/* ІНШЕ */}
                <Text className="text-text-sub text-caption uppercase mb-4 ml-2 tracking-widest font-evolventa-bold">{t('screens.settings.section_other')}</Text>
                <Mod title="" className="mb-4">
                    <SettingsRow title={t('screens.settings.item_logout')} icon={<Feather name="log-out" size={22} color="#f87171" />} onPress={onLogout} destructive isLast />
                </Mod>
            </ScrollView>

            {/* --- МОДАЛКА 1: ДОСТУПНА НОВА ВЕРСІЯ --- */}
            <AppModal type="center" visible={updateStatus === 'ready' || updateStatus === 'downloading'} onClose={resetStatus} title={t('screens.settings.update_modal_available_title')}>
                <View className="items-center p-2">
                    <View className="w-16 h-16 bg-brand-orange/20 rounded-full items-center justify-center mb-6">
                        <Feather name="zap" size={32} color="#FF6D00" />
                    </View>
                    <Text className="text-text-main text-body font-unbounded-bold text-center mb-3 leading-6">{updateMetadata?.message}</Text>
                    <View className="bg-surface-card border border-surface-border rounded-2xl p-4 w-full mb-8">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-text-sub text-[10px] uppercase font-evolventa-bold">{t('screens.settings.update_modal_date')}</Text>
                            <Text className="text-text-main text-[10px] font-evolventa">{updateMetadata?.date}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-text-sub text-[10px] uppercase font-evolventa-bold">{t('screens.settings.update_modal_build')}</Text>
                            <Text className="text-text-main text-[10px] font-mono">{updateMetadata?.id}</Text>
                        </View>
                    </View>
                    <View className="w-full gap-y-3">
                        <Button variant="primary" title={t('screens.settings.update_btn_update')} onPress={downloadAndRestart} isLoading={updateStatus === 'downloading'} />
                        <Button variant="outline" title={t('screens.settings.update_btn_later')} onPress={resetStatus} disabled={updateStatus === 'downloading'} />
                    </View>
                </View>
            </AppModal>

            {/* --- МОДАЛКА 2: ВСЕ АКТУАЛЬНО --- */}
            <AppModal type="center" visible={updateStatus === 'up-to-date'} onClose={resetStatus} title={t('screens.settings.update_modal_uptodate_title')}>
                <View className="items-center p-2">
                    <View className="w-16 h-16 bg-status-success/10 rounded-full items-center justify-center mb-6 border border-status-success/20">
                        <Feather name="check-circle" size={32} color="#34d399" />
                    </View>
                    <Text className="text-text-main text-body font-unbounded-bold text-center mb-2">{t('screens.settings.update_modal_uptodate_desc')}</Text>
                    <Text className="text-text-sub text-caption text-center mb-8 font-evolventa">{t('screens.settings.update_modal_uptodate_info')}</Text>
                    <Button variant="primary" title={t('screens.settings.update_btn_ok')} onPress={resetStatus} className="w-full" />
                </View>
            </AppModal>

            {/* --- МОДАЛКА 3: ПОМИЛКА ОНОВЛЕННЯ (НОВА) --- */}
            <AppModal type="center" visible={updateStatus === 'error'} onClose={resetStatus} title={t('screens.settings.update_modal_error_title')}>
                <View className="items-center p-2">
                    <View className="w-16 h-16 bg-status-error/10 rounded-full items-center justify-center mb-6 border border-status-error/20">
                        <Feather name="alert-triangle" size={32} color="#f87171" />
                    </View>
                    <Text className="text-text-main text-body font-unbounded-bold text-center mb-3">{t('screens.settings.update_modal_error_desc')}</Text>

                    <View className="bg-surface-card border border-status-error/30 rounded-2xl p-4 w-full mb-8">
                        <View className="mb-3">
                            <Text className="text-text-sub text-[10px] uppercase font-evolventa-bold mb-1">{t('screens.settings.update_modal_error_reason')}</Text>
                            <Text className="text-status-error text-[11px] font-evolventa leading-4">{errorDetails || t('screens.settings.update_modal_error_unknown')}</Text>
                        </View>
                        <View className="mb-3 flex-row justify-between">
                            <View>
                                <Text className="text-text-sub text-[10px] uppercase font-evolventa-bold mb-1">{t('screens.settings.update_modal_error_channel')}</Text>
                                <Text className="text-text-main text-[11px] font-mono">{Updates.channel || t('screens.settings.update_modal_error_unknown')}</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-text-sub text-[10px] uppercase font-evolventa-bold mb-1">Runtime Ver:</Text>
                                <Text className="text-text-main text-[11px] font-mono">{Updates.runtimeVersion || t('screens.settings.update_modal_error_unknown')}</Text>
                            </View>
                        </View>
                        <View>
                            <Text className="text-text-sub text-[10px] uppercase font-evolventa-bold mb-1">{t('screens.settings.update_modal_error_url')}</Text>
                            <Text className="text-text-main text-[10px] font-mono leading-4" selectable={true}>
                                {process.env.EXPO_PUBLIC_UPDATE_URL || t('screens.settings.update_modal_error_unknown')}
                            </Text>
                        </View>
                    </View>

                    <Button variant="primary" title={t('screens.settings.update_btn_ok')} onPress={resetStatus} className="w-full" />
                </View>
            </AppModal>

            {/* МОДАЛКА РЕДАГУВАННЯ ПРОФІЛЮ */}
            <AppModal type="bottom" visible={isEditModalVisible} onClose={() => setEditModalVisible(false)} title={t('screens.settings.edit_modal_title')}>
                {/* Вміст модалки профілю залишено без змін */}
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                    <View className="items-center mb-6 mt-2">
                        <View className="w-24 h-24 rounded-3xl border-2 border-brand-orange items-center justify-center overflow-hidden mb-6 shadow-xl bg-surface-card"><Image source={{ uri: tempAvatar || userProfile.avatar }} className="w-full h-full" /></View>
                        <Text className="text-text-sub text-caption uppercase mb-4 tracking-widest text-center font-evolventa-bold">{t('screens.settings.edit_avatar')}</Text>
                        <View className="flex-row flex-wrap justify-center mb-8">
                            {PRESET_AVATARS.map((url, idx) => (
                                <TouchableOpacity key={idx} onPress={() => setTempAvatar(url)} className={`w-[52px] h-[52px] m-1.5 rounded-2xl overflow-hidden border-2 ${tempAvatar === url ? 'border-brand-orange' : 'border-surface-border opacity-40'}`}><Image source={{ uri: url }} className="w-full h-full" /></TouchableOpacity>
                            ))}
                        </View>
                        <View className="w-full gap-y-4">
                            <TextField label={t('screens.settings.edit_name_label')} value={tempName} onChangeText={setTempName} />
                            <TextField label="Роль у команді" value={userProfile.role} disabled={true} />
                            <Button variant="primary" title={t('screens.settings.edit_btn_save')} onPress={handleSaveProfile} isLoading={isLoading} className="w-full mt-4" />
                        </View>
                    </View>
                </ScrollView>
            </AppModal>
        </View>
    );
}