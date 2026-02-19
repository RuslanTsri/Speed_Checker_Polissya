import { useState } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo'; // 🔥 Додали імпорт
import { authService } from '../services/authService';

const PIN_SALT = "tempo_metrics_secure_v1";

export const useAuthScreen = (onLogin: () => void) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    // Дані форми
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

        // 🔥 ПЕРЕВІРКА ІНТЕРНЕТУ (Авторизація не працює офлайн)
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
            setErrorMessage("Немає підключення до Інтернету. Авторизація неможлива.");
            return;
        }

        const cleanEmail = email.trim();
        const cleanName = name.trim();
        const securePassword = `${pin}${PIN_SALT}`;

        if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
            setErrorMessage("Введіть коректний Email");
            return;
        }
        if (pin.length !== 4) {
            setErrorMessage("PIN має складатись рівно з 4 цифр");
            return;
        }
        if (isRegistering && cleanName.length < 2) {
            setErrorMessage("Введіть повне ім'я (мінімум 2 літери)");
            return;
        }

        setIsLoading(true);

        try {
            if (isRegistering) {
                const { error } = await authService.signUp(cleanEmail, securePassword, cleanName, pin);

                if (error) {
                    if (error.message.includes("already registered") || error.status === 400) {
                        throw new Error("Ця пошта вже зареєстрована. Увійдіть.");
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
                        throw new Error("Невірний Email або PIN-код");
                    }
                    throw error;
                }
                onLogin();
            }

        } catch (e: any) {
            console.log("❌ Auth Error:", e.message);
            setErrorMessage(e.message || "Сталася невідома помилка");
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