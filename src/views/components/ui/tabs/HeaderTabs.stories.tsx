import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { HeaderTabs, TabItem } from './HeaderTabs';

const MOCK_TABS: TabItem[] = [
    { id: 'all', label: 'Всі заїзди' },
    { id: 'tournaments', label: 'Турніри' },
    { id: 'friends', label: 'Друзі' },
];

const HeaderTabsWrapper = (args: any) => {
    const [active, setActive] = useState(args.activeTab || 'all');
    return <HeaderTabs {...args} activeTab={active} onTabChange={setActive} />;
};

const meta = {
    title: 'Components/Tabs/HeaderTabs',
    component: HeaderTabs,
    args: {
        tabs: MOCK_TABS,
        activeTab: 'all',
        onTabChange: () => {}, // Заглушка для TS
    },
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof HeaderTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
    render: (args) => <HeaderTabsWrapper {...args} />,
};