import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    TextInput,
    Image,
    ActivityIndicator,
    Pressable
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
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
    const {
        isLoading,
        userProfile,
        isNotifEnabled,
        isDarkMode,
        setIsDarkMode,
        toggleNotif,
        isEditModalVisible,
        setEditModalVisible,
        tempName, setTempName,
        tempAvatar, setTempAvatar,
        openEditModal,
        handleSaveProfile,
        handleConnectionPress,
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
            <View className="px-4 mb-6">
                <Text className="text-white text-3xl font-bold">Налаштування</Text>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

                {/* 1. КАРТКА ПРОФІЛЮ */}
                <TouchableOpacity
                    onPress={openEditModal}
                    className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex-row items-center mb-8 shadow-sm active:bg-slate-800"
                >
                    <View className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 mr-4 overflow-hidden">
                        <Image source={{ uri: userProfile.avatar }} className="w-full h-full" resizeMode="cover" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-xl font-bold mb-1">{userProfile.name}</Text>
                        <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{userProfile.role}</Text>
                    </View>
                    <View className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                        <Feather name="edit-2" size={18} color="#facc15" />
                    </View>
                </TouchableOpacity>

                {/* 2. ОБЛАДНАННЯ */}
                <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-4 ml-2">Обладнання</Text>
                <View className="bg-slate-900 rounded-3xl px-5 py-2 border border-slate-800 mb-8">
                    <SettingItem
                        icon={<Feather name="bluetooth" size={20} color="#facc15" />}
                        title="З'єднання (BLE)"
                        value="Сканувати"
                        valueColor="text-yellow-400"
                        onPress={handleConnectionPress}
                    />
                </View>

                {/* 3. СИСТЕМА */}
                <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-4 ml-2">Система</Text>
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
                <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-4 ml-2">Інше</Text>
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

            {/* МОДАЛКА РЕДАГУВАННЯ */}
            <BottomModal visible={isEditModalVisible} onClose={() => setEditModalVisible(false)} title="Редагування">
                {/* Додаємо ScrollView з фіксованим початком, щоб уникнути проблем з висотою на Android */}
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                    <View className="items-center mb-6 px-4">

                        <View className="w-24 h-24 rounded-full bg-slate-950 border-2 border-yellow-400 items-center justify-center overflow-hidden mb-6 shadow-xl">
                            <Image
                                source={{ uri: tempAvatar || userProfile.avatar }}
                                className="w-full h-full"
                                key={tempAvatar}
                            />
                        </View>

                        <Text className="text-slate-500 text-[10px] uppercase font-bold mb-4 tracking-widest text-center">
                            Оберіть аватар
                        </Text>

                        {/* Контейнер з фіксованою мінімальною висотою, щоб не було синього екрана */}
                        <View className="flex-row flex-wrap justify-center mb-6 w-full" style={{ minHeight: 120 }}>
                            {PRESET_AVATARS.map((avatarUrl, index) => (
                                <TouchableOpacity
                                    key={index}
                                    // activeOpacity={1} вимикає візуальну анімацію "блимання", яка вішає Android
                                    activeOpacity={1}
                                    onPress={() => {
                                        console.log("📸 Avatar selected:", index);
                                        setTempAvatar(avatarUrl);
                                    }}
                                    // Використовуємо прості класи Tailwind замість складних обчислень style
                                    className={`w-[52px] h-[52px] m-1.5 rounded-full overflow-hidden border-2 ${
                                        tempAvatar === avatarUrl ? 'border-yellow-400' : 'border-slate-800 opacity-40'
                                    }`}
                                >
                                    <Image source={{ uri: avatarUrl }} className="w-full h-full" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="w-full space-y-4">
                            <View>
                                <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">ПІБ Тренера</Text>
                                <TextInput
                                    value={tempName}
                                    onChangeText={setTempName}
                                    className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 text-base font-bold"
                                    placeholderTextColor="#334155"
                                />
                            </View>

                            <View className="opacity-60 mb-2">
                                <Text className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-2 ml-1">Ваша Роль (ID)</Text>
                                <View className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                                    <Text className="text-slate-400 font-bold">{userProfile.role}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveProfile}
                                disabled={isLoading}
                                activeOpacity={0.8}
                                className={`bg-yellow-400 p-5 rounded-2xl items-center mt-4 shadow-lg shadow-yellow-400/20 ${isLoading ? 'opacity-50' : ''}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#0f172a" />
                                ) : (
                                    <Text className="text-slate-900 font-black text-lg uppercase tracking-wide">Зберегти зміни</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </BottomModal>
        </View>
    );
}

// Допоміжний компонент для рядків налаштувань (SettingItem)
const SettingItem = ({ icon, title, value, isSwitch = false, switchValue, onSwitchChange, onPress, valueColor = "text-slate-500", destructive = false }: any) => (
    <TouchableOpacity
        activeOpacity={isSwitch ? 1 : 0.7}
        onPress={isSwitch ? undefined : onPress}
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
                {value && <Text className={`${valueColor} mr-2 text-sm font-medium`}>{value}</Text>}
                <Feather name="chevron-right" size={20} color={destructive ? "#ef4444" : "#64748b"} />
            </View>
        )}
    </TouchableOpacity>
);