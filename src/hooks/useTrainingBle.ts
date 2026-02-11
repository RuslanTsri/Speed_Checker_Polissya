import { useState, useEffect, useRef } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer';
import { SensorInfo, TrainingSession, TrainingState, CommandType } from '../types/telemetry';
import { BLE_CONFIG } from '../constants/bleConfig';

let bleManagerInstance: any = null;

const TAG = '[BLE-DEBUG]';

export const useTrainingBle = () => {
// =========================================================================
// 🌍 WEB MODE (Заглушка для браузера)
// =========================================================================
    if (Platform.OS === 'web') {
        const [connected, setConnected] = useState(false);
        const [state, setState] = useState<TrainingState>('idle');
        const [elapsedTime, setElapsedTime] = useState(0);
        const [pingProgress, setPingProgress] = useState('');
        const [sensors, setSensors] = useState<SensorInfo[]>([
            { id: 0, status: 'unknown' }, { id: 1, status: 'unknown' },
            { id: 2, status: 'unknown' }, { id: 3, status: 'unknown' },
            { id: 4, status: 'unknown' }, { id: 5, status: 'unknown' },
        ]);

        return {
            connected, state, sensors, session: null, elapsedTime, pingProgress,
            // 👇 ДОДАЄМО ВІДСУТНІ ПОЛЯ, ЩОБ TS НЕ ЛАЯВСЯ
            device: { name: "Web Device" },
            startTime: 0,
            finalTime: 0,

            startDiscovery: () => {
                setState('discovering');
                setTimeout(() => {
                    setConnected(true);
                    setState('idle');
                    setSensors(s => s.map(x => ({...x, status: 'active'})));
                }, 1000);
            },

            pingMaster: async () => {
                console.log('Web Ping Master');
                return true;
            },

            stopPing: () => setState('ready'),
            startTraining: () => setState('active'),
            stopTraining: () => setState('finished'),
            resetSession: () => setState('idle'),
            disconnect: () => setConnected(false)
        };
    }
// =========================================================================
// NATIVE MODE (Робоча логіка)
// =========================================================================

    const BLE = require('@sfourdrinier/react-native-ble-plx');
    if (!bleManagerInstance) bleManagerInstance = new BLE.BleManager();
    const bleManager = bleManagerInstance;
    const { ScanMode } = BLE;

// --- STATE ---
    const [device, setDevice] = useState<any>(null);
    const [connected, setConnected] = useState(false);
    const [state, setState] = useState<TrainingState>('idle');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [pingProgress, setPingProgress] = useState<string>('');
    const [sensors, setSensors] = useState<SensorInfo[]>([

        { id: 0, status: 'active' },
        { id: 1, status: 'unknown' },
        { id: 2, status: 'unknown' },
        { id: 3, status: 'unknown' },
        { id: 4, status: 'unknown' },
        { id: 5, status: 'unknown' },
    ]);

    const [session, setSession] = useState<TrainingSession | null>(null);

// --- REFS ---
    const isConnecting = useRef(false);
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isPinging = useRef(false);
    const subscriptionRef = useRef<any>(null);
    const deviceRef = useRef<any>(null);

// --- CLEANUP ---
    useEffect(() => {
        return () => {
            console.log(`${TAG} Unmounting - Cleaning up`);
            stopScanning();
            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
            }

            if (deviceRef.current) {
                deviceRef.current.cancelConnection().catch(() => {});
            }
        };
    }, []);

// --- PERMISSIONS ---
    const requestPermissions = async (): Promise<boolean> => {

        if (Platform.OS === 'android') {

            try {

                if (Platform.Version >= 31) {

                    const result = await PermissionsAndroid.requestMultiple([

                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    ]);

                    return result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&

                        result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                        result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;
                } else {

                    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                }

            } catch (err) { return false; }

        }
        return true;
    };

