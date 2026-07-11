import React from "react";
import { motion } from "framer-motion";
import {
  FaWifi,
  FaUtensils,
  FaConciergeBell,
  FaParking,
  FaSnowflake,
  FaGlassCheers,
  FaMapMarkedAlt,
  FaKey,
} from "react-icons/fa";

const services = [
  {
    icon: <FaWifi className="w-8 h-8 text-luxury-gold" />,
    title: "High-Speed Wi-Fi",
    desc: "Seamless fiber internet connection across all suites and community lounges.",
  },
  {
    icon: <FaUtensils className="w-8 h-8 text-luxury-gold" />,
    title: "Gourmet Restaurant",
    desc: "Indulge in a curated menu of authentic cuisines, crafted by Michelin-inspired chefs.",
  },
  {
    icon: <FaConciergeBell className="w-8 h-8 text-luxury-gold" />,
    title: "24/7 Room Service",
    desc: "Prompt, warm royal in-room dining services delivered straight to your door.",
  },
  {
    icon: <FaParking className="w-8 h-8 text-luxury-gold" />,
    title: "Valet & Parking",
    desc: "Complimentary, fully secured private parking with elite valet services for all guests.",
  },
  {
    icon: <FaSnowflake className="w-8 h-8 text-luxury-gold" />,
    title: "Climatized AC Rooms",
    desc: "Advanced climate-control air conditioning in every single luxury room and hall.",
  },
  {
    icon: <FaGlassCheers className="w-8 h-8 text-luxury-gold" />,
    title: "Grand Banquet Hall",
    desc: "Host prestigious royal weddings, corporate events, and gala celebrations in absolute style.",
  },
  {
    icon: <FaMapMarkedAlt className="w-8 h-8 text-luxury-gold" />,
    title: "Travel Assistance",
    desc: "Curated local sightseeing guides, luxury chauffeur rentals, and absolute flight planning.",
  },
  {
    icon: <FaKey className="w-8 h-8 text-luxury-gold" />,
    title: "24/7 Elite Reception",
    desc: "A warm, helpful team ready to assist with standard queries and reservations at all hours.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const Services = () => {
  return (
    <section
      id="services"
      className="relative py-24 md:py-32 px-6 md:px-12 bg-gradient-to-b from-luxury-navy to-luxury-charcoal overflow-hidden"
    >
      {/* Background aesthetic blobs */}
      <div className="absolute top-1/4 left-0 w-80 h-80 rounded-full bg-luxury-gold/5 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-luxury-gold/3 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-sans font-semibold">
            ROYAL AMENITIES
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase mt-3 mb-6 tracking-wider">
            Timeless Luxury & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark font-serif italic font-normal tracking-[0.05em] gold-text-glow">
              Modern Comforts
            </span>
          </h2>
          <div className="w-24 h-[1px] bg-luxury-gold mx-auto mb-6" />
          <p className="font-sans font-light text-luxury-cream/70 text-sm md:text-base leading-relaxed">
            Every convenience at Hotel Meghdoot is carefully refined. We provide world-class amenities to ensure your stay with us is effortless and unforgettable.
          </p>
        </div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {services.map((svc, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col items-center text-center border border-luxury-gold/10 hover:border-luxury-gold/30 transition-all duration-300"
            >
              {/* Service Icon Wrapper */}
              <div className="mb-6 p-4 bg-luxury-navy/80 rounded-full border border-luxury-gold/20 flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110">
                {svc.icon}
              </div>
              <h3 className="text-xl font-bold font-serif text-luxury-cream mb-3">
                {svc.title}
              </h3>
              <p className="font-sans font-light text-luxury-cream/65 text-xs md:text-sm leading-relaxed">
                {svc.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
