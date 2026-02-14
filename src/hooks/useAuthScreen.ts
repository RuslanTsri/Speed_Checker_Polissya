import { useState } from 'react';
import { Alert } from 'react-native';
import { authService } from '../services/authService';

const PIN_SALT = "tempo_metrics_secure_v1";

export const useAuthScreen = (onLogin: () => void) => {
    // Режим: true = Реєстрація, false = Вхід
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Стан для модалки успіху/нагадування про пошту
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    // Дані форми
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');

    // Перемикач режимів (Вхід <-> Реєстрація)
    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setPin(''); // Очищаємо пін для безпеки
    };

    // Дія при закритті модалки "Перевірте пошту"
    const handleVerifyConfirmed = () => {
        setShowVerifyModal(false);
        // Якщо ми були в реєстрації, перекидаємо на вхід
        if (isRegistering) {
            setIsRegistering(false);
        }
        setPin('');
    };

    const handleSubmit = async () => {
        const cleanEmail = email.trim();
        const cleanName = name.trim();
        const securePassword = `${pin}${PIN_SALT}`;

        // --- 1. ВАЛІДАЦІЯ ---
        if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
            Alert.alert("Помилка", "Введіть коректний Email");
            return;
        }
        if (pin.length !== 4) {
            Alert.alert("Помилка", "PIN має складатись рівно з 4 цифр");
            return;
        }
        if (isRegistering && cleanName.length < 2) {

            Alert.alert("Помилка", "Введіть повне ім'я (мінімум 2 літери)");
            return;
        }

        setIsLoading(true);

        try {
            if (isRegistering) {
                // ==========================
                // ЛОГІКА РЕЄСТРАЦІЇ
                // ==========================
                const { error } = await authService.signUp(cleanEmail, securePassword, cleanName, pin);

                if (error) {
                    if (error.message.includes("already registered") || error.status === 400) {
                        throw new Error("Ця пошта вже зареєстрована. Спробуйте увійти.");
                    }
                    throw error;
                }

                // ✅ Успіх реєстрації -> Показуємо модалку
                setShowVerifyModal(true);

            } else {
                // ==========================
                // ЛОГІКА ВХОДУ
                // ==========================
                const { error } = await authService.signIn(cleanEmail, securePassword);

                if (error) {
                    // ⚠️ Спеціальний кейс: Пароль вірний, але пошта не підтверджена
                    if (error.message.includes("Email not confirmed")) {
                        // Показуємо ту саму модалку, щоб нагадати про лист
                        setShowVerifyModal(true);
                        return;
                    }

                    // Інші помилки входу
                    if (error.message.includes("Invalid login")) {
                        throw new Error("Невірний Email або PIN-код");
                    }
                    throw error;
                }

                // ✅ Успішний вхід -> Ніяких модалок, йдемо в додаток
                onLogin();
            }

        } catch (e: any) {
            console.log("❌ Auth Error:", e.message);
            // Звичайні помилки показуємо алертом
            Alert.alert("Увага", e.message || "Сталася помилка");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isRegistering,
        isLoading,
        showVerifyModal,
        handleVerifyConfirmed,
        name, setName,
        email, setEmail,
        pin, setPin,
        handleSubmit,
        toggleMode
    };
};