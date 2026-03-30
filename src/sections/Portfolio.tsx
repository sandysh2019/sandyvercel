import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetUrl, portfolioAPI } from '@/lib/api';
import type { PortfolioItem } from '@/types';
import { X, ChevronLeft, ChevronRight, ExternalLink, Github, Image as ImageIcon } from 'lucide-react';
import { useGsapReveal } from '@/hooks/useGsapReveal';
import { LiquidButton } from '@/components/ui/button';



const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'graphic-design' | 'web-ai'>('all');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useGsapReveal(sectionRef, '.gsap-reveal', { y: 40, stagger: 0.1 }, [portfolioItems, activeFilter]);

  useEffect(() => {
    loadPortfolioItems();
  }, []);

  const loadPortfolioItems = async () => {
    try {
      setLoading(true);
      const items = await portfolioAPI.getAll();
      setPortfolioItems(items);
    } catch (error) {
      console.error('Failed to load portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeFilter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeFilter);

  const filters = [
    { key: 'all', label: 'All Work' },
    { key: 'graphic-design', label: 'Graphic Design' },
    { key: 'web-ai', label: 'Web/AI Works' },
  ];

  const nextImage = () => {
    if (selectedItem) {
      setCurrentImageIndex((prev) =>
        prev === selectedItem.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedItem) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedItem.images.length - 1 : prev - 1
      );
    }
  };

  const openCarousel = (item: PortfolioItem) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
  };

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative w-full py-24 lg:py-32 overflow-hidden"
    >
      <div className="relative z-10 section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="gsap-reveal inline-block text-sm uppercase tracking-widest text-primary font-bold mb-4">
            My Work
          </span>
          <h2 className="gsap-reveal text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 text-foreground">
            Featured Projects
          </h2>

          {/* Filter Tabs */}
          <div className="gsap-reveal flex flex-wrap justify-center items-center gap-4 p-2 rounded-full glass-card border border-border/50 max-w-fit mx-auto shadow-2xl">
            {filters.map((filter) => (
              <LiquidButton
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
                variant={activeFilter === filter.key ? "default" : "ghost"}
                size="sm"
                className={`rounded-full px-6 transition-all duration-300 ${
                  activeFilter === filter.key
                    ? 'font-bold'
                    : 'text-muted-foreground/80 hover:text-foreground'
                }`}
              >
                {filter.label}
              </LiquidButton>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        {/* Portfolio Grid wrapper with fixed min-h strictly bounds the document scale preventing abrupt scroll jumps! */}
        <div className="min-h-[600px] w-full relative mt-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center min-h-[300px]"
              >
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </motion.div>
            ) : filteredItems.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 text-center py-20 h-fit my-auto glass-card bg-background/40 backdrop-blur-2xl max-w-lg mx-auto border border-border shadow-soft rounded-3xl"
              >
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
                <p className="text-muted-foreground font-semibold">No featured projects found in this category.</p>
              </motion.div>
            ) : (
              <motion.div 
                key={`grid-${activeFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8"
              >
                  {filteredItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="gsap-reveal group relative break-inside-avoid mb-8"
                    >
                      <div className="glass-card overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-border/50">
                        {/* Image Layer - Masonry Flow enabled by removing fixed aspect wrapper */}
                        <div
                          className="relative w-full overflow-hidden bg-muted/30 flex items-center justify-center"
                          onClick={() => openCarousel(item)}
                        >
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={getAssetUrl(item.images[0])}
                              alt={item.title}
                              className="w-full h-auto min-h-[250px] object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full aspect-video flex items-center justify-center">
                              <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                          )}

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-sm">
                            <LiquidButton variant="default" size="default" className="text-white hover:scale-105 pointer-events-none mb-2">
                              {item.category === 'graphic-design' ? (
                                <>
                                  <ImageIcon className="w-5 h-5" />
                                  View Gallery
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="w-5 h-5" />
                                  View Project
                                </>
                              )}
                            </LiquidButton>
                            {item.images && item.images.length > 1 && (
                              <span className="text-white/80 font-bold text-sm bg-black/40 px-3 py-1 rounded-full">
                                +{item.images.length - 1} Images
                              </span>
                            )}
                          </div>

                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-background/80 backdrop-blur-md text-foreground border border-border/50">
                              {item.category === 'graphic-design'
                                ? 'Graphic Design'
                                : 'Web/AI'}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors text-foreground">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 font-medium">
                            {item.description}
                          </p>

                          {/* Action Links (External / Github) visible for any project that has them */}
                          <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                            {item.externalUrl && (
                              <LiquidButton variant="outline" size="sm" asChild>
                                <a
                                  href={item.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1.5" />
                                  Live Demo
                                </a>
                              </LiquidButton>
                            )}
                            {item.githubUrl && (
                              <LiquidButton variant="ghost" size="sm" asChild>
                                <a
                                  href={item.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Github className="w-4 h-4 mr-1.5" />
                                  Code
                                </a>
                              </LiquidButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Image Carousel Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/90 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative max-w-[95vw] md:max-w-5xl w-full md:w-max p-0 bg-background border border-border/50 rounded-3xl overflow-hidden max-h-[95vh] shadow-high flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex flex-col max-h-[95vh] overflow-y-auto scrollbar-hide min-w-[300px] sm:min-w-[400px]">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Main Image */}
                <div className="relative flex items-center justify-center min-h-[30vh]">
                  {selectedItem.images[currentImageIndex] ? (
                    <img
                      src={getAssetUrl(selectedItem.images[currentImageIndex])}
                      alt={`${selectedItem.title} - ${currentImageIndex + 1}`}
                      className="w-auto h-auto max-w-full max-h-[65vh] object-contain rounded-t-3xl"
                    />
                  ) : (
                    <ImageIcon className="w-24 h-24 text-gray-600" />
                  )}

                  {/* Navigation Arrows */}
                  {selectedItem.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-lg"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-lg"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-medium shadow-lg">
                    {currentImageIndex + 1} / {selectedItem.images.length}
                  </div>
                </div>

                {/* Thumbnails */}
                {selectedItem.images.length > 1 && (
                  <div className="p-4 bg-muted/20 border-t border-border/50">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {selectedItem.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? 'border-primary ring-2 ring-primary/30'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={getAssetUrl(image)}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="p-6 bg-card/60 backdrop-blur-lg text-foreground border-t border-border/50">
                  <h3 className="text-2xl font-bold mb-2">{selectedItem.title}</h3>
                  <p className="text-muted-foreground font-medium">{selectedItem.description}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Portfolio;
