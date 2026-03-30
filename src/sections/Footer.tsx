import { Linkedin, Instagram, Palette, ArrowUp, Heart } from 'lucide-react';
import { scrollToSectionBySelector } from '@/lib/scroll';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
  ];

  const socialLinks = [
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Palette, href: '#', label: 'Behance' },
  ];

  return (
    <footer className="relative w-full border-t border-border bg-background/40 backdrop-blur-2xl">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#home" className="inline-block mb-4">
              <span className="text-2xl font-bold text-foreground">Santhosh.</span>
            </a>
            <p className="text-muted-foreground mb-6 max-w-md font-medium">
              Designer & Developer crafting digital experiences that captivate,
              convert, and inspire. Based in Chennai, India.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-300 border border-border/50"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSectionBySelector(link.href);
                    }}
                    className="text-muted-foreground font-medium hover:text-foreground hover:translate-x-1 inline-block transition-all duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:santhoshwe2007@gmail.com"
                  className="text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                  santhoshwe2007@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919994723048"
                  className="text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                  +91 99947 23048
                </a>
              </li>
              <li className="text-muted-foreground font-medium">Chennai, India</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            © {new Date().getFullYear()} Santhosh. Made with
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            in Chennai
          </p>

          <div className="flex items-center gap-6">
            <a
              href="/admin"
              className="text-sm font-medium text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              Admin
            </a>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-300 border border-border/50"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
