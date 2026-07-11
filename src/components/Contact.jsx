import React from "react";
import { motion } from "framer-motion";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaConciergeBell } from "react-icons/fa";

const contactDetails = [
  {
    icon: <FaPhone />,
    label: "Reservations",
    value: "+91 98765 43210",
    sub: "Available 24/7",
  },
  {
    icon: <FaEnvelope />,
    label: "Email Concierge",
    value: "concierge@hotelmeghdoot.com",
    sub: "Reply within 2 hours",
  },
  {
    icon: <FaMapMarkerAlt />,
    label: "Location",
    value: "Hotel Meghdoot, Indore Road",
    sub: "Ujjain, Madhya Pradesh 456010",
  },
];

const Contact = () => {
  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 px-6 md:px-12 bg-luxury-charcoal"
    >
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] rounded-full bg-luxury-gold/4 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-sans font-semibold">
            GET IN TOUCH
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase mt-3 mb-6 tracking-wider">
            Contact{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark font-serif italic font-normal tracking-[0.05em] gold-text-glow">
              Our Concierge
            </span>
          </h2>
          <div className="w-24 h-[1px] bg-luxury-gold mx-auto mb-6" />
          <p className="font-sans font-light text-luxury-cream/70 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Our dedicated concierge team is available around the clock to assist with reservations, special requests, and any queries.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {contactDetails.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className="glass-panel p-8 rounded-2xl border border-luxury-gold/15 hover:border-luxury-gold/35 transition-all duration-300 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-luxury-gold/10 border border-luxury-gold/25 flex items-center justify-center mx-auto mb-4 text-luxury-gold text-lg">
                {item.icon}
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-sans mb-2">
                {item.label}
              </p>
              <p className="text-luxury-cream font-semibold font-sans text-sm mb-1">
                {item.value}
              </p>
              <p className="text-luxury-cream/40 font-sans text-xs">{item.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-panel p-8 md:p-12 rounded-3xl border border-luxury-gold/15"
        >
          <div className="flex items-center gap-3 mb-8">
            <FaConciergeBell className="text-luxury-gold text-xl" />
            <h3 className="font-serif text-2xl font-bold text-luxury-cream">
              Send a Message
            </h3>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for your message. Our concierge will respond within 2 hours.");
            }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 font-sans">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Your name"
                className="w-full bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold rounded-xl px-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 font-sans">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="w-full bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold rounded-xl px-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 font-sans">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                className="w-full bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold rounded-xl px-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 font-sans">
                Subject
              </label>
              <input
                type="text"
                placeholder="Reservation enquiry…"
                className="w-full bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold rounded-xl px-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 font-sans">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="How may we assist you?"
                className="w-full bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold rounded-xl px-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-charcoal font-sans font-bold text-sm uppercase tracking-[0.2em] shadow-lg hover:shadow-luxury-gold/20 transition-all focus:outline-none"
              >
                Send Message to Concierge
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
