import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Image, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { BottomModal } from '../components/BottomModal';

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
}

export default function SettingsScreen({ onLogout, onOpenPinChange }: SettingsScreenProps) {
    // 🔥 Беремо все з useSettings, включаючи BLE логіку
    const {
        isLoading,
        userProfile,
        isNotifEnabled,
        isSoundEnabled,
        updateProfile,
        toggleNotif,
        toggleSound,
        clearCache,
        GetBleConnectionStatus, // Наша нова функція
        bleStatus               // Статус для відображення
    } = useSettings();

    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempRole, setTempRole] = useState('');
    const [tempAvatar, setTempAvatar] = useState('');

    // --- ВІДОБРАЖЕННЯ СТАТУСУ ---
    let connectionText = "Відключено";
    let connectionColor = "text-red-400";
    let iconColor = "#ef4444";

    if (bleStatus.connected) {
        if (bleStatus.state === 'discovering') {
            connectionText = bleStatus.pingProgress || "Пінг...";
            connectionColor = "text-yellow-400";
            iconColor = "#facc15";
        } else {
            connectionText = "Підключено (STM32)"; // Замінили ESP32 на STM32
            connectionColor = "text-green-400";
            iconColor = "#4ade80";
        }
    }

    // --- (Логіка модалки і профілю без змін) ---
    const openEditModal = () => {
        setTempName(userProfile.name);
        setTempRole(userProfile.role);
        setTempAvatar(userProfile.avatar);
        setEditModalVisible(true);
    };

    const handleSaveProfile = async () => {
        const success = await updateProfile(tempName, tempRole, tempAvatar);
        if (success) setEditModalVisible(false);
    };

    const startPinChange = () => {
        setEditModalVisible(false);
        setTimeout(() => { onOpenPinChange(); }, 300);
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-900 items-center justify-center">
                <ActivityIndicator size="large" color="#facc15" />
            </View>
        );
    }

    const SettingItem = ({ icon, title, value, isSwitch = false, onPress, color = "text-white", valueColor = "text-slate-500" }: any) => (
        <TouchableOpacity
            activeOpacity={isSwitch ? 1 : 0.7}
            onPress={isSwitch ? () => {} : onPress}
            className="flex-row items-center justify-between py-4 border-b border-slate-700/50 last:border-0"
        >
            <View className="flex-row items-center">
                <View className="mr-4 w-6 items-center">{icon}</View>
                <Text className={`text-base font-medium ${color}`}>{title}</Text>
            </View>
            {isSwitch ? (
                <Switch trackColor={{ false: "#334155", true: "#facc15" }} thumbColor={value ? "#fff" : "#94a3b8"} onValueChange={onPress} value={value} />
            ) : (
                <View className="flex-row items-center">
                    {value && <Text className={`${valueColor} mr-2 text-sm font-bold`}>{value}</Text>}
                    <Feather name="chevron-right" size={20} color="#475569" />
                </View>
            )}
        </TouchableOpacity>
    );

    const Section = ({ title, children }: any) => (
        <View className="mb-6">
            <Text className="text-slate-500 uppercase text-xs font-bold tracking-widest mb-2 ml-2">{title}</Text>
            <View className="bg-slate-800 rounded-2xl px-4 border border-slate-700 shadow-sm">{children}</View>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-900">
            <ScrollView className="flex-1 px-4 pt-4">
                <View className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex-row items-center mb-8 shadow-md">
                    <View className="w-16 h-16 bg-slate-700 rounded-full items-center justify-center mr-4 border-2 border-slate-600 overflow-hidden">
                        <Image source={{ uri: userProfile.avatar }} className="w-full h-full" resizeMode="cover" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-xl font-bold">{userProfile.name}</Text>
                        <Text className="text-slate-400 text-sm">{userProfile.role}</Text>
                        <View className="flex-row mt-2">
                            <View className={`px-2 py-0.5 rounded mr-2 border ${bleStatus.connected ? 'bg-green-500/20 border-green-500/30' : 'bg-slate-700 border-slate-600'}`}>
                                <Text className={`${bleStatus.connected ? 'text-green-400' : 'text-slate-500'} text-[10px] font-bold uppercase`}>
                                    {bleStatus.connected ? 'SYSTEM ONLINE' : 'OFFLINE'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={openEditModal} className="bg-slate-700 p-3 rounded-xl border border-slate-600 active:bg-slate-600">
                        <Feather name="edit-2" size={18} color="#facc15" />
                    </TouchableOpacity>
                </View>

                <Section title="Датчики та Обладнання">
                    {/* 🔥 ВИКЛИКАЄМО GetBleConnectionStatus */}
                    <SettingItem
                        icon={
                            bleStatus.state === 'discovering'
                                ? <ActivityIndicator size="small" color="#facc15" />
                                : <Feather name="wifi" size={20} color={iconColor} />
                        }
                        title="Статус з'єднання STM32"
                        value={connectionText}
                        valueColor={connectionColor}
                        onPress={GetBleConnectionStatus}
                    />
                    <SettingItem icon={<Ionicons name="battery-charging" size={20} color="#facc15" />} title="Заряд датчиків" value="В розробці" onPress={() => {}} />
                </Section>

                <Section title="Система">
                    <SettingItem icon={<Feather name="bell" size={20} color="#94a3b8" />} title="Сповіщення" isSwitch value={isNotifEnabled} onPress={toggleNotif} />
                    <SettingItem icon={<Feather name="volume-2" size={20} color="#94a3b8" />} title="Звук при фініші" isSwitch value={isSoundEnabled} onPress={toggleSound} />
                </Section>

                <Section title="Керування даними">
                    <SettingItem icon={<Feather name="file-text" size={20} color="#94a3b8" />} title="Експорт у PDF" onPress={() => Alert.alert("Експорт", "Звіт формується...")} />
                    <SettingItem icon={<Feather name="trash-2" size={20} color="#ef4444" />} title="Скинути налаштування" onPress={clearCache} color="text-red-400" />
                </Section>

                <TouchableOpacity onPress={onLogout} className="bg-red-900/20 border border-red-900 p-4 rounded-xl flex-row justify-center items-center mb-10 mt-2">
                    <Feather name="log-out" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                    <Text className="text-red-500 font-bold uppercase tracking-widest">Вийти з акаунту</Text>
                </TouchableOpacity>
            </ScrollView>

            <BottomModal visible={isEditModalVisible} onClose={() => setEditModalVisible(false)} title="Редагування профілю">
                <View className="items-center mb-6">
                    <View className="w-24 h-24 rounded-full bg-slate-800 border-2 border-yellow-400 items-center justify-center overflow-hidden mb-4">
                        <Image source={{ uri: tempAvatar || userProfile.avatar }} className="w-full h-full" />
                    </View>
                    <Text className="text-slate-400 text-xs uppercase font-bold mb-2">Оберіть аватар</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {PRESET_AVATARS.map((avatarUrl, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setTempAvatar(avatarUrl)}
                                className={`w-14 h-14 rounded-full mr-3 border-2 overflow-hidden ${tempAvatar === avatarUrl ? 'border-yellow-400 opacity-100' : 'border-slate-700 opacity-50'}`}
                            >
                                <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <Text className="text-slate-400 text-xs uppercase font-bold mb-2 ml-1">ПІБ Тренера</Text>
                <TextInput value={tempName} onChangeText={setTempName} className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 mb-4 text-lg" placeholderTextColor="#475569" />
                <Text className="text-slate-400 text-xs uppercase font-bold mb-2 ml-1">Посада</Text>
                <TextInput value={tempRole} onChangeText={setTempRole} className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 mb-6 text-lg" placeholderTextColor="#475569" />
                <TouchableOpacity onPress={handleSaveProfile} className="bg-yellow-400 p-4 rounded-xl items-center mb-3">
                    <Text className="text-slate-900 font-bold text-lg uppercase">Зберегти зміни</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={startPinChange} className="bg-slate-800 border border-slate-700 p-4 rounded-xl items-center flex-row justify-center">
                    <Feather name="lock" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Text className="text-slate-400 font-bold uppercase tracking-wider">Змінити PIN-код</Text>
                </TouchableOpacity>
            </BottomModal>
        </View>
    );
}