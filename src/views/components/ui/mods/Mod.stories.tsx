import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { Mod } from './Mod';

const MockIcon = () => (
    <View className="w-10 h-10 bg-brand-orange/20 rounded-full items-center justify-center">
        <Text>🔥</Text>
    </View>
);

const MockRightHeader = () => (
    <View className="bg-surface-border px-2 py-1 rounded-md">
        <Text className="text-text-muted text-xs">Деталі</Text>
    </View>
);

const meta = {
    title: 'Components/Mods/Mod',
    component: Mod,
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof Mod>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Базовий мод',
        subtitle: 'Опис під заголовком',
        icon: <MockIcon />,
        onPress: () => console.log('Pressed'),
    },
};

export const GhostVariant: Story = {
    args: {
        title: 'Примарний мод (Ghost)',
        subtitle: 'Без тіней та розмиття',
        variant: 'ghost',
        icon: <MockIcon />,
        onPress: () => console.log('Pressed'),
    },
};

export const WithRightHeader: Story = {
    args: {
        title: 'Мод з елементом справа',
        subtitle: 'Корисна інформація',
        icon: <MockIcon />,
        rightHeader: <MockRightHeader />,
    },
};

export const WithChildren: Story = {
    args: {
        title: 'Мод з контентом',
        icon: <MockIcon />,
        children: (
            <View className="bg-white/10 p-4 rounded-xl mt-2">
                <Text className="text-white text-center">Тут може бути будь-який вкладений контент</Text>
            </View>
        ),
    },
};