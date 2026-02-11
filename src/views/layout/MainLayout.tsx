import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from './Header';
import { Footer, TabType } from './Footer';

interface MainLayoutProps {
    children: React.ReactNode;
    currentTab: TabType;
    onSwitchTab: (tab: TabType, params?: any) => void;
    onLogout?: () => void;
    onOpenPinChange?: () => void;
}

export const MainLayout = ({
                               children,
                               currentTab,
                               onSwitchTab,
                               onLogout,
                               onOpenPinChange
                           }: MainLayoutProps) => {
    return (
        <SafeAreaView
            className="flex-1 bg-slate-900"
            edges={['top', 'bottom', 'left', 'right']}
        >
            <Header
                onGoHome={() => onSwitchTab('HOME')}
                onLogout={onLogout}
                onChangePin={onOpenPinChange}
            />

            <View className="flex-1 bg-slate-900">
                {children}
            </View>

            <Footer activeTab={currentTab} onSwitch={onSwitchTab} />
        </SafeAreaView>
    );
};