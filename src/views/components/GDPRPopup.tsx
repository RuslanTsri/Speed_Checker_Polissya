import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { AppModal } from './AppModal';
// Імпортуємо твій кастомний Switch (перевір шлях до файлу!)
import { Switch } from './ui/Switch';

const GDPR_STORAGE_KEY = '@tempo_metrics_gdpr_consent';

interface GDPRPopupProps {
    forceVisible?: boolean;
    onClose?: () => void;
}

export const GDPRPopup = ({ forceVisible, onClose }: GDPRPopupProps) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

    const PRIVACY_POLICY_URL = 'https://bejewelled-sorbet-f2399d.netlify.app/';

    useEffect(() => {
        if (forceVisible) setIsVisible(true);
    }, [forceVisible]);

    useEffect(() => {
        const checkConsent = async () => {
            try {
                const value = await AsyncStorage.getItem(GDPR_STORAGE_KEY);
                if (!value) setIsVisible(true);
            } catch (e) {
                console.error("GDPR Check Error:", e);
            } finally {
                setIsChecking(false);
            }
        };
        checkConsent();
    }, []);

    const handleAccept = async () => {
        try {
            const consentData = JSON.stringify({
                acceptedAt: new Date().toISOString(),
                analytics: analyticsEnabled,
                technical: true
            });
            await AsyncStorage.setItem(GDPR_STORAGE_KEY, consentData);
            setIsVisible(false);
            if (onClose) onClose();
        } catch (e) {
            console.error("Save Consent Error:", e);
        }
    };

    if (isChecking && !forceVisible) return null;

    return (
        <AppModal
            visible={isVisible}
            title={t('components.gdpr_popup.title')}
            type="bottom"
            onClose={() => {
                setIsVisible(false);
                if (onClose) onClose();
            }}
        >
            <View className="pb-6 w-full">
                <Text className="text-text-sub font-evolventa text-[11px] mb-5 leading-4">
                    {t('components.gdpr_popup.description')}
                </Text>

                <View className="gap-y-3 mb-6">
                    {/* Технічні дані (Завжди активні, без можливості зміни) */}
                    <View className="flex-row items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                        <View className="flex-1 pr-4">
                            <Text className="text-text-main font-bold text-xs font-unbounded">
                                {t('components.gdpr_popup.essential_title')}
                            </Text>
                            <Text className="text-text-sub text-[10px] mt-1 font-evolventa">
                                {t('components.gdpr_popup.essential_desc')}
                            </Text>
                        </View>
                        <Switch
                            active={true}
                            onChange={() => {}} // Пуста функція, бо це обов'язково
                        />
                    </View>

                    {/* Аналітика (Керована користувачем) */}
                    <View className="flex-row items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                        <View className="flex-1 pr-4">
                            <Text className="text-text-main font-bold text-xs font-unbounded">
                                {t('components.gdpr_popup.analytics_title')}
                            </Text>
                            <Text className="text-text-sub text-[10px] mt-1 font-evolventa">
                                {t('components.gdpr_popup.analytics_desc')}
                            </Text>
                        </View>
                        <Switch
                            active={analyticsEnabled}
                            onChange={setAnalyticsEnabled}
                        />
                    </View>
                </View>

                <Text className="text-text-sub text-[10px] text-center mb-5 px-4 font-evolventa">
                    {t('components.gdpr_popup.privacy_policy_prefix')}
                    <Text
                        className="text-brand-orange underline"
                        onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
                    >
                        {t('components.gdpr_popup.privacy_policy_link')}
                    </Text>.
                </Text>

                <View className="bg-brand-orange/5 p-3 rounded-xl border border-brand-orange/10 mb-5">
                    <Text className="text-brand-orange text-[9px] text-center font-evolventa leading-3">
                        {t('components.gdpr_popup.warning_note')}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleAccept}
                    activeOpacity={0.7}
                    className="bg-brand-orange h-14 rounded-2xl items-center justify-center shadow-md"
                >
                    <Text className="text-black font-black text-xs uppercase font-unbounded tracking-tighter">
                        {t('components.gdpr_popup.submit_btn')}
                    </Text>
                </TouchableOpacity>
            </View>
        </AppModal>
    );
};