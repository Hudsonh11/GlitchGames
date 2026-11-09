import { forwardRef, useEffect, useRef, useState } from "react";
import lottie from "lottie-web/build/player/lottie_light";
import { mascotForSlot } from "@/lib/mascotPool";
import { cn } from "@/lib/utils";


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
        <img src={mascot.src} alt="" width={size} height={size} loading="eager" decoding="async" fetchPriority="high" className="h-full w-full object-contain" draggable={false} />
      ) : data ? (
        <LottieBox data={data} autoplay={!reduced} />
      ) : null}
    </div>
  );
});
MascotAnimation.displayName = "MascotAnimation";
export default MascotAnimation;

function LottieBox({ data, autoplay }: { data: object; autoplay: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let anim: { destroy: () => void } | null = null;
    if (el.current) anim = lottie.loadAnimation({ container: el.current, renderer: "svg", loop: true, autoplay, animationData: data });
    return () => anim?.destroy();
  }, [data, autoplay]);
  return <div ref={el} className="h-full w-full" />;
}
