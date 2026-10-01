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
    // En celulares y pantallas táctiles (iPhone, Android, tablets), deshabilitar SmoothScroll
    // para usar el desplazamiento inercial 100% nativo de iOS sin bloqueos ni interferencias
    const isTouchDevice = 
      typeof window !== "undefined" && 
      (window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window || navigator.maxTouchPoints > 0);

    if (isTouchDevice) {
      return;
    }

    // 1. Inicializar Lenis únicamente en computadoras (ratón / trackpad)
    const lenis = new Lenis();
    (window as any).lenis = lenis;
    
    // Sync lenis scroll with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    
    const tickHandler = (time: number) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(tickHandler);
    gsap.ticker.lagSmoothing(0);

    const handleRefresh = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    window.addEventListener("load", handleRefresh);
    window.addEventListener("resize", handleRefresh);

    // Cleanup on unmount
    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickHandler);
      window.removeEventListener("load", handleRefresh);
      window.removeEventListener("resize", handleRefresh);
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full">
      {children}
    </div>
  );
}