// --- SCANNING ---
    const stopScanning = () => {
        bleManager.stopDeviceScan();
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };

    const scanForDevices = async () => {

        const hasPermissions = await requestPermissions();
        if (!hasPermissions) {
            Alert.alert('Помилка', 'Немає дозволів на Bluetooth');
            return;
        }

        if (connected && device) {
            console.log(`${TAG} Already connected`);
            return;
        }
        stopScanning();
        setState('discovering');

        let deviceFound = false;

        console.log(`${TAG} Scanning...`);

        bleManager.startDeviceScan(null, { scanMode: ScanMode.LowLatency, allowDuplicates: false }, (error: any, scannedDevice: any) => {

            if (error) {
                if (error.errorCode !== 201) {
                    console.error(`${TAG} Scan Error:`, error);
                    stopScanning();
                    setState('idle');
                }
                return;
            }

            if (scannedDevice?.name && !deviceFound) {
                const nameMatch = BLE_CONFIG.DEVICE_NAME_PREFIX.some(prefix =>
                    scannedDevice.name.toUpperCase().includes(prefix.toUpperCase())
                );

                if (nameMatch) {
                    deviceFound = true;
                    console.log(`${TAG} Found: ${scannedDevice.name}`);
                    stopScanning();
                    setTimeout(() => connectToDevice(scannedDevice), 1000);
                }
            }
        });

        scanTimeoutRef.current = setTimeout(() => {
            if (!deviceFound && !connected && !isConnecting.current) {
                console.log(`${TAG} Scan Timeout`);
                stopScanning();
                setState('idle');
                Alert.alert('Не знайдено', 'Перевірте STM32');
            }

        }, 15000);
    };

// --- CONNECTION ---

    const connectToDevice = async (scannedDevice: any) => {
        if (isConnecting.current) return;

        try {

            isConnecting.current = true;
            console.log(`${TAG} Connecting to ${scannedDevice.name}...`);
            const connectedDevice = await scannedDevice.connect({ autoConnect: false, timeout: 10000 });
            console.log(`${TAG} Connected. Discovering...`);
            if (Platform.OS === 'android') {
                try {
                    await connectedDevice.requestMTU(512);



                    console.log(`${TAG} MTU 512 requested`);



                } catch(e) { console.log(`${TAG} MTU request fail`, e); }



            }







            await new Promise(resolve => setTimeout(resolve, 500));



            await connectedDevice.discoverAllServicesAndCharacteristics();







// Очищення старої підписки



            if (subscriptionRef.current) subscriptionRef.current.remove();







            console.log(`${TAG} Subscribing to RX...`);



            subscriptionRef.current = connectedDevice.monitorCharacteristicForService(



                BLE_CONFIG.SERVICE_UUID,



                BLE_CONFIG.RX_CHARACTERISTIC_UUID,



                onDataReceived



            );







            deviceRef.current = connectedDevice;



            setDevice(connectedDevice);



            setConnected(true);



            setState('idle');



            isConnecting.current = false;







            Alert.alert('Підключено', `${scannedDevice.name} готовий`);



        } catch (error: any) {



            console.error(`${TAG} Connection Error:`, error);



            isConnecting.current = false;



            setConnected(false);



            setState('idle');



            Alert.alert('Помилка', error.message);



        }



    };







