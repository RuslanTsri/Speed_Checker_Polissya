export interface SensorInfo {
    id: number; // Порядковий номер (0, 1, 2...)
    status: 'active' | 'timeout' | 'unknown';
    physicalId?: string | number; // Унікальний ID заліза
    triggerTime?: number;
}

export type TrainingState =
    | 'idle'
    | 'discovering'
    | 'connecting'
    | 'initializing_sensors'
    | 'ready'
    | 'armed'
    | 'active'
    | 'finished';

export interface CommandType {
    type: number;
    sensors?: number; // Для команди 23 (SET_COUNT)
}