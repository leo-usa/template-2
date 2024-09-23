'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

export type LanguageKey = 'en' | 'zh-CN' | 'zh-TW';

interface LanguageContextType {
  language: LanguageKey;
  setLanguage: (lang: LanguageKey) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  en: {
    developedBy: "Developed by Elynn Pang and",
    sponsoredBy: "Sponsored by",
    signOut: "Sign Out",
  },
  'zh-CN': {
    developedBy: "NACEF 北美华人教育基金会公益项目\nElynn Pang 和 DrPang.AI 庞博士开发",
    sponsoredBy: "",
    signOut: "退出登录",
  },
  'zh-TW': {
    developedBy: "NACEF 北美華人教育基金會公益項目\nElynn Pang 和 DrPang.AI 龐博士開發",
    sponsoredBy: "",
    signOut: "登出",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageKey>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}