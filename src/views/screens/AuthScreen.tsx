import React from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AppModal } from '../components/AppModal';
import { useAuthScreen } from '../../hooks/useAuthScreen';
import { useTheme } from '../../context/ThemeContext'; // 🔥 Імпортуємо тему

interface AuthScreenProps {
    onLogin: () => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
    const { isDark } = useTheme(); // 🔥 Беремо стейт
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
                        Tempo Metrics
                    </Text>
                    <Text className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isRegistering ? "Створення нового профілю тренера" : "Вхід до системи"}
                    </Text>
                </View>

                {/* 2. FORM */}
                <View className="w-full space-y-4">
                    {isRegistering && (
                        <View>
                            <Text className={`ml-3 mb-2 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Ваше ПІБ</Text>
                            <View className={`rounded-2xl border px-4 flex-row items-center h-14 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <Feather name="user" size={18} color={isDark ? "#64748b" : "#94a3b8"} style={{ marginRight: 10 }} />
                                <TextInput value={name} onChangeText={setName} placeholder="Прізвище та Ім'я" placeholderTextColor={isDark ? "#475569" : "#94a3b8"} className={`flex-1 text-base font-bold h-full ${isDark ? 'text-white' : 'text-slate-900'}`} autoCapitalize="words" />
                            </View>
                        </View>
                    )}

                    <View>
                        <Text className={`ml-3 mb-2 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Email (Логін)</Text>
                        <View className={`rounded-2xl border px-4 flex-row items-center h-14 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <Feather name="mail" size={18} color={isDark ? "#64748b" : "#94a3b8"} style={{ marginRight: 10 }} />
                            <TextInput value={email} onChangeText={setEmail} placeholder="coach@example.com" placeholderTextColor={isDark ? "#475569" : "#94a3b8"} keyboardType="email-address" autoCapitalize="none" className={`flex-1 text-base font-bold h-full ${isDark ? 'text-white' : 'text-slate-900'}`} />
                        </View>
                    </View>

                    <View>
                        <Text className={`ml-3 mb-2 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{isRegistering ? 'Придумайте PIN (4 цифри)' : 'Ваш PIN-код'}</Text>
                        <View className={`rounded-2xl border px-4 flex-row items-center h-16 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <Feather name="lock" size={18} color={isDark ? "#64748b" : "#94a3b8"} style={{ marginRight: 10 }} />
                            <TextInput value={pin} onChangeText={setPin} placeholder="• • • •" placeholderTextColor={isDark ? "#475569" : "#94a3b8"} keyboardType="numeric" secureTextEntry maxLength={4} className={`flex-1 text-2xl font-black tracking-[0.5em] text-center h-full ${isDark ? 'text-white' : 'text-slate-900'}`} />
                        </View>
                    </View>

                    {errorMessage && (
                        <View className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl mt-2 flex-row items-center justify-center">
                            <Feather name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 8 }} />
                            <Text className="text-red-400 font-bold text-sm text-center">{errorMessage}</Text>
                        </View>
                    )}

                    <TouchableOpacity onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8} className={`bg-yellow-400 w-full h-14 rounded-2xl items-center justify-center mt-4 shadow-lg shadow-yellow-400/20 active:bg-yellow-500 ${isLoading ? 'opacity-50' : ''}`}>
                        {isLoading ? <ActivityIndicator color="#0f172a" /> : <Text className="text-slate-900 font-black text-lg uppercase tracking-wide">{isRegistering ? 'Створити акаунт' : 'Увійти'}</Text>}
                    </TouchableOpacity>
                </View>

                {/* 3. SWITCHER */}
                <View className="mt-8 flex-row justify-center items-center">
                    <Text className={`font-medium text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{isRegistering ? 'Вже є акаунт? ' : 'Немає акаунту? '}</Text>
                    <TouchableOpacity onPress={toggleMode} className="py-2 px-1">
                        <Text className="text-yellow-500 font-bold text-sm">{isRegistering ? 'Увійти' : 'Зареєструватися'}</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <AppModal visible={showVerifyModal} onClose={handleVerifyConfirmed} title="Реєстрація успішна" type="bottom">
                <View className="items-center pb-4">
                    <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 border-4 shadow-xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                        <Feather name="mail" size={48} color={isDark ? "#facc15" : "#eab308"} />
                    </View>

                    <Text className={`text-center text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Лист вже у тебе! 🚀
                    </Text>

                    <Text className={`text-center text-base leading-6 mb-8 px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Ми відправили посилання для підтвердження на:{'\n'}
                        <Text className="text-yellow-500 font-bold text-lg">{email}</Text>
                        {'\n\n'}
                        Натисни на посилання в листі, а потім повертайся сюди для входу.
                    </Text>

                    <TouchableOpacity onPress={handleVerifyConfirmed} className="bg-yellow-400 w-full py-4 rounded-xl items-center shadow-lg shadow-yellow-400/20 active:bg-yellow-500">
                        <Text className="text-slate-900 font-black text-lg uppercase tracking-wide">
                            Зрозуміло, увійти
                        </Text>
                    </TouchableOpacity>
                </View>
            </AppModal>
        </KeyboardAvoidingView>
    );
}