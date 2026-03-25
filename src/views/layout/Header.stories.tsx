import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
// Імпортуй свій реальний UserContext, якщо він експортується, або створимо заглушку нижче
import { UserContext } from '../../context/UserContext';
import { Header } from './Header';

// Фейкові дані користувача для Storybook
const mockUser = {
    profile: {
        full_name: 'Руслан Цимбалюк',
        role: 'ADMIN',
        avatar_url: null, // Можна вставити URL картинки для тесту
    },
};

const meta = {
    title: 'Layout/Header',
    component: Header,
    decorators: [
        (Story) => (
            <View className="flex-1 bg-[#1C1C1E] pt-10 px-2 w-full">
                {/* Обгортаємо в контекст користувача, щоб useUser не падав */}
                <UserContext.Provider value={mockUser as any}>
                    <Story />
                </UserContext.Provider>
            </View>
        ),
    ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        onGoHome: () => console.log('Go Home clicked'),
        onLogout: () => console.log('Logout clicked'),
        onChangePin: () => console.log('Change PIN clicked'),
    },
};