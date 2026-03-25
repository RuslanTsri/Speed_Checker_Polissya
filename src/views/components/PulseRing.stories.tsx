import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { PulseRing } from './PulseRing';

const meta = {
    title: 'Complex/PulseRing',
    component: PulseRing,
    decorators: [
        (Story) => (
            <View className="flex-1 bg-[#121212] justify-center items-center">
                <View className="w-32 h-32 items-center justify-center relative">
                    <Story />
                    {/* Центральний елемент для контексту */}
                    <View className="w-16 h-16 bg-brand-yellow rounded-full items-center justify-center z-10">
                        <Text className="text-black font-bold">NFC</Text>
                    </View>
                </View>
            </View>
        ),
    ],
} satisfies Meta<typeof PulseRing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        delay: 0,
    },
};

export const WithDelay: Story = {
    args: {
        delay: 1000,
    },
};