import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const Ctx = createContext({ settings: {}, reload: () => {} });
export const useSettings = () => useContext(Ctx);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [error, setError] = useState('');
  const reload = async () => {
    try {
      const data = await api.settings();
      setSettings(data);
      setError('');
      return data;
    } catch (ex) {
      setError(ex.message);
      throw ex;
    }
  };
  useEffect(() => { reload().catch(() => {}); }, []);
  return <Ctx.Provider value={{ settings, reload, error }}>{children}</Ctx.Provider>;
}
