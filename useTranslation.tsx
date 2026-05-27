// Author: SyncStream i18n Engineer
// OS support: Cross-platform
// Description: React Context and hook for clean locales injection without UI widgets

import React, { createContext, useContext, useMemo } from 'react';
import { dictionary, CURRENT_LANG, Translations } from './locales.ts';

interface LanguageContextType {
  lang: string;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: CURRENT_LANG,
  t: (dictionary as any)[CURRENT_LANG] || dictionary.FR,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo(() => {
    // Falls back to French if CURRENT_LANG setup is missing or incorrect
    const selectedLang = CURRENT_LANG in dictionary ? CURRENT_LANG : 'FR';
    return {
      lang: selectedLang,
      t: (dictionary as any)[selectedLang] || dictionary.FR,
    };
  }, []);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
