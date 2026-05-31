import { createContext, useContext, useState } from 'react';
import { t as translateStr, LANGUAGES } from '../data/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('roadwatch_language') || 'en';
  });

  function setLang(code) {
    localStorage.setItem('roadwatch_language', code);
    setLangState(code);
  }

  // t(key, vars?) — translate a key with optional {var} interpolation
  // For array keys (defects, quick replies), returns the array as-is
  function t(key, vars) {
    return translateStr(lang, key, vars);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
