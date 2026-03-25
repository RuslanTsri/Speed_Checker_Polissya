import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppModal } from './AppModal';

const ModalWrapper = (args: any) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <SafeAreaProvider>
            <View className="flex-1 justify-center items-center w-full h-full">
                <Pressable
                    onPress={() => setIsVisible(true)}
                    className="bg-surface-card border border-surface-border px-6 py-3 rounded-xl"
                >
                    <Text className="text-white">Відкрити {args.type} модалку</Text>
                </Pressable>

                <AppModal
                    {...args}
                    visible={isVisible}
                    onClose={() => setIsVisible(false)}
                />
            </View>
        </SafeAreaProvider>
    );
};

const meta = {
    title: 'Complex/AppModal',
    component: AppModal,
    args: {
        title: 'Налаштування',
        children: <Text className="text-text-sub font-evolventa">Це вміст модального вікна. Тут можуть бути будь-які компоненти.</Text>,
        visible: false,
    },
    decorators: [
        (Story) => (
            <View className="flex-1 bg-[#121212] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof AppModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bottom: Story = {
    render: (args) => <ModalWrapper {...args} />,
    args: { type: 'bottom' },
};

export const Center: Story = {
    render: (args) => <ModalWrapper {...args} />,
    args: { type: 'center' },
};

export const Fullscreen: Story = {
    render: (args) => <ModalWrapper {...args} />,
    args: { type: 'fullscreen' },
};