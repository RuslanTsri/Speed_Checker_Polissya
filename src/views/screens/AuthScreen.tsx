import React from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { AppModal } from '../components/AppModal';
import { useAuthScreen } from '../../hooks/useAuthScreen';
import { useTheme } from '../../context/ThemeContext';

interface AuthScreenProps {
    onLogin: () => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
    const { t } = useTranslation();
    const { isDark } = useTheme();
    const {
        isRegistering, isLoading, errorMessage, showVerifyModal, handleVerifyConfirmed,
        name, setName, email, setEmail, pin, setPin, handleSubmit, toggleMode
    } = useAuthScreen(onLogin);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}
        >
            <StatusBar style={isDark ? "light" : "dark"} />

            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6" showsVerticalScrollIndicator={false}>
                {/* 1. LOGO */}
                <View className="items-center mb-8">
                    <View className={`w-24 h-24 rounded-[32px] items-center justify-center mb-6 border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 shadow-black' : 'bg-white border-slate-200 shadow-slate-300'}`}>
                        <Ionicons name="flash" size={48} color={isDark ? "#facc15" : "#eab308"} />
                    </View>

                    <Text className={`text-3xl font-black tracking-tight text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {t('screens.auth.title') as string}
                    </Text>
                    <Text className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isRegistering ? (t('screens.auth.register_subtitle') as string) : (t('screens.auth.login_subtitle') as string)}
                    </Text>
                </View>

                {/* 2. FORM */}
                <View className="w-full space-y-4">
                    {isRegistering && (
                        <View>
                            <Text className={`ml-3 mb-2 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                {t('screens.auth.label_name') as string}
                            </Text>
                            <View className={`rounded-2xl border px-4 flex-row items-center h-14 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <Feather name="user" size={18} color={isDark ? "#64748b" : "#94a3b8"} style={{ marginRight: 10 }} />
                                <TextInput
                                    value={name} onChangeText={setName}
                                    placeholder={t('screens.auth.placeholder_name') as string}
                                    placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                                    className={`flex-1 text-base font-bold h-full ${isDark ? 'text-white' : 'text-slate-900'}`}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>
                    )}

                    <View>
                        <Text className={`ml-3 mb-2 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {t('screens.auth.label_email') as string}
                        </Text>
                        <View className={`rounded-2xl border px-4 flex-row items-center h-14 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <Feather name="mail" size={18} color={isDark ? "#64748b" : "#94a3b8"} style={{ marginRight: 10 }} />
                            <TextInput
                                value={email} onChangeText={setEmail}
                                placeholder="coach@example.com" // Можна залишити хардкодом як приклад пошти
                                placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className={`flex-1 text-base font-bold h-full ${isDark ? 'text-white' : 'text-slate-900'}`}
                            />
                        </View>
                    </View>

                    <View>
                        <Text className={`ml-3 mb-2 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {isRegistering ? (t('screens.auth.label_pin_reg') as string) : (t('screens.auth.label_pin_login') as string)}
                        </Text>
                        <View className={`rounded-2xl border px-4 flex-row items-center h-16 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <Feather name="lock" size={18} color={isDark ? "#64748b" : "#94a3b8"} style={{ marginRight: 10 }} />
                            <TextInput
                                value={pin} onChangeText={setPin}
                                placeholder="• • • •"
                                placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                                keyboardType="numeric"
                                secureTextEntry maxLength={4}
                                className={`flex-1 text-2xl font-black tracking-[0.5em] text-center h-full ${isDark ? 'text-white' : 'text-slate-900'}`}
                            />
                        </View>
                    </View>

                    {errorMessage && (
                        <View className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl mt-2 flex-row items-center justify-center">
                            <Feather name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 8 }} />
                            <Text className="text-red-400 font-bold text-sm text-center">{errorMessage}</Text>
                        </View>
                    )}

                    <TouchableOpacity onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8} className={`bg-yellow-400 w-full h-14 rounded-2xl items-center justify-center mt-4 shadow-lg shadow-yellow-400/20 active:bg-yellow-500 ${isLoading ? 'opacity-50' : ''}`}>
                        {isLoading ? <ActivityIndicator color="#0f172a" /> : <Text className="text-slate-900 font-black text-lg uppercase tracking-wide">
                            {isRegistering ? (t('screens.auth.btn_register') as string) : (t('screens.auth.btn_login') as string)}
                        </Text>}
                    </TouchableOpacity>
                </View>

                {/* 3. SWITCHER */}
                <View className="mt-8 flex-row justify-center items-center">
                    <Text className={`font-medium text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        {isRegistering ? (t('screens.auth.switch_has_account') as string) : (t('screens.auth.switch_no_account') as string)}
                    </Text>
                    <TouchableOpacity onPress={toggleMode} className="py-2 px-1">
                        <Text className="text-yellow-500 font-bold text-sm">
                            {isRegistering ? (t('screens.auth.btn_login') as string) : (t('screens.auth.btn_register_short') as string)}
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <AppModal visible={showVerifyModal} onClose={handleVerifyConfirmed} title={t('screens.auth.verify_title') as string} type="bottom">
                <View className="items-center pb-4">
                    <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 border-4 shadow-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                        <Feather name="mail" size={48} color={isDark ? "#facc15" : "#eab308"} />
                    </View>

                    <Text className={`text-center text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {t('screens.auth.verify_msg_title') as string}
                    </Text>

                    {/* 🔥 Збираємо текст із двох частин та Email між ними */}
                    <Text className={`text-center text-base leading-6 mb-8 px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {t('screens.auth.verify_msg_body_1') as string}
                        <Text className="text-yellow-500 font-bold text-lg">{email}</Text>
                        {t('screens.auth.verify_msg_body_2') as string}
                    </Text>

                    <TouchableOpacity onPress={handleVerifyConfirmed} className="bg-yellow-400 w-full py-4 rounded-xl items-center shadow-lg shadow-yellow-400/20 active:bg-yellow-500">
                        <Text className="text-slate-900 font-black text-lg uppercase tracking-wide">
                            {t('screens.auth.verify_btn') as string}
                        </Text>
                    </TouchableOpacity>
                </View>
            </AppModal>
        </KeyboardAvoidingView>
    );
}