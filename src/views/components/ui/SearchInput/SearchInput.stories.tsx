import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { SearchInput } from './SearchInput';

const SearchInputWrapper = (args: any) => {
    const [text, setText] = useState(args.value || '');
    return (
        <SearchInput {...args} value={text} onChangeText={setText} />
    );
};

const meta = {
    title: 'Components/SearchInput',
    component: SearchInput,
    args: {
        value: '',
        onChangeText: () => {}, // Заглушка для TS
    },
    decorators: [
        (Story) => (
            <View className="flex-1 p-4 justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
    render: (args) => <SearchInputWrapper {...args} />,
    args: {
        placeholder: 'Пошук гравців або команд...',
    },
};