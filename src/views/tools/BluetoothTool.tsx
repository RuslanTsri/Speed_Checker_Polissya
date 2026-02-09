import React, { useEffect, useRef } from 'react';

import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Animated, Easing } from 'react-native';

import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';



import { useTrainingBle } from '../../hooks/useTrainingBle';

import { SensorCard } from '../components/SensorCard';

import { formatTime } from '../../utils/time';



interface BluetoothToolProps {

    onBack: () => void;

}



// --- БЕЗПЕЧНИЙ КОМПОНЕНТ АНІМАЦІЇ (Standard Animated) ---

const PulseRing = ({ delay }: { delay: number }) => {

// Використовуємо ref для значень, щоб уникнути конфліктів Reanimated

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const opacityAnim = useRef(new Animated.Value(0.6)).current;



    useEffect(() => {

        const animation = Animated.loop(

            Animated.parallel([

                Animated.timing(scaleAnim, {

                    toValue: 2.5,

                    duration: 2000,

                    easing: Easing.out(Easing.ease),

                    useNativeDriver: true,

                    delay: delay,

                }),

                Animated.timing(opacityAnim, {

                    toValue: 0,

                    duration: 2000,

                    easing: Easing.out(Easing.ease),

                    useNativeDriver: true,

                    delay: delay,

                })

            ])

        );



// Скидаємо перед стартом

        scaleAnim.setValue(1);

        opacityAnim.setValue(0.6);



        animation.start();



        return () => animation.stop();

    }, [delay]);



    return (

        <Animated.View

            style={{

                transform: [{ scale: scaleAnim }],

                opacity: opacityAnim,

            }}

            className="absolute w-full h-full rounded-full border-2 border-yellow-400 bg-yellow-400/20"

        />

    );

};



