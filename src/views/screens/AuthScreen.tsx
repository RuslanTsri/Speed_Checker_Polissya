import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';

interface AuthScreenProps {
    onLogin: () => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');

    const handleSubmit = () => {
        // Тут пізніше буде перевірка в базі даних
        if (pin.length === 4) {
            onLogin();
        } else {
            alert("PIN має бути 4 цифри (наприклад, 1918)");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-900"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                className="px-6"
            >
                <View className="items-center mb-12">
                    <View className="w-24 h-24 bg-slate-800 rounded-full items-center justify-center mb-4 border-2 border-yellow-400 shadow-lg shadow-yellow-400/20">
                        <Text className="text-5xl">🐺</Text>
                    </View>
                    <Text className="text-yellow-400 text-3xl font-black tracking-tighter italic">
                        POLISSYA
                    </Text>
                    <Text className="text-slate-400 text-sm tracking-[0.3em] uppercase">
                        Telemetry System
                    </Text>
                </View>

                {/* Форма */}
                <View className="space-y-4">

                    {isRegistering && (
                        <View>
                            <Text className="text-slate-400 ml-2 mb-1 text-xs uppercase font-bold">Ваше Ім'я</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Олександр Усик"
                                placeholderTextColor="#475569"
                                className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:border-yellow-400 text-lg"
                            />
                        </View>
                    )}

                    <View>
                        <Text className="text-slate-400 ml-2 mb-1 text-xs uppercase font-bold">
                            {isRegistering ? 'Створіть PIN (4 цифри)' : 'Введіть PIN'}
                        </Text>
                        <TextInput
                            value={pin}
                            onChangeText={setPin}
                            placeholder="****"
                            placeholderTextColor="#475569"
                            keyboardType="numeric"
                            secureTextEntry
                            maxLength={4}
                            className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:border-yellow-400 text-center text-3xl tracking-[0.5em] font-bold"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        className="bg-yellow-400 p-4 rounded-xl items-center mt-4 shadow-lg shadow-yellow-400/20"
                    >
                        <Text className="text-slate-900 font-bold text-lg uppercase">
                            {isRegistering ? 'Зареєструватись' : 'Увійти в систему'}
                        </Text>
                    </TouchableOpacity>

                </View>

                <View className="mt-8 flex-row justify-center">
                    <Text className="text-slate-500">
                        {isRegistering ? 'Вже є акаунт? ' : 'Новий тренер? '}
                    </Text>
                    <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
                        <Text className="text-yellow-400 font-bold">
                            {isRegistering ? 'Увійти' : 'Створити акаунт'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}