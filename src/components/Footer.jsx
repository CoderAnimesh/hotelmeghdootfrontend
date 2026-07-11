import React from "react";
import { motion } from "framer-motion";
import {
  FaFacebookF, FaInstagram, FaTwitter, FaTripadvisor,
  FaConciergeBell, FaPhone, FaEnvelope, FaMapMarkerAlt
} from "react-icons/fa";

const footerLinks = [
  { name: "Home", href: "#home" },
  { name: "Rooms & Suites", href: "#rooms" },
  { name: "Our Story", href: "#about" },
  { name: "Royal Services", href: "#services" },
  { name: "Photo Gallery", href: "#gallery" },
  { name: "Guest Reviews", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

const amenities = [
  "Fine Dining Restaurant",
  "24 / 7 Room Service",
  "Private Jacuzzi Suites",
  "Grand Celebration Banquet",
  "Elite Chauffeur Service",
  "Rooftop Pool Terrace",
  "Royal Spa & Wellness",
];

const socials = [
  { icon: <FaFacebookF />, label: "Facebook", href: "https://facebook.com" },
  { icon: <FaInstagram />, label: "Instagram", href: "https://instagram.com" },
  { icon: <FaTwitter />, label: "Twitter", href: "https://twitter.com" },
  { icon: <FaTripadvisor />, label: "TripAdvisor", href: "https://tripadvisor.com" },
];

const Footer = () => {
  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      window.scrollTo({
        top: elementRect - bodyRect - offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <footer className="relative bg-luxury-navy text-luxury-cream overflow-hidden">

      {/* ── Ambient glow blobs ── */}
      <div className="absolute top-0 left-1/4 w-[40vw] h-[40vw] rounded-full bg-luxury-gold/4 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[30vw] h-[30vw] rounded-full bg-luxury-gold/3 blur-[120px] pointer-events-none" />

      {/* ── Top gold ornament line ── */}
      <div className="relative">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-luxury-gold to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 bg-luxury-navy px-6">
          <div className="w-12 h-[1px] bg-luxury-gold/50" />
          <FaConciergeBell className="text-luxury-gold text-sm" />
          <div className="w-12 h-[1px] bg-luxury-gold/50" />
        </div>
      </div>

      {/* ── Google Maps Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-4"
      >
        <div className="text-center mb-8">
          <span className="section-label text-luxury-gold tracking-[0.4em]">OUR LOCATION</span>
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-luxury-cream mt-2 mb-1">
            Find Us at{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark">
              Hotel Meghdoot
            </span>
          </h3>
          <div className="flex items-center justify-center gap-2 text-luxury-cream/50 text-xs font-sans mt-2">
            <FaMapMarkerAlt className="text-luxury-gold" />
            <span>Near Shani Mandir, Indore Road , Ujjain-456010, India</span>
          </div>
        </div>

        {/* Map embed */}
        <div className="map-container w-full h-64 md:h-80 lg:h-96 relative group">
          {/* Gold corner decorations */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t border-l border-luxury-gold/60 z-10 pointer-events-none rounded-tl-sm" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-luxury-gold/60 z-10 pointer-events-none rounded-tr-sm" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b border-l border-luxury-gold/60 z-10 pointer-events-none rounded-bl-sm" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b border-r border-luxury-gold/60 z-10 pointer-events-none rounded-br-sm" />

          <iframe
            title="Hotel Meghdoot Location"
            src="https://maps.google.com/maps?q=23.1176144,75.7991728&z=17&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, filter: "invert(92%) hue-rotate(175deg) saturate(0.4) brightness(0.85) contrast(1.1)" }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />

          {/* Dark luxury overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-luxury-navy/60 to-transparent pointer-events-none z-[1]" />

          {/* Pin card overlay */}
          <div className="absolute bottom-4 left-4 z-10 glass-panel rounded-xl px-4 py-2.5 flex items-center gap-2.5 pointer-events-none">
            <div className="w-6 h-6 rounded-full bg-luxury-gold flex items-center justify-center flex-shrink-0">
              <FaMapMarkerAlt className="text-luxury-charcoal text-[10px]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-luxury-gold uppercase tracking-widest font-sans">Hotel Meghdoot</p>
              <p className="text-[9px] text-luxury-cream/60 font-sans">Indore Road, Ujjain</p>
            </div>
          </div>

          {/* Open in Maps link */}
          <a
            href="https://maps.google.com/maps?q=23.1176144,75.7991728&z=17"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 z-10 glass-panel rounded-lg px-3 py-1.5 text-[10px] font-sans font-semibold text-luxury-gold uppercase tracking-widest hover:bg-luxury-gold/20 transition-colors"
          >
            Open in Maps ↗
          </a>
        </div>
      </motion.div>

      {/* ── Main Footer Grid ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-10 relative z-10">

        {/* Brand Block */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center">
              <FaConciergeBell className="text-luxury-gold text-sm" />
            </div>
            <span className="font-serif text-xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark gold-text-glow">
              MEGHDOOT
            </span>
          </div>
          <div className="w-12 h-[1px] bg-luxury-gold/40" />
          <p className="font-sans font-light text-luxury-cream/55 text-xs leading-relaxed">
            Nestled in royal architectural splendor, Hotel Meghdoot is an award-winning sanctuary dedicated to timeless luxury, serene privacy, and the finest hospitality in Rajasthan.
          </p>
          {/* Social row */}
          <div className="flex gap-3 items-center">
            {socials.map((s, i) => (
              <motion.a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={s.label}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-luxury-charcoal/70 border border-luxury-gold/20 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-charcoal hover:border-luxury-gold transition-all duration-300 text-xs"
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          <h4 className="font-serif text-sm font-bold tracking-[0.22em] text-luxury-gold-bright uppercase">
            Navigation
          </h4>
          <div className="w-8 h-[1px] bg-luxury-gold/40" />
          <div className="flex flex-col gap-2.5">
            {footerLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="group flex items-center gap-2 text-luxury-cream/60 hover:text-luxury-gold font-sans font-light text-xs tracking-wider transition-all duration-300 w-max"
              >
                <span className="w-3 h-[1px] bg-luxury-gold/0 group-hover:bg-luxury-gold/70 transition-all duration-300 flex-shrink-0" />
                {link.name}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Amenities */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col gap-5"
        >
          <h4 className="font-serif text-sm font-bold tracking-[0.22em] text-luxury-gold-bright uppercase">
            Royal Amenities
          </h4>
          <div className="w-8 h-[1px] bg-luxury-gold/40" />
          <div className="flex flex-col gap-2.5">
            {amenities.map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-2 text-luxury-cream/55 font-sans font-light text-xs tracking-wider"
              >
                <span className="w-1 h-1 rounded-full bg-luxury-gold/50 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col gap-5"
        >
          <h4 className="font-serif text-sm font-bold tracking-[0.22em] text-luxury-gold-bright uppercase">
            Stay Connected
          </h4>
          <div className="w-8 h-[1px] bg-luxury-gold/40" />
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full border border-luxury-gold/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaMapMarkerAlt className="text-luxury-gold text-[10px]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-luxury-gold font-sans mb-1">Address</p>
                <p className="text-luxury-cream/60 font-sans font-light text-xs leading-relaxed">
                  12, Royal Heritage Road,<br />Udaipur, Rajasthan 313001
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full border border-luxury-gold/25 flex items-center justify-center flex-shrink-0">
                <FaPhone className="text-luxury-gold text-[10px]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-luxury-gold font-sans mb-1">Reservations</p>
                <a href="tel:+919876543210" className="text-luxury-cream/60 hover:text-luxury-gold font-sans font-light text-xs transition-colors">
                  +91 98765 43210
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full border border-luxury-gold/25 flex items-center justify-center flex-shrink-0">
                <FaEnvelope className="text-luxury-gold text-[10px]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-luxury-gold font-sans mb-1">Concierge</p>
                <a href="mailto:stay@hotelmeghdoot.com" className="text-luxury-cream/60 hover:text-luxury-gold font-sans font-light text-xs transition-colors break-all">
                  stay@hotelmeghdoot.com
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative z-10">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-sans font-light tracking-[0.18em] uppercase text-luxury-cream/35">
          <span>© 2026 Hotel Meghdoot · All Rights Reserved</span>
          <div className="flex items-center gap-1 text-luxury-gold/40 font-serif text-xs tracking-widest">
            <span className="text-luxury-gold/60">◆</span>
            <span>Luxury · Heritage · Peace</span>
            <span className="text-luxury-gold/60">◆</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-luxury-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-luxury-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
