import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { LayoutContainer } from './LayoutContainer';
import { LayoutTrack } from './LayoutTrack';
import { LayoutMarker } from './LayoutMarker';

const meta = {
    title: 'Components/LayoutScheme',
    component: LayoutContainer,
    // Додаємо заглушку для children сюди
    args: {
        children: <></>,
    },
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof LayoutContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const MockHeaderRight = () => (
    <View className="bg-surface-border px-2 py-1 rounded-md">
        <Text className="text-text-muted text-xs">Дод. інфо</Text>
    </View>
);

export const FullScheme: Story = {
    args: {
        title: 'Схема заїзду',
        subtitle: 'Дистанція: 400 м',
        headerRight: <MockHeaderRight />,
    },
    render: (args) => (
        <LayoutContainer {...args}>
            <LayoutTrack />

            <LayoutMarker
                type="start"
                position={0}
                totalDistance={400}
                label="Старт"
            />

            <LayoutMarker
                type="gate"
                position={150}
                totalDistance={400}
                label="Ворота 1"
            />

            <LayoutMarker
                type="gate"
                position={300}
                totalDistance={400}
                label="Ворота 2"
            />

            <LayoutMarker
                type="finish"
                position={400}
                totalDistance={400}
                label="Фініш"
            />
        </LayoutContainer>
    ),
};

export const EmptyScheme: Story = {
    args: {
        title: 'Порожня траса',
        subtitle: 'Очікування налаштувань',
    },
    render: (args) => (
        <LayoutContainer {...args}>
            <LayoutTrack />
            <LayoutMarker
                type="start"
                position={0}
                totalDistance={100}
                label="Старт"
            />
            <LayoutMarker
                type="finish"
                position={100}
                totalDistance={100}
                label="Фініш"
            />
        </LayoutContainer>
    ),
};