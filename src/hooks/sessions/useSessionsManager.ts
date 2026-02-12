import { useState } from 'react';
import { TeamSession } from './useSessionsData';

export type SessionTabType = 'GENERAL' | 'TEAM';

export const useSessionsManager = (initialTab: SessionTabType = 'TEAM') => {
    const [activeTab, setActiveTab] = useState<SessionTabType>(initialTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeamSession, setSelectedTeamSession] = useState<TeamSession | null>(null);

    const clearSelection = () => setSelectedTeamSession(null);

    return {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedTeamSession,
        setSelectedTeamSession,
        clearSelection
    };
};