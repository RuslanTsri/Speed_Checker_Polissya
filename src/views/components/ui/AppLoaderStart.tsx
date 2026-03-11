import React, { useEffect, useState } from 'react';
import { View, Image, Animated, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';


import InHubLogo from '../../../../assets/InHub_logo_white.svg';
import PolissyaLogo from '../../../../assets/Polissya_icon.svg';

interface AppLoaderStartProps {
    progress: number;
    statusText?: string;
}

export const AppLoaderStart = ({ progress, statusText }: AppLoaderStartProps) => {
    const { t } = useTranslation();

    const [widthAnim] = useState(new Animated.Value(0));

    useEffect(() => {

        Animated.timing(widthAnim, {
            toValue: progress,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const displayText = statusText || t('screens.loader.default_status');

    return (
        <View className="flex-1 justify-center items-center bg-[#0A0A0A]">
            <StatusBar style="light" />

            <View className="absolute top-24 w-full items-center justify-center">

                <View className="flex-row items-center justify-center ml-4">

                    <InHubLogo width={130} height={45} />

                    <Text className="text-white text-xl font-evolventa pl-10 px-4">
                        X
                    </Text>

                    <PolissyaLogo width={90} height={90} />

                </View>

            </View>

            <Image
                source={require('../../../../assets/tempometrics_white_nobackground.png')}
                style={{ width: 150, height: 150, resizeMode: 'contain' }}
            />

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