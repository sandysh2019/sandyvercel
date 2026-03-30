import { useEffect, useRef, useState } from 'react';
import { Linkedin, Instagram, Palette, ArrowDown, Calendar } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToSectionById } from '@/lib/scroll';
import { useGsapReveal } from '@/hooks/useGsapReveal';
import { settingsAPI, getAssetUrl } from '@/lib/api';
import type { SiteSettings } from '@/types';
import { LiquidButton } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useGsapReveal(heroRef, '.gsap-reveal', { y: 40, stagger: 0.1, delay: 0.2 });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!heroRef.current) return;

    settingsAPI.get().then(setSettings).catch(console.error);

    const ctx = gsap.context(() => {
      gsap.to('.hero-parallax', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    scrollToSectionById(id);
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* Content Container */}
      <div className="relative z-10 w-full section-container py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-screen">
          {/* Left Content */}
          <div className="order-2 lg:order-1 flex flex-col justify-center space-y-8">
            {/* Greeting */}
            <div className="gsap-reveal">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-muted-foreground border border-border">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Available for projects
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              {['Hi, I\'m Santhosh', 'Graphic Designer', '& Full Stack AI', 'Developer'].map((line, index) => (
                <div key={index} className="overflow-hidden gsap-reveal">
                  <h1
                    className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight ${
                      index === 0 ? 'text-primary/60' : 'text-foreground'
                    }`}
                  >
                    {line}
                  </h1>
                </div>
              ))}
            </div>

            {/* Subheadline */}
            <p className="gsap-reveal text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
              I blend visual storytelling with cutting-edge AI technology to create
              digital experiences that captivate, convert, and inspire.
            </p>

            {/* CTA Buttons */}
            <div className="gsap-reveal flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
              <LiquidButton size="xl" variant="default" className="w-full sm:w-auto" asChild>
                <a
                  href="https://wa.me/919994723048"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-base group"
                >
                  <Calendar className="w-5 h-5 mr-1" />
                  Schedule a call
                </a>
              </LiquidButton>
              <LiquidButton
                size="xl"
                variant="outline"
                className="w-full sm:w-auto font-bold text-base"
                onClick={() => scrollToSection('projects')}
              >
                View my work
                <ArrowDown className="w-5 h-5 ml-1" />
              </LiquidButton>
            </div>

            {/* Social Links */}
            <div className="gsap-reveal flex items-center gap-4 pt-8">
              <span className="text-sm text-muted-foreground">Follow me:</span>
              <div className="flex gap-3">
                {[
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Instagram, href: '#', label: 'Instagram' },
                  { icon: Palette, href: '#', label: 'Behance' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Profile Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end hero-parallax">
            <div className="gsap-reveal relative">
              {/* Decorative Rings */}
              <div className="absolute inset-0 -m-8">
                <div className="absolute inset-0 rounded-full border border-border opacity-30 animate-pulse" />
                <div className="absolute inset-4 rounded-full border border-border opacity-20" />
                <div className="absolute inset-8 rounded-full border border-border opacity-10" />
              </div>

              {/* Glass Card Container */}
              <div className="relative glass-card p-4 sm:p-6 float-animation border border-border/50">
                {/* Profile Image Placeholder */}
                <div className="relative w-64 h-80 sm:w-80 sm:h-96 lg:w-96 lg:h-[480px] rounded-2xl overflow-hidden bg-background">
                  {settings?.heroImage ? (
                    <img src={getAssetUrl(settings.heroImage)} alt="Hero Profile" className="w-full h-full object-cover" />
                  ) : (
                    /* Abstract Avatar Representation */
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                      <div className="text-center">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 rounded-full glass-card flex items-center justify-center shadow-inner">
                          <span className="text-5xl sm:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-primary to-primary/40">S</span>
                        </div>
                        <p className="text-muted-foreground font-medium">Profile Image</p>
                        <p className="text-muted-foreground/60 text-xs mt-1">Upload via Admin Panel</p>
                      </div>
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-4 -right-4 glass-card px-4 py-2 flex items-center gap-2 border border-border/50">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">Open to work</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="gsap-reveal absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={() => scrollToSection('about')}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span className="text-xs uppercase tracking-widest font-medium">Scroll</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ArrowDown className="w-5 h-5 text-primary" />
          </motion.div>
        </button>
      </div>
    </section>
  );
};

export default Hero;
