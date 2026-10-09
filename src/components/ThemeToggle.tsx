import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAppearance, setAppearance } from '@/lib/themes';
const ThemeToggle = () => {
  const [theme, setTheme] = React.useState(getAppearance);
  React.useEffect(() => {
    const sync = () => setTheme(getAppearance());
    window.addEventListener('glitch-theme-change', sync);
    return () => window.removeEventListener('glitch-theme-change', sync);
  }, []);
  return <Button variant="ghost" size="icon" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={() => setAppearance(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Moon/> : <Sun/>}</Button>;
};
export default ThemeToggle;
