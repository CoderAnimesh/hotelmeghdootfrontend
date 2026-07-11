import React from "react";
import { motion } from "framer-motion";

const BookingCTA = ({ onBookNow }) => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-luxury-charcoal">
      {/* Background visual parallax zoom */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full opacity-35"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1920&auto=format&fit=crop')`,
          }}
        />
        {/* Soft luxury gold overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-navy via-luxury-navy/80 to-luxury-navy z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal via-transparent to-luxury-charcoal/60 z-10" />
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Decorative Crest */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-luxury-gold"
        >
          <svg className="w-12 h-12 stroke-[0.75] fill-none mx-auto" viewBox="0 0 100 100">
            <polygon points="50,15 75,50 50,85 25,50" stroke="currentColor" />
            <circle cx="50" cy="50" r="6" className="fill-luxury-gold" />
          </svg>
        </motion.div>

        {/* Action Header Statement */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-extrabold uppercase text-luxury-cream tracking-wider leading-tight max-w-3xl"
        >
          Plan Your Perfect Stay <br />
          At{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-bright font-serif italic font-normal tracking-[0.05em] gold-text-glow">
            Hotel Meghdoot
          </span>
        </motion.h2>

        {/* Supporting statement */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 1 }}
          className="mt-6 text-sm sm:text-base md:text-lg font-sans tracking-[0.25em] font-light text-luxury-cream/80 uppercase max-w-xl"
        >
          Tranquil Sanctuary • Five-Star Comfort • Unmatched Serenity
        </motion.p>

        {/* Glowing Book Now CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-10"
        >
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              if (onBookNow) onBookNow();
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-12 py-5 rounded-full bg-gradient-to-r from-luxury-gold to-luxury-gold-bright text-luxury-charcoal font-sans font-bold text-sm uppercase tracking-[0.25em] shadow-[0_0_30px_rgba(197,168,128,0.4)] hover:shadow-[0_0_40px_rgba(197,168,128,0.7)] transition-all duration-300 focus:outline-none cursor-pointer"
          >
            Book Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default BookingCTA;
