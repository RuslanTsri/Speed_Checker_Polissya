import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Primary } from './Primary';

const meta = {
    title: 'Components/Primary',
    component: Primary,
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 items-center justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof Primary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gradient: Story = {
    args: {
        variant: 'gradient',
        isActive: false,
    },
};

export const Dark: Story = {
    args: {
        variant: 'dark',
        isActive: false,
    },
};

export const Active: Story = {
    args: {
        variant: 'gradient',
        isActive: true,
    },
};