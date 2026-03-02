import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTeamSelection } from '../../../hooks/tempoMetrics/useTeamSelection';

// 🔥 Імпорт UI-компонентів
import { SearchInput } from '../../components/ui/SearchInput';
import { TeamsMod } from '../../components/ui/mods';
import { Button } from '../../components/ui/Button';
import { RadioButton } from '../../components/ui/RadioButton';
import {
    ArrowIcon,
    ArrowIconActive,
    TeamsIcon,
    TeamsIconActive,
} from '../../../../assets/icons';

interface Props {
    onBack: () => void;
    onSelect: (teamId: string, teamName: string) => void;
}

export default function TeamSelector({ onBack, onSelect }: Props) {
    const { t } = useTranslation();
    const { teams, search, setSearch, selectedId, setSelectedId } = useTeamSelection();

    return (
        <View className="flex-1 pt-4 relative">

            {/* HEADER */}
            <View className="flex-row items-center justify-between px-4 mb-6 relative z-10">
                <Pressable onPress={onBack} className="p-2 -ml-2 active:opacity-60">
                    {({ pressed }) => (
                        <View style={{ transform: [{ rotate: '-90deg' }] }}>
                            {pressed ? <ArrowIconActive width={28} height={28} fill="#F5F5F5" /> : <ArrowIcon width={28} height={28} fill="#F5F5F5" />}
                        </View>
                    )}
                </Pressable>

                <Text className="text-xl font-bold flex-1 text-center text-[#F5F5F5]" style={{ fontFamily: 'Unbounded' }}>
                    {t('tools.speed_checker.select_team_title')}
                </Text>

                <View className="w-10" />
            </View>

            {/* ПОШУК */}
            <View className="px-4 mb-4 z-10">
                <SearchInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t('tools.speed_checker.search_team')}
                />
            </View>

            {/* СПИСОК КОМАНД */}
            <FlatList
                data={teams}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                // 🔥 Робимо відступ знизу (200px), щоб список можна було доскролити ПІД кнопкою і футером
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 200 }}
                renderItem={({ item }) => {
                    const isSelected = selectedId === item.id;

                    return (
                        <TeamsMod
                            teamName={item.name}
                            tags={
                                <View className="flex-row gap-2 mt-1">
                                    <View className="flex-row items-center px-2 py-1 rounded-md border border-white/10 bg-white/5">
                                        <Feather name="users" size={10} color="#DCDCDC" style={{ marginRight: 6 }} />
                                        <Text className="text-[10px] font-bold text-[#DCDCDC]" style={{ fontFamily: 'Evolventa' }}>
                                            {t('tools.speed_checker.team_players_count', { count: item.players })}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center px-2 py-1 rounded-md border border-white/10 bg-white/5">
                                        <Feather name="calendar" size={10} color="#DCDCDC" style={{ marginRight: 6 }} />
                                        <Text className="text-[10px] font-bold text-[#DCDCDC]" style={{ fontFamily: 'Evolventa' }}>
                                            {item.lastSession || t('tools.speed_checker.no_data')}
                                        </Text>
                                    </View>
                                </View>
                            }
                            icon={<TeamsIcon width={31} height={31} fill={isSelected ? "#FF6D00" : "#F5F5F5"} />}
                            activeIcon={<TeamsIconActive width={31} height={31} fill="#FF6D00" />}

                            // 🔥 Використовуємо наш новий імпортований RadioButton
                            rightIcon={
                                <RadioButton
                                    selected={isSelected}
                                    onSelect={() => setSelectedId(item.id)}
                                />
                            }
                            rightActiveIcon={
                                <RadioButton
                                    selected={isSelected}
                                    onSelect={() => setSelectedId(item.id)}
                                />
                            }

                            onPress={() => setSelectedId(item.id)}
                            className={`mb-3 ${isSelected ? 'border-[#FF6D00]/50 bg-[#FF6D00]/5' : ''}`}
                        />
                    );
                }}
            />

            {/* 🔥 НИЖНЯ КНОПКА (Знову absolute bottom-28, як в BluetoothTool) */}
            <View className="absolute bottom-28 left-4 right-4 z-50">
                <Button
                    variant="primary"
                    title={t('tools.speed_checker.btn_continue')}
                    onPress={() => {
                        const team = teams.find(t => t.id === selectedId);
                        if (team) onSelect(team.id, team.name);
                    }}
                    disabled={!selectedId}
                    className="w-full shadow-xl shadow-black/50"
                />
            </View>

        </View>
    );
}