import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { BlurView } from 'expo-blur';
import { useStopwatch } from '../../hooks/tools/useStopwatch';

import { Mod } from '../components/ui/mods';
import { Button } from '../components/ui/Button';
import { ArrowIcon, ReloadIcon } from '../../../assets/icons';

export default function TimerTool({ onBack }: { onBack: () => void }) {
    const { t } = useTranslation();
    const { timeObj, isActive, toggle, reset } = useStopwatch();

    return (
        <View className="flex-1 pt-4 ">
            <View className="flex-row items-center justify-between px-4 mb-8">
                <Pressable onPress={onBack} className="p-2 -ml-2">
                    <View style={styles.rotateNeg90}><ArrowIcon width={28} height={28} fill="#F5F5F5" /></View>
                </Pressable>
                <Text className="text-h3 font-bold flex-1 text-center text-text-main font-unbounded">{t('tools.timer.title')}</Text>
                <View className="w-10" />
            </View>

            <View className="px-4">
                <Mod title={t('tools.timer.title')} subtitle="Точний час виконання">
                    <View className="mt-5 rounded-2xl overflow-hidden border border-surface-border bg-black/40">
                        <View className="py-8 flex-row items-baseline justify-center">
                            <Text className={`text-6xl font-black ${isActive ? 'text-brand-orange' : 'text-text-main'}`} style={{ fontFamily: 'monospace' }}>
                                {timeObj.main}
                            </Text>
                            <Text className={`text-h2 font-bold ml-1 ${isActive ? 'text-brand-orange/80' : 'text-text-muted'}`} style={{ fontFamily: 'monospace' }}>
                                {timeObj.decimal}
                            </Text>
                        </View>
                    </View>
                </Mod>

                <View className="flex-row gap-3 mt-8">
                    <Button variant="outline" title="" onPress={reset} icon={<ReloadIcon width={24} height={24} fill="#F5F5F5" />} className="w-20" />
                    <Button variant="primary" title={isActive ? t('tools.timer.stop') : t('tools.timer.start')} onPress={toggle} className="flex-1" icon={<Feather name={isActive ? "pause" : "play"} size={22} color="#F5F5F5" />} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({ rotateNeg90: { transform: [{ rotate: '-90deg' }] } });