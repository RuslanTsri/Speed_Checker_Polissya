import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Image, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BottomModal } from '../components/BottomModal';
import { useSettingsScreen } from '../../hooks/useSettingsScreen';

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
    // 🔥 Вся логіка тепер тут
    const {
        isLoading,
        userProfile,
        bleStatus,
        connectionText,
        connectionColor,
        isNotifEnabled,
        isDarkMode,
        setIsDarkMode,
        toggleNotif,

        // Modal State
        isEditModalVisible,
        setEditModalVisible,
        tempName, setTempName,
        tempRole, setTempRole,
        tempAvatar, setTempAvatar,

        // Handlers
        handleConnectionPress,
        openEditModal,
        handleSaveProfile,
        startPinChange,
        handleFAQ,
        handleExport
    } = useSettingsScreen({ onOpenPinChange, onOpenBluetooth });

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-950 items-center justify-center">
                <ActivityIndicator size="large" color="#facc15" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-950 pt-4">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 mb-6">
                <Text className="text-white text-3xl font-bold">Налаштування</Text>
            </View>

            <ScrollView className="flex-1 px-4">

                {/* 1. ПРОФІЛЬ (Картка) */}
                <TouchableOpacity
                    onPress={openEditModal}
                    className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex-row items-center mb-8 shadow-sm active:bg-slate-800"
                >
                    <View className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 mr-4 overflow-hidden">
                        <Image source={{ uri: userProfile.avatar }} className="w-full h-full" resizeMode="cover" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-xl font-bold mb-1">{userProfile.name}</Text>
                        <Text className="text-slate-400 text-sm mb-2">{userProfile.role}</Text>

                        <View className="flex-row items-center">
                            <View className={`w-2 h-2 rounded-full mr-2 ${bleStatus.connected ? 'bg-green-400' : 'bg-slate-500'}`} />
                            <Text className={`text-xs font-bold ${bleStatus.connected ? 'text-green-400' : 'text-slate-500'}`}>
                                {bleStatus.connected ? 'ONLINE' : 'OFFLINE'}
                            </Text>
                        </View>
                    </View>
                    <View className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                        <Feather name="edit-2" size={18} color="#facc15" />
                    </View>
                </TouchableOpacity>

                {/* 2. ПІДКЛЮЧЕННЯ */}
                <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-4 ml-2">Обладнання</Text>
                <View className="bg-slate-900 rounded-3xl px-5 py-2 border border-slate-800 mb-8">
                    <SettingItem
                        icon={bleStatus.pingProgress ? <ActivityIndicator size="small" color="#facc15" /> : <Feather name="bluetooth" size={20} color="#facc15" />}
                        title="З'єднання (STM32)"
                        value={connectionText}
                        valueColor={connectionColor}
                        onPress={handleConnectionPress}
                    />
                    <SettingItem
                        icon={<Ionicons name="battery-charging" size={20} color="#4ade80" />}
                        title="Заряд датчиків"
                        value="98%"
                        valueColor="text-green-400"
                        onPress={() => {}}
                    />
                </View>

                {/* 3. ЗАГАЛЬНІ */}
                <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-4 ml-2">Система</Text>
                <View className="bg-slate-900 rounded-3xl px-5 py-2 border border-slate-800 mb-8">
                    <SettingItem
                        icon={<Feather name="bell" size={20} color="#94a3b8" />}
                        title="Сповіщення"
                        isSwitch
                        switchValue={isNotifEnabled}
                        onSwitchChange={toggleNotif}
                    />
                    <SettingItem
                        icon={<Feather name={isDarkMode ? "moon" : "sun"} size={20} color="#94a3b8" />}
                        title="Темна тема"
                        isSwitch
                        switchValue={isDarkMode}
                        onSwitchChange={() => setIsDarkMode(!isDarkMode)}
                    />
                    <SettingItem
                        icon={<Feather name="help-circle" size={20} color="#60a5fa" />}
                        title="FAQ та Допомога"
                        onPress={handleFAQ}
                    />
                </View>

                {/* 4. ІНШЕ */}
                <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-4 ml-2">Інше</Text>
                <View className="bg-slate-900 rounded-3xl px-5 py-2 border border-slate-800 mb-10">
                    <SettingItem
                        icon={<Feather name="file-text" size={20} color="#94a3b8" />}
                        title="Експорт усіх даних (PDF)"
                        onPress={handleExport}
                    />
                    <SettingItem
                        icon={<Feather name="log-out" size={20} color="#ef4444" />}
                        title="Вийти з акаунту"
                        destructive
                        onPress={onLogout}
                    />
                </View>

            </ScrollView>

            {/* МОДАЛКА РЕДАГУВАННЯ ПРОФІЛЮ */}
            <BottomModal visible={isEditModalVisible} onClose={() => setEditModalVisible(false)} title="Редагування">
                <View className="items-center mb-6">
                    <View className="w-24 h-24 rounded-full bg-slate-900 border-2 border-yellow-400 items-center justify-center overflow-hidden mb-6">
                        <Image source={{ uri: tempAvatar || userProfile.avatar }} className="w-full h-full" />
                    </View>

                    <Text className="text-slate-400 text-xs uppercase font-bold mb-3 tracking-widest">Оберіть аватар</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6">
                        {PRESET_AVATARS.map((avatarUrl, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setTempAvatar(avatarUrl)}
                                className={`w-14 h-14 rounded-full mr-3 border-2 overflow-hidden ${tempAvatar === avatarUrl ? 'border-yellow-400 opacity-100' : 'border-slate-800 opacity-40'}`}
                            >
                                <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View className="w-full">
                        <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-2 ml-1">ПІБ Тренера</Text>
                        <TextInput
                            value={tempName}
                            onChangeText={setTempName}
                            className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 mb-4 text-lg"
                            placeholderTextColor="#475569"
                        />

                        <Text className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-2 ml-1">Посада</Text>
                        <TextInput
                            value={tempRole}
                            onChangeText={setTempRole}
                            className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 mb-8 text-lg"
                            placeholderTextColor="#475569"
                        />

                        <TouchableOpacity onPress={handleSaveProfile} className="bg-yellow-400 p-5 rounded-2xl items-center mb-3 shadow-lg shadow-yellow-400/20">
                            <Text className="text-slate-900 font-bold text-lg uppercase">Зберегти</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={startPinChange} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl items-center flex-row justify-center">
                            <Feather name="lock" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                            <Text className="text-slate-400 font-bold uppercase tracking-wider">Змінити PIN-код</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomModal>
        </View>
    );
}

