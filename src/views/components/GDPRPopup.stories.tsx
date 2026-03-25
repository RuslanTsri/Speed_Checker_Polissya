import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GDPRPopup } from './GDPRPopup';

const meta = {
    title: 'Complex/GDPRPopup',
    component: GDPRPopup,
    decorators: [
        (Story) => (
            <SafeAreaProvider>
                <View className="flex-1 bg-[#121212] justify-center items-center">
                    <Story />
                </View>
            </SafeAreaProvider>
        ),
    ],
} satisfies Meta<typeof GDPRPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        // Примусово показуємо, щоб не залежати від AsyncStorage у Storybook
        forceVisible: true,
        onClose: () => console.log('GDPR Modal closed'),
    },
};