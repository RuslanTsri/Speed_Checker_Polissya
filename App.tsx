import "./global.css";
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
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
import { ThemeProvider, useTheme } from './src/context/ThemeContext'; // 🔥 ДОДАЛИ СЮДИ
import { useAppLogic } from './src/hooks/useAppLogic';
import { Feather } from "@expo/vector-icons";

// Виносимо логіку в окремий компонент, щоб мати доступ до useTheme
const AppContentWrapper = () => {
    const { user, isLoading } = useUser();
    const { isDark } = useTheme(); // 🔥 Беремо тему

    const {
        currentTab, sessionsInitialTab, navParams,
        isPinModalVisible, setPinModalVisible,
        oldPin, setOldPin, newPin, setNewPin, confirmPin, setConfirmPin,
        isPinLoading, pinError,
        handleLogout, handleNavigate, handleOpenPinModal, handleSubmitPinChange
    } = useAppLogic();

    if (isLoading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                <ActivityIndicator size="large" color="#facc15" />
            </View>
        );
    }

    if (!user) {
        return (
            <SafeAreaProvider>
                <StatusBar style={isDark ? "light" : "dark"} />
                <AuthScreen onLogin={() => {}} />
            </SafeAreaProvider>
        );
    }

    const renderScreen = () => {
        switch (currentTab) {
            case 'HOME': return <HomeScreen onNavigate={handleNavigate} />;
            case 'PLAYERS': return <PlayersScreen />;
            case 'SESSIONS': return <SessionsScreen key={sessionsInitialTab} initialTab={sessionsInitialTab} openSession={navParams?.openSession} />;
            case 'TOOLS': return <BluetoothTool onBack={() => handleNavigate('SETTINGS')} />;
            case 'SETTINGS': return <SettingsScreen onLogout={handleLogout} onOpenPinChange={handleOpenPinModal} onOpenBluetooth={() => handleNavigate('TOOLS')} />;
            default: return null;
        }
    };

    return (
        <SafeAreaProvider>
            <BleProvider>
                {/* Динамічний статус-бар */}
                <StatusBar style={isDark ? "light" : "dark"} />

                <MainLayout
                    currentTab={currentTab === 'TOOLS' || currentTab === 'SETTINGS' ? 'SETTINGS' : currentTab}
                    onSwitchTab={(tab) => handleNavigate(tab)}
                    onLogout={handleLogout}
                    onOpenPinChange={handleOpenPinModal}
                >
                    {renderScreen()}
                </MainLayout>

                {/* PIN Change Modal */}
                <BottomModal visible={isPinModalVisible} onClose={() => !isPinLoading && setPinModalVisible(false)} title="Безпека">
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View className="p-1">
                            <Text className="text-slate-500 text-[10px] uppercase font-bold mb-2 ml-1">Поточний PIN</Text>
                            <TextInput
                                value={oldPin} onChangeText={setOldPin}
                                keyboardType="numeric" secureTextEntry maxLength={4}
                                placeholder="••••" placeholderTextColor="#94a3b8"
                                className={`p-5 rounded-2xl mb-4 text-2xl tracking-[0.5em] text-center font-bold border 
                                    ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} 
                                    ${pinError ? 'border-red-500/50' : (isDark ? 'border-slate-800' : 'border-slate-200')}`}
                            />

                            <Text className="text-slate-500 text-[10px] uppercase font-bold mb-2 ml-1">Новий PIN</Text>
                            <TextInput
                                value={newPin} onChangeText={setNewPin}
                                keyboardType="numeric" secureTextEntry maxLength={4}
                                placeholder="••••" placeholderTextColor="#94a3b8"
                                className={`p-5 rounded-2xl mb-4 text-2xl tracking-[0.5em] text-center font-bold border 
                                    ${isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'}`}
                            />

                            <Text className="text-slate-500 text-[10px] uppercase font-bold mb-2 ml-1">Повторіть новий PIN</Text>
                            <TextInput
                                value={confirmPin} onChangeText={setConfirmPin}
                                keyboardType="numeric" secureTextEntry maxLength={4}
                                placeholder="••••" placeholderTextColor="#94a3b8"
                                className={`p-5 rounded-2xl mb-6 text-2xl tracking-[0.5em] text-center font-bold border 
                                    ${isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'}`}
                            />

                            {pinError && (
                                <View className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl mb-6 flex-row items-center justify-center">
                                    <Feather name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 8 }} />
                                    <Text className="text-red-400 font-bold text-sm text-center">{pinError}</Text>
                                </View>
                            )}

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

// ГОЛОВНИЙ ЕКСПОРТ (Тут ми додаємо ThemeProvider)
export default function App() {
    return (
        <ThemeProvider>
            <UserProvider>
                <AppContentWrapper />
            </UserProvider>
        </ThemeProvider>
    );
}