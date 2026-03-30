import { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { scrollToSectionBySelector } from '@/lib/scroll';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch-button';
import { LiquidButton } from '@/components/ui/button';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    scrollToSectionBySelector(href);
    setIsMobileMenuOpen(false);
  };

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
            ? 'py-3 bg-background/80 backdrop-blur-xl border-b border-border'
            : 'py-6 bg-transparent'
          }`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#home');
              }}
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60"
            >
              Santhosh
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Switch
                value={isDark}
                onToggle={() => setTheme(isDark ? 'light' : 'dark')}
                iconOn={<Moon className="size-4" />}
                iconOff={<Sun className="size-4" />}
              />
              <LiquidButton variant="default" size="default" asChild>
                <a href="https://wa.me/919994723048" target="_blank" rel="noopener noreferrer">
                  Let's Talk
                </a>
              </LiquidButton>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center gap-4">
              <Switch
                value={isDark}
                onToggle={() => setTheme(isDark ? 'light' : 'dark')}
                iconOn={<Moon className="size-4" />}
                iconOff={<Sun className="size-4" />}
              />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center p-0"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
          }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div
          className={`absolute top-24 left-4 right-4 glass-card p-6 transition-all duration-500 ${isMobileMenuOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4'
            }`}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="text-lg font-medium py-3 border-b border-border last:border-0 hover:pl-2 transition-all"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {link.label}
              </a>
            ))}
            <LiquidButton variant="default" size="lg" className="mt-4" asChild>
              <a href="https://wa.me/919994723048" target="_blank" rel="noopener noreferrer">
                Let's Talk
              </a>
            </LiquidButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
