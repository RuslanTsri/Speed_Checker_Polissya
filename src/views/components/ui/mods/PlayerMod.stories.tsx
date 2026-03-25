import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { PlayerMod } from './PlayerMod';

const meta = {
    title: 'Components/Mods/PlayerMod',
    component: PlayerMod,
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof PlayerMod>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        name: 'Олександр Вовк',
        subtitle: 'Пілот 1-го класу',
        onPress: () => console.log('Player Pressed'),
    },
};

export const WithActions: Story = {
    args: {
        name: 'Іван Богун',
        subtitle: 'Новачок',
        onPress: () => console.log('Player Pressed'),
        onEditPress: () => console.log('Edit'),
        onDeletePress: () => console.log('Delete'),
    },
};