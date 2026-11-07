import { useEffect, useRef, useState } from "react";

/**
 * Glitch Games signature "looping G" line.
 * One continuous electric-blue path of connected G symbols that slowly
 * draws itself left-to-right once when it scrolls into view, then holds.
 */

const MODULE_WIDTH = 300;
const MODULE_HEIGHT = 160;

// Trace the reference's broad rising shoulder, small upper turn and rounded
// lower bowl. The inner bar doubles back onto the exit, as in the artwork.
// Each module starts and ends on the same horizontal baseline.
const modulePath = (ox: number, first: boolean) =>
  `${first ? `M ${ox} 84 ` : ""}H ${ox + 40} ` +
  `C ${ox + 102} 84 ${ox + 108} 22 ${ox + 181} 22 ` +
  `C ${ox + 216} 22 ${ox + 222} 28 ${ox + 222} 39 ` +
  `C ${ox + 222} 51 ${ox + 208} 54 ${ox + 185} 54 ` +
  `C ${ox + 112} 54 ${ox + 106} 138 ${ox + 170} 138 ` +
  `C ${ox + 208} 138 ${ox + 237} 111 ${ox + 237} 99 ` +
  `C ${ox + 237} 87 ${ox + 227} 84 ${ox + 212} 84 ` +
  `H ${ox + 170} H ${ox + MODULE_WIDTH}`;

const GLineAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  const [started, setStarted] = useState(false);

  // Track the available width so the pattern always reaches both edges.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth((previous) => Math.abs(w - previous) > 1 ? w : previous);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Start the draw once when the section scrolls into view. Never restarts.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const reps = Math.max(2, Math.round(width / MODULE_WIDTH));
  const path = Array.from({ length: reps }, (_, i) =>
    modulePath(i * MODULE_WIDTH, i === 0)
  ).join(" ");
  // Keep the pen speed consistent: ~60px per second, clamped 14–26s.
  const duration = Math.min(26, Math.max(14, width / 60));

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`g-line${started ? " g-line-started" : ""}`}
      style={{ "--g-duration": `${duration}s` } as React.CSSProperties}
    >
      <svg
        viewBox={`0 0 ${reps * MODULE_WIDTH} ${MODULE_HEIGHT}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <path
          className="g-line-path"
          d={path}
          pathLength={100}
          fill="none"
          strokeWidth={19}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default GLineAnimation;
