import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OTAUpdateToast } from './OTAUpdateToast';

const ToastWrapper = (args: any) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <SafeAreaProvider>
            <View className="flex-1 justify-center items-center p-6 w-full h-full">
                <Pressable
                    onPress={() => setIsVisible(true)}
                    className="bg-brand-orange px-6 py-3 rounded-xl"
                >
                    <Text className="text-black font-bold">Показати Toast</Text>
                </Pressable>

                <OTAUpdateToast
                    {...args}
                    visible={isVisible}
                    onClose={() => setIsVisible(false)}
                />
            </View>
        </SafeAreaProvider>
    );
};

const meta = {
    title: 'Complex/OTAUpdateToast',
    component: OTAUpdateToast,
    args: {
        onPress: () => console.log('Toast pressed!'),
        onClose: () => {},
        visible: false,
    },
    decorators: [
        (Story) => (
            <View className="flex-1 bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof OTAUpdateToast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
    render: (args) => <ToastWrapper {...args} />,
};