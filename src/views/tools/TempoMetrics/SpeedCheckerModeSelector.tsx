import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBle } from '../../../context/BleContext';

// 🔥 Імпорт UI-компонентів
import { Mod } from '../../components/ui/mods';
import { Button } from '../../components/ui/Button';
import {
    ArrowIcon,
    ArrowIconActive,
    StartIcon,
    StartIconActive,
    TeamsIcon,
    TeamsIconActive
} from '../../../../assets/icons';

interface Props {
    onBack: () => void;
    onSelect: (mode: 'DEVICE', type: 'QUICK' | 'TEAM') => void;
    onOpenBluetooth: () => void; // 🔥 Новий пропс для переходу
}

const ModeCard = ({ title, subtitle, Icon, ActiveIcon, onPress }: any) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        className="w-full mb-4"
    >
        {({ pressed }) => (
            <View className={`rounded-3xl border min-h-[80px] p-5 flex-row items-center justify-between transition-colors ${
                pressed ? 'bg-white/5 border-white/20' : 'bg-transparent border-white/10'
            }`}>
                <View className="flex-row items-center gap-4 flex-1">
                    <View className="items-center justify-center">
                        {pressed ? <ActiveIcon width={34} height={34} fill="#F5F5F5" /> : <Icon width={34} height={34} fill="#F5F5F5" />}
                    </View>
                    <View className="flex-1 justify-center items-start gap-1">
                        <Text className="text-[#F5F5F5] text-xl font-bold leading-6" style={{ fontFamily: 'Unbounded' }}>{title}</Text>
                        <Text className="text-[#A3A3A3] text-sm font-normal leading-5 tracking-wide" style={{ fontFamily: 'Evolventa' }}>{subtitle}</Text>
                    </View>
                </View>
                <View className="ml-3 items-center justify-center" style={{ transform: [{ rotate: '90deg' }] }}>
                    {pressed ? <ArrowIconActive width={24} height={24} fill="#F5F5F5" /> : <ArrowIcon width={24} height={24} fill="#A3A3A3" />}
                </View>
            </View>
        )}
    </Pressable>
);

export default function SpeedCheckerModeSelector({ onBack, onSelect, onOpenBluetooth }: Props) {
    const { t } = useTranslation();
    const { connected } = useBle();

    const statusColor = connected ? 'text-emerald-500' : 'text-red-500';

    return (
        <View className="flex-1 pt-4 relative">
            {/* HEADER */}
            <View className="flex-row items-center justify-between px-4 mb-8 relative z-10">
                <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                    {({ pressed }) => (
                        <View style={{ transform: [{ rotate: '-90deg' }] }}>
                            {pressed ? <ArrowIconActive width={28} height={28} fill="#F5F5F5" /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                        </View>
                    )}
                </Pressable>
                <Text className="text-xl font-bold flex-1 text-center text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                    {t('tools.speed_checker.mode_select_title')}
                </Text>
                <View className="w-10" />
            </View>

            <View className="px-4">
                {/* 1. СТАТУС ПІДКЛЮЧЕННЯ */}
                <Mod
                    className="mb-8"
                    variant="ghost"
                    title="" // 🔥 Фікс TS2741
                    subtitle="" // 🔥 Фікс TS2741
                >
                    <View className="items-center py-2">
                        <Text
                            className={`${statusColor} text-2xl font-bold text-center mb-1`}
                            style={{ fontFamily: 'Unbounded' }}
                        >
                            {connected
                                ? t('tools.speed_checker.status_ready')
                                : t('tools.speed_checker.status_not_connected')}
                        </Text>

                        <Text
                            className="text-[#A3A3A3] text-sm text-center mb-4"
                            style={{ fontFamily: 'Evolventa' }}
                        >
                            {connected
                                ? t('tools.speed_checker.test_with_device')
                                : t('tools.speed_checker.status_check_ble')}
                        </Text>

                        {!connected && (
                            <Button
                                variant="light"
                                title={t('tools.bluetooth.title')}
                                onPress={onOpenBluetooth} // 🔥 Тепер веде на BluetoothTool
                                className="w-full"
                            />
                        )}
                    </View>
                </Mod>

                {/* 2. ШВИДКИЙ ТЕСТ */}
                <ModeCard
                    title={t('tools.speed_checker.quick_test_title')}
                    subtitle={t('tools.speed_checker.quick_test_desc')}
                    Icon={StartIcon}
                    ActiveIcon={StartIconActive}
                    onPress={() => onSelect('DEVICE', 'QUICK')}
                />

                {/* 3. ТЕСТ КОМАНДИ */}
                <ModeCard
                    title={t('tools.speed_checker.team_test_title')}
                    subtitle={t('tools.speed_checker.team_test_desc')}
                    Icon={TeamsIcon}
                    ActiveIcon={TeamsIconActive}
                    onPress={() => onSelect('DEVICE', 'TEAM')}
                />
            </View>
        </View>
    );
}