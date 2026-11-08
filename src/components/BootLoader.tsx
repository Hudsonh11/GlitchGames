import { useEffect, useState } from "react";
import GlitchLoader from "@/components/GlitchLoader";
import { useGame } from "@/contexts/GameContext";

/** Big loading screen on first site load; never reappears mid-session or during games. */
const BootLoader = () => {
  const { isLoading } = useGame();
  const [minDone, setMinDone] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMinDone(true), 900);
    const cap = window.setTimeout(() => setGone(true), 6000);
    return () => { window.clearTimeout(t); window.clearTimeout(cap); };
  }, []);
  useEffect(() => { if (minDone && !isLoading) setGone(true); }, [minDone, isLoading]);
  if (gone) return null;
  return <GlitchLoader size="fullscreen" slot="boot" />;
};
export default BootLoader;
