import { SafeAreaView } from 'react-native';
export const Container = ({ children }: { children: React.ReactNode }) => (
    <SafeAreaView className="flex-1 bg-surface-bg p-6">{children}</SafeAreaView>
);