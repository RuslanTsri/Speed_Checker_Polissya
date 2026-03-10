import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity, Animated, LayoutAnimation, UIManager, Platform, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Твої UI компоненти
import { Mod, SettingsRow } from '../components/ui/mods';
import { ArrowIcon, ArrowIconActive } from '../../../assets/icons';

// 🔥 Наш хук
import { useSupportScreen } from '../../hooks/useSupportScreen';

// Обов'язкове налаштування для Android, щоб працювала плавна зміна висоти
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 🔥 Компонент одного питання з ідеальною анімацією
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

            {/* Header */}
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
                {/* БЛОК FAQ */}
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

                {/* БЛОК КОНТАКТІВ */}
                <Text className="text-text-sub text-caption uppercase mb-4 ml-2 tracking-widest font-evolventa-bold">
                    {t('screens.support.contact_section')}
                </Text>

                <Mod title="">
                    <SettingsRow
                        title={t('screens.support.email_btn')}
                        value="support@tempometrics.com"
                        icon={<Feather name="mail" size={22} color="#A3A3A3" />}
                        onPress={handleContactSupport}
                        isLast
                    />
                </Mod>
                <SettingsRow
                    title="Політика конфіденційності"
                    icon={<Feather name="shield" size={22} color="#A3A3A3" />}
                    onPress={() => Linking.openURL('https://bejewelled-sorbet-f2399d.netlify.app')}
                    isLast // Тепер він останній, щоб не було зайвої лінії знизу
                />
                {/* Підвал з версією */}
                <View className="items-center mt-8 opacity-50">
                    <Text className="text-text-sub font-unbounded text-xs">Tempo Metrics {appVersion}</Text>
                    <Text className="text-surface-border font-evolventa text-xs mt-1">Made in ZHTU</Text>
                </View>
            </ScrollView>
        </View>
    );
}