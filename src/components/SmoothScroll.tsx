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
    (window as any).lenis = lenis;
    
    // Sync lenis scroll with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    
    const tickHandler = (time: number) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(tickHandler);
    gsap.ticker.lagSmoothing(0);

    // 2. Handle Astro View Transitions lifecycle
    const handlePageLoad = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    const handleBeforeSwap = () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };

    document.addEventListener("astro:before-swap", handleBeforeSwap);
    document.addEventListener("astro:page-load", handlePageLoad);
    window.addEventListener("load", handlePageLoad);
    window.addEventListener("resize", handlePageLoad);

    // 3. Cleanup on unmount
    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickHandler);
      document.removeEventListener("astro:before-swap", handleBeforeSwap);
      document.removeEventListener("astro:page-load", handlePageLoad);
      window.removeEventListener("load", handlePageLoad);
      window.removeEventListener("resize", handlePageLoad);
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full">
      {children}
    </div>
  );
}
