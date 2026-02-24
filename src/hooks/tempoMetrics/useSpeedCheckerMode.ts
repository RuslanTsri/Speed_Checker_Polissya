import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBle } from '../../context/BleContext';

export const useSpeedCheckerMode = () => {
    const { t } = useTranslation();
    const [mode, setMode] = useState<'DEVICE' | 'MANUAL'>('DEVICE');
    const { connected, sensors = [], pingMaster, pingProgress } = useBle();

    const activeSensorsCount = sensors.filter(s => s.status === 'active').length;

    const handleCheckConnection = async () => {
        if (!connected) { Alert.alert(t('tools.speed_checker.alert_error') as string, t('tools.speed_checker.error_not_connected') as string); return; }
        const sent = await pingMaster();
        if (!sent) { Alert.alert(t('tools.speed_checker.alert_error') as string, t('tools.speed_checker.error_ping_fail') as string); }
    };

    let status = {
        title: t('tools.speed_checker.status_not_connected') as string,
        subtitle: t('tools.speed_checker.status_check_ble') as string,
        bg: "bg-red-900/20", border: "border-red-500/30", textCol: "text-red-400",
        btnText: connected ? (t('tools.speed_checker.btn_ping') as string) : (t('tools.speed_checker.btn_status') as string)
    };

    if (connected) {
        if (pingProgress) {
            status.title = pingProgress;
            status.subtitle = t('tools.speed_checker.status_wait') as string;
            status.bg = "bg-yellow-900/20"; status.border = "border-yellow-500/30"; status.textCol = "text-yellow-400";
        } else {
            status.title = t('tools.speed_checker.status_ready') as string;
            status.subtitle = t('tools.speed_checker.config_gates', { count: activeSensorsCount }) as string;
            status.bg = "bg-green-900/20"; status.border = "border-green-500/30"; status.textCol = "text-green-400";
        }
    }

    return { mode, setMode, handleCheckConnection, pingProgress, status };
};