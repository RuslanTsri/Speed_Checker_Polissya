import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity, Animated, LayoutAnimation, UIManager, Platform, Linking, Image } from 'react-native'; // 🔥 Додали Image
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Mod, SettingsRow } from '../components/ui/mods';
import { ArrowIcon, ArrowIconActive } from '../../../assets/icons';

import InHubLogo from '../../../assets/InHub_logo_white.svg';
import PolissyaLogo from '../../../assets/Polissya_icon.svg';

import { useSupportScreen } from '../../hooks/useSupportScreen';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FaqItem = ({ faq, isExpanded, onPress, isLast }: any) => {
    const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(rotateAnim, {
            toValue: isExpanded ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isExpanded]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['90deg', '-90deg']
    });

    const handlePress = () => {
        LayoutAnimation.configureNext({
            duration: 300,
            create: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity
            },
            update: {
                type: LayoutAnimation.Types.easeInEaseOut
            },
            delete: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity
            }
        });
        onPress();
    };

    return (
        <View className={`overflow-hidden ${!isLast ? 'border-b border-surface-border' : ''}`}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.7}
                className="flex-row items-center justify-between p-4"
            >
                <Text className="text-text-main font-evolventa-bold text-base flex-1 pr-4">
                    {faq.q}
                </Text>

                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    {isExpanded ? <ArrowIconActive /> : <ArrowIcon />}
                </Animated.View>
            </TouchableOpacity>

            {isExpanded && (
                <View className="px-4 pb-4">
                    <Text className="text-text-sub font-evolventa leading-6">
                        {faq.a}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default function SupportScreen({ onBack }: { onBack: () => void }) {
    const { t } = useTranslation();
    const { faqs, expandedId, toggleExpand, handleContactSupport, appVersion } = useSupportScreen();

    return (
        <View className="flex-1 pt-4 relative">

            <View className="px-4 mb-6 flex-row items-center">
                <Pressable
                    onPress={onBack}
                    className="mr-4 p-2 justify-center items-center -rotate-90"
                >
                    {({ pressed }) => (
                        pressed ? <ArrowIconActive /> : <ArrowIcon />
                    )}
                </Pressable>

                <Text className="text-h2 text-text-main font-unbounded-bold">
                    {t('screens.support.title')}
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <Text className="text-text-sub text-caption uppercase mb-4 ml-2 tracking-widest font-evolventa-bold">
                    {t('screens.support.faq_section')}
                </Text>

                <Mod title="" className="mb-8">
                    {faqs.map((faq, index) => (
                        <FaqItem
                            key={faq.id}
                            faq={faq}
                            isExpanded={expandedId === faq.id}
                            onPress={() => toggleExpand(faq.id)}
                            isLast={index === faqs.length - 1}
                        />
                    ))}
                </Mod>

                <Text className="text-text-sub text-caption uppercase mb-4 ml-2 tracking-widest font-evolventa-bold">
                    {t('screens.support.contact_section')}
                </Text>

                <Mod title="">
                    <SettingsRow
                        title={t('screens.support.email_btn')}
                        value="sciencepark@ztu.edu.ua"
                        icon={<Feather name="mail" size={22} color="#A3A3A3" />}
                        onPress={handleContactSupport}
                        isLast
                    />
                </Mod>

                <View className="mt-4 bg-surface-card rounded-3xl border border-surface-border overflow-hidden">
                    <SettingsRow
                        title={t('screens.support.privacy_policy')}
                        icon={<Feather name="shield" size={22} color="#A3A3A3" />}
                        onPress={() => Linking.openURL('https://bejewelled-sorbet-f2399d.netlify.app')}
                        isLast
                    />
                </View>

                <View className="items-center mt-12 mb-6 opacity-40">

                    <Text className="text-text-sub font-unbounded text-[10px] tracking-wider">
                        TEMPO METRICS {appVersion}
                    </Text>
                    <View className="flex-row items-center justify-center gap-6 mb-5">
                        <InHubLogo width={70} height={24} />

                        <Image
                            source={require('../../../assets/tempometrics_white_nobackground.png')}
                            style={{ width: 45, height: 45, resizeMode: 'contain' }}
                        />

                        <PolissyaLogo width={40} height={40} />
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}