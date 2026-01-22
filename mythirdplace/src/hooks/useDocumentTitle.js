import { useEffect } from 'react';
import { Platform } from 'react-native';

const useDocumentTitle = (title) => {
  useEffect(() => {
    if (Platform.OS === 'web' && title) {
      const formattedTitle = title.includes('|') ? title : `MyThirdPlace | ${title}`;
      console.log('🏷️ Setting document title:', formattedTitle);
      document.title = formattedTitle;
    }
  }, [title]);
};

export default useDocumentTitle;