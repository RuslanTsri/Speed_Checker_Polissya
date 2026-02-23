import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from './Header';
import { Footer, TabType } from './Footer';
import { useTheme } from '../../context/ThemeContext'; // 🔥 Імпортуємо наш хук

interface MainLayoutProps {
    children: React.ReactNode;
    currentTab: TabType;
    onSwitchTab: (tab: TabType, params?: any) => void;
    onLogout: () => void;
    onOpenPinChange?: () => void;
}

export const MainLayout = ({
                               children,
                               currentTab,
                               onSwitchTab,
                               onLogout,
                               onOpenPinChange
                           }: MainLayoutProps) => {
    // 🔥 Беремо стан теми
    const { isDark } = useTheme();

    return (
        <SafeAreaView
            // Змінюємо фон залежно від теми
            className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}
            edges={['top', 'bottom', 'left', 'right']}
        >
            {/* В ідеалі в самі Header і Footer теж треба додати useTheme() всередині їхніх файлів */}
            <Header
                onGoHome={() => onSwitchTab('HOME')}
                onLogout={onLogout}
                onChangePin={onOpenPinChange}
            />

            <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                {children}
            </View>

            <Footer activeTab={currentTab} onSwitch={onSwitchTab} />
        </SafeAreaView>
    );
};