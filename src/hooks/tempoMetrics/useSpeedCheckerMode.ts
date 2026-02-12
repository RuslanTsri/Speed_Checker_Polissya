import { useState } from 'react';
import { Alert } from 'react-native';
import { useBle } from '../../context/BleContext';

export const useSpeedCheckerMode = () => {
    const [mode, setMode] = useState<'DEVICE' | 'MANUAL'>('DEVICE');

    const {
        connected,
        sensors = [],
        pingMaster,
        pingProgress
    } = useBle();

    const activeSensorsCount = sensors.filter(s => s.status === 'active').length;

    const handleCheckConnection = async () => {
        if (!connected) {
            Alert.alert("Помилка", "Система не підключена. Перевірте з'єднання в меню 'Телеметрія'.");
            return;
        }

        const sent = await pingMaster();
        if (!sent) {
            Alert.alert("Помилка", "Не вдалося зв'язатися з Master Node");
        }
    };

    // Обчислюємо UI статус
    let status = {
        title: "Не підключено",
        subtitle: "Перевірте Bluetooth",
        bg: "bg-red-900/20",
        border: "border-red-500/30",
        textCol: "text-red-400",
        btnText: connected ? "ПІНГ" : "СТАТУС"
    };

    if (connected) {
        if (pingProgress) {
            status.title = pingProgress;
            status.subtitle = "Зачекайте...";
            status.bg = "bg-yellow-900/20";
            status.border = "border-yellow-500/30";
            status.textCol = "text-yellow-400";
        } else {
            status.title = "Готово до тесту";
            status.subtitle = `Конфігурація: ${activeSensorsCount} гейт(и/ів)`;
            status.bg = "bg-green-900/20";
            status.border = "border-green-500/30";
            status.textCol = "text-green-400";
        }
    }

    return {
        mode,
        setMode,
        handleCheckConnection,
        pingProgress,
        status
    };
};