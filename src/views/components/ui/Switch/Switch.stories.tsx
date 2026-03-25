import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { Switch } from './Switch';

const SwitchWrapper = (args: any) => {
    const [isActive, setIsActive] = useState(args.active || false);
    return (
        <View className="flex-row items-center space-x-3">
            <Switch {...args} active={isActive} onChange={setIsActive} />
            <Text className="text-white font-evolventa ml-3">
                {isActive ? 'Увімкнено' : 'Вимкнено'}
            </Text>
        </View>
    );
};

const meta = {
    title: 'Components/Switch',
    component: Switch,
    args: {
        onChange: () => {}, // Заглушка для TS
    },
    decorators: [
        (Story) => (
            <View className="flex-1 p-6 justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
    render: (args) => <SwitchWrapper {...args} />,
    args: {
        active: false,
    },
};