// --- DATA HANDLING (RX) ---



    const onDataReceived = (error: any, characteristic: any) => {



        if (error) {



            console.error(`${TAG} Monitor Error:`, error.message);



            return;



        }



        if (!characteristic?.value) return;







        try {



            const raw = Buffer.from(characteristic.value, 'base64').toString('utf-8').trim();



            console.log(`${TAG} 📩 RAW RX: "${raw}"`); // <--- ДИВИСЬ СЮДИ В ЛОГАХ







            const jsonStart = raw.indexOf('{');



            const jsonEnd = raw.lastIndexOf('}');







            if (jsonStart !== -1 && jsonEnd !== -1) {



                const jsonStr = raw.substring(jsonStart, jsonEnd + 1);



                const data = JSON.parse(jsonStr);



                handleMasterResponse(data);



            }



        } catch (e) {



            console.error(`${TAG} Parse Error:`, e);



        }



    };







    const handleMasterResponse = (data: any) => {

// Логуємо тип пакету для дебагу

        if (data.type !== 31) { // 31 (час) приходить часто, не засмічуємо лог

            console.log(`${TAG} 🧠 Packet: Type=${data.type} Sensor=${data.sensor}`);

        }



        switch (data.type) {

            case 20:

                setState('armed');

                setPingProgress('Озброєно - Готовий до старту');

                break;

            case 21:

                if (data.status === 'FINISHED') {

                    setState('finished');

                    setSession((prev) => prev ? { ...prev, totalTime: data.total_time } : null);

                    setPingProgress('Фініш!');

                }

                break;

            case 22: // PING

                if (data.status === 'COMPLETE') {

                    forceStopPing();

                } else {

                    const sensorId = data.sensor !== undefined ? data.sensor : data.RxNum;

                    if (sensorId !== undefined) {

                        updateSensorStatus(sensorId, 'active', data.rssi);

                        setPingProgress(`Сенсор ${sensorId} OK...`);

                    }

                }

                break;

            case 30: // 🔥 TRIGGER (Перетин лазера)

                handleTrigger(data);

                break;

            case 31:

// Оновлення часу від STM32 (точнший час)

                setElapsedTime(data.elapsed);

                break;

        }

    };



    const updateSensorStatus = (id: number, status: SensorInfo['status'], rssi?: number) => {



        setSensors(prev => prev.map(s => s.id === id ? { ...s, status, rssi } : s));



    };







    const handleTrigger = (data: any) => {

        const triggeredId = data.sensor;

        const triggerTime = data.time || 0; // Час, який прислав STM32



        console.log(`${TAG} 🎯 Trigger! Sensor: ${triggeredId} | Time: ${triggerTime}ms`);



// 1. Оновлюємо UI картки сенсора (щоб показати час)

        setSensors(prev => prev.map(s =>

            s.id === triggeredId

                ? { ...s, status: 'active', triggerTime: triggerTime, splitTime: data.split }

                : s

        ));



// -------------------------------

// ЕТАП 1: СТАРТ (Мастер, ID 0)

// -------------------------------

        if (triggeredId === 0) {

// Якщо ми "Озброєні" або вже бігли (рестарт) - починаємо заново

            if (state === 'armed' || state === 'ready' || state === 'active' || state === 'finished') {

                console.log(`${TAG} 🏁 START LINE CROSSED! Timer Reset.`);



                setState('active'); // Запускаємо таймер в додатку

                setElapsedTime(0); // Скидаємо візуальний таймер



// Створюємо нову сесію

                setSession({

                    startTime: Date.now(),

                    triggers: [{ sensorId: 0, time: 0, split: 0 }]

                });



// Очищаємо попередні часи на сенсорах візуально

                setSensors(prev => prev.map(s => ({

                    ...s,

                    triggerTime: s.id === 0 ? 0 : undefined, // На старті показуємо 0

                    splitTime: undefined

                })));

            }

            return;

        }



// -------------------------------

// ЕТАП 2: РОЗРАХУНОК ФІНІШУ

// -------------------------------

// Знаходимо всі активні сенсори (крім Мастера)

        const activeSensorIds = sensors

            .filter(s => s.status === 'active' && s.id !== 0)

            .map(s => s.id);



// Фініш - це сенсор з найбільшим ID

        const finishSensorId = activeSensorIds.length > 0 ? Math.max(...activeSensorIds) : 0;



// Працюємо тільки якщо гонка активна

        if (state === 'active' && session) {



// Додаємо результат в історію

            setSession(prev => {

                if (!prev) return null;

// Захист від подвійного спрацювання (debounce 500ms)

                const isDuplicate = prev.triggers.some(t => t.sensorId === triggeredId && Math.abs(t.time - triggerTime) < 500);

                if (isDuplicate) return prev;



                return {

                    ...prev,

                    triggers: [...prev.triggers, { sensorId: triggeredId, time: triggerTime, split: data.split }]

                };

            });



// -------------------------------

// ЕТАП 3: ФІНІШ чи СПЛІТ?

// -------------------------------

            if (triggeredId === finishSensorId) {
                console.log(`${TAG} 🏁 FINISH LINE CROSSED (Sensor ${triggeredId})`);
// 1. Зупиняємо таймер в UI
                setState('finished');
// 2. Встановлюємо фінальний час таймера точно як на сенсорі
                setElapsedTime(triggerTime);
                sendCommand({ type: 21 });
            } else {
                console.log(`${TAG} ⏱️ SPLIT TIME (Sensor ${triggeredId})`);
            }
        }
    };
    const sendCommand = async (command: CommandType) => {
        if (!device || !connected) {
            console.log(`${TAG} Not connected`);
            return;
        }
        try {
            console.log(`${TAG} 📤 Sending:`, JSON.stringify(command));
            const base64Data = Buffer.from(JSON.stringify(command)).toString('base64');
            await device.writeCharacteristicWithResponseForService(
                BLE_CONFIG.SERVICE_UUID,
                BLE_CONFIG.TX_CHARACTERISTIC_UUID,
                base64Data
            );
        } catch (error: any) {
            console.error(`${TAG} Send Error:`, error.message);
        }
    };
