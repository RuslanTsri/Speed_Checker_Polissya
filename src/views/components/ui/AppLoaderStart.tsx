import React, { useEffect, useState } from 'react';
import { View, Image, Animated, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

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

            {/* Твоє лого */}
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