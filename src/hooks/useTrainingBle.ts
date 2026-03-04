import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { Buffer } from 'buffer';
import { useTranslation } from 'react-i18next';
import { SensorInfo, TrainingState, CommandType, TrainingSession } from '../types/telemetry';
import { BLE_CONFIG } from '../constants/bleConfig';

const TAG = '[BLE-DEBUG] 🔵';
let globalBleManager: any = null;
export const useTrainingBle = () => {
    const { t } = useTranslation();

    // --- СТАН (STATE) ---
    const [connected, setConnected] = useState(false);
    const [device, setDevice] = useState<any>(null);
    const [state, setState] = useState<TrainingState>('idle');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [scannedDevices, setScannedDevices] = useState<any[]>([]);

    const [pingProgress, setPingProgress] = useState<string>('');
    const [session, setSession] = useState<TrainingSession | null>(null);

    const [sensors, setSensors] = useState<SensorInfo[]>([]);

    // --- ПОСИЛАННЯ (REFS) ---
    const bleManager = useRef<any>(null);
    const subscriptionRef = useRef<any>(null);
    const isConnecting = useRef(false);
    const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const connectingDeviceId = useRef<string | null>(null);

    // Зберігаємо ID останнього датчика, який прислав 'pong' або 'assigned_id'
    // щоб правильно прив'язати до нього RSSI, який приходить наступним повідомленням
    const lastPingedSensorId = useRef<number>(0);

    const stateRef = useRef<TrainingState>('idle');
    const sensorsRef = useRef<SensorInfo[]>([]);
    const deviceRef = useRef<any>(null);

    useEffect(() => {
        if (stateRef.current !== state) {
            console.log(`${TAG} Стейт змінився: ${stateRef.current} -> ${state}`);
        }
        stateRef.current = state;
    }, [state]);
    useEffect(() => { sensorsRef.current = sensors; }, [sensors]);
    useEffect(() => { deviceRef.current = device; }, [device]);

    // --- ІНІЦІАЛІЗАЦІЯ ТА ОЧИЩЕННЯ ---
    useEffect(() => {
        if (Platform.OS !== 'web') {
            const BLE = require('@sfourdrinier/react-native-ble-plx');
            // Використовуємо глобальний менеджер, якщо він вже є
            if (!globalBleManager) {
                globalBleManager = new BLE.BleManager();
            }
            bleManager.current = globalBleManager;
        }

        return () => {
            if (bleManager.current) {
                bleManager.current.stopDeviceScan();
                // 🔥 ЗАБРАЛИ: bleManager.current.destroy(); <- Тепер він живе завжди!
            }
            if (subscriptionRef.current) subscriptionRef.current.remove();
            if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
        };
    }, []);

    // --- ПЕРЕВІРКА СТАНУ BLUETOOTH ---
    const checkBluetoothState = async (): Promise<boolean> => {
        if (Platform.OS === 'web' || !bleManager.current) return true;

        try {
            const btState = await bleManager.current.state();
            if (btState === 'PoweredOn') return true;

            if (btState === 'PoweredOff') {
                Alert.alert(
                    "Bluetooth вимкнено",
                    "Для роботи з системою потрібно увімкнути Bluetooth.",
                    [
                        { text: "Скасувати", style: "cancel" },
                        {
                            text: "Налаштування",
                            onPress: () => {
                                if (Platform.OS === 'android') {
                                    Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS').catch(() => {
                                        Linking.openSettings();
                                    });
                                } else {
                                    Linking.openURL('App-Prefs:Bluetooth');
                                }
                            }
                        }
                    ]
                );
                return false;
            }
            return false;
        } catch (error) {
            console.error(`${TAG} Помилка перевірки стану Bluetooth:`, error);
            return false;
        }
    };

    // --- ДОПОМІЖНІ ФУНКЦІЇ ---
    const sendCommand = async (command: CommandType | any, specificDevice?: any) => {
        const currentDevice = specificDevice || deviceRef.current;
        if (!currentDevice || Platform.OS === 'web') return;
        try {
            const jsonStr = JSON.stringify(command);
            const base64Data = Buffer.from(jsonStr).toString('base64');
            await currentDevice.writeCharacteristicWithResponseForService(
                BLE_CONFIG.SERVICE_UUID, BLE_CONFIG.TX_CHARACTERISTIC_UUID, base64Data
            );
            console.log(`${TAG} 📤 ВІДПРАВЛЕНО: ${jsonStr}`);
        } catch (e: any) {
            console.log(`${TAG} ❌ ПОМИЛКА ВІДПРАВКИ:`, e.message);
        }
    };

    // --- ЛОГІКА ТРИГЕРІВ ---
    const handleTrigger = useCallback((data: any) => {
        const triggeredId = data.sensor;
        const triggerTime = data.time || 0;
        const currentState = stateRef.current;

        if (triggeredId === 0) {
            if (['armed', 'ready'].includes(currentState)) {
                setState('active');
                setElapsedTime(0);
                setSession({ startTime: Date.now(), triggers: [{ sensorId: 0, time: 0, split: 0 }] });
                setSensors(prev => prev.map(s => ({
                    ...s, triggerTime: s.id === 0 ? 0 : undefined, splitTime: undefined, status: 'active'
                })));
            }
            return;
        }

        if (currentState === 'active') {
            const activeSensors = sensorsRef.current.filter(s => s.status === 'active' && s.id !== 0);
            const finishSensorId = activeSensors.length > 0 ? Math.max(...activeSensors.map(s => s.id)) : 0;

            const currentSensor = sensorsRef.current.find(s => s.id === triggeredId);
            if (currentSensor?.triggerTime !== undefined && Math.abs(currentSensor.triggerTime - triggerTime) < 500) {
                return;
            }

            setSensors(prev => prev.map(s =>
                s.id === triggeredId ? { ...s, triggerTime, splitTime: data.split, status: 'active' } : s
            ));

            setSession(prev => {
                if (!prev) return null;
                return { ...prev, triggers: [...prev.triggers, { sensorId: triggeredId, time: triggerTime, split: data.split }] };
            });

            if (triggeredId === finishSensorId) {
                setState('finished');
                setElapsedTime(triggerTime);
                setPingProgress('Фініш!');
                sendCommand({ type: 21 });
            }
        }
    }, []);

    // --- ОБРОБКА ДАНИХ ВІД STM32 (ОНОВЛЕНО ПІД НОВІ ЛОГИ) ---
    const handleMasterResponse = useCallback((data: any) => {
        if (data.type !== 31) {
            console.log(`${TAG} 📥 ОТРИМАНО ВІД ПЛАТИ:`, JSON.stringify(data));
        }

        switch (data.type) {
            case 31:
                setElapsedTime(data.elapsed);
                break;

            case 26:
                // Лог: {"type":26,"status":"sent"}
                if (data.status === 'sent') {
                    console.log(`${TAG} Команда ініціалізації прийнята`);
                }
                // Лог: {"type":26,"assigned_id":0,"total":0} або {"type":26,"assigned_id":1,"total":2}
                else if (data.assigned_id !== undefined) {
                    lastPingedSensorId.current = data.assigned_id;
                    setSensors(prev => {
                        if (prev.find(s => s.id === data.assigned_id)) return prev;
                        return [...prev, {
                            id: data.assigned_id,
                            status: 'active',
                            physicalId: data.assigned_id === 0 ? 'MASTER' : `GATE-${data.assigned_id}`
                        }];
                    });
                    setPingProgress(data.assigned_id === 0 ? 'Мастер ініціалізовано' : `Сенсор ${data.assigned_id} знайдено`);
                }
                break;

            case 22:
                // Лог: {"type":22,"sensor":0,"status":"pong"}
                if (data.sensor !== undefined && data.status === 'pong') {
                    lastPingedSensorId.current = data.sensor;
                    setSensors(prev => prev.map(s => s.id === data.sensor ? { ...s, status: 'active' } : s));
                    setPingProgress(data.sensor === 0 ? 'Мастер OK...' : `Сенсор ${data.sensor} OK...`);
                }
                // Лог: {"type":22,"rssi":-9,"snr":12,"RxNum":1,"per":99.000000}
                else if (data.rssi !== undefined) {
                    // Прив'язуємо RSSI до останнього датчика, який "пінгував"
                    setSensors(prev => prev.map(s =>
                        s.id === lastPingedSensorId.current ? { ...s, rssi: data.rssi } : s
                    ));
                }
                break;

            case 21:
                if (data.status === 'FINISHED') {
                    setState('finished');
                    setPingProgress('Фініш!');
                } else if (data.TxDoneNum !== undefined) {
                    // Лог: {"type":21,"TxDoneNum":0} - просто технічний лог передачі, ігноруємо для UI
                }
                break;

            case 20:
                setState('armed');
                setPingProgress('Очікування старту');
                break;

            case 30:
                handleTrigger(data);
                break;
        }
    }, [handleTrigger]);

    // --- ПІДКЛЮЧЕННЯ ---
    const connectToDevice = async (target: any) => {
        if (isConnecting.current) return;

        if (bleManager.current) {
            bleManager.current.stopDeviceScan();
        }

        setState('connecting');
        isConnecting.current = true;
        connectingDeviceId.current = target.id;

        // Очищаємо список сенсорів перед новим підключенням (Мастер сам себе додасть)
        setSensors([]);

        try {
            if (Platform.OS === 'web') {
                await new Promise(r => setTimeout(r, 800));
                if (!isConnecting.current) return;
                setConnected(true); setState('initializing_sensors');
            } else {
                const conn = await target.connect({ timeout: 15000 });
                if (!isConnecting.current) { await conn.cancelConnection().catch(() => {}); return; }

                if (Platform.OS === 'android') await conn.requestMTU(256).catch(() => {});
                if (!isConnecting.current) { await conn.cancelConnection().catch(() => {}); return; }

                await conn.discoverAllServicesAndCharacteristics();
                if (!isConnecting.current) { await conn.cancelConnection().catch(() => {}); return; }

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

                deviceRef.current = conn;
                setDevice(conn);
                setConnected(true);
                setState('initializing_sensors');

                // Просимо майстра ініціалізувати систему
                setTimeout(() => sendCommand({ type: 26 }, conn), 800);
            }
        } catch (e: any) {
            if (isConnecting.current) {
                setState('idle');
                Alert.alert("Помилка", "Не вдалося підключитися. Спробуйте ще раз.");
            }
        } finally {
            isConnecting.current = false;
            connectingDeviceId.current = null;
        }
    };

    const cancelConnecting = async () => {
        if (!isConnecting.current) return;
        isConnecting.current = false;
        if (deviceRef.current) {
            try { await deviceRef.current.cancelConnection(); } catch (e) {}
            deviceRef.current = null;
            setDevice(null);
        } else if (connectingDeviceId.current && bleManager.current) {
            try { await bleManager.current.cancelDeviceConnection(connectingDeviceId.current); } catch (e) {}
        }
        setState('idle');
        setConnected(false);
    };

    return {
        connected, state, sensors, elapsedTime, scannedDevices, session, pingProgress, device,
        finalTime: elapsedTime,
        canFinish: sensors.length >= 2,

        startDiscovery: async () => {
            const isBluetoothOn = await checkBluetoothState();
            if (!isBluetoothOn) return;

            if (connected && device) {
                setSensors(prev => prev.map(s => ({ ...s, status: 'unknown', rssi: undefined })));
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

            if (bleManager.current) bleManager.current.stopDeviceScan();

            setScannedDevices([]);
            setState('discovering');

            if (bleManager.current) {
                bleManager.current.startDeviceScan(null, null, (err: any, d: any) => {
                    if (err) return;
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
        cancelConnecting,

        disconnect: async () => {
            if (subscriptionRef.current) subscriptionRef.current.remove();
            if (deviceRef.current) await deviceRef.current.cancelConnection().catch(() => {});
            setDevice(null); deviceRef.current = null;
            setConnected(false); setState('idle');
            setSensors([]); // Повністю очищаємо
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
            setState('armed');
        },

        stopTraining: () => {
            sendCommand({ type: 21 });
            setState('finished');
            setPingProgress('Зупинено');
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