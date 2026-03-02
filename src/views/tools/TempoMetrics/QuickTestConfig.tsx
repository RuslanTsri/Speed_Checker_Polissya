import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// 🔥 Імпорт хуків
import { useTestConfiguration } from '../../../hooks/tempoMetrics/useTestConfiguration';
import { useBle } from '../../../context/BleContext';

// 🔥 Імпорт UI-компонентів
import { HeaderTabs } from '../../components/ui/tabs';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { ArrowIconActive, ArrowIcon } from '../../../../assets/icons';

// 🔥 Імпорт розбитої схеми
import { LayoutContainer, LayoutTrack, LayoutMarker } from '../../components/ui/LayoutScheme';

interface Props {
    onBack: () => void;
    onStart: (distance: number) => void;
    playerCount: number;
    testType?: string;
    onOpenBluetooth: () => void; // 🔥 Додаємо новий пропс
}

// ==========================================
// 🔥 Локальний компонент для кнопок регулювання (+ / -)
// ==========================================
const AdjustButton = ({ direction, onPress }: { direction: 'left' | 'right', onPress: () => void }) => (
    <Pressable
        onPress={onPress}
        className="w-12 h-14 items-center justify-center rounded-lg border border-white/20 bg-transparent active:bg-white/5"
    >
        {({ pressed }) => (
            <View style={{ transform: [{ rotate: direction === 'left' ? '-90deg' : '90deg' }] }}>
                {pressed
                    ? <ArrowIconActive width={24} height={24} fill="#F5F5F5" />
                    : <ArrowIcon width={24} height={24} fill="#A3A3A3" />
                }
            </View>
        )}
    </Pressable>
);

export default function QuickTestConfig({ onBack, onStart, playerCount, testType, onOpenBluetooth }: Props) { // 🔥 Дістаємо onOpenBluetooth
    const { t } = useTranslation();
    const { distance, setDistance, splitPositions, adjustSplit, sensorsCount, intermediateCount } = useTestConfiguration();

    // Отримуємо статус підключення з Bluetooth
    const { connected } = useBle();

    // Дані для табів дистанції
    const distanceTabs = [
        { id: '30', label: `30 ${t('tools.speed_checker.meters_short')}` },
        { id: '60', label: `60 ${t('tools.speed_checker.meters_short')}` },
        { id: '100', label: `100 ${t('tools.speed_checker.meters_short')}` }
    ];

    return (
        <View className="flex-1 pt-4 relative">

            {/* HEADER */}
            <View className="flex-row items-center justify-between px-4 mb-2 relative z-10">
                <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                    {({ pressed }) => (
                        <View style={{ transform: [{ rotate: '-90deg' }] }}>
                            {pressed ? <ArrowIconActive width={28} height={28} fill="#F5F5F5" /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                        </View>
                    )}
                </Pressable>

                <View className="flex-1 items-center">
                    <Text className="text-xl font-bold text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                        {t('tools.speed_checker.quick_test_title')}
                    </Text>
                </View>
                <View className="w-10" />
            </View>

            {/* СУБХЕДЕР (Статус підключення та гейтів) */}
            <View className="items-center mb-8">
                <Text className="text-[#A3A3A3] text-sm" style={{ fontFamily: 'Evolventa' }}>
                    {t('tools.speed_checker.gates_count', { count: sensorsCount })} • {connected ? t('tools.speed_checker.status_ready') : t('tools.speed_checker.connection_required')}
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }}>

                {/* 1. ВИБІР ДИСТАНЦІЇ */}
                <View className="w-full mb-8">
                    <HeaderTabs
                        tabs={distanceTabs}
                        activeTab={distance.toString()}
                        onTabChange={(id) => setDistance(parseInt(id))}
                        className="w-full"
                    />
                </View>

                {/* 2. СХЕМА РОЗСТАНОВКИ ГЕЙТІВ */}
                <LayoutContainer
                    title={t('tools.speed_checker.scheme_title') as string}
                    subtitle={t('tools.speed_checker.scheme_desc') as string}
                >
                    <LayoutTrack />

                    {/* Старт */}
                    <LayoutMarker position={0} totalDistance={distance} label={t('tools.speed_checker.start_label') as string} type="start" />

                    {/* Проміжні гейти (Спліти) */}
                    {splitPositions.map((pos, i) => (
                        <LayoutMarker key={i} position={pos} totalDistance={distance} label={t('tools.speed_checker.gate_label', { number: i + 1 }) as string} type="gate" />
                    ))}

                    {/* Фініш */}
                    <LayoutMarker position={distance} totalDistance={distance} label={t('tools.speed_checker.finish_label') as string} type="finish" />
                </LayoutContainer>

                {/* 3. НАЛАШТУВАННЯ СПЛІТІВ (Якщо є проміжні гейти) */}
                {intermediateCount > 0 && (
                    <View className="mb-6">
                        <Text className="text-[11px] font-bold tracking-[0.1em] uppercase mb-4 ml-1 text-slate-500">
                            {t('tools.speed_checker.split_settings')}
                        </Text>

                        {splitPositions.map((pos, index) => (
                            <View key={index} className="flex-row items-center gap-3 mb-2">
                                <View className="flex-1">
                                    <TextField
                                        label={t('tools.speed_checker.gate_meters_label', { number: index + 1 }) as string}
                                        value={pos.toString()}
                                        editable={false}
                                    />
                                </View>

                                {/* Нові кнопки регулювання з іконками стрілок */}
                                <View className="flex-row gap-2 mt-4">
                                    <AdjustButton direction="left" onPress={() => adjustSplit(index, -5)} />
                                    <AdjustButton direction="right" onPress={() => adjustSplit(index, 5)} />
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* 4. ІНФО-ПОВІДОМЛЕННЯ */}
                {!connected && (
                    <View className="flex-row items-center justify-center mb-6 opacity-70">
                        <Feather name="alert-circle" size={16} color="#F5F5F5" />
                        <Text className="text-[#F5F5F5] text-sm ml-2" style={{ fontFamily: 'Evolventa' }}>
                            {t('tools.speed_checker.gates_connection_required')}
                        </Text>
                    </View>
                )}

                {/* 5. КНОПКА СТАРТУ */}
                <Button
                    variant="light"
                    title={t('tools.speed_checker.btn_start_test') as string}
                    onPress={() => onStart(distance)}
                    disabled={!connected}
                    className="w-full mb-4"
                />

                {/* 6. КНОПКА ПІДКЛЮЧЕННЯ (OUTLINE) */}
                <Button
                    variant="outline"
                    title={t('tools.speed_checker.go_to_connection') as string}
                    onPress={onOpenBluetooth}
                    className="w-full mb-10"
                />

            </ScrollView>
        </View>
    );
}