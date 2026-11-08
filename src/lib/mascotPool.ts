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
];

/** Shuffled once per page load, so every refresh swaps which mascot sits in which slot. */
let order: Mascot[] | null = null;
const slots = new Map<string, Mascot>();

export function shuffleMascots(list: Mascot[], rand: () => number = Math.random): Mascot[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function mascotForSlot(slot: string): Mascot {
  if (!order) order = shuffleMascots(MASCOTS);
  const existing = slots.get(slot);
  if (existing) return existing;
  const m = order[slots.size % order.length];
  slots.set(slot, m);
  return m;
}
