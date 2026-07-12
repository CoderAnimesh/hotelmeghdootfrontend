import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRing, FaUsers, FaCalendarAlt, FaPhone, FaEnvelope,
  FaCheckCircle, FaExclamationTriangle, FaStar, FaLeaf,
  FaMusic, FaUtensils, FaCamera, FaCar, FaSnowflake, FaLightbulb
} from "react-icons/fa";
import { BACKEND_URL } from "../config/backend";

const EVENT_TYPES = [
  "Wedding Ceremony",
  "Wedding Reception",
  "Engagement Party",
  "Mehndi Ceremony",
  "Sangeet Night",
  "Birthday Celebration",
  "Corporate Event",
  "Anniversary Party",
  "Baby Shower",
  "Other"
];

const HALL_FEATURES = [
  { icon: <FaUsers />, title: "Capacity", desc: "Up to 500 guests in banquet style, 300 in theatre arrangement" },
  { icon: <FaSnowflake />, title: "Climate Control", desc: "Full AC with individual zone temperature control" },
  { icon: <FaMusic />, title: "Premium Sound", desc: "Surround sound system with DJ booth & live band setup" },
  { icon: <FaLightbulb />, title: "Elegant Lighting", desc: "Customizable LED & chandelier lighting with décor themes" },
  { icon: <FaUtensils />, title: "In-house Catering", desc: "Royal buffet spreads — veg, non-veg & Jain options" },
  { icon: <FaCamera />, title: "Photo Spots", desc: "Dedicated bridal photo corners & garden backdrops" },
  { icon: <FaCar />, title: "Parking", desc: "Dedicated secured parking for 150+ vehicles" },
  { icon: <FaLeaf />, title: "Décor Services", desc: "In-house decoration team for floral & theme arrangements" },
];

