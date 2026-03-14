import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBle } from '../../../context/BleContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Mod } from '../../components/ui/mods';
import { Button } from '../../components/ui/Button';
import { ArrowIcon, ArrowIconActive, StartIcon, StartIconActive, TeamsIcon, TeamsIconActive } from '../../../../assets/icons';

const ModeCard = ({ title, subtitle, Icon, ActiveIcon, onPress }: any) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        className="w-full mb-4"
    >
        {({ pressed }) => (
            <View className={`rounded-3xl border min-h-[80px] p-5 flex-row items-center justify-between transition-colors ${
                pressed ? 'bg-surface-card border-brand-orange/30' : 'bg-surface-card/50 border-surface-border'
            }`}>
                <View className="flex-row items-center gap-4 flex-1">
                    <View className="items-center justify-center">
                        {pressed
                            ? (typeof ActiveIcon === 'function' && !ActiveIcon.name ? ActiveIcon({ width: 34, height: 34, fill: '#FF6D00' }) : <ActiveIcon width={34} height={34} fill="#FF6D00" />)
                            : (typeof Icon === 'function' && !Icon.name ? Icon({ width: 34, height: 34, fill: '#F5F5F5' }) : <Icon width={34} height={34} fill="#F5F5F5" />)
                        }
                    </View>
                    <View className="flex-1">
                        <Text className="text-text-main text-h4 font-unbounded-bold leading-6">{title}</Text>
                        <Text className="text-text-sub text-body font-evolventa leading-5 tracking-wide">{subtitle}</Text>
                    </View>
                </View>
                <View className="ml-3" style={styles.rotate90}>
                    {pressed ? <ArrowIconActive width={24} height={24} fill="#FF6D00" /> : <ArrowIcon width={24} height={24} fill="#717171" />}
                </View>
            </View>
        )}
    </Pressable>
);

export default function SpeedCheckerModeSelector({ onBack, onSelect, onOpenBluetooth, onOpenCalibration }: any) {
    const { t } = useTranslation();
    const { connected } = useBle();

    return (
        <View className="flex-1 pt-4 relative">
            <View className="flex-row items-center justify-between px-4 mb-8 z-10">
                <Pressable onPress={onBack} className="p-2 -ml-2">
                    {({ pressed }) => (
                        <View style={styles.rotateNeg90}>
                            {pressed ? <ArrowIconActive width={28} height={28} /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                        </View>
                    )}
                </Pressable>
                <Text className="text-h3 flex-1 text-center text-text-main font-unbounded-bold">{t('tools.speed_checker.mode_select_title')}</Text>
                <View className="w-10" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} className="px-4">
                <Mod className="mb-6" variant="ghost">
                    <View className="items-center py-2">
                        <Text className={`${connected ? 'text-status-success' : 'text-status-error'} text-h2 text-center mb-1 font-unbounded-bold`}>
                            {connected ? t('tools.speed_checker.status_ready') : t('tools.speed_checker.status_not_connected')}
                        </Text>
                        <Text className="text-text-sub text-body text-center mb-4 font-evolventa">
                            {connected ? t('tools.speed_checker.test_with_device') : t('tools.speed_checker.status_check_ble')}
                        </Text>
                        {!connected && <Button variant="light" title={t('tools.bluetooth.title')} onPress={onOpenBluetooth} className="w-full" />}
                    </View>
                </Mod>

                {/* РОЗДІЛ: ТЕСТУВАННЯ */}
                <Text className="text-caption uppercase tracking-widest text-text-muted font-evolventa-bold mb-3 ml-1">
                    {t('tools.speed_checker.menu_section_testing')}
                </Text>
                <ModeCard
                    title={t('tools.speed_checker.quick_test_title')}
                    subtitle={t('tools.speed_checker.quick_test_desc')}
                    Icon={StartIcon}
                    ActiveIcon={StartIconActive}
                    onPress={() => onSelect('DEVICE', 'QUICK')}
                />
                <ModeCard
                    title={t('tools.speed_checker.team_test_title')}
                    subtitle={t('tools.speed_checker.team_test_desc')}
                    Icon={TeamsIcon}
                    ActiveIcon={TeamsIconActive}
                    onPress={() => onSelect('DEVICE', 'TEAM')}
                />

                {/* РОЗДІЛ: КАЛІБРУВАННЯ */}
                <Text className="text-caption uppercase tracking-widest text-text-muted font-evolventa-bold mt-4 mb-3 ml-1">
                    {t('tools.speed_checker.menu_section_tools')}
                </Text>
                <ModeCard
                    title={t('tools.speed_checker.radar_tool_title')}
                    subtitle={t('tools.speed_checker.radar_tool_desc')}
                    Icon={({ width, fill }: any) => <MaterialCommunityIcons name="radio-tower" size={width} color={fill} />}
                    ActiveIcon={({ width, fill }: any) => <MaterialCommunityIcons name="radio-tower" size={width} color={fill} />}
                    onPress={onOpenCalibration}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    rotateNeg90: { transform: [{ rotate: '-90deg' }] },
    rotate90: { transform: [{ rotate: '90deg' }] }
});