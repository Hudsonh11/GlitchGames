import { forwardRef } from "react";
import { useLocation } from "react-router-dom";
import MascotAnimation from "@/components/MascotAnimation";

const KNOWN = new Set(["home","login","profile","leaderboard","rewards","settings","admin","recovery","reset-password","social","support"]);

/** A small mascot on every page (never on game screens so it can't block play). */
const PageMascot = forwardRef<HTMLDivElement>((_, ref) => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/game/")) return null;
  const seg = pathname.split("/")[1] || "home";
  const slot = `page:${KNOWN.has(seg) ? seg : "not-found"}`;
  return (
    <div ref={ref} className="fixed bottom-24 right-4 z-30 opacity-90 animate-fade-in">
      <MascotAnimation key={slot} slot={slot} size={72} className="sm:!h-24 sm:!w-24" />
    </div>
  );
});
PageMascot.displayName = "PageMascot";
export default PageMascot;
