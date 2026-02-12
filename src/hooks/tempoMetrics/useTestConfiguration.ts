import { useState, useEffect } from 'react';
import { useBle } from '../../context/BleContext';

export const useTestConfiguration = () => {
    const [distance, setDistance] = useState(30);
    const [splitPositions, setSplitPositions] = useState<number[]>([]);

    const { sensors = [] } = useBle();

    // 1. Рахуємо активні сенсори
    const activeSensors = sensors.filter(s => s.status === 'active');
    const sensorsCount = Math.max(2, activeSensors.length);
    const intermediateCount = sensorsCount - 2;

    // 2. Скидання сплітів при зміні дистанції або сенсорів
    useEffect(() => {
        if (intermediateCount > 0) {
            const step = distance / (intermediateCount + 1);
            const defaults = Array.from({ length: intermediateCount }, (_, i) => Math.round(step * (i + 1)));
            setSplitPositions(defaults);
        } else {
            setSplitPositions([]);
        }
    }, [distance, sensorsCount]);

    // 3. Логіка зміни дистанції спліта
    const adjustSplit = (index: number, change: number) => {
        setSplitPositions(prev => {
            const newSplits = [...prev];
            const newVal = newSplits[index] + change;

            const lowerBound = index === 0 ? 0 : newSplits[index - 1];
            const upperBound = index === newSplits.length - 1 ? distance : newSplits[index + 1];

            if (newVal > lowerBound && newVal < upperBound) {
                newSplits[index] = newVal;
            }
            return newSplits;
        });
    };

    return {
        distance,
        setDistance,
        splitPositions,
        adjustSplit,
        sensorsCount,
        intermediateCount
    };
};