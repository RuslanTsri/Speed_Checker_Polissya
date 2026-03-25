import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { WorstCard } from './WorstCard';

const meta = {
    title: 'Components/Stats/WorstCard',
    component: WorstCard,
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 justify-center bg-[#121212]">
                <View className="flex-row justify-start">
                    <Story />
                </View>
            </View>
        ),
    ],
} satisfies Meta<typeof WorstCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Найгірший час',
        time: '03:45',
        playerName: 'Гість_1234',
    },
};

export const WithTeam: Story = {
    args: {
        title: 'Останнє місце',
        time: '04:12',
        playerName: 'Максим К.',
        teamName: 'Amateurs',
    },
};