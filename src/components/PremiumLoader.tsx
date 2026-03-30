import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const LoadingMessages = [
  "Preparing Assets...",
  "Rendering Layout...",
  "Curating Experience...",
  "Welcome."
];

const PremiumLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Elegant, slightly faster curve
    const duration = 2400;
    const interval = 24;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const rawProgress = currentStep / steps;
      // Smooth easing
      const easedProgress = rawProgress === 1 ? 1 : 1 - Math.pow(2, -10 * rawProgress);
      setProgress(Math.min(100, Math.floor(easedProgress * 100)));

      // Message logic
      if (rawProgress > 0.3 && rawProgress < 0.6) setMessageIndex(1);
      else if (rawProgress >= 0.6 && rawProgress < 0.9) setMessageIndex(2);
      else if (rawProgress >= 0.9) setMessageIndex(3);

      if (currentStep >= steps) {
        clearInterval(timer);
        exitAnimation();
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Soft rotation of background element
  useEffect(() => {
    if (!svgRef.current) return;
    
    gsap.to(svgRef.current, {
      rotation: 360,
      duration: 40,
      repeat: -1,
      ease: "linear"
    });

  }, []);

  const exitAnimation = () => {
    if (!containerRef.current) return;
    
    // Cinematic Exit using GSAP
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(onComplete, 50);
      }
    });

    tl.to('.loader-content', {
      scale: 1.05,
      opacity: 0,
      filter: 'blur(10px)',
      duration: 0.6,
      ease: 'power2.inOut'
    })
    .to('.loader-bg-top', {
      yPercent: -100,
      duration: 0.8,
      ease: 'power3.inOut'
    }, "-=0.3")
    .to('.loader-bg-bottom', {
      yPercent: 100,
      duration: 0.8,
      ease: 'power3.inOut'
    }, "-=0.8")
    .set(containerRef.current, { display: 'none' });
  };

  const currentMessage = LoadingMessages[messageIndex];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-none flex flex-col items-center justify-center overflow-hidden font-sans bg-transparent"
    >
      {/* Clean cinematic split backgrounds supporting light & dark modes without borders */}
      <div className="loader-bg-top absolute top-0 left-0 w-full h-1/2 bg-background pointer-events-auto shadow-sm" />
      <div className="loader-bg-bottom absolute bottom-0 left-0 w-full h-1/2 bg-background pointer-events-auto shadow-sm" />
      
      {/* Morphing Background Blobs - Subdued and professional */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 dark:opacity-30 z-0">
        <svg ref={svgRef} viewBox="0 0 1000 1000" className="w-[100vw] h-[100vw] sm:w-[70vw] sm:h-[70vw] max-w-[800px] max-h-[800px] blur-3xl">
          <motion.path
            fill="url(#loaderGradients)"
            animate={{
              d: [
                "M 250,500 C 250,300 300,250 500,250 C 700,250 750,300 750,500 C 750,700 700,750 500,750 C 300,750 250,700 250,500 Z",
                "M 300,500 C 200,350 350,200 500,200 C 650,200 800,350 700,500 C 800,650 650,800 500,800 C 350,800 200,650 300,500 Z",
                "M 200,500 C 200,300 350,350 500,200 C 650,350 800,300 800,500 C 800,700 650,650 500,800 C 350,650 200,700 200,500 Z",
                "M 250,500 C 250,300 300,250 500,250 C 700,250 750,300 750,500 C 750,700 700,750 500,750 C 300,750 250,700 250,500 Z"
              ]
            }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          />
          <defs>
            <linearGradient id="loaderGradients" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--secondary))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="loader-content relative z-10 flex flex-col items-center justify-center pointer-events-auto w-full px-6">
        
        {/* Minimalist Progress Circle */}
        <div className="relative w-40 h-40 md:w-56 md:h-56 flex items-center justify-center mb-10">
          <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
            {/* Background track circle */}
            <circle 
              cx="50" cy="50" r="48" 
              fill="transparent" 
              className="stroke-muted"
              strokeWidth="0.5" 
            />
            {/* Animated primary progress ring */}
            <motion.circle 
              cx="50" cy="50" r="48" 
              fill="transparent" 
              className="stroke-primary"
              strokeWidth="1.5"
              strokeDasharray="301.59"
              strokeDashoffset={301.59 - (301.59 * progress) / 100}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </svg>

          {/* Elegant numeric display */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <motion.span 
              className="text-4xl md:text-5xl font-light tracking-tighter text-foreground"
            >
              {progress}
              <span className="text-sm md:text-base font-medium text-muted-foreground ml-1">%</span>
            </motion.span>
          </div>
        </div>

        {/* Clean, professional fading text */}
        <div className="w-full h-8 relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={messageIndex}
              initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute text-sm md:text-base font-medium tracking-wide text-muted-foreground"
            >
              {currentMessage}
            </motion.div>
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
};

export default PremiumLoader;
