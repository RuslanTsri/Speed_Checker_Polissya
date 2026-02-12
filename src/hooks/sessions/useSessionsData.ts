import { useMemo } from 'react';

// --- ТИПИ (Shared Types) ---
export interface Attempt { round: number; time: number; }
export interface PlayerResult { id: string; playerName: string; number: string; bestTime: number; maxSpeed: number; attempts: Attempt[]; }
export interface TeamSession { id: string; teamName: string; testType: string; date: string; time: string; playerCount: number; bestTime: number; avgTime: number; results: PlayerResult[]; }

export interface GeneralSession {
    id: string;
    playerName: string;
    teamName: string;
    totalTime: number;
    avgSplit: number;
    date: string;
}

// --- MOCK DATA ---
const DUMMY_TEAM_SESSIONS: TeamSession[] = [
    {
        id: 's1', teamName: 'ФК «Динамо» U17', testType: 'Тест 30 м • 2 гейти • Раундів: 2', date: '12.10.2023', time: '10:30', playerCount: 24, bestTime: 4.06, avgTime: 4.69,
        results: [
            { id: 'p1', playerName: 'Гравець 21', number: '21', bestTime: 4.06, maxSpeed: 25.1, attempts: [{ round: 1, time: 4.12 }, { round: 2, time: 4.06 }] },
            { id: 'p2', playerName: 'Гравець 13', number: '13', bestTime: 4.10, maxSpeed: 25.1, attempts: [{ round: 1, time: 4.20 }, { round: 2, time: 4.10 }] },
            { id: 'p3', playerName: 'Гравець 4', number: '4', bestTime: 4.26, maxSpeed: 24.5, attempts: [{ round: 1, time: 4.26 }, { round: 2, time: 4.30 }] },
        ]
    }
];

const DUMMY_GENERAL_SESSIONS: GeneralSession[] = [
    { id: '1', playerName: 'Олександр Назаренко', teamName: 'ФК «Полісся»', totalTime: 12.30, avgSplit: 4.10, date: '10:45' },
    { id: '2', playerName: 'Бені Макуана', teamName: 'ФК «Полісся»', totalTime: 11.95, avgSplit: 3.98, date: '10:42' },
    { id: '3', playerName: 'Пилип Будківський', teamName: 'ФК «Полісся»', totalTime: 14.10, avgSplit: 4.70, date: '10:38' },
    { id: '4', playerName: 'Денис Бойко', teamName: 'ФК «Динамо»', totalTime: 13.50, avgSplit: 4.50, date: '10:35' },
    { id: '5', playerName: 'Артем Шабанов', teamName: 'ФК «Динамо»', totalTime: 13.10, avgSplit: 4.36, date: '10:30' },
];

export const useSessionsData = (searchQuery: string) => {

    const filteredTeamSessions = useMemo(() => {
        return DUMMY_TEAM_SESSIONS.filter(s =>
            s.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.date.includes(searchQuery)
        );
    }, [searchQuery]);

    const filteredGeneralSessions = useMemo(() => {
        const sorted = [...DUMMY_GENERAL_SESSIONS].sort((a, b) => a.totalTime - b.totalTime);
        return sorted.filter(s =>
            s.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.date.includes(searchQuery)
        );
    }, [searchQuery]);

    const bestGeneralResult = filteredGeneralSessions.length > 0 ? filteredGeneralSessions[0] : null;
    const worstGeneralResult = filteredGeneralSessions.length > 0 ? filteredGeneralSessions[filteredGeneralSessions.length - 1] : null;

    return {
        teamSessions: filteredTeamSessions,
        generalSessions: filteredGeneralSessions,
        stats: {
            best: bestGeneralResult,
            worst: worstGeneralResult
        }
    };
};