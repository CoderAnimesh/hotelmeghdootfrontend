import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=900&auto=format&fit=crop",
    label: "Grand Lobby",
    span: "col-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=900&auto=format&fit=crop",
    label: "Deluxe Suite",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=900&auto=format&fit=crop",
    label: "Pool Terrace",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=900&auto=format&fit=crop",
    label: "Family Suite",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=900&auto=format&fit=crop",
    label: "Royal View",
    span: "col-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=900&auto=format&fit=crop",
    label: "Premium Royal Suite",
    span: "",
  },
];

const Gallery = () => {
  const [lightbox, setLightbox] = useState(null);

  return (
    <section
      id="gallery"
      className="relative py-24 md:py-32 px-6 md:px-12 bg-luxury-charcoal"
    >
      {/* Background glow */}
      <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] rounded-full bg-luxury-gold/4 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-sans font-semibold">
            OUR SPACES
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase mt-3 mb-6 tracking-wider">
            A Glimpse of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark font-serif italic font-normal tracking-[0.05em] gold-text-glow">
              Meghdoot
            </span>
          </h2>
          <div className="w-24 h-[1px] bg-luxury-gold mx-auto mb-6" />
          <p className="font-sans font-light text-luxury-cream/70 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Step inside the grandeur of Hotel Meghdoot — from sweeping royal suites to serene pool terraces. Click any image to explore.
          </p>
        </div>

        {/* Masonry-style Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.08, duration: 0.7 }}
              className={`relative group overflow-hidden rounded-2xl cursor-pointer ${img.span}`}
              style={{ aspectRatio: img.span ? "16/7" : "4/3" }}
              onClick={() => setLightbox(img)}
            >
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-sans font-semibold">
                  {img.label}
                </p>
              </div>
              {/* Gold border on hover */}
              <div className="absolute inset-0 rounded-2xl border border-luxury-gold/0 group-hover:border-luxury-gold/40 transition-all duration-400" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.src}
                alt={lightbox.label}
                className="w-full rounded-2xl shadow-2xl border border-luxury-gold/20"
              />
              <div className="absolute bottom-4 left-4">
                <p className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-sans font-semibold">
                  {lightbox.label}
                </p>
              </div>
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-luxury-charcoal/80 border border-luxury-gold/30 text-luxury-cream flex items-center justify-center text-sm hover:border-luxury-gold hover:text-luxury-gold transition-all focus:outline-none"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