const apiFetch = async (endpoint, method, body) => {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

const MarriageHall = ({ onBack }) => {
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    eventDate: "",
    eventType: "",
    guestCount: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.guestName || !form.guestEmail || !form.guestPhone || !form.eventDate || !form.eventType || !form.guestCount) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(""); setLoading(true);
    try {
      await apiFetch("/api/hall/inquiry", "POST", form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060810] text-luxury-cream font-sans relative overflow-hidden">
      {/* Background ambient */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[60vw] h-[40vw] rounded-full bg-purple-900/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[40vw] h-[40vw] rounded-full bg-luxury-gold/4 blur-[100px]" />
      </div>

      {/* Hero Section */}
      <div className="relative h-[55vh] min-h-[360px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop"
          alt="Grand Marriage Hall"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#060810]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060810]/30 to-transparent" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-5 z-10 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all text-sm font-sans"
        >
          ← Back
        </button>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-[1px] w-12 bg-luxury-gold/50" />
              <FaRing className="text-luxury-gold w-5 h-5" />
              <div className="h-[1px] w-12 bg-luxury-gold/50" />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-wide mb-4">
              Grand <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark">Marriage Hall</span>
            </h1>
            <p className="text-luxury-cream/70 text-sm md:text-base max-w-xl font-sans font-light leading-relaxed">
              Where your most precious moments become timeless memories. Our royal banquet hall sets the perfect stage for your celebration.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              {[1,2,3,4,5].map(i => (
                <FaStar key={i} className="text-luxury-gold w-3.5 h-3.5" />
              ))}
              <span className="text-luxury-cream/50 text-xs ml-2 font-sans">5.0 · 200+ Events Hosted</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-5 py-12">
        {/* Hall Capacity Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-4 mb-16"
        >
          {[
            { value: "500+", label: "Guest Capacity" },
            { value: "10,000+", label: "Sq. Ft Area" },
            { value: "200+", label: "Events Hosted" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center p-5 rounded-2xl bg-luxury-navy/30 border border-luxury-gold/10 hover:border-luxury-gold/25 transition-all">
              <p className="font-serif text-3xl md:text-4xl font-bold text-luxury-gold">{value}</p>
              <p className="text-[10px] uppercase tracking-widest text-luxury-cream/40 mt-1 font-sans">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-sans">World Class Facilities</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3">
              Everything For Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark italic font-normal">Perfect Day</span>
            </h2>
            <div className="w-16 h-[1px] bg-luxury-gold mx-auto mt-4" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HALL_FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl bg-[#0d1117] border border-luxury-gold/8 hover:border-luxury-gold/25 hover:bg-luxury-gold/3 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold mb-4 group-hover:bg-luxury-gold/15 transition-all">
                  {feat.icon}
                </div>
                <h3 className="font-serif font-bold text-sm text-luxury-cream mb-1.5">{feat.title}</h3>
                <p className="text-[11px] text-luxury-cream/45 font-sans leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Gallery Row */}
        <div className="grid grid-cols-3 gap-3 mb-16 rounded-2xl overflow-hidden">
          {[
            "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=600&auto=format&fit=crop",
          ].map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="aspect-[4/3] overflow-hidden rounded-xl"
            >
              <img
                src={src}
                alt={`Hall view ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
          ))}
        </div>

        {/* Inquiry Form */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-sans">Book Your Dream Event</span>
            <h2 className="font-serif text-3xl font-bold mt-3 mb-5">
              Get A <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark">Custom Quote</span>
            </h2>
            <p className="text-luxury-cream/60 text-sm leading-relaxed mb-6">
              Every celebration is unique. Fill out the inquiry form and our dedicated events team will reach out within 24 hours with a personalized proposal, site tour, and transparent pricing.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { icon: <FaPhone />, label: "Call Us", value: "+91 12345 67890" },
                { icon: <FaEnvelope />, label: "Email", value: "events@hotelmeghdoot.com" },
                { icon: <FaCalendarAlt />, label: "Site Visits", value: "Mon–Sat, 10 AM – 6 PM" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 p-4 rounded-xl bg-luxury-navy/30 border border-luxury-gold/8">
                  <div className="w-9 h-9 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-luxury-cream/40">{label}</p>
                    <p className="text-sm font-medium text-luxury-cream">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="w-20 h-20 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-6"
                >
                  <FaCheckCircle className="text-emerald-400 w-9 h-9" />
                </motion.div>
                <h3 className="font-serif text-2xl font-bold mb-3 text-luxury-gold">Inquiry Submitted!</h3>
                <p className="text-luxury-cream/50 text-sm leading-relaxed max-w-xs mx-auto">
                  Our events team will contact you at <strong className="text-luxury-gold">{form.guestEmail}</strong> within 24 hours.
                </p>
                <button
                  onClick={onBack}
                  className="mt-8 px-8 py-3.5 rounded-xl border border-luxury-gold/20 text-luxury-gold font-bold text-sm uppercase tracking-widest hover:bg-luxury-gold/10 transition-all"
                >
                  Back to Hotel
                </button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-[#0d1117] border border-luxury-gold/12 rounded-3xl p-7 flex flex-col gap-4"
              >
                <h3 className="font-serif text-xl font-bold mb-1">Send Inquiry</h3>
                <p className="text-xs text-luxury-cream/40 mb-1">No payment required — we'll contact you with a quote.</p>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                    >
                      <FaExclamationTriangle /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Name + Phone row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-luxury-cream/40">Full Name *</label>
                    <input
                      name="guestName"
                      value={form.guestName}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="bg-luxury-navy/40 border border-luxury-gold/12 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream placeholder-luxury-cream/20 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-luxury-cream/40">Phone *</label>
                    <input
                      name="guestPhone"
                      value={form.guestPhone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="bg-luxury-navy/40 border border-luxury-gold/12 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream placeholder-luxury-cream/20 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-luxury-cream/40">Email Address *</label>
                  <input
                    name="guestEmail"
                    type="email"
                    value={form.guestEmail}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="bg-luxury-navy/40 border border-luxury-gold/12 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream placeholder-luxury-cream/20 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-luxury-cream/40">Event Date *</label>
                    <input
                      name="eventDate"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={form.eventDate}
                      onChange={handleChange}
                      className="bg-luxury-navy/40 border border-luxury-gold/12 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-luxury-cream/40">Expected Guests *</label>
                    <input
                      name="guestCount"
                      type="number"
                      min={10}
                      max={500}
                      value={form.guestCount}
                      onChange={handleChange}
                      placeholder="e.g. 200"
                      className="bg-luxury-navy/40 border border-luxury-gold/12 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream placeholder-luxury-cream/20 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-luxury-cream/40">Event Type *</label>
                  <select
                    name="eventType"
                    value={form.eventType}
                    onChange={handleChange}
                    className="bg-luxury-navy/40 border border-luxury-gold/12 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select event type</option>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-luxury-cream/40">Additional Notes</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Any special requirements, themes, or questions..."
                    rows={3}
                    className="bg-luxury-navy/40 border border-luxury-gold/12 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream placeholder-luxury-cream/20 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-purple-900/20 hover:shadow-purple-900/30 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> : <FaRing />}
                  {loading ? "Submitting..." : "Submit Inquiry"}
                </motion.button>

                <p className="text-[10px] text-luxury-cream/30 text-center font-sans">
                  Our events team will reach out within 24 hours · No commitment required
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MarriageHall;
