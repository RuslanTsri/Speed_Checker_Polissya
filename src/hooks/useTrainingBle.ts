import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Platform, Linking, PermissionsAndroid } from 'react-native';
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
    const lastPingedSensorId = useRef<number>(0);
    const rxBuffer = useRef<string>('');
    const isIntentionalDisconnect = useRef<boolean>(false);
    // МИТТЄВА ПАМ'ЯТЬ ДЛЯ ЗАХИСТУ ВІД ЗАТРИМОК REACT
    const stateRef = useRef<TrainingState>('idle');
    const sensorsRef = useRef<SensorInfo[]>([]);
    const sessionRef = useRef<TrainingSession | null>(null);
    const deviceRef = useRef<any>(null);
    const lastSeenRef = useRef<Record<number, number>>({});

    // --- СИНХРОНІЗАЦІЯ ---
    useEffect(() => {
        if (stateRef.current !== state) console.log(`${TAG} UI Стейт змінився: ${stateRef.current} -> ${state}`);
    }, [state]);
    useEffect(() => { deviceRef.current = device; }, [device]);

    // --- ІНІЦІАЛІЗАЦІЯ BLE ---
    useEffect(() => {
        if (Platform.OS !== 'web') {
            const BLE = require('@sfourdrinier/react-native-ble-plx');
            if (!globalBleManager) globalBleManager = new BLE.BleManager();
            bleManager.current = globalBleManager;
        }

        return () => {
            if (bleManager.current) bleManager.current.stopDeviceScan();
            if (subscriptionRef.current) subscriptionRef.current.remove();
            if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
        };
    }, []);

    // 🔥 НОВА ФУНКЦІЯ: ЗАПИТ ДОЗВОЛІВ (PERMISSIONS)
    const requestPermissions = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            const apiLevel = parseInt(Platform.Version.toString(), 10);

            try {
                if (apiLevel >= 31) { // Android 12+
                    const granted = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    ]);
                    return (
                        granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                        granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
                    );
                } else { // Android 11 і нижче
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                }
            } catch (err) {
                console.error(`${TAG} Помилка запиту дозволів:`, err);
                return false;
            }
        }
        // На iOS дозволи запитуються автоматично при спробі використання
        return true;
    };

    const checkBluetoothState = async (): Promise<boolean> => {
        if (Platform.OS === 'web' || !bleManager.current) return true;
        try {
            const hasPermissions = await requestPermissions();
            if (!hasPermissions) {
                Alert.alert(
                    "Бракує дозволів",
                    "Для пошуку датчиків додатку потрібен доступ до Bluetooth та Геолокації.",
                    [{ text: "ОК" }]
                );
                return false;
            }

            const btState = await bleManager.current.state();
            if (btState === 'PoweredOn') return true;
            if (btState === 'PoweredOff') {
                Alert.alert("Bluetooth вимкнено", "Для роботи з системою потрібно увімкнути Bluetooth.", [
                    { text: "Скасувати", style: "cancel" },
                    { text: "Налаштування", onPress: () => Platform.OS === 'android' ? Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS').catch(() => Linking.openSettings()) : Linking.openURL('App-Prefs:Bluetooth') }
                ]);
                return false;
            }
            return false;
        } catch (error) { return false; }
    };

    // --- ДОПОМІЖНІ ФУНКЦІЇ ---
    const handleMasterDisconnect = useCallback(async (intentional = false) => {
        // Якщо це НЕ ручне відключення, тоді б'ємо на сполох
        if (!intentional) {
            console.log(`${TAG} 💀 МАСТЕР ВІДКЛЮЧИВСЯ (ОБРИВ BLE)!`);

        } else {
            console.log(`${TAG} 👋 КОРИСТУВАЧ ВІДКЛЮЧИВСЯ САМОСТІЙНО.`);
        }

        if (subscriptionRef.current) subscriptionRef.current.remove();
        if (deviceRef.current) await deviceRef.current.cancelConnection().catch(() => {});

        setDevice(null); deviceRef.current = null;
        setConnected(false);
        stateRef.current = 'idle';
        setState('idle');
        sensorsRef.current = [];
        setSensors([]);
        sessionRef.current = null;
        setSession(null);
        setElapsedTime(0);
        lastSeenRef.current = {};
    }, []);
    const sendCommand = async (command: CommandType | any, specificDevice?: any) => {
        const currentDevice = specificDevice || deviceRef.current;
        if (!currentDevice || Platform.OS === 'web') return;
        try {
            const jsonStr = JSON.stringify(command);
            const base64Data = Buffer.from(jsonStr).toString('base64');
            await currentDevice.writeCharacteristicWithResponseForService(BLE_CONFIG.SERVICE_UUID, BLE_CONFIG.TX_CHARACTERISTIC_UUID, base64Data);
            if (command.type !== 22) console.log(`${TAG} 📤 ВІДПРАВЛЕНО: ${jsonStr}`);
        } catch (e: any) {
            console.log(`${TAG} ❌ ПОМИЛКА ВІДПРАВКИ:`, e.message);
            // Якщо помилка при відправці, швидше за все Мастер відвалився
            if (e.message?.includes('not connected') || e.message?.includes('disconnected')) {
                handleMasterDisconnect();
            }
        }
    };

    // 🔥 WATCHDOG: ПЕРЕВІРКА ЖИВУЧОСТІ ТІЛЬКИ ДЛЯ ГЕЙТІВ
    // 🔥 WATCHDOG: ПЕРЕВІРКА ЖИВУЧОСТІ ТІЛЬКИ ДЛЯ ГЕЙТІВ
    useEffect(() => {
        if (!connected) return;

        const watchdogInterval = setInterval(() => {
            const currentState = stateRef.current;
            const now = Date.now();

            if (['ready', 'finished', 'initializing_sensors'].includes(currentState)) {
                sendCommand({ type: 22 });
            } else if (['armed', 'active'].includes(currentState)) {
                sensorsRef.current.forEach(s => {
                    if (s.status === 'active') lastSeenRef.current[s.id] = now;
                });
            }

            let isChanged = false;

            const updatedSensors = sensorsRef.current.map(s => {
                if (s.id === 0) return s;

                const lastSeen = lastSeenRef.current[s.id] || now;

                if (now - lastSeen > 25000 && s.status === 'active') {
                    console.log(`${TAG} 💀 ГЕЙТ ${s.id} ВІДКЛЮЧИВСЯ (ТАЙМАУТ)!`);
                    isChanged = true;
                    // 🔥 Алерт прибрано, картка сенсора сама все покаже
                    return { ...s, status: 'timeout' as 'timeout' };
                }
                return s;
            });

            if (isChanged) {
                sensorsRef.current = updatedSensors;
                setSensors([...updatedSensors]);
            }
        }, 10000);

        return () => clearInterval(watchdogInterval);
    }, [connected]);

    // --- ОБРОБКА ТРИГЕРІВ ---
    const handleTrigger = useCallback((data: any) => {
        const triggeredId = data.sensor;
        const triggerTime = data.time || 0;
        const nowMs = Date.now() % 10000;

        const currentState = stateRef.current;
        console.log(`\n[${nowMs}] ${TAG} ⚡ ТРИГЕР ВИКЛИКАНО: Sensor=${triggeredId}, Time=${triggerTime}, State=${currentState}`);

        lastSeenRef.current[triggeredId] = Date.now();

        if (triggeredId === 0) {
            if (['armed', 'ready'].includes(currentState)) {
                console.log(`[${nowMs}] ${TAG} 🟢 МАСТЕР СТАРТ. Оновлюємо state -> active.`);
                stateRef.current = 'active';
                setState('active');
                setElapsedTime(0);

                const newSensors = sensorsRef.current.map(s => ({
                    ...s, triggerTime: s.id === 0 ? 0 : undefined, splitTime: undefined, status: 'active' as 'active'
                }));
                sensorsRef.current = newSensors;
                setSensors(newSensors);

                const newSession = { startTime: Date.now(), triggers: [{ sensorId: 0, time: 0, split: 0 }] };
                sessionRef.current = newSession;
                setSession(newSession);
            }
            return;
        }

        if (stateRef.current === 'active') {
            const activeSensors = sensorsRef.current.filter(s => s.status === 'active' && s.id !== 0);
            const finishSensorId = activeSensors.length > 0 ? Math.max(...activeSensors.map(s => s.id)) : 0;

            const currentSensor = sensorsRef.current.find(s => s.id === triggeredId);

            if (currentSensor?.triggerTime !== undefined) {
                console.log(`[${nowMs}] ${TAG} ⚠️ ПРАВИЛО 1 ДОТИКУ: Датчик ${triggeredId} вже зафіксовано. Ігноруємо!`);
                return;
            }

            console.log(`[${nowMs}] ${TAG} ✅ Оновлюємо час для Сенсора ${triggeredId} -> ${triggerTime}`);
            const newSensors = sensorsRef.current.map(s =>
                s.id === triggeredId ? { ...s, triggerTime, splitTime: data.split, status: 'active' as 'active' } : s
            );
            sensorsRef.current = newSensors;
            setSensors(newSensors);

            if (sessionRef.current) {
                if (!sessionRef.current.triggers.some(t => t.sensorId === triggeredId)) {
                    const updatedSession = {
                        ...sessionRef.current,
                        triggers: [...sessionRef.current.triggers, { sensorId: triggeredId, time: triggerTime, split: data.split }]
                    };
                    sessionRef.current = updatedSession;
                    setSession(updatedSession);
                }
            }

            if (triggeredId === finishSensorId) {
                console.log(`[${nowMs}] ${TAG} 🛑 ФІНІШ ДОСЯГНУТО (Сенсор ${triggeredId})`);
                stateRef.current = 'finished';
                setState('finished');
                setElapsedTime(triggerTime);
                setPingProgress('Фініш!');
                sendCommand({ type: 21 });
            }
        }
    }, []);

    // --- ОБРОБКА ДАНИХ З ПЛАТИ ---
    const handleMasterResponse = useCallback((data: any) => {
        if (data.type !== 31 && data.type !== 22) console.log(`${TAG} 📥 ПАРСИНГ УСПІШНИЙ:`, JSON.stringify(data));

        switch (data.type) {
            case 31: setElapsedTime(data.elapsed); break;
            case 26:
                if (data.status === 'sent') break;
                if (data.assigned_id !== undefined) {
                    lastPingedSensorId.current = data.assigned_id;
                    lastSeenRef.current[data.assigned_id] = Date.now();

                    const newSensors = [...sensorsRef.current];
                    if (!newSensors.find(s => s.id === data.assigned_id)) {
                        newSensors.push({ id: data.assigned_id, status: 'active' as 'active', physicalId: data.assigned_id === 0 ? 'MASTER' : `GATE-${data.assigned_id}` });
                        sensorsRef.current = newSensors;
                        setSensors(newSensors);
                    }
                    setPingProgress(data.assigned_id === 0 ? 'Мастер ініціалізовано' : `Сенсор ${data.assigned_id} знайдено`);
                }
                break;
            case 22:
                if (data.sensor !== undefined && data.status === 'pong') {
                    lastPingedSensorId.current = data.sensor;
                    lastSeenRef.current[data.sensor] = Date.now();

                    const isRevived = sensorsRef.current.find(s => s.id === data.sensor)?.status === 'timeout';
                    if (isRevived) console.log(`${TAG} ⚡ ДАТЧИК ${data.sensor} ПОВЕРНУВСЯ В СТРІЙ!`);

                    const newSensors = sensorsRef.current.map(s => s.id === data.sensor ? { ...s, status: 'active' as 'active' } : s);
                    sensorsRef.current = newSensors;
                    setSensors([...newSensors]);
                    setPingProgress(data.sensor === 0 ? 'Мастер OK...' : `Сенсор ${data.sensor} OK...`);
                } else if (data.rssi !== undefined) {
                    const newSensors = sensorsRef.current.map(s => s.id === lastPingedSensorId.current ? { ...s, rssi: data.rssi } : s);
                    sensorsRef.current = newSensors;
                    setSensors([...newSensors]);
                }
                break;
            case 21:
                if (data.status === 'FINISHED') {
                    stateRef.current = 'finished';
                    setState('finished');
                    setPingProgress('Фініш!');
                }
                break;
            case 20:
                stateRef.current = 'armed';
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
        if (bleManager.current) bleManager.current.stopDeviceScan();
        isIntentionalDisconnect.current = false;
        stateRef.current = 'connecting';
        setState('connecting');
        isConnecting.current = true;
        connectingDeviceId.current = target.id;

        sensorsRef.current = [];
        setSensors([]);
        rxBuffer.current = '';
        lastSeenRef.current = {};

        try {
            if (Platform.OS === 'web') {
                await new Promise(r => setTimeout(r, 800));
                if (!isConnecting.current) return;
                setConnected(true);
                stateRef.current = 'initializing_sensors';
                setState('initializing_sensors');
            } else {
                const conn = await target.connect({ timeout: 15000 });
                if (!isConnecting.current) { await conn.cancelConnection().catch(() => {}); return; }
                if (Platform.OS === 'android') await conn.requestMTU(256).catch(() => {});
                if (!isConnecting.current) { await conn.cancelConnection().catch(() => {}); return; }
                await conn.discoverAllServicesAndCharacteristics();
                if (!isConnecting.current) { await conn.cancelConnection().catch(() => {}); return; }

                // 🔥 ВІДСТЕЖЕННЯ РОЗРИВУ З'ЄДНАННЯ З МАСТЕРОМ
                conn.onDisconnected((error: any) => {
                    console.log(`${TAG} Подія onDisconnected спрацювала`);
                    if (!isIntentionalDisconnect.current) {
                        handleMasterDisconnect(false);
                    }
                });

                subscriptionRef.current = conn.monitorCharacteristicForService(
                    BLE_CONFIG.SERVICE_UUID, BLE_CONFIG.RX_CHARACTERISTIC_UUID,
                    (err: any, char: any) => {
                        if (err) {
                            console.log(`${TAG} Помилка в monitorCharacteristic:`, err.message);
                            // Якщо обрив під час моніторингу
                            handleMasterDisconnect();
                            return;
                        }

                        if (char?.value) {
                            const chunk = Buffer.from(char.value, 'base64').toString('utf-8');
                            rxBuffer.current += chunk;

                            let startIndex = rxBuffer.current.indexOf('{');
                            while (startIndex !== -1) {
                                let braceCount = 0;
                                let endIndex = -1;

                                for (let i = startIndex; i < rxBuffer.current.length; i++) {
                                    if (rxBuffer.current[i] === '{') braceCount++;
                                    else if (rxBuffer.current[i] === '}') {
                                        braceCount--;
                                        if (braceCount === 0) {
                                            endIndex = i;
                                            break;
                                        }
                                    }
                                }

                                if (endIndex !== -1) {
                                    const jsonStr = rxBuffer.current.substring(startIndex, endIndex + 1);
                                    rxBuffer.current = rxBuffer.current.substring(endIndex + 1);

                                    try {
                                        const parsed = JSON.parse(jsonStr);
                                        handleMasterResponse(parsed);
                                    } catch (e) {
                                        console.error(`${TAG} ❌ Помилка парсингу склеєного JSON:`, jsonStr);
                                    }

                                    startIndex = rxBuffer.current.indexOf('{');
                                } else {
                                    break;
                                }
                            }
                        }
                    }
                );

                deviceRef.current = conn;
                setDevice(conn);
                setConnected(true);
                stateRef.current = 'initializing_sensors';
                setState('initializing_sensors');
                setTimeout(() => sendCommand({ type: 26 }, conn), 800);
            }
        } catch (e: any) {
            if (isConnecting.current) {
                stateRef.current = 'idle';
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
        isIntentionalDisconnect.current = true;
        isConnecting.current = false;
        if (deviceRef.current) {
            try { await deviceRef.current.cancelConnection(); } catch (e) {}
            deviceRef.current = null;
            setDevice(null);
        } else if (connectingDeviceId.current && bleManager.current) {
            try { await bleManager.current.cancelDeviceConnection(connectingDeviceId.current); } catch (e) {}
        }
        stateRef.current = 'idle';
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
                const newSensors = sensorsRef.current.map(s => ({ ...s, status: 'unknown' as 'unknown', rssi: undefined }));
                sensorsRef.current = newSensors;
                setSensors(newSensors);

                stateRef.current = 'discovering';
                setState('discovering');
                setPingProgress('Перевірка...');
                sendCommand({ type: 22 });
                if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
                pingTimeoutRef.current = setTimeout(() => {
                    if (stateRef.current === 'discovering') {
                        stateRef.current = 'ready';
                        setState('ready');
                        setPingProgress('');
                    }
                }, 6000);
                return;
            }

            if (bleManager.current) bleManager.current.stopDeviceScan();
            setScannedDevices([]);
            stateRef.current = 'discovering';
            setState('discovering');

            if (bleManager.current) {
                bleManager.current.startDeviceScan(null, null, (err: any, d: any) => {
                    if (err) return;
                    if (d?.name?.startsWith('STM32BLE')) setScannedDevices(prev => prev.find(x => x.id === d.id) ? prev : [...prev, d]);
                });
            }
        },

        stopScanning: () => {
            if (bleManager.current) bleManager.current.stopDeviceScan();
            stateRef.current = 'idle';
            setState('idle');
        },

        connectToDevice,
        cancelConnecting,

        disconnect: async () => {
            isIntentionalDisconnect.current = true; // 🔥 Свідоме відключення
            await handleMasterDisconnect(true);

        },

        finishInitialization: () => {
            if (sensorsRef.current.length < 2) {
                Alert.alert("Помилка", "Потрібно мінімум 2 датчики");
                return;
            }
            sendCommand({ type: 23, sensors: sensorsRef.current.length - 1 });
            stateRef.current = 'ready';
            setState('ready');
        },

        startTraining: () => {
            const count = sensorsRef.current.filter(s => s.status === 'active' && s.id !== 0).length;
            sendCommand({ type: 20, sensors: count });
            stateRef.current = 'armed';
            setState('armed');
        },

        stopTraining: () => {
            sendCommand({ type: 21 });
            stateRef.current = 'finished';
            setState('finished');
            setPingProgress('Зупинено');
        },

        resetSession: () => {
            sendCommand({ type: 24 });
            stateRef.current = 'ready';
            setState('ready');
            setElapsedTime(0);

            sessionRef.current = null;
            setSession(null);

            const newSensors = sensorsRef.current.map(s => ({ ...s, triggerTime: undefined, splitTime: undefined }));
            sensorsRef.current = newSensors;
            setSensors(newSensors);
        },

        simulateWebTrigger: () => handleMasterResponse({ type: 30, sensor: 1, time: 2500, split: 2500 })
    };
};