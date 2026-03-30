import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Reveals elements matching `selector` inside `containerRef` when scrolled into view.
 */
export function useGsapReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  selector: string,
  options: {
    y?: number;
    x?: number;
    stagger?: number;
    duration?: number;
    delay?: number;
    start?: string;
  } = {},
  dependencies: any[] = []
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const targets = el.querySelectorAll(selector);
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y: options.y ?? 40,
          x: options.x ?? 0,
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration: options.duration ?? 0.85,
          stagger: options.stagger ?? 0.12,
          delay: options.delay ?? 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: options.start ?? 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [containerRef, selector, options.y, options.x, options.stagger, options.duration, options.delay, options.start, ...dependencies]);
}
