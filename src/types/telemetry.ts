export type TrainingState = 'idle' | 'discovering' | 'connecting' | 'initializing_sensors' | 'ready' | 'armed' | 'active' | 'finished';

export interface SensorInfo {
    id: number;
    physicalId?: string;
    status: 'active' | 'unknown' | 'timeout';
    rssi?: number;
    snr?: number;
    triggerTime?: number;
    splitTime?: number;
}


export interface TrainingSession {
    startTime: number;
    triggers: {
        sensorId: number;
        time: number;
        split: number;
    }[];
    totalTime?: number;
}

export interface CommandType {
    type: number;
    sensors?: number;
    status?: string;
}