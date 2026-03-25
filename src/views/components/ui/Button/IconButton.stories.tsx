import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { IconButton } from './IconButton';

const meta = {
    title: 'Components/Button/IconButton',
    component: IconButton,
    argTypes: {
        onPress: { action: 'pressed' },
    },
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 items-center justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Створюємо просту іконку-заглушку для відображення
const MockIcon = () => <Text className="text-white text-lg">⚙️</Text>;

export const Default: Story = {
    args: {
        icon: <MockIcon />,
        optimizeForList: false,
    },
};

export const OptimizedForList: Story = {
    args: {
        icon: <MockIcon />,
        optimizeForList: true,
    },
};