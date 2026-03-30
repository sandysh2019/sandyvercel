import { useRef, useState } from 'react';
// removed messagesAPI

import { Mail, Phone, MapPin, Send, MessageCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGsapReveal } from '@/hooks/useGsapReveal';
import { LiquidButton } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Web Development',
    message: '',
  });
  const sectionRef = useRef<HTMLElement>(null);

  useGsapReveal(sectionRef, '.gsap-reveal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // We keep a lightweight API call if you want the dashboard to still track it secretly (optional), 
      // but let's just do pure WhatsApp redirection!
      // await messagesAPI.create(formData);  <- Removed this since user purely wants WA.

      // Construct encrypted WhatsApp text payload
      const payloadString = `Hi Santhosh! I am reaching out from your portfolio.
      
*Name:* ${formData.name}
*Email:* ${formData.email}
*Service Requested:* ${formData.service}

*Project Details:*
${formData.message}`;

      const waUrl = `https://wa.me/919994723048?text=${encodeURIComponent(payloadString)}`;

      // Simulate a premium loading transmission UX
      await new Promise(r => setTimeout(r, 800));
      
      window.open(waUrl, '_blank');
      
      setIsSubmitted(true);
      setFormData({ name: '', email: '', service: 'Web Development', message: '' });
      toast.success('Redirected to WhatsApp!');
    } catch (error) {
      toast.error('Failed to encode message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      value: '+91 99947 23048',
      href: 'tel:+919994723048',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'santhoshwe2007@gmail.com',
      href: 'mailto:santhoshwe2007@gmail.com',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Chennai, India',
      href: '#',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full py-24 lg:py-32 overflow-hidden"
    >
      <div className="relative z-10 section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="gsap-reveal inline-block text-sm uppercase tracking-widest text-muted-foreground font-medium mb-4">
            Get In Touch
          </span>
          <h2 className="gsap-reveal text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Let's Create Something Amazing
          </h2>
          <p className="gsap-reveal text-muted-foreground max-w-2xl mx-auto">
            Ready to transform your ideas into reality? I'm here to help you build the
            next big thing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
          {/* Left - Contact Info */}
          <div className="gsap-reveal space-y-8">
            <div className="space-y-6">
              {contactInfo.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-xl glass-card flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div className="glass-card p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1 text-foreground">Prefer WhatsApp?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Chat with me directly for quick responses and instant updates.
                  </p>
                  <a
                    href="https://wa.me/919994723048"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium hover:bg-green-500/20 border border-green-500/20 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Usually responds within 24 hours
              </span>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="gsap-reveal">
            <div className="glass-card p-8 border border-border/50 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-12"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-20 h-20 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-6 relative"
                    >
                      <motion.div 
                        className="absolute inset-0 rounded-full border border-green-500/50"
                        animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">Redirecting to WhatsApp!</h3>
                    <p className="text-muted-foreground mb-8">
                      Your message template is ready. Press send in WhatsApp to finalize.
                    </p>
                    <LiquidButton
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      size="lg"
                    >
                      Send Another Message
                    </LiquidButton>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="form-input"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="form-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 text-foreground">
                        Service Required
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {['Web Development', 'Graphic Design', 'Other'].map((service) => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, service }))}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                              formData.service === service 
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.05]"
                                : "bg-background/40 hover:bg-background/60 text-muted-foreground hover:text-foreground border-border/50 hover:border-border"
                            }`}
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell me about your project context..."
                        rows={4}
                        className="form-input resize-none"
                        required
                      />
                    </div>

                    <LiquidButton
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 font-bold relative overflow-hidden"
                      variant="default"
                    >
                      <AnimatePresence mode="wait">
                        {isSubmitting ? (
                          <motion.div
                            key="submitting"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                            />
                            Transmitting...
                          </motion.div>
                        ) : (
                          <motion.div
                            key="idle"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <MessageCircle className="w-5 h-5" />
                            Send via WhatsApp
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </LiquidButton>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
