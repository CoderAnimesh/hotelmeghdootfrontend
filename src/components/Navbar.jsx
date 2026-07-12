import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars, FaTimes, FaConciergeBell, FaUtensils, FaRing,
  FaPhoneAlt, FaEnvelope, FaInstagram, FaFacebookF
} from "react-icons/fa";

const menuItems = [
  { name: "Home", href: "#home" },
  { name: "Rooms", href: "#rooms" },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Gallery", href: "#gallery" },
  { name: "Reviews", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

const Navbar = ({ onBookNow, onBookTable, onMarriageHall }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }, 300);
  };

  const handleTableBook = () => {
    setIsMobileMenuOpen(false);
    if (onBookTable) onBookTable();
  };

  const handleHallBook = () => {
    setIsMobileMenuOpen(false);
    if (onMarriageHall) onMarriageHall();
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
          isScrolled
            ? "bg-luxury-navy/90 backdrop-blur-md py-4 border-b border-luxury-gold/20 shadow-xl"
            : "bg-gradient-to-b from-luxury-charcoal/80 to-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-12 flex justify-between items-center">
          {/* Logo Brand */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, "#home")}
            className="flex items-center gap-3 group"
          >
            <motion.div whileHover={{ rotate: 15 }} className="text-luxury-gold">
              <FaConciergeBell className="w-6 h-6 md:w-7 md:h-7" />
            </motion.div>
            <span className="font-serif text-lg md:text-2xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark group-hover:gold-text-glow transition-all duration-300">
              MEGHDOOT
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-7 font-sans font-light text-sm tracking-[0.12em] text-luxury-cream">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className="relative py-2 hover:text-luxury-gold transition-colors duration-300 group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-luxury-gold transition-all duration-300 group-hover:w-full" />
              </a>
            ))}

            {/* Book a Table CTA */}
            <button
              onClick={handleTableBook}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-luxury-gold/40 text-luxury-gold/80 font-sans font-medium text-xs uppercase tracking-[0.18em] hover:bg-luxury-gold/10 hover:text-luxury-gold transition-all duration-300 focus:outline-none cursor-pointer"
            >
              <FaUtensils className="w-3 h-3" />
              Book Table
            </button>

            {/* Room Booking CTA */}
            <motion.button
              onClick={() => { if (onBookNow) onBookNow(); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-1 px-6 py-2.5 rounded-full border border-luxury-gold text-luxury-gold font-sans font-medium text-xs uppercase tracking-[0.2em] hover:bg-luxury-gold hover:text-luxury-charcoal transition-all duration-300 shadow-md hover:shadow-luxury-gold/20 focus:outline-none cursor-pointer"
            >
              Book Stay
            </motion.button>
          </div>

          {/* Hamburger Icon */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
            className="lg:hidden relative w-10 h-10 flex items-center justify-center text-luxury-cream hover:text-luxury-gold transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaTimes className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-[5px]"
                >
                  <span className="block w-6 h-[1.5px] bg-current rounded-full"></span>
                  <span className="block w-4 h-[1.5px] bg-luxury-gold rounded-full ml-auto"></span>
                  <span className="block w-6 h-[1.5px] bg-current rounded-full"></span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Mobile Drawer Backdrop ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Drawer — Right Side Slide ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200, mass: 0.8 }}
            className="fixed top-0 right-0 h-full w-[80vw] max-w-[340px] z-50 lg:hidden flex flex-col bg-[#0a0d14] border-l border-luxury-gold/15 shadow-2xl overflow-y-auto"
          >
            {/* Ambient glow */}
            <div className="absolute top-1/3 left-0 w-64 h-64 rounded-full bg-luxury-gold/5 blur-[80px] pointer-events-none" />

            {/* Drawer Header */}
            <div className="relative flex items-center justify-between px-6 py-5 border-b border-luxury-gold/10">
              <div className="flex items-center gap-2.5">
                <FaConciergeBell className="text-luxury-gold w-5 h-5" />
                <span className="font-serif text-base font-bold tracking-[0.2em] text-luxury-gold">MEGHDOOT</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full border border-luxury-gold/20 flex items-center justify-center text-luxury-cream/60 hover:text-luxury-gold hover:border-luxury-gold/40 transition-all"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Menu Label */}
            <p className="relative px-6 pt-5 pb-2 text-[9px] uppercase tracking-[0.3em] text-luxury-gold/50 font-sans">Navigation</p>

            {/* Nav Links */}
            <nav className="relative flex flex-col px-4">
              {menuItems.map((item, idx) => (
                <motion.a
                  key={item.name}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 + 0.1 }}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className="flex items-center justify-between px-3 py-3.5 rounded-xl text-luxury-cream/80 hover:text-luxury-gold hover:bg-luxury-gold/5 font-sans font-medium text-sm tracking-[0.08em] transition-all duration-200 group border-b border-luxury-gold/5"
                >
                  {item.name}
                  <span className="w-1 h-1 rounded-full bg-luxury-gold/30 group-hover:bg-luxury-gold group-hover:scale-150 transition-all" />
                </motion.a>
              ))}
            </nav>

            {/* Divider with label */}
            <div className="relative px-6 mt-5 mb-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-luxury-gold/10" />
                <span className="text-[9px] uppercase tracking-[0.3em] text-luxury-gold/40">Quick Booking</span>
                <div className="flex-1 h-[1px] bg-luxury-gold/10" />
              </div>
            </div>

            {/* Special CTA Buttons */}
            <div className="relative flex flex-col gap-3 px-4 pb-4">
              <motion.button
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleTableBook}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-luxury-gold/8 border border-luxury-gold/20 text-luxury-gold hover:bg-luxury-gold/15 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-luxury-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-luxury-gold/20 transition-all">
                  <FaUtensils className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-sans font-semibold text-sm">Book a Table</p>
                  <p className="text-[10px] text-luxury-gold/50 font-sans">Restaurant · ₹100/table/hr</p>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                onClick={handleHallBook}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-purple-500/8 border border-purple-500/20 text-purple-300 hover:bg-purple-500/15 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-all">
                  <FaRing className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-sans font-semibold text-sm">Marriage Hall</p>
                  <p className="text-[10px] text-purple-300/50 font-sans">Weddings & Events · Inquire</p>
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => { setIsMobileMenuOpen(false); if (onBookNow) onBookNow(); }}
                className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark text-luxury-charcoal font-sans font-bold text-sm uppercase tracking-[0.2em] shadow-xl hover:shadow-luxury-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none"
              >
                Book Your Stay
              </motion.button>
            </div>

            {/* Contact Info Footer */}
            <div className="relative mt-auto border-t border-luxury-gold/10 px-6 py-5">
              <p className="text-[9px] uppercase tracking-[0.3em] text-luxury-gold/40 mb-3 font-sans">Contact Us</p>
              <a href="tel:+911234567890" className="flex items-center gap-2.5 text-luxury-cream/50 hover:text-luxury-gold transition-colors mb-2 group">
                <FaPhoneAlt className="w-3 h-3 text-luxury-gold/40 group-hover:text-luxury-gold transition-colors" />
                <span className="text-xs font-sans">+91 12345 67890</span>
              </a>
              <a href="mailto:concierge@hotelmeghdoot.com" className="flex items-center gap-2.5 text-luxury-cream/50 hover:text-luxury-gold transition-colors mb-4 group">
                <FaEnvelope className="w-3 h-3 text-luxury-gold/40 group-hover:text-luxury-gold transition-colors" />
                <span className="text-xs font-sans">concierge@hotelmeghdoot.com</span>
              </a>
              <div className="flex items-center gap-3">
                <a href="#" className="w-8 h-8 rounded-xl border border-luxury-gold/15 flex items-center justify-center text-luxury-gold/40 hover:text-luxury-gold hover:border-luxury-gold/30 transition-all">
                  <FaInstagram className="w-3.5 h-3.5" />
                </a>
                <a href="#" className="w-8 h-8 rounded-xl border border-luxury-gold/15 flex items-center justify-center text-luxury-gold/40 hover:text-luxury-gold hover:border-luxury-gold/30 transition-all">
                  <FaFacebookF className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
