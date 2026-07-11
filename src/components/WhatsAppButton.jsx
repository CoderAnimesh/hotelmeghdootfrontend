import React from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  const phoneNumber = "+919876543210"; // Placeholder premium number
  const message = encodeURIComponent("Hello Hotel Meghdoot! I would like to inquire about booking a premium stay.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-medium tracking-wide shadow-2xl border border-emerald-400/30 group focus:outline-none"
      aria-label="Contact on WhatsApp"
    >
      <div className="relative">
        {/* Glow pulsing rings */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-75 animate-ping-slow group-hover:hidden" />
        <FaWhatsapp className="w-6 h-6 relative z-10" />
      </div>
      <span className="text-sm font-light tracking-widest hidden md:inline-block">INQUIRE NOW</span>
    </motion.a>
  );
};

export default WhatsAppButton;
