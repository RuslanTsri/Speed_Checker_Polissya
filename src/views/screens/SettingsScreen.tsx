import React from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, Pressable } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppModal } from '../components/AppModal';
import { useSettingsScreen } from '../../hooks/useSettingsScreen';
import { Switch } from '../components/ui/Switch';
import { Mod, SettingsRow } from "../components/ui/mods";
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { BleIcon, PenIcon, QuestionsIcon, NotificationsIcon } from '../../../assets/icons';

export default function SettingsScreen({ onLogout, onOpenPinChange, onOpenBluetooth }: any) {
    const { t } = useTranslation();
    const {
        isLoading, userProfile, isNotifEnabled, isDark, setIsDarkMode, toggleNotif,
        isEditModalVisible, setEditModalVisible, tempName, setTempName, tempAvatar, setTempAvatar,
        openEditModal, handleSaveProfile, handleConnectionPress, handleFAQ, toggleLanguage, currentLang
    } = useSettingsScreen({ onOpenPinChange, onOpenBluetooth });

    if (isLoading) return <View className="flex-1 items-center justify-center bg-surface-bg"><ActivityIndicator color="#FF6D00" /></View>;

    return (
        <View className="flex-1 pt-4">
            <View className="px-4 mb-6"><Text className="text-h2 font-bold text-text-main font-unbounded">{t('screens.settings.title')}</Text></View>
            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <Mod title={userProfile.name} subtitle={userProfile.role} onPress={openEditModal} className="mb-8"
                     icon={<View className="w-14 h-14 rounded-2xl overflow-hidden border border-surface-border"><Image source={{ uri: userProfile.avatar }} className="w-full h-full" /></View>}
                     rightHeader={<View className="bg-surface-card p-2 rounded-xl border border-surface-border"><PenIcon width={20} height={20} /></View>}
                />

                <Text className="text-text-muted text-caption font-bold tracking-widest uppercase mb-4 ml-2 font-evolventa">{t('screens.settings.section_equipment')}</Text>
                <Mod title="" className="mb-8">
                    <SettingsRow title={t('screens.settings.item_ble')} value={t('screens.settings.item_ble_val')} icon={<BleIcon width={22} height={22} />} onPress={handleConnectionPress} isLast />
                </Mod>

                <Text className="text-text-muted text-caption font-bold tracking-widest uppercase mb-4 ml-2 font-evolventa">{t('screens.settings.section_system')}</Text>
                <Mod title="" className="mb-8">
                    <SettingsRow title={t('screens.settings.item_notif')} icon={<NotificationsIcon width={22} height={22} />} rightElement={<Switch active={isNotifEnabled} onChange={toggleNotif} />} />
                    <SettingsRow title={t('screens.settings.item_theme')} icon={<Feather name={isDark ? "moon" : "sun"} size={22} color="#A3A3A3" />} rightElement={<Switch active={isDark} onChange={setIsDarkMode} />} />
                    <SettingsRow title={t('screens.settings.item_lang')} value={currentLang === 'uk' ? 'UA' : 'EN'} icon={<Ionicons name="language" size={22} color="#A3A3A3" />} onPress={toggleLanguage} isLast />
                </Mod>

                <Mod title=""><SettingsRow title={t('screens.settings.item_logout')} icon={<Feather name="log-out" size={22} color="#f87171" />} onPress={onLogout} destructive isLast /></Mod>
            </ScrollView>

            <AppModal type="bottom" visible={isEditModalVisible} onClose={() => setEditModalVisible(false)} title={t('screens.settings.edit_modal_title')}>
                <View className="items-center mb-6">
                    <View className="w-24 h-24 rounded-3xl border-2 border-brand-orange items-center justify-center overflow-hidden mb-8 bg-surface-card"><Image source={{ uri: tempAvatar || userProfile.avatar }} className="w-full h-full" /></View>
                    <View className="w-full gap-y-4">
                        <TextField label={t('screens.settings.edit_name_label')} value={tempName} onChangeText={setTempName} />
                        <Button variant="primary" title={t('screens.settings.edit_btn_save')} onPress={handleSaveProfile} className="w-full" />
                    </View>
                </View>
            </AppModal>
        </View>
    );
}