import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { AppBackground } from './AppBackground';

const meta = {
    title: 'Layout/AppBackground',
    component: AppBackground,
    decorators: [
        (Story) => (
            // Задаємо мінімальну висоту, щоб у Storybook було видно ефект світіння знизу
            <View style={{ flex: 1, minHeight: 600, width: '100%' }}>
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof AppBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: (
            <View className="flex-1 items-center justify-center p-6">
                <Text className="text-white text-2xl font-unbounded-bold text-center mb-4">
                    App Background
                </Text>
                <Text className="text-text-sub text-center font-evolventa">
                    Цей компонент створює темний фон із градієнтом та м'яким світінням (glow) внизу екрану.
                </Text>
            </View>
        ),
    },
};

export const WithContent: Story = {
    args: {
        children: (
            <View className="flex-1 p-6 pt-20">
                <Text className="text-white text-h2 font-unbounded-bold mb-8">
                    Головна
                </Text>

                <View className="bg-white/5 p-5 rounded-2xl border border-white/10 mb-4 shadow-sm">
                    <Text className="text-text-main text-lg font-unbounded-bold mb-2">
                        Блок контенту 1
                    </Text>
                    <Text className="text-text-sub font-evolventa">
                        Перевіряємо, як напівпрозорі картки виглядають на цьому фоні.
                    </Text>
                </View>

                <View className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-sm">
                    <Text className="text-text-main text-lg font-unbounded-bold mb-2">
                        Блок контенту 2
                    </Text>
                    <Text className="text-text-sub font-evolventa">
                        Уся магія знаходиться на рівні z-index, щоб фон не перекривав кліки.
                    </Text>
                </View>
            </View>
        ),
    },
};