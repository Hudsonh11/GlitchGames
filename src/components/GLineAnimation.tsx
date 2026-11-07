import { useEffect, useRef, useState } from "react";

/**
 * Glitch Games signature "looping G" line.
 * One continuous electric-blue path of connected G symbols that slowly
 * draws itself left-to-right once when it scrolls into view, then holds.
 */

const MODULE_WIDTH = 300;
const MODULE_HEIGHT = 140;

// One G module, 300 units wide, starting and ending on the y=60 baseline
// with a horizontal tangent so copies tile seamlessly.
const modulePath = (ox: number, first: boolean) =>
  `${first ? `M ${ox} 60 ` : ""}H ${ox + 55} ` +
  `C ${ox + 95} 60 ${ox + 105} 15 ${ox + 160} 15 ` +
  `C ${ox + 205} 15 ${ox + 215} 60 ${ox + 160} 60 ` +
  `C ${ox + 112} 60 ${ox + 110} 120 ${ox + 160} 120 ` +
  `C ${ox + 210} 120 ${ox + 207} 75 ${ox + 175} 75 ` +
  `H ${ox + 230} C ${ox + 260} 75 ${ox + 270} 60 ${ox + 300} 60`;

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
      if (w && Math.abs(w - width) > 1) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const reps = Math.max(2, Math.ceil(width / MODULE_WIDTH) + 1);
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
          stroke="#087FFF"
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default GLineAnimation;
