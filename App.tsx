import "./global.css";
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Feather } from "@expo/vector-icons";

// Блокуємо авто-хованку заставки
SplashScreen.preventAutoHideAsync();

// Layouts & Components
import { MainLayout } from './src/views/layout/MainLayout';
import { TabType } from './src/views/layout/Footer'; // Імпортуємо тип для фіксу TS
import { AppModal } from './src/views/components/AppModal'; // Використовуй оновлену AppModal

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
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useAppLogic } from './src/hooks/useAppLogic';
import { LanguageProvider, useLanguage } from "./src/context/LanguageContext";
import './src/lib/i18n';

const AppContentWrapper = () => {
    const { t } = useTranslation();
    const { user, isLoading: isUserLoading } = useUser();
    const { isDark } = useTheme();
    const { isLangLoading } = useLanguage();

    // 🔥 ЗАВАНТАЖЕННЯ ВСІХ ВАШИХ ШРИФТІВ ЗІ СКРІНШОТА
    const [fontsLoaded] = useFonts({
        'Unbounded': require('./assets/fonts/Unbounded-Regular.ttf'),
        'Unbounded-Bold': require('./assets/fonts/Unbounded-Bold.ttf'),
        'Unbounded-Black': require('./assets/fonts/Unbounded-Black.ttf'),
        'Unbounded-Medium': require('./assets/fonts/Unbounded-Medium.ttf'),
        'Unbounded-Light': require('./assets/fonts/Unbounded-Light.ttf'),
        'Evolventa': require('./assets/fonts/Evolventa-Regular.ttf'),
        'Evolventa-Bold': require('./assets/fonts/Evolventa-Bold.ttf'),
    });

    const {
        currentTab, sessionsInitialTab, navParams,
        isPinModalVisible, setPinModalVisible,
        oldPin, setOldPin, newPin, setNewPin, confirmPin, setConfirmPin,
        isPinLoading, pinError,
        handleLogout, handleNavigate, handleOpenPinModal, handleSubmitPinChange
    } = useAppLogic();

    useEffect(() => {
        if (fontsLoaded && !isUserLoading && !isLangLoading) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, isUserLoading, isLangLoading]);

    if (!fontsLoaded) return null;

    if (isUserLoading || isLangLoading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? 'bg-surface-bg' : 'bg-brand-light'}`}>
                <ActivityIndicator size="large" color="#FF6D00" />
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
            case 'HOME': return <HomeScreen onNavigate={handleNavigate} />;
            case 'PLAYERS': return <PlayersScreen />;
            case 'SESSIONS':
                return <SessionsScreen
                    key={sessionsInitialTab}
                    initialTab={sessionsInitialTab}
                    openSession={navParams?.openSession}
                />;
            case 'TOOLS': return <BluetoothTool onBack={() => handleNavigate('SETTINGS')} />;
            case 'SETTINGS':
                return <SettingsScreen
                    onLogout={handleLogout}
                    onOpenPinChange={handleOpenPinModal}
                    onOpenBluetooth={() => handleNavigate('TOOLS')}
                />;
            default: return null;
        }
    };

    return (
        <SafeAreaProvider>
            <BleProvider>
                <StatusBar style="light" />

                <MainLayout
                    currentTab={currentTab === 'TOOLS' || currentTab === 'SETTINGS' ? 'SETTINGS' : currentTab}
                    // ✅ ВИПРАВЛЕНО TS7006: додано тип TabType
                    onSwitchTab={(tab: TabType) => handleNavigate(tab)}
                    onLogout={handleLogout}
                    onOpenPinChange={handleOpenPinModal}
                >
                    {renderScreen()}
                </MainLayout>

                {/* 🔥 ОНОВЛЕНА PIN МОДАЛКА НА ТОКЕНАХ */}
                <AppModal
                    visible={isPinModalVisible}
                    onClose={() => !isPinLoading && setPinModalVisible(false)}
                    title={t('screens.app.pin_modal_title') as string}
                    type="bottom"
                >
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View className="p-1 gap-y-4">
                            {/* Старий PIN */}
                            <View>
                                <Text className="text-text-sub text-caption uppercase font-bold mb-2 ml-1 font-evolventa tracking-widest">
                                    {t('screens.app.old_pin_label') as string}
                                </Text>
                                <TextInput
                                    value={oldPin} onChangeText={setOldPin}
                                    keyboardType="numeric" secureTextEntry maxLength={4}
                                    placeholder="••••" placeholderTextColor="#717171"
                                    className={`p-5 rounded-2xl text-h2 tracking-[0.5em] text-center font-bold border font-unbounded
                                        bg-surface-card text-text-main 
                                        ${pinError ? 'border-status-error/50' : 'border-surface-border'}`}
                                />
                            </View>

                            {/* Новий PIN */}
                            <View>
                                <Text className="text-text-sub text-caption uppercase font-bold mb-2 ml-1 font-evolventa tracking-widest">
                                    {t('screens.app.new_pin_label') as string}
                                </Text>
                                <TextInput
                                    value={newPin} onChangeText={setNewPin}
                                    keyboardType="numeric" secureTextEntry maxLength={4}
                                    placeholder="••••" placeholderTextColor="#717171"
                                    className="p-5 rounded-2xl text-h2 tracking-[0.5em] text-center font-bold border font-unbounded bg-surface-card text-text-main border-surface-border"
                                />
                            </View>

                            {/* Підтвердження PIN */}
                            <View>
                                <Text className="text-text-sub text-caption uppercase font-bold mb-2 ml-1 font-evolventa tracking-widest">
                                    {t('screens.app.confirm_pin_label') as string}
                                </Text>
                                <TextInput
                                    value={confirmPin} onChangeText={setConfirmPin}
                                    keyboardType="numeric" secureTextEntry maxLength={4}
                                    placeholder="••••" placeholderTextColor="#717171"
                                    className="p-5 rounded-2xl text-h2 tracking-[0.5em] text-center font-bold border font-unbounded bg-surface-card text-text-main border-surface-border"
                                />
                            </View>

                            {pinError && (
                                <View className="bg-status-error/10 border border-status-error/30 p-3 rounded-xl flex-row items-center justify-center">
                                    <Feather name="alert-circle" size={16} color="#f87171" style={{ marginRight: 8 }} />
                                    <Text className="text-status-error font-bold text-sm text-center font-evolventa">{pinError}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={handleSubmitPinChange}
                                disabled={isPinLoading}
                                className={`bg-brand-orange h-16 rounded-2xl items-center justify-center shadow-lg active:opacity-80 mt-2 ${isPinLoading ? 'opacity-50' : ''}`}
                            >
                                {isPinLoading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Text className="text-black font-black text-body uppercase tracking-widest font-unbounded">
                                        {t('screens.app.btn_save_pin') as string}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </AppModal>
            </BleProvider>
        </SafeAreaProvider>
    );
};

export default function App() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <UserProvider>
                    <AppContentWrapper />
                </UserProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}