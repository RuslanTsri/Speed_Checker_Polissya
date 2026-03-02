import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePlayerInfo } from '../../hooks/players/usePlayerInfo';

export default function InfoScreen({ player, onBack, onDelete }: any) {
    const { t } = useTranslation();
    const { positionLabel, handleDeletePress, handleBack } = usePlayerInfo(player, onBack, onDelete);

    return (
        <ScrollView className="flex-1 pt-4 px-4 bg-surface-bg">
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={handleBack} className="flex-row items-center">
                    <Feather name="arrow-left" size={24} color="#FF6D00" />
                    <Text className="font-bold ml-2 text-h4 text-brand-orange font-evolventa">
                        {t('screens.player_info.back')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeletePress} className="p-2 rounded-xl bg-surface-card border border-surface-border">
                    <Feather name="trash-2" size={20} color="#f87171" />
                </TouchableOpacity>
            </View>

            <View className="items-center mb-8">
                <View className="w-48 h-48 rounded-full border-4 border-brand-orange items-center justify-center overflow-hidden mb-6 shadow-2xl shadow-brand-orange/20 bg-surface-card">
                    <Image source={{ uri: player.photoUrl }} className="w-full h-full" resizeMode="cover" />
                </View>
                <Text className="text-h1 font-black text-center mb-1 text-text-main font-unbounded">{player.name}</Text>
                <Text className="text-caption font-bold uppercase tracking-widest text-text-muted font-evolventa">
                    {t('screens.player_info.main_squad')}
                </Text>

                <View className="flex-row items-center gap-4 mt-6">
                    <View className="px-6 py-3 rounded-2xl border border-surface-border bg-surface-card items-center min-w-[100px]">
                        <Text className="text-caption uppercase font-bold text-text-sub font-evolventa mb-1">{t('screens.player_info.label_number')}</Text>
                        <Text className="font-black text-h2 text-brand-orange font-unbounded">#{player.number}</Text>
                    </View>
                    <View className="bg-brand-orange px-6 py-3 rounded-2xl items-center min-w-[100px] shadow-lg shadow-brand-orange/20">
                        <Text className="text-black text-caption uppercase font-bold font-evolventa mb-1">{t('screens.player_info.label_position')}</Text>
                        <Text className="text-black font-black text-h3 font-unbounded">{positionLabel}</Text>
                    </View>
                </View>
            </View>

            <View className="border-t border-surface-border my-6" />

            <View className="flex-row justify-between mb-4">
                <View className="w-[48%] p-5 rounded-3xl border border-surface-border bg-surface-card items-center">
                    <View className="w-12 h-12 bg-status-success/10 rounded-full items-center justify-center mb-3">
                        <Feather name="award" size={24} color="#34d399" />
                    </View>
                    <Text className="text-caption uppercase font-bold text-text-sub font-evolventa">{t('screens.player_info.best_time')}</Text>
                    <Text className="text-h2 font-black text-text-main font-unbounded">{player.stats?.bestTime || '--'}</Text>
                </View>
                <View className="w-[48%] p-5 rounded-3xl border border-surface-border bg-surface-card items-center">
                    <View className="w-12 h-12 bg-brand-orange/10 rounded-full items-center justify-center mb-3">
                        <Feather name="clock" size={24} color="#FF6D00" />
                    </View>
                    <Text className="text-caption uppercase font-bold text-text-sub font-evolventa">{t('screens.player_info.last_time')}</Text>
                    <Text className="text-h2 font-black text-text-main font-unbounded">{player.stats?.lastTime || '--'}</Text>
                </View>
            </View>
        </ScrollView>
    );
}