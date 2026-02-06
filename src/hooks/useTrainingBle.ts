import { useState, useEffect, useRef } from 'react';
import { Alert, Platform, PermissionsAndroid, Linking } from 'react-native';

import { BleManager, Device, Characteristic, BleError, ScanMode, State } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

import { SensorInfo, TrainingSession, TrainingState, CommandType } from '../types/telemetry';
import { BLE_CONFIG } from '../constants/bleConfig';

const bleManagerInstance = new BleManager();

export const useTrainingBle = () => {
    const bleManager = bleManagerInstance;

    const [device, setDevice] = useState<Device | null>(null);
    const [connected, setConnected] = useState(false);
    const [state, setState] = useState<TrainingState>('idle');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [pingProgress, setPingProgress] = useState<string>('');

    const isConnecting = useRef(false);
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isPinging = useRef(false);
    const MAX_RECONNECT_ATTEMPTS = 3;

    const [sensors, setSensors] = useState<SensorInfo[]>([
        { id: 0, status: 'active' },
        { id: 1, status: 'unknown' },
        { id: 2, status: 'unknown' },
        { id: 3, status: 'unknown' },
        { id: 4, status: 'unknown' },
        { id: 5, status: 'unknown' },
    ]);

    const [session, setSession] = useState<TrainingSession | null>(null);

    // --- 1. ОНОВЛЕНА ФУНКЦІЯ ПРАВ ДОСТУПУ (Android 12+ Support) ---
    const requestPermissions = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                // Для Android 12+ (API 31+)
                if (Platform.Version >= 31) {
                    const result = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    ]);

                    const isGranted =
                        result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                        result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                        result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

                    if (!isGranted) {
                        Alert.alert(
                            "Потрібні дозволи",
                            "Для роботи з Bluetooth нам потрібен доступ. Будь ласка, надайте дозволи в налаштуваннях.",
                            [
                                { text: "Відмінити", style: "cancel" },
                                { text: "Відкрити налаштування", onPress: () => Linking.openSettings() }
                            ]
                        );
                    }
                    return isGranted;
                }
                else {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                }
            } catch (err) {
                console.error('[PERMISSIONS] Error:', err);
                return false;
            }
        }
        return true;
    };

    // --- 2. НОВА ФУНКЦІЯ: Перевірка та увімкнення Bluetooth ---
    const checkBluetoothState = async (): Promise<boolean> => {
        const state = await bleManager.state();

        console.log('[BLE STATE CHECK]', state);

        if (state === State.PoweredOn) {
            return true;
        }

        if (state === State.PoweredOff) {
            if (Platform.OS === 'android') {
                try {
                    // Спроба 1: Програмне включення (працює на < Android 12)
                    await bleManager.enable();
                    return true;
                } catch (error) {
                    // Спроба 2: Якщо система заборонила, просимо юзера відкрити налаштування
                    Alert.alert(
                        "Bluetooth вимкнено",
                        "Система не дозволяє автоматично увімкнути Bluetooth. Відкрити налаштування?",
                        [
                            { text: "Ні", style: "cancel", onPress: () => false },
                            {
                                text: "Відкрити",
                                onPress: () => {
                                    // Відкриває саме меню Bluetooth на Android
                                    Linking.sendIntent("android.settings.BLUETOOTH_SETTINGS");
                                }
                            }
                        ]
                    );
                    return false;
                }
            } else {
                // iOS не дозволяє програмно вмикати, тільки налаштування
                Alert.alert(
                    "Bluetooth вимкнено",
                    "Увімкніть Bluetooth у налаштуваннях iOS",
                    [
                        { text: "OK", onPress: () => Linking.openSettings() }
                    ]
                );
                return false;
            }
        }

        if (state === State.Unauthorized) {
            Alert.alert("Помилка", "Додаток не має прав на використання Bluetooth. Перевірте налаштування.");
            return false;
        }

        return false;
    };
    // --- BLE LIFECYCLE ---
    useEffect(() => {
        const subscription = bleManager.onStateChange((bleState) => {
            console.log('[BLE STATE CHANGED]', bleState);
        }, true);
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (!device) return;

        const subscription = device.onDisconnected((error, disconnectedDevice) => {
            console.log('[BLE] Disconnected');
            setConnected(false);
            setDevice(null);
            setState('idle');
            setSession(null);
            setPingProgress('');

            if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttemptsRef.current++;
                setTimeout(() => scanForDevices(), 2000);
            }
        });

        return () => subscription.remove();
    }, [device]);

    // --- SCANNING ---
    const stopScanning = () => {
        bleManager.stopDeviceScan();
        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = null;
        }
    };

    // --- 3. ОНОВЛЕНА ЛОГІКА СТАРТУ СКАНУВАННЯ ---
    const scanForDevices = async () => {
        // Крок 1: Перевіряємо права
        const hasPerms = await requestPermissions();
        if (!hasPerms) return;

        // Крок 2: Перевіряємо, чи увімкнений адаптер (і вмикаємо якщо ні)
        const isEnabled = await checkBluetoothState();
        if (!isEnabled) return;

        if (connected || isConnecting.current) return;

        stopScanning();
        setState('discovering');
        console.log('[SCAN] Starting...');

        bleManager.startDeviceScan(null, { scanMode: ScanMode.LowLatency }, (error, scannedDevice) => {
            if (error) {
                if (error.errorCode !== 201) { // 201 = Scan stopped (це нормально)
                    stopScanning();
                    setState('idle');
                    Alert.alert('Помилка сканування', error.message);
                }
                return;
            }

            if (scannedDevice?.name) {
                const isMatch = BLE_CONFIG.DEVICE_NAME_PREFIX.some(prefix =>
                    scannedDevice.name!.toUpperCase().includes(prefix.toUpperCase())
                );

                if (isMatch) {
                    console.log(`[SCAN] Found ${scannedDevice.name}`);
                    stopScanning();
                    connectToDevice(scannedDevice);
                }
            }
        });

        scanTimeoutRef.current = setTimeout(() => {
            if (!connected && !isConnecting.current) {
                stopScanning();
                setState('idle');
                Alert.alert(
                    'Пристрій не знайдено',
                    'Перевірте живлення Master Node та спробуйте ще раз.',
                    [{ text: "OK" }]
                );
            }
        }, 15000);
    };

    // --- CONNECTION ---
    const connectToDevice = async (scannedDevice: Device) => {
        if (isConnecting.current) return;
        isConnecting.current = true;
        try {
            const connectedDevice = await scannedDevice.connect({ autoConnect: false, timeout: 10000 });
            await connectedDevice.discoverAllServicesAndCharacteristics();
            connectedDevice.monitorCharacteristicForService(
                BLE_CONFIG.SERVICE_UUID,
                BLE_CONFIG.RX_CHARACTERISTIC_UUID,
                onDataReceived
            );
            setDevice(connectedDevice);
            setConnected(true);
            setState('idle');
            isConnecting.current = false;
            reconnectAttemptsRef.current = 0;
            Alert.alert('Підключено', `${scannedDevice.name} готовий`);
        } catch (error: any) {
            console.error('[CONNECT]', error);
            isConnecting.current = false;
            setConnected(false);
            setState('idle');
            Alert.alert('Помилка підключення', error.message);
        }
    };

    // --- DATA HANDLING ---
    const onDataReceived = (error: BleError | null, characteristic: Characteristic | null) => {
        if (error || !characteristic?.value) return;
        try {
            const rawData = Buffer.from(characteristic.value, 'base64').toString('utf-8');
            const trimmed = rawData.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                const data = JSON.parse(trimmed);
                handleMasterResponse(data);
            }
        } catch (e) { console.error('[DATA] Parse error'); }
    };

    const handleMasterResponse = (data: any) => {
        switch (data.type) {
            case 20: setState('armed'); setPingProgress('Озброєно'); break;
            case 21: if (data.status === 'FINISHED') { setState('finished'); setSession(prev => prev ? { ...prev, totalTime: data.total_time } : null); } break;
            case 22: if (data.status === 'COMPLETE') { setState('ready'); setPingProgress(''); isPinging.current = false; } else if (data.sensor !== undefined) { updateSensorStatus(data.sensor, data.status === 'OK' ? 'active' : 'timeout', data.rssi); setPingProgress(`Сенсор ${data.sensor}...`); } break;
            case 30: if (data.sensor === 0 && !session) { setState('active'); setSession({ startTime: Date.now(), triggers: [] }); } else { handleTrigger(data); } break;
            case 31: setElapsedTime(data.elapsed); break;
        }
    };

    const updateSensorStatus = (id: number, status: SensorInfo['status'], rssi?: number) => {
        setSensors(prev => prev.map(s => s.id === id ? { ...s, status, rssi } : s));
    };

    const handleTrigger = (data: any) => {
        setSensors(prev => prev.map(s => s.id === data.sensor ? { ...s, status: 'active', triggerTime: data.time, splitTime: data.split } : s));
        setSession(prev => { if (!prev) return null; return { ...prev, triggers: [...prev.triggers, { sensorId: data.sensor, time: data.time, split: data.split }], }; });
    };

    const sendCommand = async (command: CommandType) => {
        if (!device || !connected) return;
        try {
            const base64Data = Buffer.from(JSON.stringify(command)).toString('base64');
            await device.writeCharacteristicWithResponseForService(BLE_CONFIG.SERVICE_UUID, BLE_CONFIG.TX_CHARACTERISTIC_UUID, base64Data);
        } catch (error) { console.error('[COMMAND] Error sending'); }
    };

    // --- ACTIONS ---
    const startDiscovery = async () => {
        // Перед пінгом теж варто перевірити Bluetooth
        const isEnabled = await checkBluetoothState();
        if (!isEnabled) return;

        if (connected) {
            setState('discovering');
            setPingProgress('Пінг...');
            isPinging.current = true;
            setSensors(prev => prev.map(s => s.id === 0 ? s : { ...s, status: 'unknown' }));
            sendCommand({ type: 22 });
        } else {
            scanForDevices();
        }
    };

    const stopPing = () => { isPinging.current = false; setState('ready'); setPingProgress(''); };
    const startTraining = () => { const count = sensors.filter(s => s.status === 'active' && s.id !== 0).length; if (count === 0) { Alert.alert("Увага", "Не знайдено активних сенсорів"); return; } sendCommand({ type: 20, sensors: count }); setState('armed'); };
    const stopTraining = () => { sendCommand({ type: 21 }); };
    const resetSession = () => { sendCommand({ type: 24 }); setState('idle'); setSession(null); setElapsedTime(0); setSensors(prev => prev.map(s => ({ ...s, status: s.id === 0 ? 'active' : 'unknown', triggerTime: undefined, splitTime: undefined }))); };

    return {
        connected, state, sensors, session, elapsedTime, pingProgress,
        startDiscovery, stopPing, startTraining, stopTraining, resetSession
    };
};