import { useState, useEffect, useRef } from 'react';

export type EnvironmentProfile = 'CLEAR' | 'RAIN' | 'INDOOR';

// Калібрувальні дані для різних умов (відкалібруєте на практиці)
const ENV_CONFIGS = {
    CLEAR: { txPower: -45, n: 2.8, name: 'Сухо / Відкрите поле' },
    RAIN:  { txPower: -45, n: 3.4, name: 'Волога трава / Дощ' },   // Сигнал падає швидше
    INDOOR:{ txPower: -40, n: 2.2, name: 'Манеж / Зал' }           // Сигнал відбивається від стін
};

export const useLoraDistance = (
    rawRssi: number | undefined,
    targetDistance: number | 'MAX',
    environment: EnvironmentProfile
) => {
    const rssiVal = rawRssi || -100;
    const [smoothedRssi, setSmoothedRssi] = useState<number>(rssiVal);
    const [calculatedDistance, setCalculatedDistance] = useState<number>(0);

    const { txPower, n } = ENV_CONFIGS[environment];
    const smoothingFactor = 0.15;
    const prevRssi = useRef(rssiVal);

    useEffect(() => {
        // Експоненційне згладжування
        const newSmoothed = (rssiVal * smoothingFactor) + (prevRssi.current * (1 - smoothingFactor));
        prevRssi.current = newSmoothed;
        setSmoothedRssi(newSmoothed);

        // Математика дистанції
        if (newSmoothed >= txPower) {
            setCalculatedDistance(1);
        } else if (newSmoothed <= -110) {
            setCalculatedDistance(0); // Втрата
        } else {
            const ratio = (txPower - newSmoothed) / (10 * n);
            const distance = Math.pow(10, ratio);
            setCalculatedDistance(Math.round(distance));
        }
    }, [rssiVal, environment]); // Перераховуємо, якщо змінилась погода

    // Логіка статусів залежить від режиму (Конкретні метри або MAX)
    let status: 'IDEAL' | 'GOOD' | 'FAR' | 'LOST' = 'FAR';

    if (smoothedRssi <= -105) {
        status = 'LOST';
    } else if (targetDistance === 'MAX') {
        // Режим пошуку максимальної дальності
        if (smoothedRssi >= -85) status = 'IDEAL'; // Сигнал надійний
        else if (smoothedRssi >= -100) status = 'GOOD'; // Сигнал на межі
    } else {
        // Режим розстановки по метрах
        const diff = Math.abs(calculatedDistance - targetDistance);
        if (diff <= 3) status = 'IDEAL';
        else if (diff <= 7) status = 'GOOD';
    }

    return {
        distance: calculatedDistance,
        rssi: Math.round(smoothedRssi),
        status
    };
};