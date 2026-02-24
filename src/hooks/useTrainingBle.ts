import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { Buffer } from 'buffer';
import { SensorInfo, TrainingState, CommandType } from '../types/telemetry';
import { BLE_CONFIG } from '../constants/bleConfig';

const TAG = '[BLE-DEBUG]';

export const useTrainingBle = () => {
    const [connected, setConnected] = useState(false);
    const [device, setDevice] = useState<any>(null);
    const [state, setState] = useState<TrainingState>('idle');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [scannedDevices, setScannedDevices] = useState<any[]>([]);

    // Master завжди Gate 0
    const [sensors, setSensors] = useState<SensorInfo[]>([
        { id: 0, status: 'active', physicalId: 'MASTER' }
    ]);

    const bleManager = useRef<any>(null);
    const subscriptionRef = useRef<any>(null);
    const isConnecting = useRef(false);

    // --- ФУНКЦІЯ ВІДПРАВКИ КОМАНД ---
    const sendCommand = async (command: CommandType) => {
        if (!device || !connected || Platform.OS === 'web') return;
        try {
            const base64Data = Buffer.from(JSON.stringify(command)).toString('base64');
            await device.writeCharacteristicWithResponseForService(
                BLE_CONFIG.SERVICE_UUID,
                BLE_CONFIG.TX_CHARACTERISTIC_UUID,
                base64Data
            );
            console.log(`${TAG} 📤 Sent command ${command.type}:`, command);
        } catch (e) { console.error("Send Error:", e); }
    };

    const handleMasterResponse = useCallback((data: any) => {
        if (state === 'initializing_sensors' && data.type === 30) {
            const physId = data.sensor;
            setSensors(prev => {
                if (prev.find(s => s.physicalId === physId)) return prev;
                if (prev.length >= 6) return prev;

                const newGate: SensorInfo = {
                    id: prev.length,
                    physicalId: physId,
                    status: 'active'
                };
                return [...prev, newGate];
            });
            return;
        }

        switch (data.type) {
            case 31: setElapsedTime(data.elapsed); break;
            case 21: setState('finished'); break;
            case 20: setState('active'); break;
        }
    }, [state]);

    const connectToDevice = async (target: any) => {
        if (isConnecting.current) return;
        isConnecting.current = true;
        if (Platform.OS !== 'web' && bleManager.current) bleManager.current.stopDeviceScan();

        try {
            if (Platform.OS === 'web') {
                await new Promise(r => setTimeout(r, 800));
                setDevice({ name: target.name });
                setConnected(true);
                setState('initializing_sensors');
            } else {
                const conn = await target.connect();
                await conn.discoverAllServicesAndCharacteristics();
                subscriptionRef.current = conn.monitorCharacteristicForService(
                    BLE_CONFIG.SERVICE_UUID, BLE_CONFIG.RX_CHARACTERISTIC_UUID,
                    (err: any, char: any) => {
                        if (char?.value) {
                            const raw = Buffer.from(char.value, 'base64').toString('utf-8');
                            handleMasterResponse(JSON.parse(raw));
                        }
                    }
                );
                setDevice(conn); setConnected(true);
                setState('initializing_sensors');
                setTimeout(() => sendCommand({ type: 25 }), 600);
            }
        } catch (e) { setState('idle'); }
        finally { isConnecting.current = false; }
    };

    const finishInitialization = () => {
        if (sensors.length < 2) {
            Alert.alert("Помилка", "Додайте хоча б один додатковий датчик (крім Мастера)");
            return;
        }
        sendCommand({ type: 23, sensors: sensors.length - 1 });
        setState('ready');
    };

    return {
        connected, state, sensors, elapsedTime, scannedDevices,
        canFinish: sensors.length >= 2,
        startDiscovery: () => {
            if (Platform.OS === 'web') {
                setScannedDevices([{ id: 'W1', name: 'STM32BLE-ALPHA' }]);
                setState('discovering');
                return;
            }
            setScannedDevices([]); setState('discovering');
            bleManager.current.startDeviceScan(null, null, (err: any, d: any) => {
                if (d?.name?.startsWith('STM32BLE')) {
                    setScannedDevices(prev => prev.find(x => x.id === d.id) ? prev : [...prev, d]);
                }
            });
        },
        stopScanning: () => setState('idle'),
        connectToDevice,
        disconnect: () => {
            if (device?.cancelConnection) device.cancelConnection();
            setConnected(false); setState('idle');
            setSensors([{ id: 0, status: 'active', physicalId: 'MASTER' }]);
        },
        finishInitialization,
        startTraining: () => sendCommand({ type: 20 }),
        stopTraining: () => sendCommand({ type: 21 }),
        resetSession: () => {
            sendCommand({ type: 24 });
            setElapsedTime(0);
            setState('ready');
        },
        simulateWebTrigger: () => handleMasterResponse({ type: 30, sensor: Math.random() })
    };
};