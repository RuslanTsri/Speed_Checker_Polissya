import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { BestCard } from './BestCard';

const meta = {
    title: 'Components/Stats/BestCard',
    component: BestCard,
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 justify-center bg-[#121212]">
                <View className="flex-row justify-start">
                    <Story />
                </View>
            </View>
        ),
    ],
} satisfies Meta<typeof BestCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Найкращий час',
        time: '01:24',
        playerName: 'Олександр В.',
    },
};

export const WithTeam: Story = {
    args: {
        title: 'Рекорд траси',
        time: '00:58',
        playerName: 'Іван Богун',
        teamName: 'ZDTU Racing',
    },
};