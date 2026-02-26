    import React from 'react';
    import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
    import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
    import { useSafeAreaInsets } from 'react-native-safe-area-context';
    import { useTranslation } from 'react-i18next';

    // Твої іконки
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
    export const Footer = ({
                               activeTab,
                               onSwitch,
                               isToolActive = false
                           }: FooterProps) => {
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
                        className={`text-[10px] text-center uppercase tracking-tighter ${
                            isActive ? 'text-[#F5F5F5] font-bold' : 'text-[#717171] font-normal'
                        }`}
                        style={{ fontFamily: 'Evolventa' }}
                    >
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            );
        };

        return (
            <View
                className="absolute bottom-0 left-0 right-0"
                style={{ paddingBottom: insets.bottom }}
            >
                {/* SVG BACKGROUND WITH CUTOUT */}
                <View className="absolute inset-0">
                    <Svg
                        width={SCREEN_WIDTH}
                        height={92}
                        viewBox="0 0 375 92"
                        fill="none"
                        preserveAspectRatio="none"
                    >
                        <Path
                            d="M0 18C0 8.05888 8.05888 0 18 0H130.246C136.559 0 142.282 3.71257 144.856 9.47759L150.974 23.1828C165.078 54.7748 209.922 54.7748 224.026 23.1828L230.144 9.4776C232.718 3.71258 238.441 0 244.754 0H357C366.941 0 375 8.05887 375 18V91.4356H0V18Z"
                            fill="url(#paint0_linear)"
                        />
                        <Defs>
                            <LinearGradient id="paint0_linear" x1="187" y1="0" x2="187" y2="92" gradientUnits="userSpaceOnUse">
                                <Stop stopColor="#1E1E1E" />
                                <Stop offset="1" stopColor="#3C3C3C" />
                            </LinearGradient>
                        </Defs>
                    </Svg>
                </View>

                {/* CONTENT LAYER */}
                <View className="flex-row justify-between items-start h-[92px] px-4">
                    {/* Ліві таби */}
                    <View className="flex-row">
                        {renderTab(tabs[0])}
                        {renderTab(tabs[1])}
                    </View>

                    {/* ЦЕНТРАЛЬНА КНОПКА (Primary) */}
                    <View className="items-center" style={{ marginTop: -25 }}>
                        <Primary
                            variant="gradient"
                            isActive={isToolActive} //
                            onPress={() => onSwitch('SPEEDCHECK' as any)} // 👈 Викликаємо спідчек
                        />
                    </View>

                    {/* Праві таби */}
                    <View className="flex-row">
                        {renderTab(tabs[2])}
                        {renderTab(tabs[3])}
                    </View>
                </View>
            </View>
        );
    };