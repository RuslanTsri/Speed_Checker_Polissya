import React from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from './Header';
import { Footer, TabType } from './Footer';
import { AppBackground } from '../components/ui/AppBackground';

export const MainLayout = ({ children, currentTab, onSwitchTab, ...props }: any) => {
    const [activeTool, setActiveTool] = React.useState<string | null>(null);
    const insets = useSafeAreaInsets();

    // 🔥 Динамічна висота відступу знизу (Футер + Навігаційна панель)
    const FOOTER_HEIGHT = 92 + insets.bottom;

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
                <SafeAreaView edges={['top']} className="z-10">
                    <Header {...props} onGoHome={() => handleSwitch('HOME')} />
                </SafeAreaView>

                {/* Додаємо paddingBottom, щоб списки скролилися до кінця */}
                <View className="flex-1" style={{ paddingBottom: FOOTER_HEIGHT }}>
                    {React.Children.map(children, child =>
                        React.isValidElement(child)
                            ? React.cloneElement(child as any, { externalTool: activeTool, setExternalTool: setActiveTool })
                            : child
                    )}
                </View>

                <Footer activeTab={currentTab} onSwitch={handleSwitch} isToolActive={activeTool === 'SPEEDCHECK'} />
            </View>
        </AppBackground>
    );
};