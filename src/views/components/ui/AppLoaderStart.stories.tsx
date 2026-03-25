import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Button } from 'react-native';
import { AppLoaderStart } from './AppLoaderStart';

// Обгортка для симуляції процесу завантаження
const LoaderWrapper = (args: any) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <View className="flex-1 w-full h-full">
            <AppLoaderStart {...args} progress={progress} />
            {/* Кнопка для рестарту анімації у Storybook */}
            <View className="absolute bottom-10 self-center z-50 bg-white/10 p-2 rounded">
                <Button title="Рестарт" onPress={() => setProgress(0)} color="#FF6D00" />
            </View>
        </View>
    );
};

const meta = {
    title: 'Complex/AppLoaderStart',
    component: AppLoaderStart,
    decorators: [
        (Story) => (
            <View className="flex-1 bg-[#0A0A0A]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof AppLoaderStart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => <LoaderWrapper {...args} />,
    args: {
        statusText: 'Завантаження модулів...',
        progress: 0,
    },
};