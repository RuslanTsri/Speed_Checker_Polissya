import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { SensorCard } from './SensorCard';

const meta = {
    title: 'Complex/SensorCard',
    component: SensorCard,
    decorators: [
        (Story) => (
            <View className="flex-1 bg-[#121212] p-4 justify-center">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof SensorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveMaster: Story = {
    args: {
        item: {
            id: 0,
            status: 'active',
            rssi: -45,
            triggerTime: 12500, // Значення в мс або с, залежить від твоєї formatTime
        },
    },
};

export const ActiveGate: Story = {
    args: {
        item: {
            id: 2,
            status: 'active',
            rssi: -65,
            triggerTime: 24350,
        },
    },
};

export const LostConnection: Story = {
    args: {
        item: {
            id: 3,
            status: 'timeout',
            rssi: null,
            triggerTime: undefined,
        },
    },
};

export const InactiveGate: Story = {
    args: {
        item: {
            id: 4,
            status: 'inactive',
            rssi: -90,
            triggerTime: undefined,
        },
    },
};