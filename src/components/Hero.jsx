import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

const bgImages = [
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1920&auto=format&fit=crop",
];

const Hero = ({ onBookNow }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % bgImages.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, []);

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="home"
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-luxury-charcoal"
    >
      {/* Cinematic Ken Burns Image Carousel Background */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 0.55, scale: 1.05 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full kenburns-bg"
            style={{ backgroundImage: `url(${bgImages[currentIdx]})` }}
          />
        </AnimatePresence>

        {/* Ambient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal via-luxury-charcoal/40 to-luxury-charcoal/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-navy/60 via-transparent to-luxury-navy/60 z-10" />
      </div>

      {/* Floating Graphic Lines and Elements */}
      <div className="absolute inset-x-12 inset-y-12 border border-luxury-gold/15 pointer-events-none z-20 hidden md:block" />
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-[1px] h-20 bg-gradient-to-b from-luxury-gold to-transparent pointer-events-none z-20 hidden md:block" />

      {/* Content Container */}
      <div className="relative z-20 text-center max-w-5xl px-6 md:px-12 flex flex-col items-center">
        {/* Floating Crest Ornaments */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mb-6"
        >
          <span className="inline-block text-xs font-sans tracking-[0.5em] text-luxury-gold-light uppercase border-b border-luxury-gold/30 pb-2">
            A Sanctuary of Premium hospitality
          </span>
        </motion.div>

        {/* Core Main Title with luxury text mask */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-8xl font-black tracking-[0.15em] leading-tight text-luxury-cream uppercase"
        >
          Experience <br className="sm:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-bright font-serif italic font-normal tracking-[0.08em] gold-text-glow">
            Meghdoot
          </span>
        </motion.h1>

        {/* Subtitle statement */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-6 text-sm sm:text-lg md:text-xl font-sans tracking-[0.3em] font-light max-w-2xl text-luxury-cream/80"
        >
          EXCEPTIONAL LUXURY, SUPREME COMFORT & TIMELESS PEACE
        </motion.p>

        {/* Motion CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center w-full"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onBookNow) onBookNow();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-charcoal font-sans font-bold text-sm uppercase tracking-[0.2em] shadow-2xl hover:shadow-luxury-gold/30 hover:scale-105 hover:bg-gradient-to-l transition-all duration-300 flex items-center justify-center focus:outline-none cursor-pointer font-semibold"
          >
            Book Your Stay
          </button>
          <a
            href="#rooms"
            onClick={(e) => handleScrollTo(e, "#rooms")}
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-luxury-cream/30 hover:border-luxury-gold text-luxury-cream hover:text-luxury-gold font-sans font-medium text-sm uppercase tracking-[0.2em] transition-all duration-300 bg-luxury-charcoal/30 backdrop-blur-sm flex items-center justify-center focus:outline-none"
          >
            Explore Rooms
          </a>
        </motion.div>
      </div>

      {/* Floating Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 2, duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 z-20 cursor-pointer flex flex-col items-center gap-2"
        onClick={(e) => handleScrollTo(e, "#about")}
      >
        <span className="text-[10px] tracking-[0.3em] font-light text-luxury-gold uppercase">
          SCROLL DOWN
        </span>
        <FaChevronDown className="w-4 h-4 text-luxury-gold" />
      </motion.div>
    </section>
  );
};

export default Hero;
