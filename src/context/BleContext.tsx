import React, { createContext, useContext, ReactNode } from 'react';
import { useTrainingBle } from '../hooks/useTrainingBle';
import { SensorInfo, TrainingState, TrainingSession } from '../types/telemetry';

// 🔥 ЯВНО ОПИСУЄМО ІНТЕРФЕЙС
export interface BleContextType {
    connected: boolean;
    state: TrainingState;
    sensors: SensorInfo[];
    elapsedTime: number;
    finalTime: number;
    scannedDevices: any[];
    session: TrainingSession | null;
    pingProgress: string;
    device: any;
    cancelConnecting: () => Promise<void>;
    canFinish: boolean;
    startDiscovery: () => Promise<void>;
    connectToDevice: (target: any) => Promise<void>;
    disconnect: () => Promise<void>;
    pingMaster: () => Promise<boolean>;
    finishInitialization: () => void;
    startTraining: () => void;
    stopTraining: () => void;
    resetSession: () => void;
    simulateWebTrigger: () => void;

}

const BleContext = createContext<BleContextType | null>(null);

export const BleProvider = ({ children }: { children: ReactNode }) => {
    const bleLogic = useTrainingBle();

    return (
        // Кастимо до BleContextType, щоб TS не лаявся на ReturnType
        <BleContext.Provider value={bleLogic as unknown as BleContextType}>
            {children}
        </BleContext.Provider>
    );
};

export const useBle = () => {
    const context = useContext(BleContext);
    if (!context) throw new Error('useBle must be used within a BleProvider');
    return context;
};