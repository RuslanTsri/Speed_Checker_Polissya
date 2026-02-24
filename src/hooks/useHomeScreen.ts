import { useState, useEffect } from 'react';
import { useBle } from '../context/BleContext';
import { supabase } from '../lib/supabase';
import NetInfo from '@react-native-community/netinfo';
import { storage } from '../lib/storage';
import { syncManager } from '../services/SyncManager';
import { useTranslation } from 'react-i18next';

export type TabType = 'HOME' | 'PLAYERS' | 'SESSIONS' | 'SETTINGS';
export type ToolType = 'MENU' | 'BLUETOOTH' | 'TIMER' | 'SPEEDCHECK';

export const useHomeScreen = (onNavigate: (tab: TabType, params?: any) => void) => {
    const { t } = useTranslation();
    const [currentTool, setCurrentTool] = useState<ToolType>('MENU');

    // 🔥 ФІКС: Беремо тільки те, що реально є в useTrainingBle
    const { connected, sensors } = useBle();

    // Стан для останньої активності
    const [recentActivity, setRecentActivity] = useState<any>(null);

    // --- ЗАВАНТАЖЕННЯ ОСТАННЬОЇ СЕСІЇ ---
    const loadRecentActivity = async () => {
        try {
            const state = await NetInfo.fetch();
            let dataToUse = null;

            const pendingSessions = syncManager.getPendingItems('sessions')
                .filter((s: any) => s.team_id)
                .sort((a: any, b: any) => b.createdAt - a.createdAt);

            if (pendingSessions.length > 0) {
                const s = pendingSessions[0];
                dataToUse = {
                    teamId: s.team_id,
                    teamName: s.name || (t('screens.home.default_team') as string),
                    date: new Date(s.created_at || Date.now()).toLocaleDateString(),
                    time: new Date(s.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    testType: s.test_type || 'STATIC'
                };
            } else if (state.isConnected) {
                const { data } = await supabase
                    .from('sessions')
                    .select('id, team_id, created_at, test_type, teams(name)')
                    .not('team_id', 'is', null)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    const fetchedTeamName = Array.isArray(data.teams)
                        ? data.teams[0]?.name
                        : (data.teams as any)?.name;

                    dataToUse = {
                        teamId: data.team_id,
                        teamName: fetchedTeamName || (t('screens.home.default_team') as string),
                        date: new Date(data.created_at).toLocaleDateString(),
                        time: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        testType: data.test_type
                    };
                    await storage.setItem('home_recent_activity', JSON.stringify(dataToUse));
                }
            }

            if (!dataToUse && !state.isConnected) {
                const cached = await storage.getItem('home_recent_activity');
                if (cached) dataToUse = JSON.parse(cached);
            }

            setRecentActivity(dataToUse);
        } catch (e) {
            console.log("Error loading recent activity", e);
        }
    };

    useEffect(() => {
        loadRecentActivity();
        const unsub = syncManager.subscribe(() => {
            if (!syncManager.getIsSyncing()) loadRecentActivity();
        });
        return unsub;
    }, []);

    // --- ЛОГІКА СТАТУСУ UI (Локалізована) ---
    let status = {
        title: t('screens.home.status_disconnected_title') as string,
        desc: t('screens.home.status_disconnected_desc') as string,
        iconColor: "#64748b",
        bgIcon: "bg-slate-800",
        border: "border-slate-800",
        textCol: "text-white",
        btnText: t('screens.home.status_btn_connect') as string,
        btnClass: "bg-slate-800 border-slate-700",
        btnTextClass: "text-white"
    };

    if (connected) {
        status.title = t('screens.home.status_online_title') as string;
        // 🔥 ФІКС: Рахуємо сателіти без device.name
        const satellitesCount = sensors && sensors.length > 0 ? sensors.length - 1 : 0;
        status.desc = `STM32 Master • Датчиків: ${satellitesCount}`;
        status.iconColor = "#4ade80";
        status.bgIcon = "bg-green-500/10";
        status.border = "border-green-500/30";
        status.textCol = "text-green-400";
        status.btnText = t('screens.home.status_btn_settings') as string;
        status.btnClass = "bg-slate-900 border-slate-700";
        status.btnTextClass = "text-slate-400";
    }

    // --- НАВІГАЦІЯ ---
    const openTimer = () => setCurrentTool('TIMER');
    const openBluetooth = () => setCurrentTool('BLUETOOTH');
    const openSpeedCheck = () => setCurrentTool('SPEEDCHECK');
    const closeTool = () => setCurrentTool('MENU');

    const goToPlayers = () => onNavigate('PLAYERS');
    const goToSessions = () => onNavigate('SESSIONS', { subTab: 'GENERAL' });

    const openRecentActivity = () => {
        if (recentActivity) {
            onNavigate('SESSIONS', {
                subTab: 'TEAM',
                openSession: {
                    id: recentActivity.teamId,
                    teamName: recentActivity.teamName,
                    hasResults: true,
                    testType: recentActivity.testType,
                    playerCount: 0
                }
            });
        }
    };

    return {
        currentTool, connected, status, recentActivity,
        sensors, // Віддаємо сенсори для UI
        openTimer, openBluetooth, openSpeedCheck, closeTool,
        goToPlayers, goToSessions, openRecentActivity
    };
};