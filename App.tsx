import "./global.css";
import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MainLayout } from './src/views/layout/MainLayout';
import { BottomModal } from './src/views/components/BottomModal';

// Screens
import AuthScreen from './src/views/screens/AuthScreen';
import PlayersScreen from './src/views/screens/PlayersScreen';
import SessionsScreen from './src/views/screens/SessionsScreen';
import SettingsScreen from './src/views/screens/SettingsScreen';
import HomeScreen from './src/views/screens/HomeScreen';
import BluetoothTool from './src/views/tools/BluetoothTool';

// Context & Logic
import { BleProvider } from './src/context/BleContext';
import { useAppLogic } from './src/hooks/useAppLogic';


import { supabase } from './src/lib/supabase';

export default function App() {
    // Вся логіка тут
    const {
        isLoggedIn,
        currentTab,
        sessionsInitialTab,

        // Pin Modal State
        isPinModalVisible, setPinModalVisible,
        oldPin, setOldPin,
        newPin, setNewPin,
        confirmPin, setConfirmPin,

        // Actions
        handleLogin,
        handleLogout,
        handleNavigate,
        handleOpenPinModal,
        handleSubmitPinChange
    } = useAppLogic();

    useEffect(() => {
        const testConnection = async () => {
            console.log("🔄 Перевірка зв'язку з Supabase...");

            // Спробуємо просто отримати сесію (це не потребує таблиць)
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error("❌ Помилка підключення:", error.message);
            } else {
                console.log("✅ Supabase клієнт ініціалізовано успішно!");
                console.log("🔗 URL:", process.env.EXPO_PUBLIC_SUPABASE_URL ? "Завантажено" : "Не знайдено");
            }
        };
        testConnection();

    }, []);
    // Логіка рендеру залишається у View, бо це UI-свіч
    const renderScreen = () => {
        switch (currentTab) {
            case 'HOME':
                return <HomeScreen onNavigate={handleNavigate} />;
            case 'PLAYERS':
                return <PlayersScreen />;
            case 'SESSIONS':
                return <SessionsScreen key={sessionsInitialTab} initialTab={sessionsInitialTab} />;
            case 'TOOLS':
                // Використовуємо handleNavigate для переходу назад
                return <BluetoothTool onBack={() => handleNavigate('SETTINGS')} />;
            case 'SETTINGS':
                return <SettingsScreen
                    onLogout={handleLogout}
                    onOpenPinChange={handleOpenPinModal}
                    onOpenBluetooth={() => handleNavigate('TOOLS')}
                />;
            default:
                return null;
        }
    };

    // 1. Екран Авторизації
    if (!isLoggedIn) {
        return (
            <SafeAreaProvider>
                <StatusBar style="light" />
                <AuthScreen onLogin={handleLogin} />
            </SafeAreaProvider>
        );
    }

    // 2. Головний додаток
    return (
        <SafeAreaProvider>
            <BleProvider>
                <StatusBar style="light" />

                <MainLayout
                    // Перетворюємо 'TOOLS' або 'SETTINGS' на валідний TabType для футера, якщо треба
                    currentTab={currentTab === 'TOOLS' || currentTab === 'SETTINGS' ? 'SETTINGS' : currentTab}
                    onSwitchTab={(tab) => handleNavigate(tab)}
                    onLogout={handleLogout}
                    onOpenPinChange={handleOpenPinModal}
                >
                    {renderScreen()}
                </MainLayout>

                {/* PIN Change Modal */}
                <BottomModal visible={isPinModalVisible} onClose={() => setPinModalVisible(false)} title="Безпека">
                    <View>
                        <Text className="text-slate-400 text-xs uppercase font-bold mb-2 ml-1">Поточний PIN</Text>
                        <TextInput
                            value={oldPin} onChangeText={setOldPin}
                            keyboardType="numeric" secureTextEntry maxLength={4}
                            placeholder="••••" placeholderTextColor="#475569"
                            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 mb-4 text-lg tracking-widest font-bold"
                        />

                        <Text className="text-slate-400 text-xs uppercase font-bold mb-2 ml-1">Новий PIN</Text>
                        <TextInput
                            value={newPin} onChangeText={setNewPin}
                            keyboardType="numeric" secureTextEntry maxLength={4}
                            placeholder="••••" placeholderTextColor="#475569"
                            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 mb-4 text-lg tracking-widest font-bold"
                        />

                        <Text className="text-slate-400 text-xs uppercase font-bold mb-2 ml-1">Повторіть новий PIN</Text>
                        <TextInput
                            value={confirmPin} onChangeText={setConfirmPin}
                            keyboardType="numeric" secureTextEntry maxLength={4}
                            placeholder="••••" placeholderTextColor="#475569"
                            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 mb-8 text-lg tracking-widest font-bold"
                        />

                        <TouchableOpacity onPress={handleSubmitPinChange} className="bg-yellow-400 p-4 rounded-xl items-center shadow-lg shadow-yellow-400/20">
                            <Text className="text-slate-900 font-bold text-lg uppercase">Змінити PIN-код</Text>
                        </TouchableOpacity>
                    </View>
                </BottomModal>

            </BleProvider>
        </SafeAreaProvider>
    );
}