export default function BluetoothTool({ onBack }: BluetoothToolProps) {

    const {

        connected,

        state,

        sensors,

        elapsedTime,

        pingProgress,

        startDiscovery,

        startTraining,

        stopTraining,

        stopPing,

        resetSession,

        disconnect

    } = useTrainingBle();



    const handleDisconnect = () => {



        disconnect?.();

    };



    return (

        <View className="flex-1 px-4 pt-4 bg-slate-900">

            {/* 1. HEADER */}

            <TouchableOpacity onPress={onBack} className="mb-4 flex-row items-center">

                <Feather name="arrow-left" size={24} color="#facc15" />

                <Text className="text-yellow-400 text-lg ml-2 font-bold">Телеметрія</Text>

            </TouchableOpacity>



            {/* 2. MAIN STATUS CARD */}

            <View className={`p-6 rounded-3xl border items-center shadow-lg mb-4 ${connected ? 'bg-slate-800 border-green-500/30' : 'bg-slate-800 border-slate-700'}`}>



                <View className="mb-4 items-center justify-center">

                    {/* Показуємо кільця тільки при пошуку */}

                    {state === 'discovering' && (

                        <View className="absolute w-20 h-20 items-center justify-center pointer-events-none">

                            <PulseRing delay={0} />

                            <PulseRing delay={1000} />

                        </View>

                    )}



                    <View className={`w-20 h-20 rounded-full items-center justify-center border-2 z-10 ${connected ? 'bg-green-500/20 border-green-500' : 'bg-slate-700 border-slate-600'}`}>

                        <MaterialCommunityIcons

                            name={connected ? "bluetooth" : "bluetooth-off"}

                            size={32}

                            color={connected ? "#4ade80" : "#94a3b8"}

                        />

                    </View>

                </View>



                {state === 'discovering' ? (

                    <>

                        <Text className="text-white text-xl font-bold mb-2">Пошук / Пінг...</Text>

                        <ActivityIndicator size="small" color="#facc15" className="my-2" />

                        <Text className="text-slate-400 text-center text-xs">{pingProgress || 'Скануємо ефір...'}</Text>



                        {connected && (

                            <TouchableOpacity onPress={stopPing} className="mt-4 bg-red-500/20 border border-red-500 px-4 py-2 rounded-full">

                                <Text className="text-red-400 font-bold text-xs">ЗУПИНИТИ</Text>

                            </TouchableOpacity>

                        )}

                    </>

                ) : (

                    <>

                        <Text className="text-white text-2xl font-bold mb-1">

                            {connected ? 'ПІДКЛЮЧЕНО' : 'ВІДКЛЮЧЕНО'}

                        </Text>

                        <Text className="text-slate-400 text-xs mb-4">STM32 Master Node</Text>



                        {!connected ? (

                            <TouchableOpacity

                                onPress={startDiscovery}

                                className="bg-yellow-400 px-10 py-3 rounded-xl shadow-lg shadow-yellow-400/20 active:bg-yellow-500"

                            >

                                <Text className="text-slate-900 font-bold text-lg">ПІДКЛЮЧИТИСЯ</Text>

                            </TouchableOpacity>

                        ) : (

                            <TouchableOpacity

                                onPress={handleDisconnect}

                                className="flex-row items-center bg-slate-700/50 border border-slate-600 px-4 py-2 rounded-full active:bg-slate-700"

                            >

                                <Feather name="x" size={16} color="#ef4444" />

                                <Text className="text-slate-300 font-bold text-xs ml-2">ВІДКЛЮЧИТИСЯ</Text>

                            </TouchableOpacity>

                        )}

                    </>

                )}

            </View>



            {/* 3. TIMER DISPLAY */}

            {(state === 'active' || state === 'armed' || state === 'finished') && (

                <View className={`mb-4 p-6 rounded-2xl border-2 items-center ${state === 'armed' ? 'bg-yellow-900/10 border-yellow-500' : state === 'active' ? 'bg-green-900/10 border-green-500' : 'bg-slate-800 border-slate-600'}`}>

                    <Text className="text-slate-400 text-xs font-bold tracking-widest mb-1">ЧАС ЗАЇЗДУ</Text>

                    <Text className={`text-6xl font-mono font-black ${state === 'armed' ? 'text-yellow-400' : state === 'active' ? 'text-green-400' : 'text-white'}`}>

                        {formatTime(elapsedTime)}

                    </Text>

                    {state === 'armed' && <Text className="text-yellow-500 text-xs mt-2 font-bold animate-pulse">ОЧІКУВАННЯ СТАРТУ...</Text>}

                </View>

            )}



            {/* 4. SENSORS LIST */}

            {connected && (

                <View className="flex-1">

                    <View className="flex-row justify-between items-end mb-3 px-2">

                        <Text className="text-slate-400 font-bold text-xs uppercase">Датчики</Text>

                        <Text className="text-slate-500 text-xs font-bold">{sensors.filter(s => s.status === 'active').length} / {sensors.length} Активні</Text>

                    </View>



                    <FlatList

                        data={sensors}

                        keyExtractor={item => item.id.toString()}

                        renderItem={({item}) => <SensorCard item={item} />}

                        className="flex-1"

                        showsVerticalScrollIndicator={false}

                        contentContainerStyle={{ paddingBottom: 100 }}

                    />

                </View>

            )}



            {/* 5. BOTTOM CONTROLS */}

            {connected && state !== 'discovering' && (

                <View className="absolute bottom-6 left-4 right-4 gap-3">

                    {state === 'idle' || state === 'ready' ? (

                        <View className="flex-row gap-3">

                            <TouchableOpacity onPress={startDiscovery} className="flex-1 bg-slate-800 border border-slate-600 py-4 rounded-xl items-center active:bg-slate-700">

                                <Text className="text-white font-bold uppercase">Перевірка</Text>

                            </TouchableOpacity>

                            <TouchableOpacity onPress={startTraining} className="flex-[2] bg-green-500 py-4 rounded-xl items-center shadow-lg shadow-green-500/30 active:bg-green-600">

                                <Text className="text-slate-900 font-black text-lg uppercase">СТАРТ</Text>

                            </TouchableOpacity>

                        </View>

                    ) : state === 'active' ? (

                        <TouchableOpacity onPress={stopTraining} className="bg-red-500 py-4 rounded-xl items-center shadow-lg shadow-red-500/30 active:bg-red-600">

                            <Text className="text-white font-black text-lg uppercase">СТОП</Text>

                        </TouchableOpacity>

                    ) : (

                        <TouchableOpacity onPress={resetSession} className="bg-slate-700 py-4 rounded-xl items-center active:bg-slate-600">

                            <Text className="text-white font-bold uppercase">Скинути результат</Text>

                        </TouchableOpacity>

                    )}

                </View>

            )}

        </View>

    );

}