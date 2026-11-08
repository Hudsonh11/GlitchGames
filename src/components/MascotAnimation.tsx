import { forwardRef, lazy, Suspense, useEffect, useState, type ComponentType } from "react";
import { mascotForSlot } from "@/lib/mascotPool";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Lottie = lazy<ComponentType<any>>(() => import("lottie-react").then((m: any) => ({ default: m.default?.default ?? m.default ?? m.Lottie })));

interface Props {
  slot: string;
  size?: number;
  className?: string;
}

/** Renders whichever mascot this slot drew for the current page load. */
const MascotAnimation = forwardRef<HTMLDivElement, Props>(({ slot, size = 120, className }, ref) => {
  const mascot = mascotForSlot(slot);
  const [data, setData] = useState<object | null>(null);
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (mascot.kind !== "lottie") return;
    let live = true;
    mascot.load().then((m) => live && setData(m.default));
    return () => { live = false; };
  }, [mascot]);

  return (
    <div ref={ref} aria-hidden="true" className={cn("pointer-events-none select-none shrink-0", className)} style={{ width: size, height: size }}>
      {mascot.kind === "image" ? (
        <img src={mascot.src} alt="" width={size} height={size} loading="eager" decoding="async" className="h-full w-full object-contain" draggable={false} />
      ) : data ? (
        <Suspense fallback={null}>
          <Lottie animationData={data} loop autoplay={!reduced} style={{ width: size, height: size }} />
        </Suspense>
      ) : null}
    </div>
  );
});
MascotAnimation.displayName = "MascotAnimation";
export default MascotAnimation;
