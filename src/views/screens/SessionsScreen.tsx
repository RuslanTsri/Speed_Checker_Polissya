import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import SessionsGeneral from '../tools/SessionsGeneral';
import SessionsTeam from '../tools/SessionsTeam';
import SessionDetails from '../tools/SessionDetails';
import { useSessionsManager, SessionTabType } from '../../hooks/sessions/useSessionsManager';

import { HeaderTabs } from '../components/ui/tabs';
import { SearchInput } from '../components/ui/SearchInput';

interface SessionsScreenProps {
    initialTab?: SessionTabType;
    openSession?: any;
    // 🔥 Додані пропси
    sessionDetailsOpen?: boolean;
    setSessionDetailsOpen?: (val: boolean) => void;
}

export default function SessionsScreen({ initialTab, openSession, sessionDetailsOpen, setSessionDetailsOpen }: SessionsScreenProps) {
    const { t } = useTranslation();
    const {
        activeTab, setActiveTab, searchQuery, setSearchQuery,
        selectedTeamSession, setSelectedTeamSession, clearSelection
    } = useSessionsManager(initialTab);

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        if (openSession) {
            setSelectedTeamSession(openSession);
            setActiveTab('TEAM');
        }
    }, [openSession]);

    // 🔥 1. Кажемо глобальному AppLogic, чи відкриті зараз деталі сесії
    useEffect(() => {
        if (setSessionDetailsOpen) {
            setSessionDetailsOpen(!!selectedTeamSession);
        }
    }, [selectedTeamSession]);

    // 🔥 2. Слухаємо AppLogic: якщо він каже "закрити" (по кнопці Назад) — очищаємо сесію
    useEffect(() => {
        if (sessionDetailsOpen === false && selectedTeamSession) {
            clearSelection();
        }
    }, [sessionDetailsOpen]);

    if (selectedTeamSession) {
        return <SessionDetails session={selectedTeamSession} onBack={clearSelection} />;
    }

    const tabs = [
        { id: 'TEAM', label: t('screens.sessions.tab_team') as string },
        { id: 'GENERAL', label: t('screens.sessions.tab_general') as string }
    ];

    return (
        <View className="flex-1 pt-4">
            <View className="items-center px-4 mb-4">
                <Text className="text-h3 font-bold text-text-main font-unbounded">
                    {t('screens.sessions.title') as string}
                </Text>
            </View>

            <View className="px-4 mb-5">
                <HeaderTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(id) => setActiveTab(id as SessionTabType)}
                />
            </View>

            <View className="px-4 mb-6">
                <SearchInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('screens.sessions.search_placeholder') as string}
                />
            </View>

            {activeTab === 'TEAM' ? (
                <SessionsTeam
                    searchQuery={searchQuery}
                    onSelectSession={setSelectedTeamSession}
                />
            ) : (
                <SessionsGeneral
                    searchQuery={searchQuery}
                />
            )}
        </View>
    );
}