import React from "react";
import { motion } from "framer-motion";
import { FaCrown, FaAward, FaUsers, FaClock } from "react-icons/fa";

const stats = [
  {
    icon: <FaCrown className="w-6 h-6 text-luxury-gold" />,
    value: "25+",
    label: "Luxury Rooms",
    desc: "Exquisite designs & premium amenities",
  },
  {
    icon: <FaAward className="w-6 h-6 text-luxury-gold" />,
    value: "10+",
    label: "Years of Service",
    desc: "Timeless traditions of Indian hospitality",
  },
  {
    icon: <FaUsers className="w-6 h-6 text-luxury-gold" />,
    value: "5000+",
    label: "Happy Guests",
    desc: "Memorable experiences curated daily",
  },
  {
    icon: <FaClock className="w-6 h-6 text-luxury-gold" />,
    value: "24/7",
    label: "Royal Service",
    desc: "Dedicated concierge on call always",
  },
];

const About = () => {
  return (
    <section
      id="about"
      className="relative py-24 md:py-32 px-6 md:px-12 bg-gradient-to-b from-luxury-charcoal to-luxury-navy overflow-hidden"
    >
      {/* Ambient background blur blobs */}
      <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-luxury-gold/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-luxury-gold/3 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left Side: Images Grid */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative flex justify-center lg:justify-start"
        >
          {/* Main Large Image */}
          <div className="relative w-[85%] md:w-[75%] aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-luxury-gold/20">
            <div className="absolute inset-0 bg-luxury-charcoal/15 z-10" />
            <img
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop"
              alt="Hotel Meghdoot Exterior View"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          {/* Overlapping Small Image */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute bottom-[-30px] right-[-10px] sm:right-[30px] lg:right-[-20px] w-[50%] aspect-square rounded-xl overflow-hidden shadow-2xl border-[3px] border-luxury-navy z-20"
          >
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop"
              alt="Hospitality Service at Hotel Meghdoot"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </motion.div>

          {/* Floating Gold Border Square */}
          <div className="absolute top-[-25px] left-[-10px] w-24 h-24 border-t-2 border-l-2 border-luxury-gold pointer-events-none z-0" />
        </motion.div>

        {/* Right Side: Text & Stats */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-sans font-semibold">
              OUR HERITAGE
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-wide uppercase mt-3 mb-6 leading-tight">
              Where Luxury Meets <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark font-serif italic font-normal tracking-[0.05em] gold-text-glow">
                Peaceful Hospitality
              </span>
            </h2>
            <p className="font-sans font-light text-luxury-cream/80 text-base md:text-lg leading-relaxed mb-6">
              Hotel Meghdoot is an elite sanctuary defined by comfort and absolute sophistication. Nestled amidst breathtaking architecture and premium ambience, we commit to serving our guests with the highest traditions of care.
            </p>
            <p className="font-sans font-light text-luxury-cream/60 text-sm md:text-base leading-relaxed mb-12">
              From our bespoke luxury accommodations equipped with state-of-the-art systems to our multi-cuisine dining experiences, every element is sculpted to deliver royal serenity. Let our professional staff surround you in tranquility.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="glass-panel glass-panel-hover p-6 rounded-xl flex items-start gap-4"
              >
                <div className="p-3 bg-luxury-gold/10 rounded-lg flex-shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <h4 className="text-2xl font-bold font-serif text-luxury-gold-bright">
                    {stat.value}
                  </h4>
                  <div className="text-sm font-semibold tracking-wide font-sans text-luxury-cream mt-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-luxury-cream/50 mt-1 font-sans font-light leading-relaxed">
                    {stat.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
