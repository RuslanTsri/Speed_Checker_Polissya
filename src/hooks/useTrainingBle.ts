import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { Buffer } from 'buffer';
import { useTranslation } from 'react-i18next';
import { SensorInfo, TrainingState, CommandType, TrainingSession } from '../types/telemetry';
import { BLE_CONFIG } from '../constants/bleConfig';

const TAG = '[BLE-DEBUG] 🔵';

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

    const [sensors, setSensors] = useState<SensorInfo[]>([
        { id: 0, status: 'active', physicalId: 'MASTER' }
    ]);

    // --- ПОСИЛАННЯ (REFS) ---
    const bleManager = useRef<any>(null);
    const subscriptionRef = useRef<any>(null);
    const isConnecting = useRef(false);
    const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 🔥 ДОДАНО: Зберігаємо ID пристрою, до якого пробуємо підключитися
    const connectingDeviceId = useRef<string | null>(null);

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
            if (!bleManager.current) bleManager.current = new BLE.BleManager();
        }
        return () => {
            if (bleManager.current) {
                bleManager.current.stopDeviceScan();
                bleManager.current.destroy();
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
            console.log(`${TAG} Стан Bluetooth на пристрої: ${btState}`);

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

            Alert.alert("Помилка", `Стан Bluetooth: ${btState}. Перевірте налаштування пристрою.`);
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

    // --- ЛОГІКА ТРИГЕРІВ (СТАРТ / СПЛІТ / ФІНІШ) ---
    // --- ЛОГІКА ТРИГЕРІВ (СТАРТ / СПЛІТ / ФІНІШ) ---
    const handleTrigger = useCallback((data: any) => {
        const triggeredId = data.sensor;
        const triggerTime = data.time || 0;
        const currentState = stateRef.current;

        console.log(`${TAG} ⚡ ТРИГЕР: Датчик ID=${triggeredId} | Час=${triggerTime} | Стейт=${currentState}`);

        // 🟢 СТАРТ (ID 0)
        if (triggeredId === 0) {
            // 🔥 ФІКС 1: Забороняємо перезапуск таймера, якщо забіг ВЖЕ йде ('active')
            // або вже завершився ('finished'). Дозволяємо старт ТІЛЬКИ зі стану 'armed' або 'ready'.
            if (['armed', 'ready'].includes(currentState)) {
                console.log(`${TAG} 🏁 СТАРТ! Мастер перетнуто. Скидаємо таймер.`);
                setState('active');
                setElapsedTime(0);
                setSession({
                    startTime: Date.now(),
                    triggers: [{ sensorId: 0, time: 0, split: 0 }]
                });

                // Оновлюємо візуал
                setSensors(prev => prev.map(s => ({
                    ...s,
                    triggerTime: s.id === 0 ? 0 : undefined,
                    splitTime: undefined,
                    status: 'active'
                })));
            } else {
                console.log(`${TAG} 🛡️ Ігноруємо Мастер-датчик (забіг вже триває або завершений)`);
            }
            return;
        }

        // 🔴 РОЗРАХУНОК ФІНІШУ ТА СПЛІТІВ (Для датчиків ID > 0)
        if (currentState === 'active') {
            const activeSensors = sensorsRef.current.filter(s => s.status === 'active' && s.id !== 0);
            const finishSensorId = activeSensors.length > 0 ? Math.max(...activeSensors.map(s => s.id)) : 0;

            // 🔥 ФІКС 2: Анти-Брязкіт (Debounce).
            // Якщо цей самий датчик уже спрацьовував менше ніж 1.5 секунди тому — це просто "задня нога" бігуна або подвійний змах рукою.
            const currentSensor = sensorsRef.current.find(s => s.id === triggeredId);
            if (currentSensor?.triggerTime !== undefined && Math.abs(currentSensor.triggerTime - triggerTime) < 1500) {
                console.log(`${TAG} ⚠️ Подвійний тригер від ID=${triggeredId} (задня нога/рука). Ігноруємо!`);
                return; // Виходимо, не оновлюючи таймери
            }

            console.log(`${TAG} 🧮 Розрахунок фінішу: Поточний=${triggeredId} | Очікуваний Фініш=${finishSensorId}`);

            // Зберігаємо перший надійний час для візуалу
            setSensors(prev => prev.map(s =>
                s.id === triggeredId ? { ...s, triggerTime, splitTime: data.split, status: 'active', rssi: data.rssi } : s
            ));

            setSession(prev => {
                if (!prev) return null;
                return { ...prev, triggers: [...prev.triggers, { sensorId: triggeredId, time: triggerTime, split: data.split }] };
            });

            // Якщо ID цього датчика співпадає з останнім датчиком на трасі — це Фініш!
            if (triggeredId === finishSensorId) {
                console.log(`${TAG} 🛑 ФІНІШ ДОСЯГНУТО (перетнуто датчик ${triggeredId})`);
                setState('finished');
                setElapsedTime(triggerTime); // Жорстко фіксуємо фінішний час
                setPingProgress('Фініш!');
                sendCommand({ type: 21 }); // Зупиняємо залізо
            }
        }
    }, []);
    // --- ОБРОБКА ДАНИХ ВІД STM32 ---
    const handleMasterResponse = useCallback((data: any) => {
        const currentState = stateRef.current;

        if (data.type !== 31) {
            console.log(`${TAG} 📥 ОТРИМАНО ВІД ПЛАТИ:`, JSON.stringify(data));
        }

        switch (data.type) {
            case 31: setElapsedTime(data.elapsed); break;
            case 26:
                if (currentState === 'initializing_sensors' && data.assigned_id !== undefined) {
                    setSensors(prev => {
                        if (prev.find(s => s.id === data.assigned_id)) return prev;
                        return [...prev, { id: data.assigned_id, status: 'active', rssi: data.rssi }];
                    });
                }
                break;
            case 22:
                if (data.status === 'COMPLETE') {
                    if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
                    setState('ready');
                    setPingProgress('');
                } else {
                    const sId = data.sensor !== undefined ? data.sensor : data.RxNum;
                    if (sId !== undefined) {
                        setSensors(prev => prev.map(s => s.id === sId ? { ...s, status: 'active', rssi: data.rssi } : s));
                        setPingProgress(`Сенсор ${sId} OK...`);
                    }
                }
                break;
            case 20:
                console.log(`${TAG} Плата підтвердила ARMED (20)`);
                setState('armed');
                setPingProgress('Очікування старту');
                break;
            case 21:
                if (data.status === 'FINISHED') {
                    console.log(`${TAG} 🛑 ПЛАТА ПРИСЛАЛА РЕАЛЬНИЙ ФІНІШ (21)`);
                    setState('finished');
                    setPingProgress('Фініш!');
                }
                break;
            case 30:
                handleTrigger(data);
                break;
        }
    }, [handleTrigger]);

    // --- ПІДКЛЮЧЕННЯ ---
    // --- ПІДКЛЮЧЕННЯ ---
    const connectToDevice = async (target: any) => {
        if (isConnecting.current) return;

        // 🔥 ГОЛОВНИЙ ФІКС ПІДКЛЮЧЕННЯ:
        // Радіомодуль телефону не може надійно підключатися, поки він сканує ефір.
        // Примусово вбиваємо сканування перед підключенням!
        if (bleManager.current) {
            bleManager.current.stopDeviceScan();
            console.log(`${TAG} 🛑 Сканування зупинено для звільнення радіомодуля`);
        }

        setState('connecting');
        isConnecting.current = true;
        connectingDeviceId.current = target.id;

        try {
            if (Platform.OS === 'web') {
                await new Promise(r => setTimeout(r, 800));
                if (!isConnecting.current) return;
                setConnected(true); setState('initializing_sensors');
            } else {
                console.log(`${TAG} ⏳ Спроба підключення до ${target.id}...`);
                const conn = await target.connect({ timeout: 15000 });

                if (!isConnecting.current) {
                    await conn.cancelConnection().catch(() => {});
                    return;
                }

                if (Platform.OS === 'android') await conn.requestMTU(256).catch(() => {});

                if (!isConnecting.current) {
                    await conn.cancelConnection().catch(() => {});
                    return;
                }

                await conn.discoverAllServicesAndCharacteristics();

                if (!isConnecting.current) {
                    await conn.cancelConnection().catch(() => {});
                    return;
                }

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
                console.log(`${TAG} ✅ Підключення успішне!`);
                setTimeout(() => sendCommand({ type: 26 }, conn), 800);
            }
        } catch (e: any) {
            if (isConnecting.current) {
                console.log(`${TAG} ❌ Помилка підключення:`, e.message);
                setState('idle');
                Alert.alert("Помилка", "Не вдалося підключитися. Спробуйте ще раз.");
            } else {
                console.log(`${TAG} Підключення перервано користувачем.`);
            }
        } finally {
            isConnecting.current = false;
            connectingDeviceId.current = null;
        }
    };

    // --- СКАСУВАННЯ ПІДКЛЮЧЕННЯ ---
    const cancelConnecting = async () => {
        if (!isConnecting.current) return;

        console.log(`${TAG} 🛑 Скасування підключення користувачем...`);

        // 1. Опускаємо прапорець, щоб connectToDevice зупинилося
        isConnecting.current = false;

        // 2. Якщо вже маємо об'єкт з'єднання (але ще не завершили налаштування)
        if (deviceRef.current) {
            try {
                await deviceRef.current.cancelConnection();
            } catch (e) {}
            deviceRef.current = null;
            setDevice(null);
        }
        // 3. Якщо підключення ЩЕ В ПРОЦЕСІ target.connect(), жорстко скасовуємо через менеджер
        else if (connectingDeviceId.current && bleManager.current) {
            try {
                await bleManager.current.cancelDeviceConnection(connectingDeviceId.current);
            } catch (e) {}
        }

        setState('idle');
        setConnected(false);
    };

    // --- ПУБЛІЧНІ МЕТОДИ ---
    return {
        connected, state, sensors, elapsedTime, scannedDevices, session, pingProgress, device,
        finalTime: elapsedTime,
        canFinish: sensors.length >= 2,

        startDiscovery: async () => {
            const isBluetoothOn = await checkBluetoothState();
            if (!isBluetoothOn) return;

            if (connected && device) {
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

            // 🔥 ФІКС ПОШУКУ: Примусово зупиняємо старий пошук, якщо він "завис" у фоні
            if (bleManager.current) {
                bleManager.current.stopDeviceScan();
            }

            setScannedDevices([]);
            setState('discovering');

            if (bleManager.current) {
                bleManager.current.startDeviceScan(null, null, (err: any, d: any) => {
                    // 🔥 Якщо є помилка (наприклад, заборонили локацію), покажемо в логах
                    if (err) {
                        console.log(`${TAG} ❌ Помилка сканування:`, err.message);
                        return;
                    }
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
            console.log(`${TAG} Користувач натиснув СТАРТ. Відправляємо {type: 20, sensors: ${count}}`);
            sendCommand({ type: 20, sensors: count });
            setState('armed'); // Чекаємо старту
        },

        stopTraining: () => {
            console.log(`${TAG} 🛑 Примусова зупинка забігу користувачем`);
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