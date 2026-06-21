import { useEffect } from "react";
import { useI18nStore } from "./i18nStore";

export function AppProviders({ children }) {
  const { init, isLoading } = useI18nStore();

  useEffect(() => {
    init();
  }, []);

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading app...</div>;

  return children;
}
