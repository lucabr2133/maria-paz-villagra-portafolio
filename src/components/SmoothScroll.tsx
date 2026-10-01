import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Initialize once
    const lenis = new Lenis();
    
    // Sync lenis scroll with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    
    const tickHandler = (time: number) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(tickHandler);
    gsap.ticker.lagSmoothing(0);

    // 2. Refresh on window load for accurate calculations
    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    // 3. Cleanup on unmount
    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickHandler);
      window.removeEventListener("load", handleLoad);
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full">
      {children}
    </div>
  );
}
