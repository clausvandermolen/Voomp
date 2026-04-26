import { createContext, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { resolveKey } from '../i18n';

const LangContext = createContext();

export function LangProvider({ children }) {
  const { user } = useAuth();
  const lang = user?.language || 'es';

  const t = useCallback((key) => resolveKey(lang, key), [lang]);

  return (
    <LangContext.Provider value={{ t, lang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
};
