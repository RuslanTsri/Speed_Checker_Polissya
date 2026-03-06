import React from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from './Header';
import { Footer, TabType } from './Footer';
import { AppBackground } from '../components/ui/AppBackground';

export const MainLayout = ({ children, currentTab, onSwitchTab, ...props }: any) => {
    const [activeTool, setActiveTool] = React.useState<string | null>(null);
    const insets = useSafeAreaInsets();

    const FOOTER_HEIGHT = 92 + insets.bottom;

    const handleSwitch = (tab: string) => {
        // Якщо це один з інструментів, що відкриваються поверх Home
        if (['SPEEDCHECK', 'BLUETOOTH', 'TIMER'].includes(tab)) {
            setActiveTool(tab);
            onSwitchTab('HOME'); // Футер підсвітить HOME (або центральну кнопку для SPEEDCHECK)
        } else {
            // Якщо це звичайний таб
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

                <View className="flex-1" style={{ paddingBottom: FOOTER_HEIGHT }}>
                    {React.Children.map(children, child =>
                        React.isValidElement(child)
                            // 🔥 Передаємо handleSwitch вниз, щоб екрани могли ним керувати
                            ? React.cloneElement(child as any, {
                                externalTool: activeTool,
                                setExternalTool: setActiveTool,
                                onNavigateLayout: handleSwitch
                            })
                            : child
                    )}
                </View>

                {/* Якщо activeTool === 'SPEEDCHECK', підсвічуємо центральну кнопку */}
                <Footer
                    activeTab={currentTab}
                    onSwitch={handleSwitch as any}
                    isToolActive={activeTool === 'SPEEDCHECK'}
                />
            </View>
        </AppBackground>
    );
};