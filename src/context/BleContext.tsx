import React, { createContext, useContext, ReactNode } from 'react';
import { useTrainingBle } from '../hooks/useTrainingBle';

const BleContext = createContext<ReturnType<typeof useTrainingBle> | null>(null);
export const BleProvider = ({ children }: { children: ReactNode }) => {
    const bleLogic = useTrainingBle();

    return (
        <BleContext.Provider value={bleLogic}>
            {children}
        </BleContext.Provider>
    );
};

export const useBle = () => {
    const context = useContext(BleContext);
    if (!context) {
        throw new Error('useBle must be used within a BleProvider');
    }
    return context;
};