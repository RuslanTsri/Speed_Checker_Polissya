import { useState } from 'react';
import { useBle } from '../context/BleContext';

// Типи (можна винести в global types, але поки тут)
export type TabType = 'HOME' | 'PLAYERS' | 'SESSIONS' | 'SETTINGS';
export type ToolType = 'MENU' | 'BLUETOOTH' | 'TIMER' | 'SPEEDCHECK';

export const useHomeScreen = (onNavigate: (tab: TabType, params?: any) => void) => {
    const [currentTool, setCurrentTool] = useState<ToolType>('MENU');
    const { connected, pingProgress, device } = useBle();

    // --- ЛОГІКА СТАТУСУ UI ---
    // Обчислюємо всі кольори та тексти тут, щоб View була чистою
    let status = {
        title: "Пристрій не підключено",
        desc: "Підключіть Tempo Metrics, щоб почати тест.",
        iconColor: "#64748b", // slate-500
        bgIcon: "bg-slate-800",
        border: "border-slate-800",
        textCol: "text-white",
        btnText: "Підключити",
        btnClass: "bg-slate-800 border-slate-700",
        btnTextClass: "text-white"
    };

    if (connected) {
        if (pingProgress) {
            status.title = "Перевірка зв'язку...";
            status.desc = pingProgress;
            status.iconColor = "#facc15";
            status.border = "border-yellow-500/30";
        } else {
            status.title = "Tempo Metrics Online";
            status.desc = device?.name || "Готовий до роботи";
            status.iconColor = "#4ade80";
            status.bgIcon = "bg-green-500/10";
            status.border = "border-green-500/30";
            status.textCol = "text-green-400";
            status.btnText = "Налаштування з'єднання";
            status.btnClass = "bg-slate-900 border-slate-700";
            status.btnTextClass = "text-slate-400";
        }
    }

    // --- НАВІГАЦІЯ ---
    const openTimer = () => setCurrentTool('TIMER');
    const openBluetooth = () => setCurrentTool('BLUETOOTH');
    const openSpeedCheck = () => setCurrentTool('SPEEDCHECK');
    const closeTool = () => setCurrentTool('MENU');

    const goToPlayers = () => onNavigate('PLAYERS');
    const goToSessions = () => onNavigate('SESSIONS', { subTab: 'GENERAL' });

    return {
        currentTool,
        connected,
        pingProgress,
        status,
        // Actions
        openTimer,
        openBluetooth,
        openSpeedCheck,
        closeTool,
        goToPlayers,
        goToSessions
    };
};