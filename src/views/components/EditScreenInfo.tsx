import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export const EditScreenInfo = ({ path }: { path: string }) => {
  const { t } = useTranslation();

  return (
      <View>
        <View className={styles.getStartedContainer}>
          <Text className={styles.getStartedText}>{t('components.edit_screen.title') as string}</Text>
          <View className={styles.codeHighlightContainer + styles.homeScreenFilename}>
            <Text>{path}</Text>
          </View>
          <Text className={styles.getStartedText}>{t('components.edit_screen.desc') as string}</Text>
        </View>
      </View>
  );
};

const styles = {
  codeHighlightContainer: `rounded-md px-1`,
  getStartedContainer: `items-center mx-12`,
  getStartedText: `text-lg leading-6 text-center`,
  helpContainer: `items-center mx-5 mt-4`,
  helpLink: `py-4`,
  helpLinkText: `text-center`,
  homeScreenFilename: `my-2`,
};