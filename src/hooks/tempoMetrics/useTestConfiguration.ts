import { useState, useEffect } from 'react';
import { useBle } from '../../context/BleContext';

export const useTestConfiguration = () => {
    const [distance, setDistance] = useState(30);
    const [splitPositions, setSplitPositions] = useState<number[]>([]);

    const { sensors = [] } = useBle();

    const activeSensors = sensors.filter(s => s.status === 'active');
    const sensorsCount = Math.max(2, activeSensors.length);
    const intermediateCount = sensorsCount - 2;

    useEffect(() => {
        if (intermediateCount > 0) {
            const step = distance / (intermediateCount + 1);
            const defaults = Array.from({ length: intermediateCount }, (_, i) => Math.round(step * (i + 1)));
            setSplitPositions(defaults);
        } else {
            setSplitPositions([]);
        }
    }, [distance, sensorsCount]);

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