export type CelebrationTheme = {
  key: string;
  title: string;
  subtitle: string;
  particles: string[];
  style: 'fall' | 'burst' | 'rise';
};

const VARIANTS: CelebrationTheme[] = [
  { key: 'confetti', title: 'Payment Complete!', subtitle: 'Welcome to Glitch Games Plus', particles: ['🎉', '🎊', '✨', '⚡'], style: 'burst' },
  { key: 'fireworks', title: 'You’re In!', subtitle: 'Plus perks unlocked', particles: ['🎆', '🎇', '✨', '💫'], style: 'burst' },
  { key: 'treasure', title: 'Loot Unlocked!', subtitle: 'Coins and gems are on their way', particles: ['🪙', '💎', '👑', '⭐'], style: 'fall' },
  { key: 'rocket', title: 'Level Up!', subtitle: 'Plus is now active', particles: ['🚀', '⚡', '🌟', '🔥'], style: 'rise' },
];

/** Returns the event theme for a date, or null when no event is running. */
export function getEventTheme(d: Date = new Date()): CelebrationTheme | null {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m === 10) return { key: 'halloween', title: 'Spooky Success!', subtitle: 'Plus has risen from the grave 🎃', particles: ['🎃', '👻', '🦇', '🕷️', '🍬'], style: 'rise' };
  if (m === 12) return { key: 'christmas', title: 'Merry Plus-mas!', subtitle: 'An early present for you 🎄', particles: ['❄️', '🎄', '🎁', '⛄', '🌟'], style: 'fall' };
  if (m === 1 && day <= 7) return { key: 'newyear', title: 'Happy New Year!', subtitle: 'Start the year with Plus 🥳', particles: ['🎆', '🥳', '🍾', '✨'], style: 'burst' };
  if (m === 2 && day >= 7 && day <= 14) return { key: 'valentine', title: 'Love at First Payment!', subtitle: 'Plus loves you back 💖', particles: ['💖', '💘', '💝', '🌹'], style: 'rise' };
  if (m === 3 && day >= 14 && day <= 17) return { key: 'stpatrick', title: 'Lucky You!', subtitle: 'Plus pot of gold unlocked 🍀', particles: ['🍀', '☘️', '🪙', '🌈'], style: 'fall' };
  if ((m === 3 && day >= 22) || (m === 4 && day <= 25)) return { key: 'easter', title: 'Egg-cellent!', subtitle: 'Plus is hatched 🐣', particles: ['🥚', '🐣', '🐰', '🌷'], style: 'fall' };
  if (m === 11 && day <= 6) return { key: 'bonfire', title: 'Remember Remember!', subtitle: 'Plus is lighting up the sky', particles: ['🎆', '🔥', '🎇', '✨'], style: 'burst' };
  if (m === 7 || m === 8) return { key: 'summer', title: 'Summer Vibes!', subtitle: 'Plus is heating up ☀️', particles: ['☀️', '🏖️', '🍦', '🌴'], style: 'fall' };
  return null;
}

export function pickCelebration(d: Date = new Date()): CelebrationTheme {
  return getEventTheme(d) ?? VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
}
