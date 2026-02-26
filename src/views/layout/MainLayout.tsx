import React from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from './Header';
import { Footer, TabType } from './Footer';
import { useTheme } from '../../context/ThemeContext';
import { AppBackground } from '../components/ui/AppBackground';
interface MainLayoutProps {
    children: React.ReactNode;
    currentTab: TabType;
    onSwitchTab: (tab: TabType, params?: any) => void;
    onLogout: () => void;
    onOpenPinChange?: () => void;
}
export const MainLayout = ({ children, currentTab, onSwitchTab, ...props }: MainLayoutProps) => {
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeTool, setActiveTool] = React.useState<string | null>(null);

    const FOOTER_HEIGHT = 92;

    const handleSwitch = (tab: TabType) => {
        if (tab === ('SPEEDCHECK' as any)) {
            setActiveTool('SPEEDCHECK');
            onSwitchTab('HOME');
        } else {
            setActiveTool(null);
            onSwitchTab(tab);
        }
    };

    return (

        <AppBackground className="flex-1">
            <View className="flex-1">

                {/* Хедер (тільки зверху Safe Area) */}
                <SafeAreaView edges={['top', 'left', 'right']} className="z-10">
                    <Header {...props} onGoHome={() => handleSwitch('HOME')} />
                </SafeAreaView>

                {/* КОНТЕНТНА ОБЛАСТЬ */}
                <View
                    className="flex-1"
                    style={{
                        paddingBottom: FOOTER_HEIGHT
                    }}
                >
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child as any, {
                                externalTool: activeTool,
                                setExternalTool: setActiveTool
                            });
                        }
                        return child;
                    })}
                </View>

                <Footer
                    activeTab={currentTab}
                    onSwitch={handleSwitch}
                    isToolActive={activeTool === 'SPEEDCHECK'}
                />

            </View>
        </AppBackground>
    );
};