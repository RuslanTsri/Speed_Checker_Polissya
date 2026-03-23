
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });
const { withProjectBuildGradle } = require('@expo/config-plugins');

const variant = process.env.APP_VARIANT || "preview";

let appName = "Tempo Metrics";
let appIdentifier = "com.citye.scienceparkztu.tempometrics";

if (variant === "development") {
  appName = "Tempo DEV";
  appIdentifier = "com.citye.scienceparkztu.tempometrics.dev";
} else if (variant === "preview") {
  appName = "Tempo Metrics";
  appIdentifier = "com.citye.scienceparkztu.tempometrics";
}

const withAndroidResolutionStrategy = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('resolutionStrategy')) {
      config.modResults.contents += `\n
allprojects {
    configurations.all {
        resolutionStrategy {
            force "androidx.core:core:1.15.0"
            force "androidx.core:core-ktx:1.15.0"
            force "androidx.activity:activity:1.9.3"
            force "androidx.fragment:fragment:1.8.5"
            force "androidx.annotation:annotation:1.9.0"
        }
    }
}\n`;
    }
    return config;
  });
};

export default {
  expo: {
    name: appName,
    slug: "tempo-metrics",
    version: "1.0.0",
    owner: "ruslan_tsri",
    orientation: "portrait",
    icon: "./assets/tempometrics_black.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/tempometrics_white_nobackground.png",
      resizeMode: "contain",
      backgroundColor: "#0A0A0A"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: appIdentifier,
      infoPlist: {
        NSBluetoothAlwaysUsageDescription: "Додаток використовує Bluetooth для підключення до системи хронометражу.",
        NSBluetoothPeripheralUsageDescription: "Додаток використовує Bluetooth для обміну даними з датчиками.",
        NSLocationWhenInUseUsageDescription: "Додаток використовує геолокацію для пошуку Bluetooth пристроїв поблизу.",
        UIBackgroundModes: ["bluetooth-central"]
      }
    },
    android: {
      package: appIdentifier,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive_icon.png",
        backgroundColor: "#0A0A0A"
      },
      permissions: [
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "BLUETOOTH_SCAN",
        "BLUETOOTH_CONNECT",
        "ACCESS_FINE_LOCATION"
      ]
    },
    runtimeVersion: "1.0.0",
    updates: {
      enabled: true,
      url:process.env.EXPO_PUBLIC_UPDATE_URL,
      channel:process.env.EXPO_PUBLIC_UPDATE_CHANNEL,
      requestHeaders: {
        "expo-channel-name":process.env.EXPO_PUBLIC_UPDATE_CHANNEL,
      }
    },
    extra: {
      eas: {
        projectId: "1f49de81-20be-4d3d-955d-c08af4d41bbd"
      }
    },
    plugins: [
      withAndroidResolutionStrategy,
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: "35.0.0",
            kotlinVersion: "2.1.20"
          }
        }
      ],
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/Unbounded-Regular.ttf",
            "./assets/fonts/Unbounded-Bold.ttf",
            "./assets/fonts/Unbounded-Black.ttf",
            "./assets/fonts/Unbounded-Medium.ttf",
            "./assets/fonts/Unbounded-Light.ttf",
            "./assets/fonts/Evolventa-Regular.ttf",
            "./assets/fonts/Evolventa-Bold.ttf"
          ]
        }
      ],
      "expo-dev-client",
      [
        "expo-location",
        {
          locationAlwaysPermission: "Дозвольте доступ до локації для пошуку пристроїв поблизу."
        }
      ]
    ]
  }
};