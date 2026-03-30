import { Briefcase, Users, Clock } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useGsapReveal } from '@/hooks/useGsapReveal';
import { LiquidButton } from '@/components/ui/button';
import { settingsAPI, getAssetUrl } from '@/lib/api';
import type { SiteSettings } from '@/types';

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  useGsapReveal(sectionRef, '.gsap-reveal');

  useEffect(() => {
    settingsAPI.get().then(setSettings).catch(console.error);
  }, []);

  const stats = [
    { icon: Briefcase, value: '50+', label: 'Projects Delivered' },
    { icon: Users, value: '30+', label: 'Happy Clients' },
    { icon: Clock, value: '5+', label: 'Years Experience' },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full py-24 lg:py-32 overflow-hidden"
    >
      <div className="relative z-10 section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left - Image */}
          <div className="relative gsap-reveal">
            {/* Decorative Line */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-primary rounded-full" />

            {/* Image Container */}
            <div className="relative glass-card p-4 sm:p-6 border border-border">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted/50">
                {settings?.aboutImage ? (
                  <img src={getAssetUrl(settings.aboutImage)} alt="About Portrait" className="w-full h-full object-cover" />
                ) : (
                  /* Abstract Representation */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-4 rounded-full glass-card flex items-center justify-center border border-border/50">
                        <span className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-primary to-primary/40">A</span>
                      </div>
                      <p className="text-muted-foreground font-medium text-sm">About Image</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -right-6 glass-card p-4 float-animation border border-border/50 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">50+</p>
                    <p className="text-sm text-muted-foreground font-medium">Projects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8">
            {/* Section Label */}
            <div className="gsap-reveal">
              <span className="text-sm uppercase tracking-widest text-primary font-bold">
                About Me
              </span>
            </div>

            {/* Headline */}
            <h2 className="gsap-reveal text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
              Crafting Digital Experiences with Purpose
            </h2>

            {/* Body Text */}
            <div className="space-y-4">
              <p className="gsap-reveal text-muted-foreground leading-relaxed text-lg">
                With over 5 years of experience bridging the gap between design and
                development, I've honed a unique skill set that allows me to see projects
                from both creative and technical perspectives.
              </p>
              <p className="gsap-reveal text-muted-foreground leading-relaxed text-lg">
                My journey began in graphic design, where I developed an eye for aesthetics
                and user-centered thinking. Today, I combine that foundation with full-stack
                development expertise and AI integration to build solutions that are as
                beautiful as they are functional.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="gsap-reveal text-center group cursor-default"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted/50 mb-4 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                    <stat.icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="gsap-reveal pt-4">
              <LiquidButton variant="default" size="lg" asChild>
                <a href="#contact">Contact Me directly</a>
              </LiquidButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
