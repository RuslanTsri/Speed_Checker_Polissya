import { View, Text } from 'react-native';
export const ScreenContent = ({ title, path, children }: any) => (
    <View className="flex-1 items-center justify-center bg-surface-bg p-6">
        <Text className="text-h2 font-bold text-text-main font-unbounded mb-4">{title}</Text>
        <View className="h-[1px] w-4/5 bg-surface-border mb-8" />
        <Text className="text-body text-text-sub font-evolventa mb-4">{path}</Text>
        {children}
    </View>
);