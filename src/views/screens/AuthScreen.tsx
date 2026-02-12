import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// 🔥 Hook
import { useAuthScreen } from '../../hooks/useAuthScreen';

interface AuthScreenProps {
    onLogin: () => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
    // Вся логіка тут
    const {
        isRegistering,
        name, setName,
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
                {/* 1. LOGO & TITLE */}
                <View className="items-center mb-12">
                    <View className="w-28 h-28 bg-slate-900 rounded-[32px] items-center justify-center mb-8 border border-slate-800 shadow-2xl shadow-black">
                        <Ionicons name="flash" size={56} color="#facc15" />
                    </View>

                    <Text className="text-white text-4xl font-black tracking-tight text-center mb-4">
                        Tempo Metrics
                    </Text>

                    <Text className="text-slate-400 text-base font-medium text-center leading-6 px-2">
                        Точний замір швидкості футболістів.{'\n'}
                        Результати одразу в застосунку та CSV.
                    </Text>
                </View>

                {/* 2. FORM */}
                <View className="w-full space-y-5">

                    {/* Name Input (Only Registration) */}
                    {isRegistering && (
                        <View>
                            <Text className="text-slate-500 ml-3 mb-2 text-[10px] uppercase font-bold tracking-widest">
                                Ваше Ім'я
                            </Text>
                            <View className="bg-slate-900 rounded-2xl border border-slate-800 px-4 py-1 flex-row items-center">
                                <Feather name="user" size={20} color="#64748b" style={{ marginRight: 10 }} />
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Наприклад: Олександр"
                                    placeholderTextColor="#475569"
                                    className="flex-1 text-white text-lg py-4 font-bold"
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>
                    )}

                    {/* PIN Input */}
                    <View>
                        <Text className="text-slate-500 ml-3 mb-2 text-[10px] uppercase font-bold tracking-widest">
                            {isRegistering ? 'Створіть PIN (4 цифри)' : 'Введіть PIN-код'}
                        </Text>
                        <View className="bg-slate-900 rounded-2xl border border-slate-800 px-4 py-1 flex-row items-center">
                            <Feather name="lock" size={20} color="#64748b" style={{ marginRight: 10 }} />
                            <TextInput
                                value={pin}
                                onChangeText={setPin}
                                placeholder="• • • •"
                                placeholderTextColor="#475569"
                                keyboardType="numeric"
                                secureTextEntry
                                maxLength={4}
                                className="flex-1 text-white text-3xl font-black tracking-[0.5em] py-4 text-center"
                            />
                        </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        className="bg-yellow-400 w-full py-5 rounded-2xl items-center mt-4 shadow-lg shadow-yellow-400/20 active:bg-yellow-500"
                    >
                        <Text className="text-slate-900 font-black text-lg uppercase tracking-wide">
                            {isRegistering ? 'Зареєструватись' : 'Увійти'}
                        </Text>
                    </TouchableOpacity>

                </View>

                {/* 3. FOOTER SWITCHER */}
                <View className="mt-10 flex-row justify-center items-center">
                    <Text className="text-slate-500 font-medium">
                        {isRegistering ? 'Вже є акаунт? ' : 'Новий пристрій? '}
                    </Text>
                    <TouchableOpacity onPress={toggleMode} className="py-2">
                        <Text className="text-yellow-400 font-bold border-b border-yellow-400/30">
                            {isRegistering ? 'Увійти' : 'Створити акаунт'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}