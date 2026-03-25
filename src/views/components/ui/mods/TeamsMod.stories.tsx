import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { TeamsMod } from './TeamsMod';

const MockTeamIcon = () => (
    <View className="w-10 h-10 bg-brand-light rounded-xl items-center justify-center">
        <Text>🛡️</Text>
    </View>
);

const MockTags = () => (
    <View className="bg-brand-orange/20 px-2 py-0.5 rounded-md">
        <Text className="text-brand-orange text-[10px] font-bold">PRO</Text>
    </View>
);

const meta = {
    title: 'Components/Mods/TeamsMod',
    component: TeamsMod,
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof TeamsMod>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        teamName: 'ZDTU Racing',
        icon: <MockTeamIcon />,
        onPress: () => console.log('Pressed'),
    },
};

export const FullInfo: Story = {
    args: {
        teamName: 'Polissya eSports',
        date: '15 Березня',
        time: '18:00',
        tags: <MockTags />,
        icon: <MockTeamIcon />,
        onPress: () => console.log('Pressed'),
    },
};