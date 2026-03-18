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
    openTeam?: any;
    sessionDetailsOpen?: boolean;
    setSessionDetailsOpen?: (val: boolean) => void;
}

export default function SessionsScreen({ initialTab, openSession, openTeam, sessionDetailsOpen, setSessionDetailsOpen }: SessionsScreenProps) {
    const { t } = useTranslation();
    const {
        activeTab, setActiveTab, searchQuery, setSearchQuery,
        selectedTeamSession, setSelectedTeamSession, clearSelection
    } = useSessionsManager(initialTab);

    const actualSession = openSession && !openSession.isJustTeam ? openSession : null;
    const actualTeam = openTeam || (openSession && openSession.isJustTeam ? openSession : null);

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        if (actualSession) {
            setSelectedTeamSession(actualSession);
            setActiveTab('TEAM');
        }
    }, [actualSession]);

    useEffect(() => {
        if (actualTeam) {
            setActiveTab('TEAM');
        }
    }, [actualTeam]);

    useEffect(() => {
        if (setSessionDetailsOpen) {
            setSessionDetailsOpen(!!selectedTeamSession);
        }
    }, [selectedTeamSession]);

    useEffect(() => {
        if (sessionDetailsOpen === false && selectedTeamSession) {
            clearSelection();
        }
    }, [sessionDetailsOpen]);

    if (selectedTeamSession) {
        return <SessionDetails session={selectedTeamSession} onBack={clearSelection} />;
    }

    const tabs = [
        { id: 'TEAM', label: t('sessions.tab_team', 'Командні') as string },
        { id: 'GENERAL', label: t('sessions.tab_general', 'Загальні / Швидкі') as string }
    ];

    return (
        <View className="flex-1 pt-4">
            <View className="items-center px-4 mb-4">
                <Text className="text-h3 font-bold text-text-main font-unbounded">
                    {t('sessions.title', 'Результати') as string}
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
                    placeholder={t('sessions.search_placeholder', 'Пошук') as string}
                />
            </View>

            {activeTab === 'TEAM' ? (
                <SessionsTeam
                    searchQuery={searchQuery}
                    onSelectSession={setSelectedTeamSession}
                    openTeam={actualTeam}
                />
            ) : (
                <SessionsGeneral
                    searchQuery={searchQuery}
                />
            )}
        </View>
    );
}