// Виніс компонент елементу налаштувань, щоб не засмічувати основну функцію
const SettingItem = ({ icon, title, value, isSwitch = false, switchValue, onSwitchChange, onPress, valueColor = "text-slate-500", destructive = false }: any) => (
    <TouchableOpacity
        activeOpacity={isSwitch ? 1 : 0.7}
        onPress={isSwitch ? () => {} : onPress}
        className="flex-row items-center justify-between py-4 border-b border-slate-800 last:border-0"
    >
        <View className="flex-row items-center flex-1 mr-4">
            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${destructive ? 'bg-red-500/10' : 'bg-slate-800 border border-slate-700'}`}>
                {icon}
            </View>
            <Text className={`text-base font-bold ${destructive ? 'text-red-400' : 'text-white'}`}>
                {title}
            </Text>
        </View>

        {isSwitch ? (
            <Switch
                trackColor={{ false: "#334155", true: "#facc15" }}
                thumbColor={switchValue ? "#fff" : "#94a3b8"}
                onValueChange={onSwitchChange}
                value={switchValue}
            />
        ) : (
            <View className="flex-row items-center">
                {value && (
                    <Text className={`${valueColor} mr-2 text-sm font-medium`}>
                        {value}
                    </Text>
                )}
                <Feather name="chevron-right" size={20} color={destructive ? "#ef4444" : "#64748b"} />
            </View>
        )}
    </TouchableOpacity>
);