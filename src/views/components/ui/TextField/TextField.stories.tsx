import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { TextField } from './TextField';

const MockIcon = () => <Text className="text-xl">✉️</Text>;

const TextFieldWrapper = (args: any) => {
    const [text, setText] = useState(args.value || '');
    return (
        <TextField
            {...args}
            value={text}
            onChangeText={setText}
        />
    );
};

const meta = {
    title: 'Components/TextField',
    component: TextField,
    decorators: [
        (Story) => (
            <View className="flex-1 p-6 justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => <TextFieldWrapper {...args} />,
    args: {
        label: 'Логін',
        placeholder: 'Введіть ваш логін',
    },
};

export const WithIcon: Story = {
    render: (args) => <TextFieldWrapper {...args} />,
    args: {
        label: 'Email',
        placeholder: 'example@mail.com',
        icon: <MockIcon />,
    },
};

export const WithError: Story = {
    render: (args) => <TextFieldWrapper {...args} />,
    args: {
        label: 'Пароль',
        placeholder: 'Введіть пароль',
        error: 'Пароль занадто короткий',
        secureTextEntry: true,
    },
};

export const Disabled: Story = {
    render: (args) => <TextFieldWrapper {...args} />,
    args: {
        label: 'ID Користувача',
        value: 'USR-9842-11',
        disabled: true,
    },
};