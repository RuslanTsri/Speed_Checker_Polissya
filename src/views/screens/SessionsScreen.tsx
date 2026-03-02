import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import SessionsGeneral from '../tools/SessionsGeneral';
import SessionsTeam from '../tools/SessionsTeam';
import SessionDetails from '../tools/SessionDetails';
import { useSessionsManager, SessionTabType } from '../../hooks/sessions/useSessionsManager';

// 🔥 Наші UI Компоненти
import { HeaderTabs } from '../components/ui/tabs';
import { SearchInput } from '../components/ui/SearchInput';

interface SessionsScreenProps {
    initialTab?: SessionTabType;
    openSession?: any; // Типізуй згідно зі своєю моделлю даних
}

export default function SessionsScreen({ initialTab, openSession }: SessionsScreenProps) {
    const { t } = useTranslation();
    const {
        activeTab, setActiveTab, searchQuery, setSearchQuery,
        selectedTeamSession, setSelectedTeamSession, clearSelection
    } = useSessionsManager(initialTab);

    // Синхронізація табів при зміні пропсів
    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        if (openSession) {
            setSelectedTeamSession(openSession);
            setActiveTab('TEAM');
        }
    }, [openSession]);

    if (selectedTeamSession) {
        return <SessionDetails session={selectedTeamSession} onBack={clearSelection} />;
    }

    // Конфіг для табів (використовуємо твої переклади)
    const tabs = [
        { id: 'TEAM', label: t('screens.sessions.tab_team') as string },
        { id: 'GENERAL', label: t('screens.sessions.tab_general') as string }
    ];

    return (
        <View className="flex-1 pt-4">
            {/* Заголовок: h3 + font-unbounded */}
            <View className="items-center px-4 mb-4">
                <Text className="text-h3 font-bold text-text-main font-unbounded">
                    {t('screens.sessions.title') as string}
                </Text>
            </View>

            {/* Таби: виправляємо помилку TS2322 за допомогою приведення типу */}
            <View className="px-4 mb-5">
                <HeaderTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(id) => setActiveTab(id as SessionTabType)}
                />
            </View>

            {/* Пошук: наш преміальний SearchInput */}
            <View className="px-4 mb-6">
                <SearchInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('screens.sessions.search_placeholder') as string}
                />
            </View>

            {/* Контентна частина: відображаємо потрібний тул */}
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