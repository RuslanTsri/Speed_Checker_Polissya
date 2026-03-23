import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next'; // 🔥 Імпортуємо хук перекладу

export const OTAUpdateToast = ({
                                   visible,
                                   onPress,
                                   onClose
                               }: {
    visible: boolean,
    onPress: () => void,
    onClose: () => void
}) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    // Початкова позиція за межами екрану зверху (-150px)
    const translateY = useRef(new Animated.Value(-150)).current;

    useEffect(() => {
        if (visible) {
            // Плавно виїжджає вниз
            Animated.spring(translateY, {
                toValue: insets.top + 10, // Відступ від чілки/статусбару
                useNativeDriver: true,
                tension: 40,
                friction: 6
            }).start();

            // Автоматично ховається через 5 секунд
            const timer = setTimeout(() => hide(), 5000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hide = () => {
        // Плавно ховається назад вгору
        Animated.timing(translateY, {
            toValue: -150,
            duration: 300,
            useNativeDriver: true,
        }).start(() => onClose()); // Після анімації кажемо батьку, що ми закрились
    };

    if (!visible) return null;

    return (
        // ВАЖЛИВО: pointerEvents="box-none" пропускає кліки крізь невидимий контейнер
        <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]} pointerEvents="box-none">
            <Animated.View style={{ transform: [{ translateY }], paddingHorizontal: 16 }}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => { hide(); onPress(); }}
                    // Приємна напівпрозора зелена рамка
                    className="bg-[#1A1A1A] border border-[#22C55E]/40 rounded-2xl p-4 flex-row items-center shadow-lg shadow-black/50"
                    style={{ elevation: 10 }}
                >
                    {/* М'який зелений фон для іконки */}
                    <View className="bg-[#22C55E]/20 p-2.5 rounded-full mr-3">
                        {/* Змінили колір на зелений і іконку на більш дружню */}
                        <Feather name="arrow-up-circle" size={22} color="#22C55E" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-text-main font-bold font-unbounded text-sm">
                            {t('components.ota_updater.toast_title')}
                        </Text>
                        <Text className="text-text-sub text-xs font-evolventa mt-1 leading-tight">
                            {t('components.ota_updater.toast_desc')}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={hide} className="p-2 -mr-2 active:opacity-50">
                        <Feather name="x" size={20} color="#717171" />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};