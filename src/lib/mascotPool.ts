import ghost from "@/assets/mascots/ghost.webp.asset.json";
import pixelCat from "@/assets/mascots/pixel-cat.webp.asset.json";
import robot from "@/assets/mascots/robot.webp.asset.json";
import arcade from "@/assets/mascots/arcade.webp.asset.json";
import gamepad from "@/assets/mascots/gamepad.webp.asset.json";
import heart from "@/assets/mascots/heart.webp.asset.json";
import portal from "@/assets/mascots/portal.webp.asset.json";
import trophy from "@/assets/mascots/trophy.webp.asset.json";
import chest from "@/assets/mascots/chest.webp.asset.json";
import rocket from "@/assets/mascots/rocket.webp.asset.json";

export type Mascot =
  | { id: string; name: string; kind: "image"; src: string }
  | { id: string; name: string; kind: "lottie"; load: () => Promise<{ default: object }> };

export const MASCOTS: Mascot[] = [
  { id: "ghost", name: "Dancing Ghost", kind: "image", src: ghost.url },
  { id: "pixel-cat", name: "8-Bit Cat", kind: "image", src: pixelCat.url },
  { id: "robot", name: "Glitch Bot", kind: "image", src: robot.url },
  { id: "arcade", name: "Arcade Cabinet", kind: "image", src: arcade.url },
  { id: "gamepad", name: "Retro Gamepad", kind: "image", src: gamepad.url },
  { id: "heart", name: "Pixel Heart", kind: "image", src: heart.url },
  { id: "portal", name: "Portal", kind: "image", src: portal.url },
  { id: "trophy", name: "Trophy", kind: "image", src: trophy.url },
  { id: "chest", name: "Treasure Chest", kind: "image", src: chest.url },
  { id: "rocket", name: "Turbo Rocket", kind: "image", src: rocket.url },
  { id: "glitch-gamepad", name: "Glitch Gamepad", kind: "lottie", load: () => import("@/assets/lottie/glitch-gamepad.json") },
  { id: "cyber-gem", name: "Cyber Gem", kind: "lottie", load: () => import("@/assets/lottie/cyber-gem.json") },
  { id: "cyber-radar", name: "Cyber Radar", kind: "lottie", load: () => import("@/assets/lottie/cyber-radar.json") },
  { id: "retro-ufo", name: "Retro UFO", kind: "lottie", load: () => import("@/assets/lottie/retro-ufo.json") },
  { id: "level-shield", name: "Level-Up Shield", kind: "lottie", load: () => import("@/assets/lottie/level-shield.json") },
  { id: "spinning-coin", name: "Spinning Coin", kind: "lottie", load: () => import("@/assets/lottie/spinning-coin.json") },
  { id: "cyber-gear", name: "Cyber Gear", kind: "lottie", load: () => import("@/assets/lottie/cyber-gear.json") },
  { id: "lightning-bolt", name: "Lightning Bolt", kind: "lottie", load: () => import("@/assets/lottie/lightning-bolt.json") },
];

const byId = (id: string) => MASCOTS.find((m) => m.id === id)!;

/** Every place has its own fixed animation, so it always shows up where it belongs. */
export const SLOT_HOMES: Record<string, string> = {
  "page:home": "ghost",
  "page:login": "robot",
  "page:profile": "pixel-cat",
  "page:leaderboard": "trophy",
  "page:rewards": "chest",
  "page:settings": "cyber-gear",
  "page:admin": "level-shield",
  "page:recovery": "cyber-gem",
  "page:reset-password": "heart",
  "page:social": "retro-ufo",
  "page:support": "cyber-radar",
  "page:not-found": "portal",
  boot: "arcade",
  "page-loader": "lightning-bolt",
  "login-loader": "robot",
  button: "spinning-coin",
  "button-mini": "spinning-coin",
};

export function mascotForSlot(slot: string): Mascot {
  const id = SLOT_HOMES[slot] ?? SLOT_HOMES[slot.replace(/-mini$/, "")] ?? "gamepad";
  return byId(id);
}

/** Start downloading a page's animation as early as possible. */
export function preloadMascot(slot: string) {
  const m = mascotForSlot(slot);
  if (m.kind === "image") { const img = new Image(); img.src = m.src; }
  else void m.load();
}
