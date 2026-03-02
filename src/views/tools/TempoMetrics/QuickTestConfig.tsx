import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTestConfiguration } from '../../../hooks/tempoMetrics/useTestConfiguration';
import { useBle } from '../../../context/BleContext';

import { HeaderTabs } from '../../components/ui/tabs';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { ArrowIconActive, ArrowIcon } from '../../../../assets/icons';
import { LayoutContainer, LayoutTrack, LayoutMarker } from '../../components/ui/LayoutScheme';

const AdjustButton = ({ direction, onPress }: { direction: 'left' | 'right', onPress: () => void }) => (
    <Pressable
        onPress={onPress}
        className="w-12 h-14 items-center justify-center rounded-xl border border-surface-border bg-surface-card active:bg-brand-orange/10"
    >
        {({ pressed }) => (
            <View style={{ transform: [{ rotate: direction === 'left' ? '-90deg' : '90deg' }] }}>
                {pressed ? <ArrowIconActive width={24} height={24} fill="#FF6D00" /> : <ArrowIcon width={24} height={24} fill="#A3A3A3" />}
            </View>
        )}
    </Pressable>
);

export default function QuickTestConfig({ onBack, onStart, playerCount, testType, onOpenBluetooth }: any) {
    const { t } = useTranslation();
    const { distance, setDistance, splitPositions, adjustSplit, sensorsCount, intermediateCount } = useTestConfiguration();
    const { connected } = useBle();

    const distanceTabs = [
        { id: '30', label: `30 ${t('tools.speed_checker.meters_short')}` },
        { id: '60', label: `60 ${t('tools.speed_checker.meters_short')}` },
        { id: '100', label: `100 ${t('tools.speed_checker.meters_short')}` }
    ];

    return (
        <View className="flex-1 pt-4 relative bg-surface-bg">
            <View className="flex-row items-center justify-between px-4 mb-2 z-10">
                <Pressable onPress={onBack} className="p-2 -ml-2"><View style={styles.rotateNeg90}><ArrowIcon width={28} height={28} fill="#F5F5F5" /></View></Pressable>
                <Text className="text-h3 font-bold text-text-main font-unbounded">{t('tools.speed_checker.quick_test_title')}</Text>
                <View className="w-10" />
            </View>

            <View className="items-center mb-8">
                <Text className="text-text-sub text-body font-evolventa">
                    {t('tools.speed_checker.gates_count', { count: sensorsCount })} • {connected ? t('tools.speed_checker.status_ready') : t('tools.speed_checker.connection_required')}
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }}>
                <View className="w-full mb-8">
                    <HeaderTabs tabs={distanceTabs} activeTab={distance.toString()} onTabChange={(id) => setDistance(parseInt(id))} />
                </View>

                <LayoutContainer title={t('tools.speed_checker.scheme_title')} subtitle={t('tools.speed_checker.scheme_desc')}>
                    <LayoutTrack />
                    <LayoutMarker position={0} totalDistance={distance} label={t('tools.speed_checker.start_label')} type="start" />
                    {splitPositions.map((pos, i) => (
                        <LayoutMarker key={i} position={pos} totalDistance={distance} label={t('tools.speed_checker.gate_label', { number: i + 1 })} type="gate" />
                    ))}
                    <LayoutMarker position={distance} totalDistance={distance} label={t('tools.speed_checker.finish_label')} type="finish" />
                </LayoutContainer>

                {intermediateCount > 0 && (
                    <View className="mb-6">
                        <Text className="text-caption font-bold tracking-widest uppercase mb-4 ml-1 text-text-muted font-evolventa">{t('tools.speed_checker.split_settings')}</Text>
                        {splitPositions.map((pos, index) => (
                            <View key={index} className="flex-row items-center gap-3 mb-2">
                                <View className="flex-1"><TextField label={t('tools.speed_checker.gate_meters_label', { number: index + 1 })} value={pos.toString()} editable={false} /></View>
                                <View className="flex-row gap-2 mt-4"><AdjustButton direction="left" onPress={() => adjustSplit(index, -5)} /><AdjustButton direction="right" onPress={() => adjustSplit(index, 5)} /></View>
                            </View>
                        ))}
                    </View>
                )}

                {!connected && (
                    <View className="flex-row items-center justify-center mb-6 opacity-80 bg-status-error/10 p-3 rounded-xl border border-status-error/20">
                        <Feather name="alert-circle" size={16} color="#f87171" />
                        <Text className="text-status-error text-small ml-2 font-evolventa">{t('tools.speed_checker.gates_connection_required')}</Text>
                    </View>
                )}

                <Button variant="primary" title={t('tools.speed_checker.btn_start_test')} onPress={() => onStart(distance)} disabled={!connected} className="w-full mb-4" />
                <Button variant="outline" title={t('tools.speed_checker.go_to_connection')} onPress={onOpenBluetooth} className="w-full mb-10" />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({ rotateNeg90: { transform: [{ rotate: '-90deg' }] } });