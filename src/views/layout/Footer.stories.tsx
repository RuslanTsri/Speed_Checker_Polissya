import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Footer, TabType } from './Footer';

const FooterWrapper = (args: any) => {
    const [activeTab, setActiveTab] = useState<TabType>('HOME');
    const [isToolActive, setIsToolActive] = useState(false);

    const handleSwitch = (tab: TabType | any) => {
        if (tab === 'SPEEDCHECK') {
            setIsToolActive(!isToolActive);
        } else {
            setActiveTab(tab);
            setIsToolActive(false);
        }
    };

    return (
        <SafeAreaProvider>
            {/* Контейнер на весь екран, щоб Footer прилип до низу */}
            <View className="flex-1 bg-[#121212] w-full h-full relative">
                <Footer
                    {...args}
                    activeTab={activeTab}
                    onSwitch={handleSwitch}
                    isToolActive={isToolActive}
                />
            </View>
        </SafeAreaProvider>
    );
};

const meta = {
    title: 'Layout/Footer',
    component: Footer,
    args: {
        activeTab: 'HOME',
        onSwitch: () => {}, // Заглушка
    },
    decorators: [
        (Story) => (
            <Story />
        ),
    ],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
    render: (args) => <FooterWrapper {...args} />,
};