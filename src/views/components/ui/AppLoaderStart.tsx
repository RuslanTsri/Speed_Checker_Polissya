import React, { useEffect, useState } from 'react';
import { View, Image, Animated, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';


import InHubLogo from '../../../../assets/InHub_logo_white.svg';
import PolissyaLogo from '../../../../assets/Polissya_icon.svg';

interface AppLoaderStartProps {
    progress: number; // від 0 до 100
    statusText?: string;
}

export const AppLoaderStart = ({ progress, statusText }: AppLoaderStartProps) => {
    const { t } = useTranslation();

    const [widthAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Анімуємо зміну ширини прогрес-бару
        Animated.timing(widthAnim, {
            toValue: progress,
            duration: 300,
            useNativeDriver: false, // Для ширини false
        }).start();
    }, [progress]);

    const displayText = statusText || t('screens.loader.default_status');

    return (
        <View className="flex-1 justify-center items-center bg-[#0A0A0A]">
            <StatusBar style="light" />

            {/* 🔥 ВЕРХНІЙ БЛОК: Логотипи партнерів */}
            <View className="absolute top-24 flex-row items-center justify-center w-full px-6">
                <InHubLogo width={130} height={45} />

                {/* Хрестик "X" між логотипами */}
                <Text className="text-white text-xl mx-5 font-evolventa">
                    X
                </Text>

                <PolissyaLogo width={50} height={50} />
            </View>

            {/* ЦЕНТРАЛЬНИЙ БЛОК: Основне лого */}
            <Image
                source={require('../../../../assets/tempometrics_white_nobackground.png')}
                style={{ width: 150, height: 150, resizeMode: 'contain' }}
            />

            {/* Контейнер для прогрес-бару */}
            <View className="w-2/3 h-2 bg-surface-card rounded-full mt-10 overflow-hidden">
                <Animated.View
                    style={{
                        height: '100%',
                        backgroundColor: '#FF6D00',
                        width: widthAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%']
                        })
                    }}
                />
            </View>

            <Text className="text-text-sub font-evolventa text-sm mt-4">
                {displayText}
            </Text>
        </View>
    );
};