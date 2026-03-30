import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

export function scrollToSectionBySelector(selector: string, offset = 96) {
  const element = document.querySelector(selector);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  
  gsap.to(window, {
    duration: 1.2,
    scrollTo: { y: Math.max(top, 0), autoKill: true },
    ease: "power3.inOut"
  });
}

export function scrollToSectionById(id: string, offset = 96) {
  const element = document.getElementById(id);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  
  gsap.to(window, {
    duration: 1.2,
    scrollTo: { y: Math.max(top, 0), autoKill: true },
    ease: "power3.inOut"
  });
}
