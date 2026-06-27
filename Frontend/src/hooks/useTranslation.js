import { useState, useEffect } from 'react';
import { translations } from '../i18n';

export const useTranslation = () => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const setLanguage = (lang) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
    window.dispatchEvent(new Event('languagechange'));
  };

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageState(localStorage.getItem('language') || 'en');
    };
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  const t = (key, replacements = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        let fallbackValue = translations['en'];
        for (const fk of keys) {
          if (fallbackValue && fallbackValue[fk] !== undefined) {
            fallbackValue = fallbackValue[fk];
          } else {
            fallbackValue = null;
            break;
          }
        }
        if (fallbackValue) {
          value = fallbackValue;
        } else {
          return key; 
        }
        break;
      }
    }

    if (typeof value === 'string') {
      let result = value;
      Object.keys(replacements).forEach(placeholder => {
        result = result.replace(`{${placeholder}}`, replacements[placeholder]);
      });
      return result;
    }

    return value || key;
  };

  return { t, language, changeLanguage: setLanguage, setLanguage };
};
