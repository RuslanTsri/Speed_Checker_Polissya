import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Animated, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useBle } from '../../../context/BleContext';
import { useLoraDistance, EnvironmentProfile } from '../../../hooks/useLoraDistance'; // Перевір шлях

import { Button } from '../../components/ui/Button';
import { ArrowIconActive, ArrowIcon } from '../../../../assets/icons';

// Компонент винесено назовні для оптимізації
const GateRadarCard = ({ sensor, targetDistance, label, environment }: any) => {
    const { t } = useTranslation();
    const { distance, rssi, status } = useLoraDistance(sensor.rssi, targetDistance, environment);
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
            ])
        ).start();
    }, []);

    const isMax = targetDistance === 'MAX';

    const themes = {
        IDEAL: { main: '#34d399', bg: 'rgba(52, 211, 153, 0.1)', text: isMax ? t('tools.speed_checker.radar_status_ideal_max') : t('tools.speed_checker.radar_status_ideal') },
        GOOD: { main: '#FF6D00', bg: 'rgba(255, 109, 0, 0.1)', text: isMax ? t('tools.speed_checker.radar_status_good_max') : t('tools.speed_checker.radar_status_good') },
        FAR: { main: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', text: t('tools.speed_checker.radar_status_far') },
        LOST: { main: '#717171', bg: 'rgba(113, 113, 113, 0.1)', text: t('tools.speed_checker.radar_status_lost') }
    };
    const theme = themes[status];

    return (
        <View className="bg-surface-card border border-surface-border rounded-3xl p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                    <MaterialCommunityIcons name={isMax ? "wifi-strength-4" : "radio-tower"} size={20} color={theme.main} />
                    <Text className="text-text-main font-unbounded-bold ml-2">{label}</Text>
                </View>
                <View className="bg-black/30 px-3 py-1 rounded-full border border-surface-border">
                    <Text className="text-text-sub font-evolventa text-xs">
                        {isMax ? t('tools.speed_checker.radar_target_max') : t('tools.speed_checker.radar_target', { value: `${targetDistance}м` })}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <View className="flex-row items-baseline mb-1">
                        <Text className="text-h1 font-unbounded-black text-white leading-none">
                            {status === 'LOST' ? '--' : `~${distance}`}
                        </Text>
                        <Text className="text-text-sub font-unbounded-bold text-sm ml-1">м</Text>
                    </View>
                    <Text className="text-text-muted font-evolventa text-[10px] uppercase tracking-widest">
                        LoRa RSSI: {rssi} dBm
                    </Text>
                </View>

                <View className="items-center justify-center w-20 h-16 mr-2">
                    {status !== 'LOST' && (
                        <Animated.View style={[
                            StyleSheet.absoluteFill,
                            { borderRadius: 50, borderWidth: 2, borderColor: theme.main, opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.5] }) }
                        ]} />
                    )}
                    <View className="px-2 py-1.5 rounded-md" style={{ backgroundColor: theme.bg }}>
                        <Text className="font-evolventa-bold text-[8px] tracking-widest text-center" style={{ color: theme.main }}>
                            {theme.text}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default function SensorPlacementCheck({ config, onBack }: { config: any, onBack: () => void }) {
    const { t } = useTranslation();
    const { sensors, connected } = useBle();
    const activeGates = sensors.filter(s => s.id !== 0).sort((a, b) => a.id - b.id);

    const [env, setEnv] = useState<EnvironmentProfile>('CLEAR');
    const [testMode, setTestMode] = useState<'CONFIG' | '30' | '60' | '100' | 'MAX'>('CONFIG');

    const environments: { id: EnvironmentProfile, icon: any, label: string }[] = [
        { id: 'CLEAR', icon: 'sun', label: t('tools.speed_checker.radar_env_clear') },
        { id: 'RAIN', icon: 'cloud-drizzle', label: t('tools.speed_checker.radar_env_rain') },
        { id: 'INDOOR', icon: 'home', label: t('tools.speed_checker.radar_env_indoor') }
    ];

    const distances = [
        { id: 'CONFIG', label: t('tools.speed_checker.radar_dist_scheme') },
        { id: '30', label: '30м' },
        { id: '60', label: '60м' },
        { id: '100', label: '100м' },
        { id: 'MAX', label: 'MAX' }
    ];

    const getTargetForSensor = (index: number) => {
        if (testMode === 'MAX') return 'MAX';
        if (testMode !== 'CONFIG') return parseInt(testMode);

        if (index < (config.splitPositions?.length || 0)) return config.splitPositions[index];
        return config.distance || 30;
    };

    return (
        <View className="flex-1 pt-4 relative">
            <View className="flex-row items-center justify-between px-4 mb-4 z-10">
                <Pressable onPress={onBack} className="p-2 -ml-2">
                    {({ pressed }) => (
                        <View style={{ transform: [{ rotate: '-90deg' }] }}>
                            {pressed ? <ArrowIconActive width={28} height={28} /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                        </View>
                    )}
                </Pressable>
                <Text className="text-h4 text-text-main font-unbounded-bold uppercase">
                    {t('tools.speed_checker.radar_title')}
                </Text>
                <View className="w-10" />
            </View>

            {/* 🔥 Збільшено відступ знизу, щоб вмістити кнопку та футер (paddingBottom: 180) */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
                <View className="px-4 mb-4">
                    <Text className="text-caption uppercase text-text-muted font-evolventa-bold tracking-widest mb-2 ml-1">
                        {t('tools.speed_checker.radar_env_title')}
                    </Text>
                    <View className="flex-row gap-2">
                        {environments.map(e => (
                            <Pressable
                                key={e.id}
                                onPress={() => setEnv(e.id)}
                                className={`flex-1 py-2.5 rounded-xl border flex-row items-center justify-center gap-1.5 ${env === e.id ? 'bg-brand-orange/15 border-brand-orange/50' : 'bg-surface-card border-surface-border'}`}
                            >
                                <Feather name={e.icon} size={14} color={env === e.id ? '#FF6D00' : '#A3A3A3'} />
                                <Text className={`font-evolventa-bold text-xs ${env === e.id ? 'text-brand-orange' : 'text-text-sub'}`}>{e.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View className="px-4 mb-6">
                    <Text className="text-caption uppercase text-text-muted font-evolventa-bold tracking-widest mb-2 ml-1">
                        {t('tools.speed_checker.radar_dist_title')}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {distances.map(d => (
                            <Pressable
                                key={d.id}
                                onPress={() => setTestMode(d.id as any)}
                                className={`px-4 py-2 mr-2 rounded-xl border ${testMode === d.id ? 'bg-white/10 border-white/30' : 'bg-surface-card border-surface-border'}`}
                            >
                                <Text className={`font-unbounded-bold text-xs ${testMode === d.id ? 'text-white' : 'text-text-sub'}`}>{d.label}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                <View className="px-4">
                    {!connected ? (
                        <View className="items-center justify-center p-6 bg-status-error/10 rounded-3xl border border-status-error/20 mt-4">
                            <Feather name="bluetooth" size={32} color="#f87171" className="mb-3" />
                            <Text className="text-status-error font-evolventa-bold text-center mb-1">
                                {t('tools.speed_checker.status_not_connected')}
                            </Text>
                            <Text className="text-status-error/80 font-evolventa text-center text-xs">
                                {t('tools.speed_checker.radar_no_connection_msg')}
                            </Text>
                        </View>
                    ) : activeGates.length === 0 ? (
                        <View className="items-center justify-center p-10 bg-surface-card rounded-3xl border border-surface-border mt-4">
                            <Feather name="radio" size={40} color="#717171" className="mb-4" />
                            <Text className="text-text-muted font-evolventa text-center">
                                {t('tools.speed_checker.radar_waiting_sensors')}
                            </Text>
                        </View>
                    ) : (
                        activeGates.map((sensor, index) => (
                            <GateRadarCard
                                key={sensor.id}
                                sensor={sensor}
                                targetDistance={getTargetForSensor(index)}
                                label={sensor.physicalId || `Гейт ${sensor.id}`}
                                environment={env}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* 🔥 Змінено bottom-6 на bottom-[110px], щоб кнопка піднялася над футером */}
            <View className="absolute bottom-[110px] left-4 right-4 z-50 pt-2">
                <Button
                    variant="primary"
                    title={t('tools.speed_checker.radar_btn_ok')}
                    onPress={onBack}
                    className="w-full shadow-2xl"
                />
            </View>
        </View>
    );
}