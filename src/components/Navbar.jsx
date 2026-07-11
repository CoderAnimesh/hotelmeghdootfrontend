import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaConciergeBell } from "react-icons/fa";

const menuItems = [
  { name: "Home", href: "#home" },
  { name: "Rooms", href: "#rooms" },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Gallery", href: "#gallery" },
  { name: "Reviews", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

const Navbar = ({ onBookNow }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const offset = 80; // Navbar offset height
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
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
          isScrolled
            ? "bg-luxury-navy/80 backdrop-blur-md py-4 border-b border-luxury-gold/20 shadow-xl"
            : "bg-gradient-to-b from-luxury-charcoal/80 to-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo Brand */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, "#home")}
            className="flex items-center gap-3 group"
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              className="text-luxury-gold transition-colors duration-300"
            >
              <FaConciergeBell className="w-6 h-6 md:w-7 md:h-7" />
            </motion.div>
            <span className="font-serif text-lg md:text-2xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark group-hover:gold-text-glow transition-all duration-300">
              MEGHDOOT
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8 font-sans font-light text-sm tracking-[0.15em] text-luxury-cream">
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

            {/* Direct Booking CTA */}
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                if (onBookNow) onBookNow();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-4 px-6 py-2.5 rounded-full border border-luxury-gold text-luxury-gold font-sans font-medium text-xs uppercase tracking-[0.2em] hover:bg-luxury-gold hover:text-luxury-charcoal transition-all duration-300 shadow-md hover:shadow-luxury-gold/20 focus:outline-none cursor-pointer"
            >
              Book Now
            </motion.button>
          </div>

          {/* Hamburger Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-luxury-cream hover:text-luxury-gold transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="fixed inset-0 z-30 lg:hidden flex flex-col justify-center items-center bg-luxury-charcoal/98 min-h-screen px-6"
          >
            <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full bg-luxury-gold/5 blur-[100px]" />

            <div className="flex flex-col gap-6 items-center text-center">
              {menuItems.map((item, idx) => (
                <motion.a
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className="font-serif text-2xl font-medium tracking-[0.2em] text-luxury-cream hover:text-luxury-gold transition-colors py-2 block"
                >
                  {item.name}
                </motion.a>
              ))}

              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: menuItems.length * 0.05 }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  if (onBookNow) onBookNow();
                }}
                className="mt-6 px-10 py-4 rounded-full bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-charcoal font-sans font-bold text-sm uppercase tracking-[0.25em] shadow-xl hover:shadow-luxury-gold/30 hover:scale-105 transition-all focus:outline-none cursor-pointer"
              >
                Book Your Stay
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
