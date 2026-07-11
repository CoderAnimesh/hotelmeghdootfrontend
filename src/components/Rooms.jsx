import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URL } from "../config/backend";
import {
  FaBed, FaConciergeBell,
  FaCheck, FaTimes, FaMapMarkerAlt, FaRulerCombined, FaExclamationTriangle
} from "react-icons/fa";
import { rooms, CANCELLATION_POLICY } from "../config/roomsData";


// ─── Room Detail Modal ────────────────────────────────────────────────────────
export const RoomDetailModal = ({ room, onClose, onBook }) => {
  const [activeImg, setActiveImg] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md overflow-y-auto py-6 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="relative bg-[#0d1117] border border-luxury-gold/25 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-luxury-charcoal/80 border border-luxury-gold/20 text-luxury-cream/60 hover:text-luxury-gold hover:border-luxury-gold/50 transition-all focus:outline-none"
        >
          <FaTimes className="w-3.5 h-3.5" />
        </button>

        {/* Hero Image Gallery */}
        <div className="relative aspect-[16/8] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImg}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              src={room.galleryImages[activeImg]}
              alt={room.name}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />

          {/* Thumbnails */}
          <div className="absolute bottom-4 right-5 flex gap-2 z-10">
            {room.galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-12 h-8 rounded overflow-hidden border-2 transition-all focus:outline-none ${activeImg === i ? "border-luxury-gold" : "border-white/20 opacity-60 hover:opacity-100"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Tag badge */}
          <div className="absolute top-5 left-5 z-10 px-3 py-1.5 bg-luxury-gold text-luxury-charcoal text-[10px] font-bold uppercase tracking-widest rounded-full">
            {room.tag}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-7 md:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-3xl font-bold text-luxury-cream gold-text-glow">{room.name}</h2>
              <p className="font-sans text-sm text-luxury-cream/60 mt-1 italic">{room.tagline}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="font-serif text-3xl font-extrabold text-luxury-gold-bright">{room.price}</span>
              <span className="text-xs font-sans text-luxury-cream/50 block"> / Night (incl. GST)</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: <FaRulerCombined />, label: "Size", value: room.size },
              { icon: <FaMapMarkerAlt />, label: "View", value: room.view },
              { icon: <FaBed />, label: "Bed", value: room.bedType },
              { icon: <FaConciergeBell />, label: "Max Guests", value: `${room.maxGuests} Guests` },
            ].map((stat, i) => (
              <div key={i} className="bg-luxury-navy/50 border border-luxury-gold/10 rounded-xl p-3 flex flex-col gap-1">
                <span className="text-luxury-gold text-sm">{stat.icon}</span>
                <span className="text-[9px] uppercase tracking-widest text-luxury-cream/40 font-sans">{stat.label}</span>
                <span className="text-xs font-semibold text-luxury-cream font-sans leading-tight">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-luxury-gold mb-4 font-sans">Suite Amenities</h3>
            <div className="flex flex-wrap gap-3">
              {room.facilities.map((fac, i) => (
                <div key={i} className="flex items-center gap-2 bg-luxury-navy/60 border border-luxury-cream/8 rounded-full px-4 py-2 text-xs font-sans text-luxury-cream/80">
                  <span className="text-luxury-gold">{fac.icon}</span>
                  {fac.label}
                </div>
              ))}
            </div>
          </div>

          {/* What's Included / Not Included */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-luxury-gold mb-4 font-sans">What's Included</h3>
              <ul className="flex flex-col gap-2.5">
                {room.inclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs font-sans font-light text-luxury-cream/80 leading-relaxed">
                    <FaCheck className="text-emerald-400 mt-0.5 flex-shrink-0 w-3 h-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-luxury-cream/40 mb-4 font-sans">Not Included</h3>
              <ul className="flex flex-col gap-2.5 mb-6">
                {room.notIncluded.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs font-sans font-light text-luxury-cream/50 leading-relaxed">
                    <FaTimes className="text-red-400/60 mt-0.5 flex-shrink-0 w-3 h-3" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Floor Info */}
              <div className="mt-4 p-3 bg-luxury-navy/40 border border-luxury-gold/10 rounded-xl text-xs font-sans">
                <span className="text-luxury-gold/60 uppercase tracking-widest text-[9px]">Location</span>
                <p className="text-luxury-cream/70 mt-0.5 font-light">{room.floor}</p>
              </div>
            </div>
          </div>

          {/* ── Cancellation Policy ── */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FaExclamationTriangle className="text-amber-400 w-4 h-4" />
              <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-luxury-cream font-sans">Cancellation Policy</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {CANCELLATION_POLICY.map((tier, i) => (
                <div key={i} className={`p-4 rounded-xl border ${tier.bg} flex items-start gap-3`}>
                  <span className="text-base leading-none mt-0.5">{tier.icon}</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-luxury-cream/50 font-sans">{tier.days}</p>
                    <p className={`font-bold text-sm font-sans mt-0.5 ${tier.color}`}>{tier.refund}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-luxury-cream/35 font-sans mt-3 italic leading-relaxed">
              * Cancellation time is calculated from 12:00 PM IST on the day of check-in. Refunds are credited within 5–7 business days to the original payment method.
            </p>
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBook(room.name)}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark text-luxury-charcoal font-serif font-bold text-base uppercase tracking-widest shadow-2xl hover:shadow-luxury-gold/30 transition-all focus:outline-none"
          >
            Reserve {room.name} — {room.price} / Night
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Rooms Section ────────────────────────────────────────────────────────────
const Rooms = ({ onSelectRoom }) => {
  const [detailRoom, setDetailRoom] = useState(null);
  const [liveInventory, setLiveInventory] = useState({}); // live room data from server

  // Fetch live room inventory on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/rooms`)
      .then(r => r.json())
      .then(d => { if (d.success && d.inventory) setLiveInventory(d.inventory); })
      .catch(() => {}); // silently fallback to static data
  }, []);

  const handleBookNow = (roomName) => {
    setDetailRoom(null);
    if (onSelectRoom) {
      onSelectRoom(roomName);
    } else {
      const element = document.querySelector("#contact");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ── Room Detail Modal ── */}
      <AnimatePresence>
        {detailRoom && (
          <RoomDetailModal
            room={detailRoom}
            onClose={() => setDetailRoom(null)}
            onBook={handleBookNow}
          />
        )}
      </AnimatePresence>

      <section id="rooms" className="relative py-24 md:py-32 px-6 md:px-12 bg-luxury-charcoal">
        <div className="max-w-7xl mx-auto">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
            <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold font-sans font-semibold">
              ACCOMMODATIONS
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase mt-3 mb-6 tracking-wider">
              Discover Our <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark font-serif italic font-normal tracking-[0.05em] gold-text-glow">
                Luxury Suites
              </span>
            </h2>
            <div className="w-24 h-[1px] bg-luxury-gold mx-auto mb-6" />
            <p className="font-sans font-light text-luxury-cream/70 text-sm md:text-base leading-relaxed">
              Crafted for ultimate relaxation, each room is a perfect fusion of heritage charm and modern comfort. Click <strong className="text-luxury-gold">Show Details</strong> to explore full amenities, inclusions, and our cancellation policy.
            </p>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {rooms.map((room, index) => {
              const liveData = liveInventory[room.name] || { availableCount: 10, pricePerNight: room.priceNum };
              const currentPrice = liveData.pricePerNight;
              const availableCount = liveData.availableCount;
              const isSoldOut = availableCount <= 0;
              return (
                <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.15, duration: 0.8 }}
                className="glass-panel group overflow-hidden rounded-2xl flex flex-col justify-between border border-luxury-gold/10 hover:border-luxury-gold/30 hover:shadow-[0_20px_40px_rgba(197,168,128,0.15)] transition-all duration-500"
              >
                {/* Card Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <div className="absolute inset-0 bg-luxury-charcoal/20 z-10 group-hover:bg-transparent transition-all duration-500" />
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Tag badge */}
                  <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-luxury-gold text-luxury-charcoal text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {room.tag}
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 z-20 px-4 py-2 rounded-lg bg-luxury-charcoal/80 backdrop-blur-md border border-luxury-gold/30 shadow-lg text-luxury-gold-bright font-serif text-lg font-bold">
                    ₹{currentPrice.toLocaleString("en-IN")} <span className="text-xs font-sans text-luxury-cream/70 font-light">/ Night</span>
                  </div>

                  {/* Sub-Badges */}
                  <div className="absolute bottom-4 left-4 z-20 flex gap-2">
                    <span className="px-3 py-1 rounded bg-luxury-navy/80 backdrop-blur-sm text-[10px] tracking-widest uppercase font-semibold text-luxury-cream/80 border border-luxury-cream/10">
                      {room.size}
                    </span>
                    <span className="px-3 py-1 rounded bg-luxury-navy/80 backdrop-blur-sm text-[10px] tracking-widest uppercase font-semibold text-luxury-cream/80 border border-luxury-cream/10">
                      {room.view}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] tracking-[0.2em] font-sans font-semibold text-luxury-gold uppercase">
                        {room.tag}
                      </span>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase font-sans ${
                        isSoldOut 
                          ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                          : availableCount <= 3 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {isSoldOut ? "Fully Booked" : `${availableCount} Rooms Left`}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold font-serif text-luxury-cream group-hover:text-luxury-gold-bright transition-colors duration-300">
                      {room.name}
                    </h3>
                    <p className="font-sans font-light text-luxury-cream/70 text-sm mt-3 leading-relaxed">
                      {room.description}
                    </p>
                  </div>

                  {/* Amenities Row */}
                  <div className="my-6 pt-6 border-t border-luxury-gold/10">
                    <div className="text-[10px] tracking-[0.2em] font-sans font-semibold text-luxury-gold uppercase mb-3">
                      Suite Amenities
                    </div>
                    <div className="flex flex-wrap gap-3 text-luxury-cream/80">
                      {room.facilities.slice(0, 4).map((fac, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-xs bg-luxury-navy/40 px-3 py-1.5 rounded-full border border-luxury-cream/5"
                          title={fac.label}
                        >
                          <span className="text-luxury-gold">{fac.icon}</span>
                          <span className="font-light tracking-wide font-sans">{fac.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bed & Max Guests Info */}
                  <div className="flex items-center gap-4 mb-6 text-xs font-sans text-luxury-cream/50">
                    <span className="flex items-center gap-1.5"><FaBed className="text-luxury-gold/60" /> {room.bedType.split("(")[0].trim()}</span>
                    <span className="h-3 w-px bg-luxury-cream/20" />
                    <span className="flex items-center gap-1.5"><FaConciergeBell className="text-luxury-gold/60" /> Up to {room.maxGuests} guests</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDetailRoom(room)}
                      className="flex-1 py-3.5 rounded-xl border border-luxury-gold/30 hover:border-luxury-gold/60 text-luxury-gold hover:text-luxury-gold-bright font-sans font-bold text-xs uppercase tracking-[0.15em] hover:bg-luxury-gold/5 transition-all duration-300 focus:outline-none"
                    >
                      Show Details
                    </button>
                    <motion.button
                      whileHover={{ scale: isSoldOut ? 1 : 1.02 }}
                      whileTap={{ scale: isSoldOut ? 1 : 0.98 }}
                      onClick={() => !isSoldOut && handleBookNow(room.name)}
                      disabled={isSoldOut}
                      className={`flex-1 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 focus:outline-none shadow-lg ${
                        isSoldOut 
                          ? "bg-luxury-navy text-luxury-cream/30 border border-white/10 cursor-not-allowed" 
                          : "border border-luxury-gold hover:border-luxury-gold text-luxury-charcoal bg-gradient-to-r from-luxury-gold to-luxury-gold-dark hover:from-luxury-gold-bright hover:to-luxury-gold hover:shadow-luxury-gold/20"
                      }`}
                    >
                      {isSoldOut ? "Sold Out" : "Reserve Suite"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
            })}
          </div>

          {/* Cancellation Policy Preview Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-16 p-6 md:p-8 rounded-2xl border border-luxury-gold/15 bg-luxury-navy/30 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-5">
              <FaExclamationTriangle className="text-amber-400 w-5 h-5 flex-shrink-0" />
              <h3 className="font-serif text-xl font-bold text-luxury-cream tracking-wide">Our Cancellation Policy</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CANCELLATION_POLICY.map((tier, i) => (
                <div key={i} className={`p-4 rounded-xl border ${tier.bg} flex flex-col gap-2`}>
                  <span className="text-xl leading-none">{tier.icon}</span>
                  <p className="text-[10px] uppercase tracking-wider text-luxury-cream/50 font-sans leading-relaxed">{tier.days}</p>
                  <p className={`font-bold text-sm font-sans ${tier.color}`}>{tier.refund}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-luxury-cream/35 font-sans mt-4 italic leading-relaxed">
              * Cancellation time is calculated from 12:00 PM IST on the day of check-in. Refunds credited to original payment method within 5–7 business days.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Rooms;
