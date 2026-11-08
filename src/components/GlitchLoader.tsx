import { forwardRef, useMemo } from "react";
import MascotAnimation from "@/components/MascotAnimation";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "fullscreen";
const PX: Record<Size, number> = { xs: 20, sm: 28, md: 88, lg: 150, fullscreen: 220 };
const TIPS = ["Calibrating joysticks...", "Dusting off the cartridges...", "Inserting coins...", "Warming up the pixels...", "Loading retro carts..."];

interface Props {
  size?: Size;
  text?: string;
  slot?: string;
  className?: string;
}

/** One loader in five sizes: tiny for buttons, big mascot screen for full-page loads. */
const GlitchLoader = forwardRef<HTMLDivElement, Props>(({ size = "md", text, slot = "loader", className }, ref) => {
  const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], []);
  const px = PX[size];

  if (size === "xs" || size === "sm") {
    return (
      <span ref={ref as never} role="status" className={cn("inline-flex items-center gap-2", className)}>
        <MascotAnimation slot={`${slot}-mini`} size={px} />
        {text && <span>{text}</span>}
      </span>
    );
  }

  const body = (
    <div ref={size === "fullscreen" ? undefined : ref} role="status" className={cn("flex flex-col items-center justify-center gap-3 text-center", className)}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
        <MascotAnimation slot={slot} size={px} className="relative" />
      </div>
      <p className="font-display text-sm text-muted-foreground animate-pulse">{text ?? (size === "fullscreen" ? tip : "Loading...")}</p>
    </div>
  );

  if (size === "fullscreen") {
    return (
      <div ref={ref} className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        {body}
      </div>
    );
  }
  return body;
});
GlitchLoader.displayName = "GlitchLoader";
export default GlitchLoader;
