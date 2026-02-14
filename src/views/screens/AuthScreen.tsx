import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AppModal } from '../components/AppModal';
import { useAuthScreen } from '../../hooks/useAuthScreen';

interface AuthScreenProps {
    onLogin: () => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
    const {
        isRegistering,
        isLoading,
        errorMessage,
        showVerifyModal,
        handleVerifyConfirmed,
        name, setName,
        email, setEmail,
        pin, setPin,
        handleSubmit,
        toggleMode
    } = useAuthScreen(onLogin);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-950"
        >
            <StatusBar style="light" />

            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                className="px-6"
                showsVerticalScrollIndicator={false}
            >
                {/* 1. LOGO */}
                <View className="items-center mb-8">
                    <View className="w-24 h-24 bg-slate-900 rounded-[32px] items-center justify-center mb-6 border border-slate-800 shadow-2xl shadow-black">
                        <Ionicons name="flash" size={48} color="#facc15" />
                    </View>

                    <Text className="text-white text-3xl font-black tracking-tight text-center mb-2">
                        Tempo Metrics
                    </Text>
                    <Text className="text-slate-400 text-sm text-center">
                        {isRegistering ? "Створення нового профілю тренера" : "Вхід до системи"}
                    </Text>
                </View>

                {/* 2. FORM */}
                <View className="w-full space-y-4">

                    {/* Ім'я */}
                    {isRegistering && (
                        <View>
                            <Text className="text-slate-500 ml-3 mb-2 text-[10px] uppercase font-bold tracking-widest">Ваше ПІБ</Text>
                            <View className="bg-slate-900 rounded-2xl border border-slate-800 px-4 flex-row items-center h-14">
                                <Feather name="user" size={18} color="#64748b" style={{ marginRight: 10 }} />
                                <TextInput value={name} onChangeText={setName} placeholder="Прізвище та Ім'я" placeholderTextColor="#475569" className="flex-1 text-white text-base font-bold h-full" autoCapitalize="words" />
                            </View>
                        </View>
                    )}

                    {/* Email */}
                    <View>
                        <Text className="text-slate-500 ml-3 mb-2 text-[10px] uppercase font-bold tracking-widest">Email (Логін)</Text>
                        <View className="bg-slate-900 rounded-2xl border border-slate-800 px-4 flex-row items-center h-14">
                            <Feather name="mail" size={18} color="#64748b" style={{ marginRight: 10 }} />
                            <TextInput value={email} onChangeText={setEmail} placeholder="coach@example.com" placeholderTextColor="#475569" keyboardType="email-address" autoCapitalize="none" className="flex-1 text-white text-base font-bold h-full" />
                        </View>
                    </View>

                    {/* PIN */}
                    <View>
                        <Text className="text-slate-500 ml-3 mb-2 text-[10px] uppercase font-bold tracking-widest">{isRegistering ? 'Придумайте PIN (4 цифри)' : 'Ваш PIN-код'}</Text>
                        <View className="bg-slate-900 rounded-2xl border border-slate-800 px-4 flex-row items-center h-16">
                            <Feather name="lock" size={18} color="#64748b" style={{ marginRight: 10 }} />
                            <TextInput value={pin} onChangeText={setPin} placeholder="• • • •" placeholderTextColor="#475569" keyboardType="numeric" secureTextEntry maxLength={4} className="flex-1 text-white text-2xl font-black tracking-[0.5em] text-center h-full" />
                        </View>
                    </View>

                    {errorMessage && (
                        <View className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl mt-2 flex-row items-center justify-center">
                            <Feather name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 8 }} />
                            <Text className="text-red-400 font-bold text-sm text-center">
                                {errorMessage}
                            </Text>
                        </View>
                    )}

                    {/* Кнопка */}
                    <TouchableOpacity onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8} className="bg-yellow-400 w-full h-14 rounded-2xl items-center justify-center mt-4 shadow-lg shadow-yellow-400/20 active:bg-yellow-500">
                        {isLoading ? <ActivityIndicator color="#0f172a" /> : <Text className="text-slate-900 font-black text-lg uppercase tracking-wide">{isRegistering ? 'Створити акаунт' : 'Увійти'}</Text>}
                    </TouchableOpacity>
                </View>

                {/* 3. SWITCHER */}
                <View className="mt-8 flex-row justify-center items-center">
                    <Text className="text-slate-500 font-medium text-sm">{isRegistering ? 'Вже є акаунт? ' : 'Немає акаунту? '}</Text>
                    <TouchableOpacity onPress={toggleMode} className="py-2 px-1">
                        <Text className="text-yellow-400 font-bold text-sm">{isRegistering ? 'Увійти' : 'Зареєструватися'}</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <AppModal
                visible={showVerifyModal}
                onClose={handleVerifyConfirmed}
                title="Реєстрація успішна"
                type="bottom"
            >
                <View className="items-center pb-4">
                    <View className="w-24 h-24 bg-slate-800 rounded-full items-center justify-center mb-6 border-4 border-slate-700 shadow-xl">
                        <Feather name="mail" size={48} color="#facc15" />
                    </View>

                    <Text className="text-white text-center text-xl font-bold mb-4">
                        Лист вже у тебе! 🚀
                    </Text>

                    <Text className="text-slate-400 text-center text-base leading-6 mb-8 px-2">
                        Ми відправили посилання для підтвердження на:{'\n'}
                        <Text className="text-yellow-400 font-bold text-lg">{email}</Text>
                        {'\n\n'}
                        Натисни на посилання в листі, а потім повертайся сюди для входу.
                    </Text>

                    <TouchableOpacity
                        onPress={handleVerifyConfirmed}
                        className="bg-yellow-400 w-full py-4 rounded-xl items-center shadow-lg shadow-yellow-400/20 active:bg-yellow-500"
                    >
                        <Text className="text-slate-900 font-black text-lg uppercase tracking-wide">
                            Зрозуміло, увійти
                        </Text>
                    </TouchableOpacity>
                </View>
            </AppModal>

        </KeyboardAvoidingView>
    );
}