import { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  stories: [
    // Шукаємо всі файли .stories в папці src та всіх її підпапках
    '../src/**/*.stories.?(ts|tsx|js|jsx)'
  ],
  addons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-actions',
  ],
};

export default main;