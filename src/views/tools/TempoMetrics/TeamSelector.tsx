import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTeamSelection } from '../../../hooks/tempoMetrics/useTeamSelection';

import { SearchInput } from '../../components/ui/SearchInput';
import { TeamsMod } from '../../components/ui/mods';
import { Button } from '../../components/ui/Button';
import { RadioButton } from '../../components/ui/RadioButton';
import { ArrowIcon, ArrowIconActive, TeamsIcon, TeamsIconActive } from '../../../../assets/icons';

export default function TeamSelector({ onBack, onSelect }: any) {
    const { t } = useTranslation();
    const { teams, search, setSearch, selectedId, setSelectedId } = useTeamSelection();

    return (
        <View className="flex-1 pt-4 relative bg-surface-bg">
            <View className="flex-row items-center justify-between px-4 mb-6 z-10">
                <Pressable onPress={onBack} className="p-2 -ml-2"><View style={styles.rotateNeg90}><ArrowIcon width={28} height={28} fill="#F5F5F5" /></View></Pressable>
                <Text className="text-h3 font-bold flex-1 text-center text-text-main font-unbounded">{t('tools.speed_checker.select_team_title')}</Text>
                <View className="w-10" />
            </View>

            <View className="px-4 mb-4 z-10"><SearchInput value={search} onChangeText={setSearch} placeholder={t('tools.speed_checker.search_team')} /></View>

            <FlatList
                data={teams}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 200 }}
                renderItem={({ item }) => {
                    const isSelected = selectedId === item.id;
                    return (
                        <TeamsMod
                            teamName={item.name}
                            tags={<View className="flex-row gap-2 mt-1"><View className="flex-row items-center px-2 py-1 rounded-md border border-surface-border bg-surface-card"><Feather name="users" size={10} color="#717171" style={{ marginRight: 6 }} /><Text className="text-caption font-bold text-text-sub font-evolventa">{t('tools.speed_checker.team_players_count', { count: item.players })}</Text></View></View>}
                            icon={<TeamsIcon width={31} height={31} fill={isSelected ? "#FF6D00" : "#F5F5F5"} />}
                            rightIcon={<RadioButton selected={isSelected} onSelect={() => setSelectedId(item.id)} />}
                            onPress={() => setSelectedId(item.id)}
                            className={`mb-3 ${isSelected ? 'border-brand-orange/50 bg-brand-orange/5' : ''}`}
                        />
                    );
                }}
            />

            <View className="absolute bottom-28 left-4 right-4 z-50">
                <Button variant="primary" title={t('tools.speed_checker.btn_continue')} onPress={() => { const team = teams.find(t => t.id === selectedId); if (team) onSelect(team.id, team.name); }} disabled={!selectedId} className="w-full shadow-xl shadow-black/50" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({ rotateNeg90: { transform: [{ rotate: '-90deg' }] } });