import { useRef } from 'react';
import { useGsapReveal } from '@/hooks/useGsapReveal';
import { PricingSection } from '@/components/ui/pricing';

const Services = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  useGsapReveal(sectionRef, '.gsap-reveal');

  const PLANS = [
    {
      name: 'Basic / Starter',
      info: 'Perfect for small businesses and personal portfolios',
      price: {
        normal: 399,
        exclusive: 649,
      },
      features: {
        normal: [
          { text: 'Single-page landing website' },
          { text: 'Fully Responsive design' },
          { text: 'Basic SEO setup', tooltip: 'On-page title and meta tags' },
          { text: 'Contact form integration' },
          { text: '2 revision rounds' },
          { text: 'Analytics basic setup' },
        ],
        exclusive: [
          { text: 'Multi-page architecture', limit: 'Up to 3 Pages' },
          { text: 'Fluid Hover Animations', tooltip: 'Framer Motion triggers' },
          { text: 'Advanced SEO metrics' },
          { text: 'CMS Integration', tooltip: 'Basic markdown publishing' },
          { text: '4 revision rounds' },
          { text: 'Lighthouse optimizations' },
        ]
      },
      btn: {
        text: 'Contact To Start',
        href: 'https://wa.me/919994723048?text=Hi!%20I%20want%20the%20Basic%20Starter%20package.',
      },
    },
    {
      highlighted: true,
      name: 'Pro / Growth',
      info: 'Ideal for scaling brands requiring multi-page setups',
      price: {
        normal: 899,
        exclusive: 1299,
      },
      features: {
        normal: [
          { text: 'Multi-page website', limit: 'Up to 5 Pages' },
          { text: 'Premium Animations', tooltip: 'GSAP and Framer Motion integrated' },
          { text: 'CMS Integration', tooltip: 'Self-manage your content easily' },
          { text: 'Advanced SEO metrics' },
          { text: 'Custom iOS Liquid UI elements' },
          { text: '5 revision rounds' },
          { text: 'Performance optimization' },
        ],
        exclusive: [
          { text: 'Unlimited Static Pages' },
          { text: 'Custom 3D WebGL interactions', tooltip: 'Three.js / React Three Fiber' },
          { text: 'E-commerce Capability', tooltip: 'Stripe integration' },
          { text: 'Custom User Dashboard' },
          { text: 'Unlimited revision rounds' },
          { text: 'Premium Server Architecture' },
          { text: 'Priority tech support' },
        ],
      },
      btn: {
        text: 'Deploy Pro Tier',
        href: 'https://wa.me/919994723048?text=Hi!%20I%20want%20the%20Pro%20Growth%20package.',
      },
    },
    {
      name: 'Enterprise / AI',
      info: 'Full-scale app solutions and custom integrations',
      price: {
        normal: 1999,
        exclusive: 2999,
      },
      features: {
        normal: [
          { text: 'Unlimited Custom Pages' },
          { text: 'AI Feature Integration', tooltip: 'OpenAI, HuggingFace, Custom Models' },
          { text: 'Full-stack infrastructure', tooltip: 'Node / Database' },
          { text: 'Scalable Authorization' },
          { text: 'Unlimited Revisions' },
          { text: 'Priority tech support', tooltip: '24/7 dedicated assistance' },
        ],
        exclusive: [
          { text: 'Custom LLM Fine-tuning' },
          { text: 'Full Cloud Architecture', tooltip: 'AWS / GCP Load Balancing' },
          { text: 'Mobile App Companion', tooltip: 'React Native (iOS/Android)' },
          { text: 'Military-Grade Authorization' },
          { text: 'Advanced Security / Pen-tested' },
          { text: 'Dedicated 24/7 SLA Engineering' },
        ],
      },
      btn: {
        text: 'Custom Quote',
        href: 'https://wa.me/919994723048?text=Hi!%20I%20need%20a%20Custom%20Enterprise%20quote.',
      },
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative w-full py-24 lg:py-32 overflow-hidden"
    >
      <div className="relative z-10 section-container">
        <div className="gsap-reveal">
          <PricingSection
            plans={PLANS}
            heading="Full-Stack Development Packages"
            description="Choose the perfect package for your needs. All packages feature modern tech, clean code, and ongoing support."
          />
        </div>
      </div>
    </section>
  );
};

export default Services;
