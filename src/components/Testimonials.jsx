import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const reviews = [
  {
    name: "Vikram Malhotra",
    role: "Premium Elite Member",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    rating: 5,
    text: "An absolutely stunning experience at Hotel Meghdoot! The Royal Suite exceeded my expectations with its gorgeous interior design and breathtaking view. The staff handled every detail with extreme professionalism.",
  },
  {
    name: "Ananya Sharma",
    role: "Corporate Luxury Planner",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    rating: 5,
    text: "We hosted our annual executive conference in their Banquet Pavilion. Everything from high-speed digital systems to gourmet dining was flawlessly orchestrated. I highly recommend Meghdoot for luxury stays.",
  },
  {
    name: "Rohan Chatterjee",
    role: "Luxury Globe Traveler",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    rating: 5,
    text: "India has many luxury hotels, but Hotel Meghdoot stands out in hospitality. The attention to detail in their room service and travel assistance is highly impressive. I felt like royalty during my week-long stay.",
  },
];

const Testimonials = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section
      id="testimonials"
      className="relative py-24 md:py-32 px-6 md:px-12 bg-gradient-to-b from-luxury-charcoal to-luxury-navy overflow-hidden"
    >
      {/* Background visual blobs */}
      <div className="absolute top-1/3 left-1/4 w-[35vw] h-[35vw] rounded-full bg-luxury-gold/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] rounded-full bg-luxury-gold/3 blur-[90px] pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-sans font-semibold">
            GUEST FEEDBACK
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase mt-3 mb-6 tracking-wider">
            Voices of Our <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark font-serif italic font-normal tracking-[0.05em] gold-text-glow">
              Elite Guests
            </span>
          </h2>
          <div className="w-24 h-[1px] bg-luxury-gold mx-auto" />
        </div>

        {/* Carousel Slide Wrapper */}
        <div className="relative glass-panel rounded-3xl p-8 md:p-16 border border-luxury-gold/15 shadow-2xl flex flex-col items-center">
          {/* Quote Mark */}
          <div className="absolute top-6 left-8 md:top-10 md:left-12 text-luxury-gold/15 pointer-events-none">
            <FaQuoteLeft className="w-12 h-12 md:w-20 md:h-20" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col items-center text-center relative z-10"
            >
              {/* Star Rating Rendering */}
              <div className="flex gap-1.5 text-luxury-gold-bright mb-6">
                {[...Array(reviews[currentIdx].rating)].map((_, i) => (
                  <FaStar key={i} className="w-5 h-5 drop-shadow-[0_0_5px_rgba(226,199,153,0.6)]" />
                ))}
              </div>

              {/* Review Text */}
              <p className="font-sans font-light text-luxury-cream/85 text-base md:text-xl leading-relaxed italic max-w-2xl mb-8">
                "{reviews[currentIdx].text}"
              </p>

              {/* Guest Profile Details */}
              <div className="flex items-center gap-4 text-left">
                <img
                  src={reviews[currentIdx].avatar}
                  alt={reviews[currentIdx].name}
                  className="w-14 h-14 rounded-full border border-luxury-gold/30 object-cover shadow-lg"
                />
                <div>
                  <h4 className="font-serif text-lg font-bold text-luxury-cream">
                    {reviews[currentIdx].name}
                  </h4>
                  <p className="font-sans text-xs tracking-wider uppercase text-luxury-gold">
                    {reviews[currentIdx].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex gap-4 mt-12 relative z-20">
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(197,168,128,0.2)" }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="p-3 border border-luxury-gold/35 rounded-full text-luxury-gold transition-colors focus:outline-none"
              aria-label="Previous Review"
            >
              <FaChevronLeft className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "rgba(197,168,128,0.2)" }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="p-3 border border-luxury-gold/35 rounded-full text-luxury-gold transition-colors focus:outline-none"
              aria-label="Next Review"
            >
              <FaChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
