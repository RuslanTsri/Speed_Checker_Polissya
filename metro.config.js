const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

module.exports = (() => {
  // 1. Отримуємо базовий конфіг Expo
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  // 2. Додаємо підтримку SVG
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };

  config.resolver = {
    ...resolver,
    // Виключаємо svg з активів (assets) і додаємо в розширення вихідного коду (source)
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  // 3. Загортаємо все це в NativeWind
  return withNativeWind(config, { input: './global.css' });
})();