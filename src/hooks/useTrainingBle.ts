import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer';
import { useTranslation } from 'react-i18next';
import { SensorInfo, TrainingState, CommandType, TrainingSession } from '../types/telemetry';
import { BLE_CONFIG } from '../constants/bleConfig';

const TAG = '[BLE-DEBUG]';

export const useTrainingBle = () => {
    const { t } = useTranslation();

    // --- СТАН (STATE) ---
    const [connected, setConnected] = useState(false);
    const [device, setDevice] = useState<any>(null);
    const [state, setState] = useState<TrainingState>('idle');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [scannedDevices, setScannedDevices] = useState<any[]>([]);

    // Додаємо відсутні стани зі старого хука
    const [pingProgress, setPingProgress] = useState<string>('');
    const [session, setSession] = useState<TrainingSession | null>(null);

    const [sensors, setSensors] = useState<SensorInfo[]>([
        { id: 0, status: 'active', physicalId: 'MASTER' }
    ]);

    // --- ПОСИЛАННЯ (REFS) ---
    const bleManager = useRef<any>(null);
    const subscriptionRef = useRef<any>(null);
    const isConnecting = useRef(false);
    const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Рефи для синхронізації стейту в колбеках Bluetooth
    const stateRef = useRef<TrainingState>('idle');
    const sensorsRef = useRef<SensorInfo[]>([]);

    useEffect(() => { stateRef.current = state; }, [state]);
    useEffect(() => { sensorsRef.current = sensors; }, [sensors]);

    // --- ІНІЦІАЛІЗАЦІЯ ТА ОЧИЩЕННЯ ---
    useEffect(() => {
        if (Platform.OS !== 'web') {
            const BLE = require('@sfourdrinier/react-native-ble-plx');
            if (!bleManager.current) bleManager.current = new BLE.BleManager();
        }
        return () => {
            if (bleManager.current) bleManager.current.stopDeviceScan();
            if (subscriptionRef.current) subscriptionRef.current.remove();
            if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
        };
    }, []);

    // --- ДОПОМІЖНІ ФУНКЦІЇ ---
    const sendCommand = async (command: CommandType | any, specificDevice?: any) => {
        const currentDevice = specificDevice || device;
        if (!currentDevice || Platform.OS === 'web') return;
        try {
            const jsonStr = JSON.stringify(command);
            const base64Data = Buffer.from(jsonStr).toString('base64');
            await currentDevice.writeCharacteristicWithResponseForService(
                BLE_CONFIG.SERVICE_UUID, BLE_CONFIG.TX_CHARACTERISTIC_UUID, base64Data
            );
            console.log(`${TAG} 📤 SENT: ${jsonStr}`);
        } catch (e: any) {
            console.log(`${TAG} ❌ Send Error:`, e.message);
        }
    };

    // --- ЛОГІКА ТРИГЕРІВ (СТАРТ / СПЛІТ / ФІНІШ) ---
    const handleTrigger = useCallback((data: any) => {
        const triggeredId = data.sensor;
        const triggerTime = data.time || 0;
        const currentState = stateRef.current;

        // Оновлюємо візуал сенсора (час та сигнал)
        setSensors(prev => prev.map(s =>
            s.id === triggeredId ? { ...s, triggerTime, splitTime: data.split, status: 'active', rssi: data.rssi } : s
        ));

        // 🟢 СТАРТ (ID 0)
        if (triggeredId === 0) {
            if (['armed', 'ready', 'active', 'finished'].includes(currentState)) {
                setState('active');
                setElapsedTime(0);
                setSession({
                    startTime: Date.now(),
                    triggers: [{ sensorId: 0, time: 0, split: 0 }]
                });
                setSensors(prev => prev.map(s => ({
                    ...s, triggerTime: s.id === 0 ? 0 : undefined, splitTime: undefined
                })));
            }
            return;
        }

        // 🔴 РОЗРАХУНОК ФІНІШУ ТА СПЛІТІВ
        if (currentState === 'active') {
            const activeSensors = sensorsRef.current.filter(s => s.status === 'active' && s.id !== 0);
            const finishSensorId = activeSensors.length > 0 ? Math.max(...activeSensors.map(s => s.id)) : 0;

            setSession(prev => {
                if (!prev) return null;
                const isDuplicate = prev.triggers.some(t => t.sensorId === triggeredId && Math.abs(t.time - triggerTime) < 500);
                if (isDuplicate) return prev;
                return { ...prev, triggers: [...prev.triggers, { sensorId: triggeredId, time: triggerTime, split: data.split }] };
            });

            if (triggeredId === finishSensorId) {
                setState('finished');
                setElapsedTime(triggerTime);
                setPingProgress('Фініш!');
                sendCommand({ type: 21 }); // Зупиняємо залізо
            }
        }
    }, []);

    // --- ОБРОБКА ДАНИХ ВІД STM32 ---
    const handleMasterResponse = useCallback((data: any) => {
        const currentState = stateRef.current;

        switch (data.type) {
            case 31: // Точний час від STM32
                setElapsedTime(data.elapsed);
                break;
            case 26: // Навчання датчиків
                if (currentState === 'initializing_sensors' && data.assigned_id !== undefined) {
                    setSensors(prev => {
                        if (prev.find(s => s.id === data.assigned_id)) return prev;
                        return [...prev, { id: data.assigned_id, status: 'active', rssi: data.rssi }];
                    });
                }
                break;
            case 22: // ПІНГ
                if (data.status === 'COMPLETE') {
                    if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
                    setState('ready');
                    setPingProgress('');
                    Alert.alert("Система готова", "Всі сенсори в мережі.");
                } else {
                    const sId = data.sensor !== undefined ? data.sensor : data.RxNum;
                    if (sId !== undefined) {
                        setSensors(prev => prev.map(s => s.id === sId ? { ...s, status: 'active', rssi: data.rssi } : s));
                        setPingProgress(`Сенсор ${sId} OK...`);
                    }
                }
                break;
            case 20: // Озброєно (Armed)
                setState('armed');
                setPingProgress('Очікування старту');
                break;
            case 21: // Фініш
                if (data.status === 'FINISHED' || currentState === 'active') {
                    setState('finished');
                    setPingProgress('Фініш!');
                }
                break;
            case 30: // ТРИГЕР
                handleTrigger(data);
                break;
        }
    }, [handleTrigger]);

    // --- ПІДКЛЮЧЕННЯ (НЕ ЗМІНЮВАЛИ) ---
    const connectToDevice = async (target: any) => {
        if (isConnecting.current) return;
        setState('connecting');
        isConnecting.current = true;
        try {
            if (Platform.OS === 'web') {
                await new Promise(r => setTimeout(r, 800));
                setConnected(true); setState('initializing_sensors');
            } else {
                const conn = await target.connect({ timeout: 15000 });
                if (Platform.OS === 'android') await conn.requestMTU(256).catch(() => {});
                await conn.discoverAllServicesAndCharacteristics();
                subscriptionRef.current = conn.monitorCharacteristicForService(
                    BLE_CONFIG.SERVICE_UUID, BLE_CONFIG.RX_CHARACTERISTIC_UUID,
                    (err: any, char: any) => {
                        if (err) { setConnected(false); setState('idle'); return; }
                        if (char?.value) {
                            try {
                                const raw = Buffer.from(char.value, 'base64').toString('utf-8');
                                handleMasterResponse(JSON.parse(raw));
                            } catch (e) {}
                        }
                    }
                );
                setDevice(conn); setConnected(true); setState('initializing_sensors');
                setTimeout(() => sendCommand({ type: 26 }, conn), 800);
            }
        } catch (e) {
            setState('idle');
            Alert.alert("Помилка", "Не вдалося підключитися.");
        } finally {
            isConnecting.current = false;
        }
    };

    // --- ПУБЛІЧНІ МЕТОДИ ---
    return {
        connected, state, sensors, elapsedTime, scannedDevices, session, pingProgress,
        canFinish: sensors.length >= 2,

        startDiscovery: async () => {
            if (connected && device) {
                // Логіка ПІНГУВАННЯ, якщо вже підключені
                setSensors(prev => prev.map(s => s.id === 0 ? s : { ...s, status: 'unknown', rssi: undefined }));
                setState('discovering');
                setPingProgress('Перевірка...');
                sendCommand({ type: 22 });
                if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
                pingTimeoutRef.current = setTimeout(() => {
                    if (stateRef.current === 'discovering') {
                        setState('ready');
                        setPingProgress('');
                    }
                }, 6000);
                return;
            }
            // Логіка ПОШУКУ нових пристроїв
            setScannedDevices([]);
            setState('discovering');
            if (bleManager.current) {
                bleManager.current.startDeviceScan(null, null, (err: any, d: any) => {
                    if (d?.name?.startsWith('STM32BLE')) {
                        setScannedDevices(prev => prev.find(x => x.id === d.id) ? prev : [...prev, d]);
                    }
                });
            }
        },

        stopScanning: () => {
            if (bleManager.current) bleManager.current.stopDeviceScan();
            setState('idle');
        },

        connectToDevice,

        disconnect: async () => {
            if (subscriptionRef.current) subscriptionRef.current.remove();
            if (device) await device.cancelConnection().catch(() => {});
            setDevice(null); setConnected(false); setState('idle');
            setSensors([{ id: 0, status: 'active', physicalId: 'MASTER' }]);
            setSession(null);
            setElapsedTime(0);
        },

        finishInitialization: () => {
            if (sensors.length < 2) {
                Alert.alert("Помилка", "Потрібно мінімум 2 датчики");
                return;
            }
            sendCommand({ type: 23, sensors: sensors.length - 1 });
            setState('ready');
        },

        startTraining: () => {
            const count = sensors.filter(s => s.status === 'active' && s.id !== 0).length;
            sendCommand({ type: 20, sensors: count });
            setState('armed'); // Чекаємо старту
        },

        stopTraining: () => {
            sendCommand({ type: 21 });
            setPingProgress('');
        },

        resetSession: () => {
            sendCommand({ type: 24 });
            setState('ready');
            setElapsedTime(0);
            setSession(null);
            setSensors(prev => prev.map(s => ({ ...s, triggerTime: undefined, splitTime: undefined })));
        },

        simulateWebTrigger: () => handleMasterResponse({ type: 30, sensor: 1, time: 2500, split: 2500 })
    };
};