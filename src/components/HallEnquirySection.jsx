import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt, FaUsers, FaEnvelope, FaUser, FaPhone,
  FaCheckCircle, FaExclamationTriangle, FaRing, FaArrowRight
} from "react-icons/fa";
import { BACKEND_URL } from "../config/backend";

const EVENT_TYPES = [
  "Royal Wedding Ceremony",
  "Sangeet & Mehendi Night",
  "Grand Reception",
  "Corporate Gala Dinner",
  "Anniversary / Private Social"
];

const HallEnquirySection = () => {
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    eventDate: "",
    eventType: EVENT_TYPES[0],
    guestCount: 200,
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.guestName || !form.guestEmail || !form.guestPhone || !form.eventDate || !form.guestCount) {
      setError("Please fill in all required stay fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/hall/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          guestCount: parseInt(form.guestCount, 10) || 100
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Inquiry submission failed.");

      setSuccess(true);
      setForm({
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        eventDate: "",
        eventType: EVENT_TYPES[0],
        guestCount: 200,
        message: ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="hall-enquiry" className="relative py-28 bg-[#04060b] overflow-hidden text-luxury-cream">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-luxury-gold/3 blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Royal Information */}
        <div className="lg:col-span-5 flex flex-col gap-6 text-left">
          <span className="text-xs uppercase tracking-[0.3em] font-sans font-bold text-luxury-gold flex items-center gap-2">
            <FaRing className="text-lg animate-pulse" /> The Durbar & Shahi Halls
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-extrabold tracking-widest text-luxury-cream leading-tight uppercase">
            Host Your Royal <br />
            <span className="text-luxury-gold-bright gold-text-glow">Heritage Event</span>
          </h2>
          <div className="w-16 h-[2px] bg-luxury-gold" />
          <p className="font-sans font-light text-sm text-luxury-cream/70 leading-relaxed max-w-md">
            Whether a grand Rajasthani wedding, a stately reception, or a corporate symposium, the halls at Hotel Meghdoot offer bespoke themes, royal catering, and absolute comfort for up to 2,000 guests.
          </p>
          <ul className="flex flex-col gap-3.5 mt-2 font-sans text-xs text-luxury-cream/60">
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold" /> Accommodates 50 to 2,000 Guests
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold" /> Royal Rajasthani Banquet Custom Menus
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold" /> Luxury Suites & Valet Heritage Parking
            </li>
          </ul>
        </div>

        {/* Right Column: Enquiry Form Card */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="glass-panel p-8 md:p-10 rounded-3xl border border-luxury-gold/15 relative bg-[#090e15]/80 backdrop-blur-md shadow-2xl flex flex-col gap-6"
          >
            <div className="text-center md:text-left border-b border-luxury-gold/10 pb-4">
              <h3 className="font-serif text-xl font-bold tracking-wide">Request a Proposal</h3>
              <p className="text-xs text-luxury-cream/50 mt-1">Submit your details and our Royal Concierge will contact you within 24 hours.</p>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center text-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl">
                    <FaCheckCircle />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-luxury-gold">Proposal Request Received</h4>
                  <p className="text-xs text-luxury-cream/60 max-w-sm leading-relaxed">
                    Thank you for your interest in Hotel Meghdoot. Our event managers have received your enquiry and will be in touch shortly to assist with your wedding or banquet plans.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 px-6 py-2.5 border border-luxury-gold/20 hover:border-luxury-gold text-luxury-gold font-sans text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Send Another Inquiry
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left text-xs"
                >
                  {/* Guest Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-luxury-cream/50">Full Name *</label>
                    <div className="relative">
                      <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-luxury-gold/40" />
                      <input
                        type="text"
                        name="guestName"
                        value={form.guestName}
                        onChange={handleChange}
                        placeholder="Lead guest name"
                        required
                        className="w-full bg-[#05080c] border border-luxury-gold/15 focus:border-luxury-gold rounded-xl pl-10 pr-4 py-3 text-luxury-cream placeholder-luxury-cream/25 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-luxury-cream/50">Email Address *</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-luxury-gold/40" />
                      <input
                        type="email"
                        name="guestEmail"
                        value={form.guestEmail}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        className="w-full bg-[#05080c] border border-luxury-gold/15 focus:border-luxury-gold rounded-xl pl-10 pr-4 py-3 text-luxury-cream placeholder-luxury-cream/25 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-luxury-cream/50">Mobile Number *</label>
                    <div className="relative">
                      <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-luxury-gold/40" />
                      <input
                        type="tel"
                        name="guestPhone"
                        value={form.guestPhone}
                        onChange={handleChange}
                        placeholder="+91 99999 88888"
                        required
                        className="w-full bg-[#05080c] border border-luxury-gold/15 focus:border-luxury-gold rounded-xl pl-10 pr-4 py-3 text-luxury-cream placeholder-luxury-cream/25 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Event Date */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-luxury-cream/50">Proposed Event Date *</label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-luxury-gold/40" />
                      <input
                        type="date"
                        name="eventDate"
                        min={new Date().toISOString().split("T")[0]}
                        value={form.eventDate}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#05080c] border border-luxury-gold/15 focus:border-luxury-gold rounded-xl pl-10 pr-4 py-3 text-luxury-cream placeholder-luxury-cream/25 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Event Type */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-luxury-cream/50">Event Celebration *</label>
                    <select
                      name="eventType"
                      value={form.eventType}
                      onChange={handleChange}
                      className="w-full bg-[#05080c] border border-luxury-gold/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-luxury-cream focus:outline-none transition-colors"
                    >
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Guest Count */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-luxury-cream/50">Estimated Attendance *</label>
                    <div className="relative">
                      <FaUsers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-luxury-gold/40" />
                      <input
                        type="number"
                        name="guestCount"
                        min={10}
                        max={3000}
                        value={form.guestCount}
                        onChange={handleChange}
                        placeholder="Estimated guest count"
                        required
                        className="w-full bg-[#05080c] border border-luxury-gold/15 focus:border-luxury-gold rounded-xl pl-10 pr-4 py-3 text-luxury-cream placeholder-luxury-cream/25 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Special Requests message */}
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-luxury-cream/50">Special Requests / Themes</label>
                    <textarea
                      name="message"
                      rows={3}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Share your wedding theme details, catering requirements, etc..."
                      className="w-full bg-[#05080c] border border-luxury-gold/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-luxury-cream placeholder-luxury-cream/25 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Error display */}
                  {error && (
                    <div className="md:col-span-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                      <FaExclamationTriangle />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="md:col-span-2 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark text-luxury-charcoal font-sans font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-luxury-gold/15 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="animate-spin border-2 border-luxury-charcoal/30 border-t-luxury-charcoal rounded-full w-4 h-4" />
                      ) : (
                        <FaArrowRight />
                      )}
                      {loading ? "Submitting Inquiry..." : "Submit Royal Proposals Request"}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HallEnquirySection;
