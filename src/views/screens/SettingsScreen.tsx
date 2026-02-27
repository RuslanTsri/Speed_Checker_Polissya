import React from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppModal } from '../components/AppModal';
import { useSettingsScreen } from '../../hooks/useSettingsScreen';
import { Switch } from '../components/ui/Switch';
import {Mod, SettingsRow} from "../components/ui/mods";
import {Button} from '../components/ui/Button';
import {TextField} from '../components/ui/TextField';


// 🔥 Твої іконки
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
    const {
        isLoading, userProfile, isNotifEnabled, isDark, setIsDarkMode, toggleNotif,
        isEditModalVisible, setEditModalVisible, tempName, setTempName, tempAvatar, setTempAvatar, currentLang,
        openEditModal, handleSaveProfile, handleConnectionPress, handleFAQ, toggleLanguage
    } = useSettingsScreen({ onOpenPinChange, onOpenBluetooth });

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#0A0A0A]">
                <ActivityIndicator size="large" color="#FF6D00" />
            </View>
        );
    }

    return (
        <View className="flex-1 pt-4 relative">
            {/* Header */}
            <View className="px-4 mb-6">
                <Text className="text-3xl font-bold text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                    {t('screens.settings.title')}
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* 1. КАРТКА ПРОФІЛЮ */}
                <Mod
                    title={userProfile.name}
                    subtitle={userProfile.role}
                    icon={
                        <View className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10">
                            <Image source={{ uri: userProfile.avatar }} className="w-full h-full" />
                        </View>
                    }
                    rightHeader={
                        /* 🔥 Додали пресейбл ефект для іконки олівця */
                        <Pressable onPress={openEditModal}>
                            {({ pressed }) => (
                                <View className="bg-white/5 p-2 rounded-xl border border-white/10">
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

                {/* 2. ОБЛАДНАННЯ */}
                <Text className="text-[#A3A3A3] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ml-2" style={{ fontFamily: 'Evolventa' }}>
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

                {/* 3. СИСТЕМА */}
                <Text className="text-[#A3A3A3] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ml-2" style={{ fontFamily: 'Evolventa' }}>
                    {t('screens.settings.section_system')}
                </Text>
                <Mod title="" className="mb-8">
                    <SettingsRow
                        title={t('screens.settings.item_notif')}
                        icon={<NotificationsIcon width={22} height={22} />}
                        rightElement={<Switch active={isNotifEnabled} onChange={toggleNotif} />}
                    />
                    <SettingsRow
                        title={t('screens.settings.item_theme')}
                        icon={<Feather name={isDark ? "moon" : "sun"} size={22} color="#A3A3A3" />}
                        rightElement={<Switch active={isDark} onChange={setIsDarkMode} />}
                    />
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

                {/* 4. ІНШЕ */}
                <Text className="text-[#A3A3A3] text-[10px] font-bold tracking-[0.2em] uppercase mb-4 ml-2" style={{ fontFamily: 'Evolventa' }}>
                    {t('screens.settings.section_other')}
                </Text>
                <Mod title="">
                    <SettingsRow
                        title={t('screens.settings.item_logout')}
                        icon={<Feather name="log-out" size={22} color="#ef4444" />}
                        onPress={onLogout}
                        destructive
                        isLast
                    />
                </Mod>
            </ScrollView>

            {/* 🔥 МОДАЛКА РЕДАГУВАННЯ ЧЕРЕЗ AppModal */}
            <AppModal
                type="bottom"
                visible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                title={t('screens.settings.edit_modal_title')}
            >
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                    <View className="items-center mb-6">

                        {/* Аватар */}
                        <View className="w-24 h-24 rounded-3xl border-2 border-[#FF6D00] items-center justify-center overflow-hidden mb-6 shadow-xl bg-black/20">
                            <Image source={{ uri: tempAvatar || userProfile.avatar }} className="w-full h-full" />
                        </View>

                        <Text className="text-[#A3A3A3] text-[10px] uppercase font-bold mb-4 tracking-widest text-center" style={{ fontFamily: 'Evolventa' }}>
                            {t('screens.settings.edit_avatar')}
                        </Text>

                        {/* Вибір аватарів */}
                        <View className="flex-row flex-wrap justify-center mb-8">
                            {PRESET_AVATARS.map((avatarUrl, index) => (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.7}
                                    onPress={() => setTempAvatar(avatarUrl)}
                                    className={`w-[52px] h-[52px] m-1.5 rounded-2xl overflow-hidden border-2 ${
                                        tempAvatar === avatarUrl ? 'border-[#FF6D00]' : 'border-white/5 opacity-40'
                                    }`}
                                >
                                    <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Поля вводу та кнопка */}
                        <View className="w-full gap-y-4">

                            {/* 🔥 Використовуємо твій TextField для імені */}
                            <TextField
                                label={t('screens.settings.edit_name_label')}
                                value={tempName}
                                onChangeText={setTempName}
                            />

                            {/* 🔥 Використовуємо TextField для ролі (disabled) */}
                            <TextField
                                label={t('screens.settings.edit_role_label')}
                                value={userProfile.role}
                                disabled={true}
                            />

                            <View className="mt-4">
                                {/* 🔥 Використовуємо твій Button */}
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