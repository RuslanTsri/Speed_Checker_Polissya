import { useState } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { authService } from '../services/authService';
import { useTranslation } from 'react-i18next';

const PIN_SALT = "tempo_metrics_secure_v1";

export const useAuthScreen = (onLogin: () => void) => {
    const { t } = useTranslation();

    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setErrorMessage(null);
        setPin('');
    };

    const handleVerifyConfirmed = () => {
        setShowVerifyModal(false);
        if (isRegistering) setIsRegistering(false);
        setPin('');
        setErrorMessage(null);
    };

    const clearError = () => {
        if (errorMessage) setErrorMessage(null);
    };

    const handleSubmit = async () => {
        setErrorMessage(null);

        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            setErrorMessage(t('screens.auth.error_no_internet') as string);
            return;
        }

        const cleanEmail = email.trim();
        const cleanName = name.trim();
        const securePassword = `${pin}${PIN_SALT}`;

        if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
            setErrorMessage(t('screens.auth.error_invalid_email') as string);
            return;
        }
        if (pin.length !== 4) {
            setErrorMessage(t('screens.auth.error_invalid_pin') as string);
            return;
        }
        if (isRegistering && cleanName.length < 2) {
            setErrorMessage(t('screens.auth.error_invalid_name') as string);
            return;
        }

        setIsLoading(true);

        try {
            if (isRegistering) {
                const { error } = await authService.signUp(cleanEmail, securePassword, cleanName, pin);

                if (error) {
                    if (error.message.includes("already registered") || error.status === 400) {
                        throw new Error("ALREADY_REGISTERED");
                    }
                    throw error;
                }
                setShowVerifyModal(true);

            } else {
                const { error } = await authService.signIn(cleanEmail, securePassword);

                if (error) {
                    if (error.message.includes("Email not confirmed")) {
                        setShowVerifyModal(true);
                        return;
                    }
                    if (error.message.includes("Invalid login")) {
                        throw new Error("INVALID_LOGIN");
                    }
                    throw error;
                }
                onLogin();
            }

        } catch (e: any) {
            console.log("❌ Auth Error:", e.message);

            let finalErrorMsg = t('screens.auth.error_unknown') as string;

            if (e.message) {
                const msg = e.message.toLowerCase();

                if (msg === 'already_registered') {
                    finalErrorMsg = t('screens.auth.error_already_registered') as string;
                } else if (msg === 'invalid_login') {
                    finalErrorMsg = t('screens.auth.error_invalid_login') as string;
                }
                else if (msg.includes('rate limit') || msg.includes('too many requests')) {
                    finalErrorMsg = t('logs.errors.auth.rate_limit') as string;
                } else if (msg.includes('fetch') || msg.includes('network')) {
                    finalErrorMsg = t('logs.errors.auth.server_connection') as string;
                } else if (msg.includes('user not found')) {
                    finalErrorMsg = t('logs.errors.auth.user_not_found') as string;
                }
            }

            setErrorMessage(finalErrorMsg);

        } finally {
            setIsLoading(false);
        }
    };

    return {
        isRegistering, isLoading, errorMessage, setErrorMessage,
        showVerifyModal, handleVerifyConfirmed,
        name, setName: (text: string) => { setName(text); clearError(); },
        email, setEmail: (text: string) => { setEmail(text); clearError(); },
        pin, setPin: (text: string) => { setPin(text); clearError(); },
        handleSubmit, toggleMode
    };
};