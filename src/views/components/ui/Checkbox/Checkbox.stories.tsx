import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { Checkbox } from './Checkbox';

const CheckboxWrapper = (args: any) => {
    const [isChecked, setIsChecked] = useState(args.checked || false);
    return (
        <View className="flex-row items-center space-x-3">
            {/* Реальний onChange йде після {...args}, тому він перезапише заглушку */}
            <Checkbox {...args} checked={isChecked} onChange={setIsChecked} />
            <Text className="text-white font-evolventa ml-3">
                {isChecked ? 'Увімкнено' : 'Вимкнено'}
            </Text>
        </View>
    );
};

const meta = {
    title: 'Components/Checkbox',
    component: Checkbox,
    // Додаємо заглушку сюди, щоб задовольнити TypeScript для всіх історій
    args: {
        onChange: () => {},
    },
    decorators: [
        (Story) => (
            <View className="flex-1 p-6 justify-center bg-[#121212]">
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => <CheckboxWrapper {...args} />,
    args: {
        checked: false,
    },
};

export const DisabledUnchecked: Story = {
    render: (args) => <CheckboxWrapper {...args} />,
    args: {
        checked: false,
        disabled: true,
    },
};

export const DisabledChecked: Story = {
    render: (args) => <CheckboxWrapper {...args} />,
    args: {
        checked: true,
        disabled: true,
    },
};