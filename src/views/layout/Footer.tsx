import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import {
    HomeIcon, HomeIconActive,
    TeamsIcon, TeamsIconActive,
    StatsIcon, StatsIconActive,
    SettingsIcon, SettingsIconActive
} from '../../../assets/icons';

import { Primary } from '../components/ui/Primary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export type TabType = 'HOME' | 'PLAYERS' | 'SESSIONS' | 'SETTINGS';

interface FooterProps {
    activeTab: TabType;
    onSwitch: (tab: TabType) => void;
    isToolActive?: boolean;
}

export const Footer = ({ activeTab, onSwitch, isToolActive = false }: FooterProps) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const tabs = [
        { id: 'HOME' as TabType, label: t('layouts.footer.tab_home'), Icon: HomeIcon, IconActive: HomeIconActive },
        { id: 'PLAYERS' as TabType, label: t('layouts.footer.tab_players'), Icon: TeamsIcon, IconActive: TeamsIconActive },
        { id: 'SESSIONS' as TabType, label: t('layouts.footer.tab_sessions'), Icon: StatsIcon, IconActive: StatsIconActive },
        { id: 'SETTINGS' as TabType, label: t('layouts.footer.tab_settings'), Icon: SettingsIcon, IconActive: SettingsIconActive },
    ];

    const renderTab = (tab: typeof tabs[0]) => {
        const isActive = activeTab === tab.id && !isToolActive;
        const IconComponent = isActive ? tab.IconActive : tab.Icon;

        return (
            <TouchableOpacity
                key={tab.id}
                onPress={() => onSwitch(tab.id)}
                className="w-[70px] items-center justify-center pt-5 gap-1"
                activeOpacity={0.7}
            >
                <IconComponent
                    width={24}
                    height={24}
                    fill={isActive ? '#F5F5F5' : '#717171'}
                />
                <Text
                    className={`text-caption text-center uppercase tracking-tighter ${
                        isActive ? 'text-text-main font-evolventa-bold' : 'text-text-muted font-evolventa'
                    }`}
                >
                    {tab.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View className="absolute bottom-0 left-0 right-0 w-full">
            {/* --- ШАР ФОНУ (SVG + FILLER) --- */}
            <View style={StyleSheet.absoluteFill}>
                <Svg width={SCREEN_WIDTH} height={92} viewBox="0 0 375 92" fill="none" preserveAspectRatio="none">
                    <Path
                        d="M0 18C0 8.05888 8.05888 0 18 0H130.246C136.559 0 142.282 3.71257 144.856 9.47759L150.974 23.1828C165.078 54.7748 209.922 54.7748 224.026 23.1828L230.144 9.4776C232.718 3.71258 238.441 0 244.754 0H357C366.941 0 375 8.05887 375 18V91.4356H0V18Z"
                        fill="url(#footer_grad)"
                    />
                    <Defs>
                        <LinearGradient id="footer_grad" x1="187" y1="0" x2="187" y2="92" gradientUnits="userSpaceOnUse">
                            <Stop stopColor="#0A0A0A" />
                            <Stop offset="1" stopColor="#1C1C1E" />
                        </LinearGradient>
                    </Defs>
                </Svg>

                {/* 🔥 ФІЛЛЕР: заповнює залишок простору ПІД 92px кольором кінця градієнта */}
                <View
                    style={{
                        flex: 1, // Дозволяє розтягнутися до самого низу
                        backgroundColor: '#1C1C1E',
                        marginTop: -1 // Прибирає мікро-щілину між SVG та філлером
                    }}
                />
            </View>

            {/* --- ШАР КОНТЕНТУ (ІКОНКИ) --- */}
            {/* Тут фіксована висота, іконки не розтягуються, а залишаються на місці */}
            <View className="flex-row justify-between items-start h-[92px] px-4">
                <View className="flex-row">
                    {renderTab(tabs[0])}
                    {renderTab(tabs[1])}
                </View>

                {/* Центральна кнопка */}
                <View className="items-center" style={{ marginTop: -25 }}>
                    <Primary
                        variant="gradient"
                        isActive={isToolActive}
                        onPress={() => onSwitch('SPEEDCHECK' as any)}
                    />
                </View>

                <View className="flex-row">
                    {renderTab(tabs[2])}
                    {renderTab(tabs[3])}
                </View>
            </View>

            {/* --- ВІДСТУП ДЛЯ SAFE AREA (Навігаційна панель) --- */}
            {/* Саме цей невидимий блок "роздуває" весь футер на висоту системних кнопок Android та iOS */}
            <View style={{ height: insets.bottom }} />

        </View>
    );
};