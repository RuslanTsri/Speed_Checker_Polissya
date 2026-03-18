import "./global.css";
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Feather } from "@expo/vector-icons";
import * as NavigationBar from 'expo-navigation-bar';

SplashScreen.preventAutoHideAsync();

import { MainLayout } from './src/views/layout/MainLayout';
import { TabType } from './src/views/layout/Footer';
import { AppModal } from './src/views/components/AppModal';
import { AppLoaderStart } from './src/views/components/ui/AppLoaderStart';

import AuthScreen from './src/views/screens/AuthScreen';
import PlayersScreen from './src/views/screens/PlayersScreen';
import SessionsScreen from './src/views/screens/SessionsScreen';
import SettingsScreen from './src/views/screens/SettingsScreen';
import HomeScreen from './src/views/screens/HomeScreen';
import BluetoothTool from './src/views/tools/BluetoothTool';

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

    const [isMinimumTimeElapsed, setIsMinimumTimeElapsed] = useState(false);

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
        handleLogout, handleNavigate, handleOpenPinModal, handleSubmitPinChange,
        homeActiveTool, setHomeActiveTool,
        sessionDetailsOpen, setSessionDetailsOpen
    } = useAppLogic();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMinimumTimeElapsed(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    let loadProgress = 0;
    let loadStatus = "Ініціалізація...";

    if (fontsLoaded) loadProgress += 30;
    if (!isLangLoading) loadProgress += 30;
    if (!isUserLoading) loadProgress += 40;

    if (fontsLoaded && !isLangLoading && !isUserLoading) {
        loadStatus = "Ready to start...";
    } else if (fontsLoaded && !isLangLoading) {
        loadStatus = "Checking session...";
    } else if (fontsLoaded) {
        loadStatus = "Loading Language...";
    }

    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setPositionAsync('absolute');
            NavigationBar.setBackgroundColorAsync('#ffffff00');
            NavigationBar.setButtonStyleAsync('light');
        }
    }, []);

    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    if (!fontsLoaded || isUserLoading || isLangLoading || !isMinimumTimeElapsed) {
        return <AppLoaderStart progress={loadProgress} statusText={loadStatus} />;
    }

    if (!user) {
        return (
            <>
                <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
                <AuthScreen onLogin={() => {}} />
            </>
        );
    }

    const renderScreen = () => {
        switch (currentTab) {
            case 'HOME':
                return <HomeScreen
                    onNavigate={handleNavigate}
                    externalTool={homeActiveTool}
                    setExternalTool={setHomeActiveTool}
                />;
            case 'PLAYERS': return <PlayersScreen />;
            case 'SESSIONS':
                return <SessionsScreen
                    key={sessionsInitialTab}
                    initialTab={sessionsInitialTab}
                    openSession={navParams?.openSession}
                    openTeam={navParams?.openTeam} // 🔥 ОСЬ ЦЕЙ РЯДОК ВСЕ ЛАГОДИТЬ!
                    sessionDetailsOpen={sessionDetailsOpen}
                    setSessionDetailsOpen={setSessionDetailsOpen}
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
        <BleProvider>
            <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

            <MainLayout
                currentTab={currentTab === 'TOOLS' || currentTab === 'SETTINGS' ? 'SETTINGS' : currentTab}
                onSwitchTab={(tab: TabType) => handleNavigate(tab)}
                onLogout={handleLogout}
                onOpenPinChange={handleOpenPinModal}
            >
                {renderScreen()}
            </MainLayout>

            <AppModal
                visible={isPinModalVisible}
                onClose={() => !isPinLoading && setPinModalVisible(false)}
                title={t('screens.app.pin_modal_title') as string}
                type="bottom"
            >
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View className="p-1 gap-y-4">
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
    );
};

export default function App() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <UserProvider>
                    <SafeAreaProvider>
                        <AppContentWrapper />
                    </SafeAreaProvider>
                </UserProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}