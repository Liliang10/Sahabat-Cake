import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const Ctx = createContext({ settings: {}, reload: () => {} });
export const useSettings = () => useContext(Ctx);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const reload = () => api.settings().then(setSettings).catch(() => {});
  useEffect(() => { reload(); }, []);
  return <Ctx.Provider value={{ settings, reload }}>{children}</Ctx.Provider>;
}
