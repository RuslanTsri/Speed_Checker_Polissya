import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { BottomModal } from '../components/BottomModal';
import { useSettingsScreen } from '../../hooks/useSettingsScreen';
import { Switch } from '../components/ui/Switch';

const PRESET_AVATARS = [
    'https://img.icons8.com/color/480/wolf.png',
    'https://img.icons8.com/color/480/coach.png',
    'https://img.icons8.com/color/480/football-2.png',
    'https://img.icons8.com/color/480/strategy-board.png',
    'https://img.icons8.com/color/480/whistle.png',
    'https://img.icons8.com/fluency/480/user-male-circle.png',
    'https://img.icons8.com/fluency/480/user-female-circle.png',
];

interface SettingsScreenProps {
    onLogout: () => void;
    onOpenPinChange: () => void;
    onOpenBluetooth: () => void;
}

export default function SettingsScreen({ onLogout, onOpenPinChange, onOpenBluetooth }: SettingsScreenProps) {
    const { t, i18n } = useTranslation();
    const {
        isLoading, userProfile, isNotifEnabled, isDark, setIsDarkMode, toggleNotif,
        isEditModalVisible, setEditModalVisible, tempName, setTempName, tempAvatar, setTempAvatar,currentLang,
        openEditModal, handleSaveProfile, handleConnectionPress, handleFAQ, handleExport, toggleLanguage
    } = useSettingsScreen({ onOpenPinChange, onOpenBluetooth });

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#FF6D00" />
            </View>
        );
    }

    return (
        <View className="flex-1 pt-4">
            <View className="px-4 mb-6">
                <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t('screens.settings.title')}
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingTop: 16,
                    paddingBottom: 40
                }}
                showsVerticalScrollIndicator={false}
            >

                {/* 1. КАРТКА ПРОФІЛЮ (Glassmorphism) */}
                <TouchableOpacity
                    onPress={openEditModal}
                    activeOpacity={0.8}
                    className={`p-5 rounded-3xl border flex-row items-center mb-8 shadow-sm ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200'}`}
                >
                    <View className={`w-16 h-16 rounded-full border-2 mr-4 overflow-hidden ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                        <Image source={{ uri: userProfile.avatar }} className="w-full h-full" resizeMode="cover" />
                    </View>
                    <View className="flex-1">
                        <Text className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{userProfile.name}</Text>
                        <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{userProfile.role}</Text>
                    </View>
                    <View className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                        <Feather name="edit-2" size={18} color="#FF6D00" />
                    </View>
                </TouchableOpacity>

                {/* 2. ОБЛАДНАННЯ */}
                <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-4 ml-2">
                    {t('screens.settings.section_equipment')}
                </Text>
                <View className={`rounded-3xl px-5 py-2 border mb-8 ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                    <SettingItem
                        icon={<Feather name="bluetooth" size={20} color="#FF6D00" />}
                        title={t('screens.settings.item_ble')}
                        value={t('screens.settings.item_ble_val')}
                        valueColor={isDark ? "text-[#FF6D00]" : "text-yellow-600"}
                        onPress={handleConnectionPress}
                        isDark={isDark}
                    />
                </View>

                {/* 3. СИСТЕМА */}
                <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-4 ml-2">
                    {t('screens.settings.section_system')}
                </Text>
                <View className={`rounded-3xl px-5 py-2 border mb-8 ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                    <SettingItem
                        icon={<Feather name="bell" size={20} color="#94a3b8" />}
                        title={t('screens.settings.item_notif')}
                        isSwitch switchValue={isNotifEnabled} onSwitchChange={toggleNotif} isDark={isDark}
                    />
                    <SettingItem
                        icon={<Feather name={isDark ? "moon" : "sun"} size={20} color="#94a3b8" />}
                        title={t('screens.settings.item_theme')}
                        isSwitch switchValue={isDark} onSwitchChange={setIsDarkMode} isDark={isDark}
                    />
                    <SettingItem
                        icon={<Ionicons name="language" size={20} color="#60a5fa" />}
                        title={t('screens.settings.item_lang')}
                        value={currentLang === 'uk' ? 'UA' : 'EN'}
                        onPress={toggleLanguage}
                        isDark={isDark}
                    />
                    <SettingItem
                        icon={<Feather name="help-circle" size={20} color="#60a5fa" />}
                        title={t('screens.settings.item_faq')} onPress={handleFAQ} isDark={isDark}
                    />
                </View>

                {/* 4. ІНШЕ */}
                <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-4 ml-2">
                    {t('screens.settings.section_other')}
                </Text>
                <View className={`rounded-3xl px-5 py-2 border mb-10 ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                    <SettingItem
                        icon={<Feather name="file-text" size={20} color="#94a3b8" />}
                        title={t('screens.settings.item_export')} onPress={handleExport} isDark={isDark}
                    />
                    <SettingItem
                        icon={<Feather name="log-out" size={20} color="#ef4444" />}
                        title={t('screens.settings.item_logout')} destructive onPress={onLogout} isDark={isDark}
                    />
                </View>
            </ScrollView>

            {/* МОДАЛКА РЕДАГУВАННЯ залишається без змін... */}
            <BottomModal visible={isEditModalVisible} onClose={() => setEditModalVisible(false)} title={t('screens.settings.edit_modal_title')}>
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                    {/* ... (Вміст модалки залишив як у тебе) ... */}
                    <View className="items-center mb-6 px-4">
                        <View className={`w-24 h-24 rounded-full border-2 border-[#FF6D00] items-center justify-center overflow-hidden mb-6 shadow-xl ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                            <Image source={{ uri: tempAvatar || userProfile.avatar }} className="w-full h-full" key={tempAvatar} />
                        </View>

                        <Text className="text-slate-500 text-[10px] uppercase font-bold mb-4 tracking-widest text-center">
                            {t('screens.settings.edit_avatar')}
                        </Text>

                        <View className="flex-row flex-wrap justify-center mb-6 w-full" style={{ minHeight: 120 }}>
                            {PRESET_AVATARS.map((avatarUrl, index) => (
                                <TouchableOpacity
                                    key={index} activeOpacity={1} onPress={() => setTempAvatar(avatarUrl)}
                                    className={`w-[52px] h-[52px] m-1.5 rounded-full overflow-hidden border-2 ${
                                        tempAvatar === avatarUrl ? 'border-[#FF6D00]' : (isDark ? 'border-slate-800 opacity-40' : 'border-slate-300 opacity-60')
                                    }`}
                                >
                                    <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="w-full space-y-4">
                            <View>
                                <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">
                                    {t('screens.settings.edit_name_label')}
                                </Text>
                                <TextInput
                                    value={tempName} onChangeText={setTempName}
                                    placeholderTextColor={isDark ? "#334155" : "#94a3b8"}
                                    className={`p-5 rounded-2xl border text-base font-bold ${isDark ? 'bg-slate-900/80 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'}`}
                                />
                            </View>

                            <View className="opacity-60 mb-2 mt-4">
                                <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">
                                    {t('screens.settings.edit_role_label')}
                                </Text>
                                <View className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                                    <Text className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{userProfile.role}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveProfile} disabled={isLoading} activeOpacity={0.8}
                                className={`bg-[#FF6D00] p-5 rounded-2xl items-center mt-4 shadow-lg shadow-[#FF6D00]/20 ${isLoading ? 'opacity-50' : ''}`}
                            >
                                {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white font-black text-lg uppercase tracking-wide">{t('screens.settings.edit_btn_save')}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </BottomModal>
        </View>
    );
}

const SettingItem = ({ icon, title, value, isSwitch = false, switchValue, onSwitchChange, onPress, valueColor = "text-slate-500", destructive = false, isDark }: any) => (
    <TouchableOpacity
        activeOpacity={isSwitch ? 1 : 0.7}
        onPress={isSwitch ? undefined : onPress}
        className={`flex-row items-center justify-between py-4 border-b last:border-0 ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}
    >
        <View className="flex-row items-center flex-1 mr-4">
            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${destructive ? 'bg-red-500/10' : (isDark ? 'bg-slate-800/80 border border-slate-700/80' : 'bg-slate-100 border border-slate-200')}`}>
                {icon}
            </View>
            <Text className={`text-base font-bold ${destructive ? (isDark ? 'text-red-400' : 'text-red-500') : (isDark ? 'text-white' : 'text-slate-900')}`}>
                {title}
            </Text>
        </View>

        {isSwitch ? (
            <Switch
                active={switchValue}
                onChange={onSwitchChange}
            />
        ) : (
            <View className="flex-row items-center">
                {value && <Text className={`${valueColor} mr-2 text-sm font-medium`}>{value}</Text>}
                <Feather name="chevron-right" size={20} color={destructive ? "#ef4444" : (isDark ? "#64748b" : "#94a3b8")} />
            </View>
        )}
    </TouchableOpacity>
);