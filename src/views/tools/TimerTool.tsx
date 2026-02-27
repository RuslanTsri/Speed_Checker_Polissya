import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { BlurView } from 'expo-blur'; // 🔥 Імпортуємо BlurView для вкладеного екрану
import { useStopwatch } from '../../hooks/tools/useStopwatch';

// 🔥 UI Компоненти
import { Mod } from '../components/ui/mods';
import { Button } from '../components/ui/Button';
import {
    ArrowIcon,
    ArrowIconActive,
    ReloadIcon
} from '../../../assets/icons';

export default function TimerTool({ onBack }: { onBack: () => void }) {
    const { t } = useTranslation();
    const { timeObj, isActive, toggle, reset } = useStopwatch();

    return (
        <View className="flex-1 pt-4 relative">

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 mb-8 relative z-10">
                {/* 🔥 Кнопка НАЗАД (Стрілка повернута вліво) */}
                <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                    {({ pressed }) => (
                        <View style={{ transform: [{ rotate: '-90deg' }] }}>
                            {pressed ? (
                                <ArrowIconActive width={28} height={28} fill="#F5F5F5" />
                            ) : (
                                <ArrowIcon width={28} height={28} fill="#F5F5F5" />
                            )}
                        </View>
                    )}
                </Pressable>

                <Text
                    className="text-xl font-bold flex-1 text-center text-[#F5F5F5]"
                    style={{ fontFamily: 'Unbounded' }}
                >
                    {t('tools.timer.title') as string}
                </Text>

                <View className="w-10" />
            </View>

            <View className="flex-1 px-4 mt-4">

                {/* 🔥 Батьківський Mod */}
                <Mod
                    title="Секундомір"
                    subtitle="Точний час виконання"
                    icon={
                        <View className="bg-[#FF6D00]/10 p-3 rounded-xl border border-[#FF6D00]/20">
                            <Feather name="clock" size={24} color="#FF6D00" />
                        </View>
                    }
                    className="mb-8"
                >
                    {/* 🔥 Вкладений "Mod-Екран" з іншим ступенем розмиття */}
                    <View className="mt-5 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                        {/* Зменшений блюр і темніший фон створюють ефект глибини (ніби екран втоплений) */}
                        <BlurView
                            intensity={15}
                            tint="dark"
                            experimentalBlurMethod="dimezisBlurView"
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10, 10, 10, 0.6)' }]} />

                        {/* ЦИФРОВИЙ ДИСПЛЕЙ */}
                        <View className="py-8 flex-row items-baseline justify-center">
                            <Text
                                className={`text-6xl font-black tracking-widest ${isActive ? 'text-[#FF6D00]' : 'text-[#F5F5F5]'}`}
                                // 🔥 Системний шрифт для цифр (виглядає як електронний годинник)
                                style={{ fontFamily: 'monospace' }}
                            >
                                {timeObj.main}
                            </Text>
                            <Text
                                className={`text-3xl font-bold ml-1 ${isActive ? 'text-[#FF6D00]/80' : 'text-[#A3A3A3]'}`}
                                style={{ fontFamily: 'monospace' }}
                            >
                                {timeObj.decimal}
                            </Text>
                        </View>
                    </View>
                </Mod>

                {/* 🔥 Панель керування (Кнопки) */}
                <View className="flex-row gap-3">
                    {/* Кнопка Рестарт */}
                    <Button
                        variant="outline"
                        title=""
                        onPress={reset}
                        icon={<ReloadIcon width={24} height={24} fill="#F5F5F5" />}
                        className="w-16 h-14"
                    />

                    {/* Кнопка Старт/Стоп */}
                    <Button
                        variant="primary"
                        title={isActive ? (t('tools.timer.stop') as string) : (t('tools.timer.start') as string)}
                        onPress={toggle}
                        icon={
                            <Feather
                                name={isActive ? "pause" : "play"}
                                size={22}
                                color="#F5F5F5"
                            />
                        }
                        className="flex-1 h-14"
                    />
                </View>

            </View>
        </View>
    );
}