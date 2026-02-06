export interface SensorInfo {
    id: number;
    status: 'active' | 'timeout' | 'unknown';
    rssi?: number;
    snr?: number;
    triggerTime?: number;
    splitTime?: number;
}

export interface TrainingSession {
    startTime: number;
    totalTime?: number;
    triggers: {
        sensorId: number;
        time: number;
        split: number;
    }[];
}

export type TrainingState = 'idle' | 'discovering' | 'ready' | 'armed' | 'active' | 'finished';

export interface CommandType {
    type: number;
    sensors?: number;
}