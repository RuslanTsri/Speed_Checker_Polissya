import { useState } from 'react';
import { Linking, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

// Типізація для нашого об'єкта FAQ
interface FAQItem {
    q: string;
    a: string;
}

export const useSupportScreen = () => {
    const { t } = useTranslation();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const appVersion = "v1.0.0";
    const supportEmail = 'support@tempometrics.com'; // Заміни на реальну

    // Витягуємо перекладений масив FAQ та додаємо до кожного id
    const rawFaqs = t('screens.support.faqs', { returnObjects: true }) as FAQItem[];
    const localizedFaqs = rawFaqs.map((item, index) => ({
        id: String(index + 1),
        q: item.q,
        a: item.a
    }));

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleContactSupport = async () => {
        const osName = Platform.OS === 'ios' ? 'iOS' : 'Android';
        const osVersion = Platform.Version;

        // Беремо перекладену тему та текст листа, передаючи змінні
        const subject = t('screens.support.email_template.subject');
        const body = t('screens.support.email_template.body', {
            osName,
            osVersion,
            appVersion
        });

        const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        try {
            const canOpen = await Linking.canOpenURL(mailtoUrl);
            if (canOpen) {
                await Linking.openURL(mailtoUrl);
            } else {
                Alert.alert(
                    t('screens.support.errors.title'),
                    t('screens.support.errors.no_mail_app', { email: supportEmail })
                );
            }
        } catch (error) {
            Alert.alert(
                t('screens.support.errors.title'),
                t('screens.support.errors.open_mail_failed')
            );
        }
    };

    return {
        faqs: localizedFaqs,
        expandedId,
        toggleExpand,
        handleContactSupport,
        appVersion
    };
};