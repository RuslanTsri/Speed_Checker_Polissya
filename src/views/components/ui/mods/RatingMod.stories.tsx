import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { RatingMod } from './RatingMod';

const meta = {
    title: 'Components/Mods/RatingMod',
    component: RatingMod,
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof RatingMod>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TopRank: Story = {
    args: {
        rank: 1,
        name: 'Ruslan Tsimbalyuk',
        subtitle: 'ZDTU Team',
        resultValue: '01:24.35',
        secondaryValue: '+0.00',
    },
};

export const LowerRank: Story = {
    args: {
        rank: 42,
        name: 'Гість',
        resultValue: '02:15.10',
        secondaryValue: '+50.75',
    },
};