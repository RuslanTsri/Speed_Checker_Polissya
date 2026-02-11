import "./global.css";
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MainLayout } from './src/views/layout/MainLayout';
import { TabType } from './src/views/layout/Footer';
import { BottomModal } from './src/views/components/BottomModal';

import AuthScreen from './src/views/screens/AuthScreen';
import PlayersScreen from './src/views/screens/PlayersScreen';
import SessionsScreen, { SessionTabType } from './src/views/screens/SessionsScreen';
import SettingsScreen from './src/views/screens/SettingsScreen';
import HomeScreen from './src/views/screens/HomeScreen';
import BluetoothTool from './src/views/tools/BluetoothTool';

import { BleProvider } from './src/context/BleContext';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentTab, setCurrentTab] = useState<TabType | 'TOOLS'>('HOME');
    const [sessionsInitialTab, setSessionsInitialTab] = useState<SessionTabType | undefined>(undefined);

    // --- СТАН PIN-КОДУ ---
    const [isPinModalVisible, setPinModalVisible] = useState(false);
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const OLD_PIN_MOCK = "1111";
    const handleNavigate = (tab: TabType | 'TOOLS', params?: any) => {
        if (tab === 'SESSIONS') {
            setSessionsInitialTab(params?.subTab);
        } else {
            setSessionsInitialTab(undefined);
        }
        setCurrentTab(tab);
    };
    const handleOpenPinModal = () => {
        setOldPin(''); setNewPin(''); setConfirmPin(''); setPinModalVisible(true);
    };

    const handleSubmitPinChange = () => {
        if (oldPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) { Alert.alert("Помилка", "Всі поля мають містити 4 цифри"); return; }
        if (oldPin !== OLD_PIN_MOCK) { Alert.alert("Помилка", "Невірний старий PIN-код"); return; }
        if (newPin !== confirmPin) { Alert.alert("Помилка", "Нові PIN-коди не співпадають"); return; }
        Keyboard.dismiss(); setPinModalVisible(false); Alert.alert("Успіх", "PIN-код успішно змінено!");
    };

    const handleLogout = () => { setIsLoggedIn(false); setCurrentTab('HOME'); };

    const renderScreen = () => {
        switch (currentTab) {
            case 'HOME':
                // Правильно: передаємо нашу розумну функцію-обгортку
                return <HomeScreen onNavigate={handleNavigate} />;
            case 'PLAYERS': return <PlayersScreen />;
            case 'SESSIONS':
                return <SessionsScreen key={sessionsInitialTab} initialTab={sessionsInitialTab} />;
            case 'TOOLS':
                // @ts-ignore
                return <BluetoothTool onBack={() => setCurrentTab('SETTINGS')} />;

            case 'SETTINGS':
                // @ts-ignore
                return <SettingsScreen
                    onLogout={handleLogout}
                    onOpenPinChange={handleOpenPinModal}
                    onOpenBluetooth={() => setCurrentTab('TOOLS')}
                />;
            default: return null;
        }
    };

    if (!isLoggedIn) {
        return (
            <SafeAreaProvider>
                <StatusBar style="light" />
                <AuthScreen onLogin={() => setIsLoggedIn(true)} />
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <BleProvider>
                <StatusBar style="light" />
                <MainLayout
                    // @ts-ignore (якщо TOOLS немає в TabType)
                    currentTab={currentTab === 'TOOLS' ? 'SETTINGS' : currentTab}
                    onSwitchTab={(tab) => setCurrentTab(tab)}
                    onLogout={handleLogout}
                    onOpenPinChange={handleOpenPinModal}
                >
                    {renderScreen()}
                </MainLayout>

                <BottomModal visible={isPinModalVisible} onClose={() => setPinModalVisible(false)} title="Безпека">
                    <View>
                        <Text className="text-slate-400 text-xs uppercase font-bold mb-2 ml-1">Поточний PIN</Text>
                        <TextInput value={oldPin} onChangeText={setOldPin} keyboardType="numeric" secureTextEntry maxLength={4} placeholder="••••" placeholderTextColor="#475569" className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 mb-4 text-lg tracking-widest font-bold" />
                        <Text className="text-slate-400 text-xs uppercase font-bold mb-2 ml-1">Новий PIN</Text>
                        <TextInput value={newPin} onChangeText={setNewPin} keyboardType="numeric" secureTextEntry maxLength={4} placeholder="••••" placeholderTextColor="#475569" className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 mb-4 text-lg tracking-widest font-bold" />
                        <Text className="text-slate-400 text-xs uppercase font-bold mb-2 ml-1">Повторіть новий PIN</Text>
                        <TextInput value={confirmPin} onChangeText={setConfirmPin} keyboardType="numeric" secureTextEntry maxLength={4} placeholder="••••" placeholderTextColor="#475569" className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 mb-8 text-lg tracking-widest font-bold" />
                        <TouchableOpacity onPress={handleSubmitPinChange} className="bg-yellow-400 p-4 rounded-xl items-center shadow-lg shadow-yellow-400/20"><Text className="text-slate-900 font-bold text-lg uppercase">Змінити PIN-код</Text></TouchableOpacity>
                    </View>
                </BottomModal>
            </BleProvider>
        </SafeAreaProvider>
    );
}