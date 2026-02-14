import "./global.css";
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator,ScrollView } from 'react-native';
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
import { UserProvider, useUser } from './src/context/UserContext';
import { useAppLogic } from './src/hooks/useAppLogic';
import {Feather} from "@expo/vector-icons";



const AppContent = () => {
    // 1. Беремо глобального юзера
    const { user, isLoading } = useUser();

    const {
        currentTab,
        sessionsInitialTab,

        // Pin Modal State
        isPinModalVisible, setPinModalVisible,
        oldPin, setOldPin,
        newPin, setNewPin,
        confirmPin, setConfirmPin,
        isPinLoading,
        pinError,
        // Actions
        handleLogout,
        handleNavigate,
        handleOpenPinModal,
        handleSubmitPinChange
    } = useAppLogic();

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-950 justify-center items-center">
                <ActivityIndicator size="large" color="#facc15" />
            </View>
        );
    }

    if (!user) {
        return (
            <SafeAreaProvider>
                <StatusBar style="light" />
                <AuthScreen onLogin={() => {}} />
            </SafeAreaProvider>
        );
    }

    const renderScreen = () => {
        switch (currentTab) {
            case 'HOME':
                return <HomeScreen onNavigate={handleNavigate} />;
            case 'PLAYERS':
                return <PlayersScreen />;
            case 'SESSIONS':
                return <SessionsScreen key={sessionsInitialTab} initialTab={sessionsInitialTab} />;
            case 'TOOLS':
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

    // 6. Головний додаток
    return (
        <SafeAreaProvider>
            <BleProvider>
                <StatusBar style="light" />

                <MainLayout
                    currentTab={currentTab === 'TOOLS' || currentTab === 'SETTINGS' ? 'SETTINGS' : currentTab}
                    onSwitchTab={(tab) => handleNavigate(tab)}
                    onLogout={handleLogout}
                    onOpenPinChange={handleOpenPinModal}
                >
                    {renderScreen()}
                </MainLayout>

                {/* PIN Change Modal */}
                <BottomModal
                    visible={isPinModalVisible}
                    onClose={() => !isPinLoading && setPinModalVisible(false)}
                    title="Безпека"
                >
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View className="p-1">

                            {/* ПОТОЧНИЙ PIN */}
                            <Text className="text-slate-500 text-[10px] uppercase font-bold mb-2 ml-1">Поточний PIN</Text>
                            <TextInput
                                value={oldPin} onChangeText={setOldPin}
                                keyboardType="numeric" secureTextEntry maxLength={4}
                                placeholder="••••" placeholderTextColor="#334155"
                                // Якщо є помилка -> рамка стає червоною, інакше сіра
                                className={`bg-slate-950 text-white p-5 rounded-2xl border mb-4 text-2xl tracking-[0.5em] text-center font-bold ${pinError ? 'border-red-500/50' : 'border-slate-800'}`}
                            />

                            {/* НОВИЙ PIN */}
                            <Text className="text-slate-500 text-[10px] uppercase font-bold mb-2 ml-1">Новий PIN</Text>
                            <TextInput
                                value={newPin} onChangeText={setNewPin}
                                keyboardType="numeric" secureTextEntry maxLength={4}
                                placeholder="••••" placeholderTextColor="#334155"
                                className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 mb-4 text-2xl tracking-[0.5em] text-center font-bold"
                            />

                            {/* ПОВТОР PIN */}
                            <Text className="text-slate-500 text-[10px] uppercase font-bold mb-2 ml-1">Повторіть новий PIN</Text>
                            <TextInput
                                value={confirmPin} onChangeText={setConfirmPin}
                                keyboardType="numeric" secureTextEntry maxLength={4}
                                placeholder="••••" placeholderTextColor="#334155"
                                className="bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 mb-6 text-2xl tracking-[0.5em] text-center font-bold"
                            />

                            {pinError && (
                                <View className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl mb-6 flex-row items-center justify-center">
                                    <Feather name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 8 }} />
                                    <Text className="text-red-400 font-bold text-sm text-center">
                                        {pinError}
                                    </Text>
                                </View>
                            )}

                            {/* КНОПКА ЗБЕРЕГТИ */}
                            <TouchableOpacity
                                onPress={handleSubmitPinChange}
                                disabled={isPinLoading}
                                className={`bg-yellow-400 p-5 rounded-2xl items-center shadow-lg shadow-yellow-400/20 active:bg-yellow-500 ${isPinLoading ? 'opacity-50' : ''}`}
                            >
                                {isPinLoading ? (
                                    <ActivityIndicator color="#0f172a" />
                                ) : (
                                    <Text className="text-slate-900 font-black text-lg uppercase tracking-wide">Зберегти новий PIN</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </BottomModal>

            </BleProvider>
        </SafeAreaProvider>
    );
};

export default function App() {
    return (
        <UserProvider>
            <AppContent />
        </UserProvider>
    );
}