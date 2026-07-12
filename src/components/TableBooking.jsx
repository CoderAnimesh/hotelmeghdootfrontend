import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUtensils, FaArrowLeft, FaArrowRight, FaEnvelope, FaUser,
  FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaSync, FaChair, FaUsers, FaRupeeSign, FaShieldAlt
} from "react-icons/fa";
import { BACKEND_URL } from "../config/backend";

const STEPS = ["Identity", "Select Slot", "Review & Pay", "Confirmed"];

const getProgressIndex = (stepVal) => {
  if (stepVal === 0) return 0;
  if (stepVal === 2) return 1;
  if (stepVal === 3) return 2;
  if (stepVal === 4) return 3;
  return 0;
};

const apiFetch = async (endpoint, method = "GET", body = null, extraHeaders = {}) => {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

const OPENING_HOUR = 7;
const CLOSING_HOUR = 23;

function generateTimeOptions() {
  const opts = [];
  for (let h = OPENING_HOUR; h <= CLOSING_HOUR; h++) {
    opts.push(`${String(h).padStart(2, "0")}:00`);
  }
  return opts;
}

const TIME_OPTIONS = generateTimeOptions();

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(hhmm) {
  const [h, m] = hhmm.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function calcDuration(from, to) {
  return (timeToMinutes(to) - timeToMinutes(from)) / 60;
}

const TableBooking = ({ onBack }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 0: Identity
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Step 1: OTP
  const [otp, setOtp] = useState("");
  const [guestToken, setGuestToken] = useState(null);
  const [guestName, setGuestName] = useState("");

  // Step 2: Slot Selection
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [timeFrom, setTimeFrom] = useState("12:00");
  const [timeTo, setTimeTo] = useState("13:00");
  const [tableCount, setTableCount] = useState(1);
  const [personCount, setPersonCount] = useState(2);
  const [availability, setAvailability] = useState(null);
  const [checkingAvail, setCheckingAvail] = useState(false);

  // Step 3: Payment
  const [booking, setBooking] = useState(null);

  // Search bookings tab
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearchBookings = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResults(null);
    try {
      const data = await apiFetch("/api/table/my-bookings", "POST", { query: searchQuery.trim() });
      setSearchResults(data.bookings || []);
    } catch (err) {
      setError(err.message || "Failed to search reservations.");
    } finally {
      setSearchLoading(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  // Auto-check availability when slot changes
  const checkAvailability = useCallback(async () => {
    if (!date || !timeFrom || !timeTo) return;
    const durationHrs = calcDuration(timeFrom, timeTo);
    if (durationHrs < 2) {
      setError("Minimum table reservation duration is 2 hours.");
      setAvailability(null);
      return;
    }
    setCheckingAvail(true);
    setAvailability(null);
    try {
      const data = await apiFetch("/api/table/availability", "POST", { date, timeFrom, timeTo });
      setAvailability(data);
    } catch (err) {
      setAvailability(null);
    } finally {
      setCheckingAvail(false);
    }
  }, [date, timeFrom, timeTo]);

  useEffect(() => {
    if (step === 2) checkAvailability();
  }, [step, checkAvailability]);

  const durationHours = calcDuration(timeFrom, timeTo);
  const pricePerHr = availability?.pricePerTablePerHour || 100;
  const totalAmount = Math.max(0, durationHours * tableCount * pricePerHr);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError("Name and email are required."); return; }
    setError(""); setLoading(true);
    try {
      const data = await apiFetch("/api/table/send-otp", "POST", { name: name.trim(), email: email.trim() });
      setGuestToken(data.guestToken);
      setGuestName(data.guestName);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) { setError("Please enter the 6-digit OTP."); return; }
    setError(""); setLoading(true);
    try {
      const data = await apiFetch("/api/table/verify-otp", "POST", { email, otp });
      setGuestToken(data.guestToken);
      setGuestName(data.guestName);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToReview = () => {
    if (!availability || tableCount > availability.availableTables) {
      setError("Not enough tables available. Please adjust your selection.");
      return;
    }
    if (durationHours < 2) {
      setError("Minimum table reservation duration is 2 hours.");
      return;
    }
    setError("");
    setStep(3);
  };

  const handlePayment = async () => {
    setLoading(true); setError("");
    try {
      // Create Razorpay order
      const orderRes = await apiFetch("/api/table/create-order", "POST", {
        guestToken,
        amount: totalAmount,
        tableCount, date, timeFrom, timeTo
      });
      setLoading(true);
      if (orderRes.mode === "live" && orderRes.keyId) {
        // Real Razorpay checkout
        const options = {
          key: orderRes.keyId,
          amount: orderRes.order.amount,
          currency: "INR",
          name: "Hotel Meghdoot — Restaurant",
          description: `Table Reservation: ${date} ${timeFrom}–${timeTo}`,
          order_id: orderRes.order.id,
          handler: async (response) => {
            setLoading(true);
            try {
              const confirmRes = await apiFetch("/api/table/confirm", "POST", {
                guestToken,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                date, timeFrom, timeTo, tableCount, personCount,
                durationHours, totalPaid: totalAmount, mode: "live"
              });
              setBooking(confirmRes.booking);
              setStep(4);
            } catch (err) {
              setError(err.message);
            } finally {
              setLoading(false);
            }
          },
          theme: { color: "#C5A880" }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Simulated payment
        const confirmRes = await apiFetch("/api/table/confirm", "POST", {
          guestToken, date, timeFrom, timeTo, tableCount, personCount,
          durationHours, totalPaid: totalAmount, mode: "simulated"
        });
        setBooking(confirmRes.booking);
        setStep(4);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060810] text-luxury-cream font-sans relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] rounded-full bg-luxury-gold/4 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] rounded-full bg-amber-900/8 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative border-b border-luxury-gold/10 bg-[#0a0d14]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-luxury-gold/20 flex items-center justify-center text-luxury-cream/60 hover:text-luxury-gold hover:border-luxury-gold/40 transition-all focus:outline-none flex-shrink-0"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FaUtensils className="text-luxury-gold w-4 h-4" />
              <h1 className="font-serif text-lg font-bold tracking-wide">Restaurant Table Booking</h1>
            </div>
            <p className="text-[10px] text-luxury-gold/50 uppercase tracking-widest">Hotel Meghdoot · No Login Required</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-5 py-8">
        {/* Step Progress */}
        <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const activeIdx = getProgressIndex(step);
            return (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                    i < activeIdx ? "bg-luxury-gold border-luxury-gold text-luxury-charcoal" :
                    i === activeIdx ? "border-luxury-gold text-luxury-gold bg-luxury-gold/10" :
                    "border-luxury-cream/15 text-luxury-cream/30"
                  }`}>
                    {i < activeIdx ? "✓" : i + 1}
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider whitespace-nowrap ${i === activeIdx ? "text-luxury-gold" : "text-luxury-cream/30"}`}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 min-w-[20px] h-[1px] mx-1 mb-4 transition-all duration-500 ${i < activeIdx ? "bg-luxury-gold" : "bg-luxury-cream/10"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <FaExclamationTriangle className="flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ── STEP 0: Identity ── */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/25 flex items-center justify-center mx-auto mb-4">
                    <FaUtensils className="text-luxury-gold w-7 h-7" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold mb-2">Table Booking Portal</h2>
                  <p className="text-luxury-cream/50 text-sm">Secure a premium fine-dining experience or check your active bookings.</p>
                </div>

                {/* Sub-navigation tabs */}
                <div className="flex justify-center gap-6 mb-8 border-b border-luxury-gold/10 pb-3 text-xs uppercase tracking-widest font-bold font-sans">
                  <button
                    onClick={() => { setIsSearching(false); setError(""); }}
                    className={`pb-1.5 border-b-2 transition-all focus:outline-none ${!isSearching ? "border-luxury-gold text-luxury-gold" : "border-transparent text-luxury-cream/40 hover:text-luxury-cream/70"}`}
                  >
                    New Reservation
                  </button>
                  <button
                    onClick={() => { setIsSearching(true); setError(""); }}
                    className={`pb-1.5 border-b-2 transition-all focus:outline-none ${isSearching ? "border-luxury-gold text-luxury-gold" : "border-transparent text-luxury-cream/40 hover:text-luxury-cream/70"}`}
                  >
                    Check Reservations
                  </button>
                </div>

                {isSearching ? (
                  /* Lookup Reservations Panel */
                  <div className="flex flex-col gap-6 font-sans">
                    <form onSubmit={handleSearchBookings} className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50">Enter Guest Email or Full Name</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="e.g. guest@email.com or Animesh"
                          className="flex-1 bg-luxury-navy/40 border border-luxury-gold/15 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream placeholder-luxury-cream/25 focus:outline-none transition-colors"
                          required
                        />
                        <button
                          type="submit"
                          className="px-6 py-3.5 bg-luxury-gold text-luxury-charcoal font-sans font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all focus:outline-none shadow-lg"
                        >
                          Search
                        </button>
                      </div>
                    </form>

                    {searchLoading && (
                      <div className="flex items-center justify-center py-10 text-luxury-gold/40">
                        <FaSync className="animate-spin w-6 h-6" />
                      </div>
                    )}

                    {!searchLoading && searchResults && (
                      <div className="flex flex-col gap-4 mt-2">
                        <h4 className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">Search Results ({searchResults.length})</h4>
                        {searchResults.length === 0 ? (
                          <div className="text-center py-8 rounded-xl bg-luxury-navy/20 border border-luxury-gold/5 text-xs text-luxury-cream/40 italic">
                            No reservations found for "{searchQuery}".
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                            {searchResults.map(b => (
                              <div key={b.id} className="p-5 rounded-2xl bg-luxury-navy/30 border border-luxury-gold/15 text-xs flex flex-col gap-3 relative shadow-md">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-mono text-luxury-gold font-bold tracking-wider text-[11px]">{b.id}</span>
                                    <p className="font-serif font-bold text-luxury-cream text-[13px] mt-0.5">{b.guestName}</p>
                                    <p className="text-luxury-cream/40 text-[9px]">{b.guestEmail}</p>
                                  </div>
                                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${
                                    b.status === "Confirmed" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-red-500/10 border-red-500/25 text-red-400"
                                  }`}>
                                    {b.status}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-luxury-gold/10 pt-3 text-luxury-cream/70 font-sans font-light">
                                  <div><span className="text-luxury-cream/40">Date:</span> {b.date}</div>
                                  <div><span className="text-luxury-cream/40">Time:</span> {b.timeFrom} – {b.timeTo}</div>
                                  <div><span className="text-luxury-cream/40">Tables:</span> {b.tableCount} table(s)</div>
                                  <div><span className="text-luxury-cream/40">Guests:</span> {b.personCount} person(s)</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard New Reservation Form */
                  <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50">Full Name</label>
                      <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold/40 text-sm" />
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full bg-luxury-navy/40 border border-luxury-gold/15 focus:border-luxury-gold rounded-xl pl-11 pr-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/25 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50">Email Address</label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold/40 text-sm" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full bg-luxury-navy/40 border border-luxury-gold/15 focus:border-luxury-gold rounded-xl pl-11 pr-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/25 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Info card */}
                    <div className="p-4 rounded-xl bg-luxury-gold/5 border border-luxury-gold/10">
                      <p className="text-[11px] text-luxury-cream/50 leading-relaxed">
                        <span className="text-luxury-gold font-semibold">ℹ️ Pricing: </span>₹100 per table per hour · Minimum 2-hour reservation · Open 7:00 AM – 11:00 PM
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="py-4 rounded-xl bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark text-luxury-charcoal font-bold text-sm uppercase tracking-widest shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? <span className="animate-spin border-2 border-luxury-charcoal/30 border-t-luxury-charcoal rounded-full w-4 h-4" /> : <FaUtensils />}
                      {loading ? "Initializing..." : "Select Reservation Slot"}
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP 1: Verify OTP ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/25 flex items-center justify-center mx-auto mb-4">
                    <FaShieldAlt className="text-luxury-gold w-7 h-7" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold mb-2">Verify Your Email</h2>
                  <p className="text-luxury-cream/50 text-sm">Enter the 6-digit OTP sent to <strong className="text-luxury-gold">{email}</strong></p>
                </div>

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                  <div className="text-center p-4 rounded-xl bg-luxury-gold/5 border border-luxury-gold/10 mb-2">
                    <p className="text-xs text-luxury-cream/40">Check your email inbox. In dev mode, check server terminal. Bypass: <code className="text-luxury-gold">123456</code></p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50">6-Digit OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="— — — — — —"
                      maxLength={6}
                      className="w-full bg-luxury-navy/40 border border-luxury-gold/15 focus:border-luxury-gold rounded-xl px-4 py-4 text-2xl font-mono text-luxury-cream text-center tracking-[0.6em] placeholder-luxury-cream/20 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setStep(0); setOtp(""); setError(""); }}
                      className="flex-1 py-3.5 rounded-xl border border-luxury-gold/20 text-luxury-cream/60 text-xs font-bold uppercase tracking-widest hover:border-luxury-gold/40 transition-colors focus:outline-none"
                    >
                      <FaArrowLeft className="inline mr-1" /> Back
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark text-luxury-charcoal font-bold text-xs uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? <span className="animate-spin border-2 border-luxury-charcoal/30 border-t-luxury-charcoal rounded-full w-4 h-4" /> : "Verify OTP"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Select Slot ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="max-w-2xl mx-auto">
                <h2 className="font-serif text-2xl font-bold mb-1">Select Your Slot</h2>
                <p className="text-luxury-cream/50 text-sm mb-8">Welcome, <strong className="text-luxury-gold">{guestName || name}</strong> — choose your date, time and table count.</p>

                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  {/* Date */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 flex items-center gap-1.5">
                      <FaCalendarAlt className="text-luxury-gold" /> Date
                    </label>
                    <input
                      type="date"
                      min={minDate}
                      value={date}
                      onChange={e => { setDate(e.target.value); setAvailability(null); }}
                      className="bg-luxury-navy/40 border border-luxury-gold/15 focus:border-luxury-gold rounded-xl px-4 py-3.5 text-sm text-luxury-cream focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Person Count */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 flex items-center gap-1.5">
                      <FaUsers className="text-luxury-gold" /> Number of Guests
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={personCount}
                      onChange={e => {
                        const val = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10) || 1;
                        setPersonCount(val);
                        // Auto-calculate table count:
                        // 1-4 -> 1 table (capacity 4)
                        // 5-6 -> 1 table (capacity 6)
                        // > 6 -> Math.ceil(val / 6) tables
                        const reqTables = val <= 6 ? 1 : Math.ceil(val / 6);
                        setTableCount(reqTables);
                      }}
                      className="bg-luxury-navy/40 border border-luxury-gold/15 focus:border-luxury-gold rounded-xl px-4 py-3.5 text-sm text-luxury-cream focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Time From */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 flex items-center gap-1.5">
                      <FaClock className="text-luxury-gold" /> From Time
                    </label>
                    <select
                      value={timeFrom}
                      onChange={e => { setTimeFrom(e.target.value); setAvailability(null); }}
                      className="bg-luxury-navy/40 border border-luxury-gold/15 focus:border-luxury-gold rounded-xl px-4 py-3.5 text-sm text-luxury-cream focus:outline-none transition-colors"
                    >
                      {TIME_OPTIONS.filter(t => t < "23:00").map(t => (
                        <option key={t} value={t}>{formatTime(t)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Time To */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 flex items-center gap-1.5">
                      <FaClock className="text-luxury-gold" /> To Time
                    </label>
                    <select
                      value={timeTo}
                      onChange={e => { setTimeTo(e.target.value); setAvailability(null); }}
                      className="bg-luxury-navy/40 border border-luxury-gold/15 focus:border-luxury-gold rounded-xl px-4 py-3.5 text-sm text-luxury-cream focus:outline-none transition-colors"
                    >
                      {TIME_OPTIONS.filter(t => t > timeFrom).map(t => (
                        <option key={t} value={t}>{formatTime(t)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration Info */}
                {durationHours > 0 && (
                  <div className="flex items-center gap-2 mb-5 text-sm text-luxury-cream/60">
                    <FaClock className="text-luxury-gold" />
                    Duration: <strong className="text-luxury-gold">{Math.floor(durationHours)} hours</strong>
                  </div>
                )}

                {/* Table Count (Auto-allocated, read-only) */}
                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 flex items-center gap-1.5">
                    <FaChair className="text-luxury-gold" /> Auto-Allocated Tables
                  </label>
                  <div className="flex items-center gap-4 bg-luxury-navy/20 border border-luxury-gold/10 rounded-xl px-4 py-3.5 text-sm text-luxury-cream">
                    <span className="font-serif text-2xl font-bold text-luxury-gold">{tableCount}</span>
                    <span className="text-xs text-luxury-cream/70">
                      {personCount <= 4 ? "Single Table (fits up to 4 guests)" :
                       personCount <= 6 ? "Single Table (fits up to 6 guests)" :
                       `${tableCount} Tables side-by-side (fits up to ${tableCount * 6} guests)`}
                    </span>
                    <span className="text-[10px] text-luxury-cream/40 ml-auto font-sans">
                      {availability ? `(${availability.availableTables} available)` : ""}
                    </span>
                  </div>
                </div>

                {/* Availability Check */}
                <div className="mb-6">
                  {checkingAvail ? (
                    <div className="flex items-center gap-2 text-luxury-gold/60 text-sm py-3">
                      <FaSync className="animate-spin" /> Checking availability...
                    </div>
                  ) : availability ? (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border ${availability.availableTables > 0 ? "bg-emerald-500/8 border-emerald-500/20" : "bg-red-500/8 border-red-500/20"}`}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-luxury-cream/60">Total Tables</span>
                        <span className="font-bold">{availability.totalTables}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-luxury-cream/60">Already Booked</span>
                        <span className="font-bold text-amber-400">{availability.bookedTables}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-luxury-cream/60">Available</span>
                        <span className={`font-bold ${availability.availableTables > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {availability.availableTables}
                        </span>
                      </div>
                      {availability.availableTables === 0 && (
                        <p className="text-red-400 text-xs mt-2">No tables available for this time slot. Please choose a different time.</p>
                      )}
                    </motion.div>
                  ) : (
                    <button
                      onClick={checkAvailability}
                      className="flex items-center gap-2 text-sm text-luxury-gold/60 hover:text-luxury-gold transition-colors"
                    >
                      <FaSync /> Check availability
                    </button>
                  )}
                </div>

                {/* Price Preview */}
                {durationHours >= 2 && tableCount > 0 && (
                  <div className="p-5 rounded-2xl bg-luxury-navy/40 border border-luxury-gold/15 mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-luxury-cream/60">{tableCount} table{tableCount > 1 ? "s" : ""} × {durationHours}hr × ₹{pricePerHr}/hr</span>
                      <span className="font-bold text-luxury-gold">₹{totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-xs text-luxury-cream/40">
                      <span>Min reservation: 2 hours</span>
                      <span>No cancellation fee</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep(0); setError(""); }}
                    className="flex-1 py-3.5 rounded-xl border border-luxury-gold/20 text-luxury-cream/60 text-xs font-bold uppercase tracking-widest focus:outline-none hover:border-luxury-gold/40 transition-colors"
                  >
                    <FaArrowLeft className="inline mr-1" /> Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProceedToReview}
                    disabled={!availability || availability.availableTables === 0 || durationHours < 2}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark text-luxury-charcoal font-bold text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    Review & Pay <FaArrowRight />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Review & Pay ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/25 flex items-center justify-center mx-auto mb-4">
                    <FaRupeeSign className="text-luxury-gold w-7 h-7" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold mb-2">Review & Confirm</h2>
                  <p className="text-luxury-cream/50 text-sm">Check your reservation details before payment.</p>
                </div>

                <div className="bg-luxury-navy/30 border border-luxury-gold/15 rounded-2xl p-6 mb-6">
                  {[
                    { label: "Guest Name", value: guestName || name },
                    { label: "Email", value: email },
                    { label: "Date", value: new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                    { label: "Time Slot", value: `${formatTime(timeFrom)} – ${formatTime(timeTo)}` },
                    { label: "Duration", value: `${durationHours >= 1 ? `${Math.floor(durationHours)} hr${durationHours > 1 ? "s" : ""}` : ""}${(durationHours % 1) * 60 > 0 ? ` ${(durationHours % 1) * 60} min` : ""}` },
                    { label: "Tables", value: `${tableCount} table${tableCount > 1 ? "s" : ""}` },
                    { label: "Guests", value: `${personCount} person${personCount > 1 ? "s" : ""}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-2.5 border-b border-luxury-gold/8 last:border-0">
                      <span className="text-xs text-luxury-cream/50 uppercase tracking-wider">{label}</span>
                      <span className="text-sm font-medium text-luxury-cream">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 mt-2 border-t border-luxury-gold/20">
                    <span className="text-sm font-bold text-luxury-cream/70">Total Amount</span>
                    <span className="font-serif text-2xl font-bold text-luxury-gold">₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/15 mb-6 text-xs text-amber-300/70">
                  <p>⏰ <strong>Arrival Policy:</strong> Please arrive within your booked time window. If you arrive within your reservation period, you will be seated immediately. A 30-minute grace period applies.</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep(2); setError(""); }}
                    className="flex-1 py-3.5 rounded-xl border border-luxury-gold/20 text-luxury-cream/60 text-xs font-bold uppercase tracking-widest focus:outline-none hover:border-luxury-gold/40 transition-colors"
                  >
                    <FaArrowLeft className="inline mr-1" /> Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark text-luxury-charcoal font-bold text-xs uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? <span className="animate-spin border-2 border-luxury-charcoal/30 border-t-luxury-charcoal rounded-full w-4 h-4" /> : <FaRupeeSign />}
                    {loading ? "Processing..." : `Pay ₹${totalAmount.toLocaleString("en-IN")}`}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Confirmed ── */}
          {step === 4 && booking && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="max-w-lg mx-auto text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
                >
                  <FaCheckCircle className="text-emerald-400 w-9 h-9" />
                </motion.div>

                <h2 className="font-serif text-3xl font-bold mb-2 text-luxury-gold">Table Reserved!</h2>
                <p className="text-luxury-cream/50 text-sm mb-8">A confirmation has been sent to <strong className="text-luxury-gold">{email}</strong></p>

                <div className="bg-luxury-navy/30 border border-luxury-gold/15 rounded-2xl p-6 mb-6 text-left print-voucher">
                  <p className="text-[10px] uppercase tracking-widest text-luxury-gold/50 mb-4">Booking Details</p>
                  {[
                    { label: "Booking ID", value: booking.id, highlight: true },
                    { label: "Date", value: booking.date },
                    { label: "Time", value: `${formatTime(booking.timeFrom)} – ${formatTime(booking.timeTo)}` },
                    { label: "Tables", value: booking.tableCount },
                    { label: "Guests", value: booking.personCount },
                    { label: "Total Paid", value: `₹${booking.totalPaid?.toLocaleString("en-IN")}`, highlight: true },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex justify-between py-2.5 border-b border-luxury-gold/8 last:border-0">
                      <span className="text-xs text-luxury-cream/50">{label}</span>
                      <span className={`text-sm font-bold ${highlight ? "text-luxury-gold" : "text-luxury-cream"}`}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-luxury-gold/5 border border-luxury-gold/15 mb-8 text-xs text-luxury-cream/50">
                  <p>Please arrive within your reservation window. Our staff will be ready to welcome you. 30-minute grace period applies.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto print:hidden">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-4 rounded-xl bg-luxury-gold text-luxury-charcoal font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg focus:outline-none"
                  >
                    Print Receipt
                  </button>
                  <button
                    onClick={onBack}
                    className="flex-1 py-4 rounded-xl border border-luxury-gold/20 text-luxury-gold font-bold text-sm uppercase tracking-widest hover:bg-luxury-gold/10 transition-all focus:outline-none"
                  >
                    Back to Hotel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TableBooking;
