// Central HSL palette engine. Surface tokens are derived for light/dark mode.
export type ThemeId = 'default' | 'cyberpunk' | 'retro' | 'ocean' | 'sunset' | 'forest' | 'graphite' | 'cherry' | 'arctic' | 'volt' | 'cobalt' | 'rose';
export type AppearanceMode = 'dark' | 'light';
interface ThemeDef {
  id: ThemeId;
  label: string;
  description: string;
  hue: number;
  saturation: number;
  primary: string;
  secondary: string;
  accent: string;
}
export const THEMES: ThemeDef[] = [
  { id: 'default', label: 'Glitch', description: 'Signature cyan. A fresh classic.', hue: 220, saturation: 12, primary: '180 85% 52%', secondary: '345 82% 67%', accent: '80 75% 58%' },
  { id: 'cyberpunk', label: 'Cyberpunk', description: 'Electric pink meets acid yellow.', hue: 290, saturation: 15, primary: '325 90% 66%', secondary: '55 90% 60%', accent: '180 85% 55%' },
  { id: 'retro', label: 'Retro Arcade', description: 'Amber lights. Arcade nostalgia.', hue: 20, saturation: 12, primary: '30 95% 62%', secondary: '335 80% 68%', accent: '170 65% 56%' },
  { id: 'ocean', label: 'Ocean Depths', description: 'A cool blue with sea-green accents.', hue: 210, saturation: 24, primary: '190 85% 60%', secondary: '162 65% 58%', accent: '30 90% 65%' },
  { id: 'sunset', label: 'Sunset Vapor', description: 'Coral, peach, and violet afterglow.', hue: 300, saturation: 14, primary: '345 85% 70%', secondary: '25 90% 68%', accent: '270 70% 75%' },
  { id: 'forest', label: 'Forest', description: 'Botanical green with golden accents.', hue: 150, saturation: 16, primary: '150 65% 58%', secondary: '45 80% 65%', accent: '195 65% 65%' },
  { id: 'graphite', label: 'Graphite', description: 'Silver precision. Quiet confidence.', hue: 220, saturation: 5, primary: '210 18% 82%', secondary: '165 65% 62%', accent: '35 85% 64%' },
  { id: 'cherry', label: 'Cherry', description: 'Bold red against charcoal.', hue: 350, saturation: 8, primary: '355 85% 67%', secondary: '40 85% 65%', accent: '180 65% 60%' },
  { id: 'arctic', label: 'Arctic', description: 'Icy cyan. Crisp silver surfaces.', hue: 200, saturation: 18, primary: '195 80% 67%', secondary: '210 30% 82%', accent: '335 65% 70%' },
  { id: 'volt', label: 'Volt', description: 'Lime energy with a coral spark.', hue: 90, saturation: 8, primary: '80 85% 62%', secondary: '12 90% 66%', accent: '185 70% 60%' },
  { id: 'cobalt', label: 'Cobalt', description: 'Brilliant blue. Warm amber detail.', hue: 225, saturation: 12, primary: '218 95% 70%', secondary: '40 90% 65%', accent: '165 65% 60%' },
  { id: 'rose', label: 'Rose Quartz', description: 'Soft rose with fresh mint detail.', hue: 330, saturation: 10, primary: '335 70% 76%', secondary: '165 55% 65%', accent: '35 80% 70%' },
];
const STORAGE_KEY = 'siteTheme';
export const getStoredTheme = (): ThemeId => {
  const value = localStorage.getItem(STORAGE_KEY);
  return THEMES.find(t => t.id === value)?.id ?? 'default';
};
export const getAppearance = (): AppearanceMode => localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
const contrastingText = (color: string) => {
  const [h, s, l] = color.split(' ').map(v => parseFloat(v));
  const a = s / 100 * Math.min(l / 100, 1 - l / 100);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4) > 0.179 ? '220 15% 7%' : '0 0% 100%';
};
export const getThemeVars = (theme: ThemeDef, mode: AppearanceMode): Record<string, string> => {
  const light = mode === 'light';
  const surface = `${theme.hue} ${theme.saturation}%`;
  const foreground = light ? `${surface} 12%` : '210 15% 96%';
  const primary = light ? theme.primary.replace(/\d+%$/, theme.id === 'graphite' ? '30%' : '38%') : theme.primary;
  const secondary = light ? theme.secondary.replace(/\d+%$/, '38%') : theme.secondary;
  const accent = light ? theme.accent.replace(/\d+%$/, '38%') : theme.accent;
  return {
    '--background': `${surface} ${light ? 97 : 6}%`, '--foreground': foreground,
    '--card': `${surface} ${light ? 100 : 10}%`, '--card-foreground': foreground,
    '--popover': `${surface} ${light ? 100 : 11}%`, '--popover-foreground': foreground,
    '--muted': `${surface} ${light ? 92 : 15}%`, '--muted-foreground': `${theme.hue} 10% ${light ? 40 : 65}%`,
    '--border': `${surface} ${light ? 85 : 19}%`, '--input': `${surface} ${light ? 88 : 19}%`,
    '--primary': primary, '--primary-foreground': contrastingText(primary),
    '--secondary': secondary, '--secondary-foreground': contrastingText(secondary),
    '--accent': accent, '--accent-foreground': contrastingText(accent), '--ring': primary,
    '--success': light ? '145 70% 30%' : '145 65% 58%', '--success-foreground': light ? '0 0% 100%' : '220 15% 7%',
    '--warning': light ? '38 95% 40%' : '45 90% 62%', '--warning-foreground': '220 15% 7%',
    '--destructive': light ? '0 75% 44%' : '0 80% 65%', '--destructive-foreground': light ? '0 0% 100%' : '220 15% 7%',
    '--glass-bg': `${surface} ${light ? 100 : 10}% / 0.82`, '--glass-border': `${surface} ${light ? 70 : 45}% / 0.2`,
    '--glass-highlight': `0 0% ${light ? 0 : 100}% / 0.04`,
    '--neon-cyan': primary, '--neon-magenta': secondary, '--neon-purple': accent,
    '--neon-gold': light ? '38 95% 40%' : '45 90% 62%', '--neon-green': light ? '145 70% 30%' : '145 65% 58%',
    '--sidebar-background': `${surface} ${light ? 100 : 10}%`, '--sidebar-foreground': foreground,
    '--sidebar-primary': primary, '--sidebar-primary-foreground': contrastingText(primary),
    '--sidebar-accent': `${surface} ${light ? 92 : 15}%`, '--sidebar-accent-foreground': foreground,
    '--sidebar-border': `${surface} ${light ? 85 : 19}%`, '--sidebar-ring': primary,
  };
};
export const applyTheme = (id: ThemeId) => {
  const definition = THEMES.find(t => t.id === id) ?? THEMES[0];
  if (!definition) return;
  const root = document.documentElement;
  const mode = getAppearance();
  Object.entries(getThemeVars(definition, mode)).forEach(([key, value]) => root.style.setProperty(key, value));
  root.classList.toggle('light', mode === 'light');
  root.style.colorScheme = mode;
  root.setAttribute('data-theme', definition.id);
  localStorage.setItem(STORAGE_KEY, definition.id);
  window.dispatchEvent(new Event('glitch-theme-change'));
};
export const setAppearance = (mode: AppearanceMode) => {
  localStorage.setItem('theme', mode);
  applyTheme(getStoredTheme());
};