// --- ACTIONS ---
    const forceStopPing = () => {
        if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
        isPinging.current = false;
        setState('ready');
        setPingProgress('');
        const activeCount = sensors.filter(s => s.status === 'active').length;
        Alert.alert('Пінгування завершено', `Активних: ${activeCount}`);
    };
    const startDiscovery = async () => {
        if (connected && device) {
            const isAlive = await device.isConnected();
            if (isAlive) {
                console.log(`${TAG} Starting Ping Sequence`);
// Reset UI
                setSensors(prev => prev.map(s => s.id === 0 ? s : { ...s, status: 'unknown', rssi: undefined }));
                setState('discovering');
                setPingProgress('Пінг...');
                isPinging.current = true;
// Safety Timeout 5s
                if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
                pingTimeoutRef.current = setTimeout(() => {
                    console.log(`${TAG} Ping Timeout!`);
                    if (isPinging.current) forceStopPing();
                }, 5000);
                await sendCommand({ type: 22 });
                return;
            }
        }
        setDevice(null); setConnected(false);
        await scanForDevices();
    };

    const disconnect = async () => {
        console.log(`${TAG} Manual Disconnect`);
        if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
// 1. UI Reset
        setConnected(false);
        setState('idle');
        setDevice(null);

// 2. BLE Cleanup
        if (subscriptionRef.current) {
            subscriptionRef.current.remove();
            subscriptionRef.current = null;
        }

        if (device) {
            try { await device.cancelConnection(); } catch (e) {}
        }

// 3. Delayed State Reset
        setTimeout(() => {
            setSensors(prev => prev.map(s => ({ ...s, status: s.id === 0 ? 'active' : 'unknown', rssi: undefined })));
            setSession(null);
            setElapsedTime(0);
            setPingProgress('');
        }, 100);
    };
    const startTraining = () => {
        const count = sensors.filter(s => s.status === 'active' && s.id !== 0).length;
        if (count === 0) { Alert.alert("Увага", "Немає активних сенсорів, але спробуємо почати."); }
        sendCommand({ type: 20, sensors: count });
        setState('armed');
        setPingProgress('Очікування старту...');
    };

    const stopTraining = () => { sendCommand({ type: 21 }); setPingProgress(''); };

    const resetSession = () => {
        sendCommand({ type: 24 });
        setState('idle');
        setSession(null);
        setElapsedTime(0);
        setPingProgress('');
        setSensors(prev => prev.map(s => ({ ...s, status: s.id === 0 ? 'active' : 'unknown', triggerTime: undefined, splitTime: undefined })));
    };

    const pingMaster = async () => {
        if (!device || !connected) return false;

        try {
            const isAlive = await device.isConnected();
            if (!isAlive) {
                setConnected(false);
                return false;
            }

            console.log(`${TAG} Pinging Master Node...`);
            setPingProgress('Перевірка зв\'язку...');

            await sendCommand({ type: 22 });

            // Очистимо текст через секунду, щоб користувач бачив ефект
            setTimeout(() => setPingProgress(''), 1500);

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };
    return {
        connected, state, sensors, session, elapsedTime, pingProgress,
        startDiscovery, stopPing: forceStopPing, startTraining, stopTraining, resetSession,
        disconnect,pingMaster,device

    };
    }

