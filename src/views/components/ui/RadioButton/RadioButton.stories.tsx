import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text, Pressable } from 'react-native';
import { RadioButton } from './RadioButton';

const RadioWrapper = (args: any) => {
    const [isSelected, setIsSelected] = useState(args.selected || false);
    return (
        <Pressable
            onPress={() => setIsSelected(!isSelected)}
            className="flex-row items-center space-x-3 p-2"
        >
            <RadioButton {...args} selected={isSelected} onSelect={() => setIsSelected(!isSelected)} />
            <Text className="text-white font-evolventa ml-3">
                {isSelected ? 'Обрано' : 'Не обрано'}
            </Text>
        </Pressable>
    );
};

const meta = {
    title: 'Components/RadioButton',
    component: RadioButton,
    args: {
        selected: false,
        onSelect: () => {}, // Заглушка для TS
    },
    decorators: [
        (Story) => (
            <View className="flex-1 p-6 justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof RadioButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
    render: (args) => <RadioWrapper {...args} />,
    args: {
        selected: false,
    },
};