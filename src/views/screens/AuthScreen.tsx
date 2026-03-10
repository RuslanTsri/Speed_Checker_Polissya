import React from 'react';
import {View, Text, KeyboardAvoidingView, Platform, ScrollView, Linking} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

// 🔥 Наші компоненти
import { AppModal } from '../components/AppModal';
import { useAuthScreen } from '../../hooks/useAuthScreen';
import { TextField } from '../components/ui/TextField';
import { AppBackground } from '../components/ui/AppBackground';
import { Button } from '../components/ui/Button';

interface AuthScreenProps {
    onLogin: () => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
    const { t } = useTranslation();
    const {
        isRegistering, isLoading, errorMessage, showVerifyModal, handleVerifyConfirmed,
        name, setName, email, setEmail, pin, setPin, handleSubmit, toggleMode
    } = useAuthScreen(onLogin);

    return (
        <AppBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <StatusBar style="light" />

                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    className="px-8"
                    showsVerticalScrollIndicator={false}
                >
                    {/* 1. ЛОГОТИП ТА ЗАГОЛОВОК */}
                    <View className="items-center mb-10">
                        <View className="w-24 h-24 rounded-[32px] items-center justify-center mb-6 bg-surface-card border border-surface-border shadow-2xl">
                            <Ionicons name="flash" size={48} color="#FF6D00" />
                        </View>

                        <Text className="text-h1 font-black tracking-tight text-center mb-2 text-text-main font-unbounded">
                            TEMPO METRICS
                        </Text>
                        <Text className="text-body text-center text-text-sub px-4 font-evolventa">
                            {isRegistering ? t('screens.auth.register_subtitle') : t('screens.auth.login_subtitle')}
                        </Text>
                    </View>

                    {/* 2. ФОРМА ВВОДУ */}
                    <View className="w-full gap-y-4">
                        {isRegistering && (
                            <TextField
                                label={t('screens.auth.label_name')}
                                value={name}
                                onChangeText={setName}
                                placeholder={t('screens.auth.placeholder_name')}
                                icon={<Feather name="user" size={18} color="#717171" />}
                                autoCapitalize="words"
                            />
                        )}

                        <TextField
                            label={t('screens.auth.label_email')}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="coach@example.com"
                            icon={<Feather name="mail" size={18} color="#717171" />}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TextField
                            label={isRegistering ? t('screens.auth.label_pin_reg') : t('screens.auth.label_pin_login')}
                            value={pin}
                            onChangeText={setPin}
                            placeholder="• • • •"
                            icon={<Feather name="lock" size={18} color="#717171" />}
                            keyboardType="numeric"
                            secureTextEntry
                            maxLength={4}
                            error={errorMessage || undefined}
                        />

                        <Button
                            title={isRegistering ? t('screens.auth.btn_register') : t('screens.auth.btn_login')}
                            variant="primary"
                            isLoading={isLoading}
                            onPress={handleSubmit}
                            className="mt-6"
                        />
                    </View>

                    {/* 3. ПЕРЕМИКАЧ РЕЖИМІВ */}
                    <View className="mt-10 items-center">
                        <Text className="text-text-muted text-small mb-2 font-evolventa">
                            {isRegistering ? t('screens.auth.switch_has_account') : t('screens.auth.switch_no_account')}
                        </Text>
                        <Button
                            title={isRegistering ? t('screens.auth.btn_login') : t('screens.auth.btn_register_short')}
                            variant="outline"
                            onPress={toggleMode}
                            className="w-full"
                        />
                    </View>
                    <View className="mt-8 mb-4 items-center px-4">
                        <Text className="text-text-muted text-xs text-center font-evolventa leading-5">
                            Продовжуючи, ви погоджуєтесь з нашою{' '}
                            <Text
                                className="text-brand-orange underline font-evolventa-bold"
                                onPress={() => Linking.openURL('https://bejewelled-sorbet-f2399d.netlify.app')}
                            >
                                Політикою конфіденційності
                            </Text>
                        </Text>
                    </View>
                </ScrollView>

                {/* 4. МОДАЛКА ПІДТВЕРДЖЕННЯ (Поза ScrollView для коректного відображення) */}
                <AppModal
                    visible={showVerifyModal}
                    onClose={handleVerifyConfirmed}
                    title={t('screens.auth.verify_title')}
                    type="bottom"
                >
                    <View className="items-center pb-6">
                        <View className="w-20 h-20 rounded-full bg-brand-orange/10 items-center justify-center mb-6 border border-brand-orange/20">
                            <Feather name="mail" size={40} color="#FF6D00" />
                        </View>

                        <Text className="text-center text-h3 font-bold mb-4 text-text-main font-unbounded">
                            {t('screens.auth.verify_msg_title')}
                        </Text>

                        <Text className="text-center text-text-sub leading-6 mb-8 px-4 font-evolventa">
                            {t('screens.auth.verify_msg_body_1')}{' '}
                            <Text className="text-brand-orange font-bold">{email}</Text>
                            {t('screens.auth.verify_msg_body_2')}
                        </Text>

                        <Button
                            title={t('screens.auth.verify_btn')}
                            variant="primary"
                            onPress={handleVerifyConfirmed}
                            className="w-full"
                        />
                    </View>
                </AppModal>
            </KeyboardAvoidingView>
        </AppBackground>
    );
}