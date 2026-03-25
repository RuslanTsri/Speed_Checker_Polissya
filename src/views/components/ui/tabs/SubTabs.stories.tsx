import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { SubTabs } from './SubTabs';

const MOCK_DISTANCES: (number | 'ALL')[] = ['ALL', 100, 200, 400, 1000];

const SubTabsWrapper = (args: any) => {
    const [selected, setSelected] = useState<(number | 'ALL')>(args.selectedDistance || 'ALL');
    return <SubTabs {...args} selectedDistance={selected} onSelect={setSelected} />;
};

const meta = {
    title: 'Components/Tabs/SubTabs',
    component: SubTabs,
    args: {
        distances: MOCK_DISTANCES,
        selectedDistance: 'ALL',
        onSelect: () => {}, // Заглушка для TS
    },
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof SubTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
    render: (args) => <SubTabsWrapper {...args} />,
};