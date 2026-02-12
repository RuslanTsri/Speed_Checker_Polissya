import { useState } from 'react';
import { Alert } from 'react-native';

export const useAuthScreen = (onLogin: () => void) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        // Можна очищати поля при перемиканні, якщо потрібно
        // setPin('');
    };

    const handleSubmit = () => {
        // Валідація
        if (pin.length !== 4) {
            Alert.alert("Помилка", "PIN має складатись з 4 цифр");
            return;
        }

        if (isRegistering && name.trim().length === 0) {
            Alert.alert("Помилка", "Будь ласка, введіть ваше ім'я");
            return;
        }

        // Тут у майбутньому буде запит до API або перевірка в AsyncStorage
        // Поки що просто викликаємо колбек успішного входу
        onLogin();
    };

    return {
        // State
        isRegistering,
        name, setName,
        pin, setPin,

        // Actions
        handleSubmit,
        toggleMode
    };
};