import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { Button } from './Button';

const meta = {
    title: 'Components/Button/Button',
    component: Button,
    argTypes: {
        onPress: { action: 'pressed' },
        variant: {
            control: 'select',
            options: ['light', 'primary', 'outline', 'danger'],
        },
    },
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 items-center justify-center bg-surface-card bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        title: 'Primary Button',
        variant: 'primary',
    },
};

export const Light: Story = {
    args: {
        title: 'Light Button',
        variant: 'light',
    },
};

export const Outline: Story = {
    args: {
        title: 'Outline Button',
        variant: 'outline',
    },
};

export const Danger: Story = {
    args: {
        title: 'Danger Button',
        variant: 'danger',
    },
};

export const Disabled: Story = {
    args: {
        title: 'Disabled',
        variant: 'primary',
        disabled: true,
    },
};

export const Loading: Story = {
    args: {
        title: 'Loading',
        variant: 'primary',
        isLoading: true,
    },
};

export const WithIcon: Story = {
    args: {
        title: 'With Icon',
        variant: 'primary',
        icon: <Text className="text-white"></Text>,
    },
};