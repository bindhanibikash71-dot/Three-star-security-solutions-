/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'or';
export type ThemeMode = 'dark' | 'light';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    hi: string;
    or: string;
  };
}

export const translations: TranslationDictionary = {
  appName: {
    en: 'Security Guard Pro',
    hi: 'सिक्योरिटी गार्ड प्रो',
    or: 'ସିକ୍ୟୁରିଟି ଗାର୍ଡ ପ୍ରୋ',
  },
  dashboard: {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    or: 'ଡ୍ୟାସବୋର୍ଡ',
  },
  attendance: {
    en: 'Attendance',
    hi: 'उपस्थिति',
    or: 'ଉପସ୍ଥିତି',
  },
  leave: {
    en: 'Absence & Leave',
    hi: 'छुट्टी प्रबंधन',
    or: 'ଛୁଟି ପରିଚାଳନା',
  },
  dutyReports: {
    en: 'Duty Reports',
    hi: 'ड्यूटी रिपोर्ट',
    or: 'ଡ୍ୟୁଟି ରିପୋର୍ଟ',
  },
  salaries: {
    en: 'Calculators & Salaries',
    hi: 'वेतन गणना',
    or: 'ଦରମା ହିସାବ',
  },
  incidents: {
    en: 'Incident Logs',
    hi: 'घटना रिपोर्ट',
    or: 'ଦୁର୍ଘଟଣା ରିଭ୍ୟୁ',
  },
  visitors: {
    en: 'Visitor Center',
    hi: 'आगंतुक प्रविष्टि',
    or: 'ଅତିଥି ପଞ୍ଜୀକରଣ',
  },
  sites: {
    en: 'Station Posts',
    hi: 'सुरक्षा साइटें',
    or: 'ସୁରକ୍ଷା କେନ୍ଦ୍ର',
  },
  documents: {
    en: 'Digital Lockers',
    hi: 'दस्तावेज़ तिजोरी',
    or: 'ଫାଇଲ୍ ଲକର୍',
  },
  training: {
    en: 'Training Center',
    hi: 'प्रशिक्षण केंद्र',
    or: 'ତାଲିମ କେନ୍ଦ୍ର',
  },
  admin: {
    en: 'Control Board',
    hi: 'प्रशासन पैनल',
    or: 'ନିୟନ୍ତ୍ରଣ ବୋର୍ଡ',
  },
  superadmin: {
    en: 'Super Panel',
    hi: 'सुपर कोर कंट्रोल',
    or: 'ସୁପର ପ୍ୟାନେଲ୍',
  },
  settings: {
    en: 'Profile Settings',
    hi: 'सेटिंग्स बदलें',
    or: 'ପ୍ରୋଫାଇଲ୍ ସେଟିଂସ',
  },
  logOut: {
    en: 'Sign Out',
    hi: 'लॉग आउट',
    or: 'ଲଗ୍ ଆଉଟ୍',
  },
  welcomeBack: {
    en: 'Welcome back,',
    hi: 'स्वागत है,',
    or: 'ସ୍ୱାଗତମ,',
  },
  markAttendance: {
    en: 'Mark Presence',
    hi: 'उपस्थिति दर्ज करें',
    or: 'ଉପସ୍ଥିତି ଦିଅନ୍ତୁ',
  },
  checkIn: {
    en: 'Check In Roster',
    hi: 'चेक इन करें',
    or: 'ଚେକ୍ ଇନ୍ କରନ୍ତୁ',
  },
  quickStats: {
    en: 'Operational Summaries',
    hi: 'मुख्य सांख्यिकी',
    or: 'ମୁଖ୍ୟ ତଥ୍ୟ',
  },
  activeGuards: {
    en: 'Guards Multi-Roster',
    hi: 'सक्रिय सुरक्षा गार्ड',
    or: 'ସକ୍ରିୟ ଗାର୍ଡ',
  },
  incidentAlert: {
    en: 'Emergency Incidents',
    hi: 'आपातकालीन घटनाएँ',
    or: 'ଜରୁରୀକାଳୀନ ରିପୋର୍ଟ',
  },
  changeLanguage: {
    en: 'Change Language',
    hi: 'भाषा बदलें',
    or: 'ଭାଷା ବଦଳାନ୍ତୁ',
  },
  theme: {
    en: 'UI Layout Tone',
    hi: 'रंग थीम',
    or: 'ରଙ୍ଗ ଶୈଳୀ',
  },
};

interface ThemeContextType {
  theme: ThemeMode;
  lang: LanguageCode;
  toggleTheme: () => void;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('sgpro-theme');
    return (saved as ThemeMode) || 'dark'; // Keep default "dark" premium look
  });
  const [lang, setLang] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('sgpro-lang');
    return (saved as LanguageCode) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('sgpro-theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sgpro-lang', lang);
  }, [lang]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLanguage = (newLang: LanguageCode) => {
    setLang(newLang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][lang];
    }
    // fallback to original key
    return key;
  };

  return (
    <ThemeContext.Provider value={{ theme, lang, toggleTheme, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
};
