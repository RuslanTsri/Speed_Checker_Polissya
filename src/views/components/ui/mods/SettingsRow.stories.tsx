import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { SettingsRow } from './SettingsRow';

const MockSettingIcon = () => <Text className="text-xl">⚙️</Text>;
const MockProfileIcon = () => <Text className="text-xl">👤</Text>;
const MockLogoutIcon = () => <Text className="text-xl">🚪</Text>;

const meta = {
    title: 'Components/Mods/SettingsRow',
    component: SettingsRow,
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 justify-center bg-[#121212]">
                <View className="bg-surface-card rounded-2xl p-2 border border-surface-border">
                    <Story />
                </View>
            </View>
        ),
    ],
} satisfies Meta<typeof SettingsRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Профіль користувача',
        icon: <MockProfileIcon />,
        onPress: () => console.log('Pressed'),
    },
};

export const WithValue: Story = {
    args: {
        title: 'Мова',
        value: 'Українська',
        icon: <MockSettingIcon />,
        onPress: () => console.log('Pressed'),
    },
};

export const Destructive: Story = {
    args: {
        title: 'Вийти з акаунта',
        icon: <MockLogoutIcon />,
        destructive: true,
        isLast: true,
        onPress: () => console.log('Pressed'),
    },
};