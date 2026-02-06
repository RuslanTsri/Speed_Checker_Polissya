import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Image } from 'react-native';
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
    const [isNotifEnabled, setIsNotifEnabled] = useState(true);
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);

    const [userProfile, setUserProfile] = useState({
        name: "Руслан Цимбалюк",
        role: "Головний аналітик",
        initials: "РЦ",
        avatar: PRESET_AVATARS[0]
    });

    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempRole, setTempRole] = useState('');
    const [tempAvatar, setTempAvatar] = useState<string>(PRESET_AVATARS[0]);


    const openEditModal = () => {
        setTempName(userProfile.name);
        setTempRole(userProfile.role);
        setTempAvatar(userProfile.avatar);
        setEditModalVisible(true);
    };

    const handleSaveProfile = () => {
        if (!tempName.trim()) {
            Alert.alert("Помилка", "Ім'я не може бути порожнім");
            return;
        }
        const words = tempName.trim().split(' ');
        const newInitials = words.length > 1
            ? (words[0][0] + words[1][0]).toUpperCase()
            : words[0].substring(0, 2).toUpperCase();

        setUserProfile({
            name: tempName,
            role: tempRole,
            initials: newInitials,
            avatar: tempAvatar
        });
        setEditModalVisible(false);
    };

    const startPinChange = () => {
        setEditModalVisible(false);
        setTimeout(() => {
            onOpenPinChange();
        }, 300);
    };

    const SettingItem = ({ icon, title, value, isSwitch = false, onPress, color = "text-white" }: any) => (
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
                <Switch
                    trackColor={{ false: "#334155", true: "#facc15" }}
                    thumbColor={value ? "#fff" : "#94a3b8"}
                    onValueChange={onPress}
                    value={value}
                />
            ) : (
                <View className="flex-row items-center">
                    {value && <Text className="text-slate-500 mr-2 text-sm">{value}</Text>}
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
        <View className="flex-1">
            <ScrollView className="flex-1 px-4 pt-4">
                {/* ПРОФІЛЬ */}
                <View className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex-row items-center mb-8 shadow-md">
                    <View className="w-16 h-16 bg-slate-700 rounded-full items-center justify-center mr-4 border-2 border-slate-600 overflow-hidden">
                        <Image source={{ uri: userProfile.avatar }} className="w-full h-full" resizeMode="cover" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-xl font-bold">{userProfile.name}</Text>
                        <Text className="text-slate-400 text-sm">{userProfile.role}</Text>
                        <View className="flex-row mt-2">
                            <View className="bg-green-500/20 px-2 py-0.5 rounded mr-2 border border-green-500/30">
                                <Text className="text-green-400 text-[10px] font-bold uppercase">Online</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={openEditModal} className="bg-slate-700 p-3 rounded-xl border border-slate-600 active:bg-slate-600">
                        <Feather name="edit-2" size={18} color="#facc15" />
                    </TouchableOpacity>
                </View>

                <Section title="Датчики та Обладнання">
                    <SettingItem icon={<Feather name="wifi" size={20} color="#facc15" />} title="Статус з'єднання" value="Підключено (ESP32)" onPress={() => Alert.alert("Інфо", "Ping: 24ms")} />
                    <SettingItem icon={<Ionicons name="battery-charging" size={20} color="#facc15" />} title="Заряд датчиків" value="В розробці" onPress={() => {}} />
                </Section>
                <Section title="Система">
                    <SettingItem icon={<Feather name="bell" size={20} color="#94a3b8" />} title="Сповіщення" isSwitch value={isNotifEnabled} onPress={() => setIsNotifEnabled(!isNotifEnabled)} />
                    <SettingItem icon={<Feather name="volume-2" size={20} color="#94a3b8" />} title="Звук при фініші" isSwitch value={isSoundEnabled} onPress={() => setIsSoundEnabled(!isSoundEnabled)} />
                </Section>
                <Section title="Керування даними">
                    <SettingItem icon={<Feather name="file-text" size={20} color="#94a3b8" />} title="Експорт у PDF" onPress={() => Alert.alert("Експорт", "Звіт формується...")} />
                    <SettingItem icon={<Feather name="trash-2" size={20} color="#ef4444" />} title="Очистити кеш" onPress={() => Alert.alert("Успіх", "Кеш очищено")} color="text-red-400" />
                </Section>

                <TouchableOpacity onPress={onLogout} className="bg-red-900/20 border border-red-900 p-4 rounded-xl flex-row justify-center items-center mb-10 mt-2">
                    <Feather name="log-out" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                    <Text className="text-red-500 font-bold uppercase tracking-widest">Вийти з акаунту</Text>
                </TouchableOpacity>
            </ScrollView>

            <BottomModal visible={isEditModalVisible} onClose={() => setEditModalVisible(false)} title="Редагування профілю">
                <View className="items-center mb-6">
                    <View className="w-24 h-24 rounded-full bg-slate-800 border-2 border-yellow-400 items-center justify-center overflow-hidden mb-4">
                        <Image source={{ uri: tempAvatar }} className="w-full h-full" />
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