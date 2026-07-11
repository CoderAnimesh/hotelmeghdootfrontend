import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLock, FaEnvelope, FaKey, FaShieldAlt, FaSignOutAlt,
  FaHotel, FaCalendarAlt, FaChartBar, FaEdit, FaSave,
  FaTimes, FaCheck, FaSync, FaExclamationTriangle,
  FaArrowLeft, FaBed, FaMoneyBillWave, FaExpandAlt
} from "react-icons/fa";
import { BACKEND_URL } from "../config/backend";

const ROOM_IMAGES = {
  "Deluxe Room": "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=400&auto=format&fit=crop",
  "Super Deluxe Room": "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=400&auto=format&fit=crop",
  "Family Suite": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=400&auto=format&fit=crop",
  "Premium Royal Suite": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=400&auto=format&fit=crop",
};

// ─── Admin API helper ─────────────────────────────────────────────────────────
const adminFetch = async (endpoint, method = "GET", body = null) => {
  const token = sessionStorage.getItem("meghdoot_admin_jwt");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BACKEND_URL}${endpoint}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    Paid: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
    Cancelled: "bg-red-500/15 border-red-500/25 text-red-400",
    Extended: "bg-blue-500/15 border-blue-500/25 text-blue-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${styles[status] || styles.Paid}`}>
      {status}
    </span>
  );
};

// ─── Main AdminPortal Component ───────────────────────────────────────────────
const AdminPortal = () => {
  // Auth states
  const [adminState, setAdminState] = useState(() =>
    sessionStorage.getItem("meghdoot_admin_jwt") ? "dashboard" : "login"
  );
  const [loginForm, setLoginForm] = useState({ email: "admin@hotelmeghdoot.com", password: "" });
  const [otpValue, setOtpValue] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Dashboard states
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [inventory, setInventory] = useState({});
  const [summary, setSummary] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  // Room edit states
  const [editingRoom, setEditingRoom] = useState(null); // room type string
  const [roomEdits, setRoomEdits] = useState({});
  const [roomSaving, setRoomSaving] = useState(false);

  // Extend booking modal
  const [extendModal, setExtendModal] = useState(null); // booking obj
  const [extendDate, setExtendDate] = useState("");
  const [extendLoading, setExtendLoading] = useState(false);
  const [extendResult, setExtendResult] = useState("");

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    if (adminState !== "dashboard") return;
    setDataLoading(true);
    setDataError("");
    try {
      const [bookRes, roomRes, sumRes] = await Promise.all([
        adminFetch("/api/admin/bookings"),
        adminFetch("/api/admin/rooms"),
        adminFetch("/api/admin/payments/summary"),
      ]);
      setBookings(bookRes.bookings || []);
      setInventory(roomRes.inventory || {});
      setSummary(sumRes.summary || null);
    } catch (err) {
      setDataError(err.message);
      if (err.message.includes("Admin authentication failed")) {
        sessionStorage.removeItem("meghdoot_admin_jwt");
        setAdminState("login");
      }
    } finally {
      setDataLoading(false);
    }
  }, [adminState]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        fetchData();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchData]);

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      await adminFetch("/api/admin/login", "POST", loginForm);
      setAdminState("otp");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await adminFetch("/api/admin/verify-otp", "POST", {
        email: loginForm.email,
        otp: otpValue,
      });
      sessionStorage.setItem("meghdoot_admin_jwt", res.adminToken);
      setAdminState("dashboard");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("meghdoot_admin_jwt");
    setAdminState("login");
    setLoginForm({ email: "admin@hotelmeghdoot.com", password: "" });
    setOtpValue("");
    setBookings([]);
    setInventory({});
    setSummary(null);
  };

  // ── Room edit handlers ────────────────────────────────────────────────────
  const startEditRoom = (type) => {
    setEditingRoom(type);
    setRoomEdits({ totalCount: inventory[type].totalCount, pricePerNight: inventory[type].pricePerNight });
  };

  const saveRoom = async (type) => {
    setRoomSaving(true);
    try {
      await adminFetch(`/api/admin/rooms/${encodeURIComponent(type)}`, "PUT", roomEdits);
      await fetchData();
      setEditingRoom(null);
    } catch (err) {
      setDataError(err.message);
    } finally {
      setRoomSaving(false);
    }
  };

  // ── Extend booking ────────────────────────────────────────────────────────
  const handleExtend = async () => {
    if (!extendDate || !extendModal) return;
    setExtendLoading(true);
    setExtendResult("");
    try {
      const res = await adminFetch(`/api/admin/bookings/${extendModal.id}/extend`, "PATCH", { newCheckOut: extendDate });
      setExtendResult(res.message);
      await fetchData();
    } catch (err) {
      setExtendResult(`Error: ${err.message}`);
    } finally {
      setExtendLoading(false);
    }
  };

  // ── Admin cancel ──────────────────────────────────────────────────────────
  const handleAdminCancel = async (id) => {
    if (!window.confirm(`Cancel booking ${id}? This cannot be undone.`)) return;
    try {
      await adminFetch(`/api/admin/bookings/${id}/cancel`, "POST");
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Login screen
  // ─────────────────────────────────────────────────────────────────────────
  if (adminState === "login" || adminState === "otp") {
    return (
      <div className="min-h-screen bg-[#060810] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] rounded-full bg-luxury-gold/4 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#0d1117] border border-luxury-gold/20 rounded-3xl p-8 shadow-2xl relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/25 flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="text-luxury-gold w-7 h-7" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-luxury-cream tracking-wide">
              Admin Portal
            </h1>
            <p className="text-xs font-sans text-luxury-cream/40 mt-1 tracking-widest uppercase">
              Hotel Meghdoot · Secure Access
            </p>
          </div>

          <AnimatePresence mode="wait">
            {adminState === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 font-sans">Admin Email</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold/50 text-sm" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold rounded-xl pl-11 pr-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors"
                      placeholder="admin@hotelmeghdoot.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 font-sans">Admin Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold/50 text-sm" />
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold rounded-xl pl-11 pr-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors"
                      placeholder="Enter admin password"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-sans flex items-center gap-2">
                    <FaExclamationTriangle className="flex-shrink-0" /> {authError}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={authLoading}
                  className="py-4 rounded-xl bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark text-luxury-charcoal font-bold text-sm uppercase tracking-widest shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {authLoading ? <span className="animate-spin border-2 border-luxury-charcoal/30 border-t-luxury-charcoal rounded-full w-4 h-4" /> : <FaShieldAlt />}
                  {authLoading ? "Verifying..." : "Send OTP"}
                </motion.button>

                <p className="text-center text-[10px] text-luxury-cream/30 font-sans">
                  An OTP will be dispatched to the admin email. In dev mode, check server terminal.
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleOtpVerify}
                className="flex flex-col gap-5"
              >
                <div className="text-center p-4 rounded-xl bg-luxury-gold/5 border border-luxury-gold/15">
                  <FaEnvelope className="text-luxury-gold mx-auto mb-2" />
                  <p className="text-xs font-sans text-luxury-cream/60">OTP dispatched to</p>
                  <p className="text-sm font-bold text-luxury-gold">{loginForm.email}</p>
                  <p className="text-[10px] text-luxury-cream/30 mt-1">Check server terminal in dev mode or use bypass: 123456</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 font-sans">6-Digit OTP Code</label>
                  <div className="relative">
                    <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold/50 text-sm" />
                    <input
                      type="text"
                      value={otpValue}
                      onChange={e => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold rounded-xl pl-11 pr-4 py-3.5 text-lg font-mono text-luxury-cream text-center tracking-[0.5em] focus:outline-none transition-colors"
                      placeholder="— — — — — —"
                      maxLength={6}
                    />
                  </div>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-sans flex items-center gap-2">
                    <FaExclamationTriangle className="flex-shrink-0" /> {authError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setAdminState("login"); setAuthError(""); setOtpValue(""); }}
                    className="flex-1 py-3.5 rounded-xl border border-luxury-gold/20 text-luxury-cream/60 text-xs font-bold uppercase tracking-widest hover:border-luxury-gold/40 transition-colors focus:outline-none"
                  >
                    <FaArrowLeft className="inline mr-1" /> Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={authLoading || otpValue.length < 6}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark text-luxury-charcoal font-bold text-xs uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {authLoading ? <span className="animate-spin border-2 border-luxury-charcoal/30 border-t-luxury-charcoal rounded-full w-4 h-4" /> : <FaCheck />}
                    {authLoading ? "Verifying..." : "Unlock"}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Dashboard
  // ─────────────────────────────────────────────────────────────────────────


  return (
    <div className="min-h-screen bg-[#060810] text-luxury-cream font-sans">
      {/* ── Extend Booking Modal ── */}
      <AnimatePresence>
        {extendModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
            onClick={() => { setExtendModal(null); setExtendDate(""); setExtendResult(""); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0d1117] border border-luxury-gold/25 rounded-3xl p-8 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-serif text-xl font-bold mb-1">Extend Stay</h3>
              <p className="text-xs text-luxury-cream/50 mb-6">
                Booking <span className="text-luxury-gold font-bold">{extendModal.id}</span> — {extendModal.roomType}
                <br />Current check-out: <strong>{new Date(extendModal.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>
              </p>

              <div className="mb-4">
                <label className="text-[10px] uppercase tracking-widest text-luxury-cream/50 block mb-2">New Check-Out Date</label>
                <input
                  type="date"
                  min={new Date(new Date(extendModal.checkOut).getTime() + 86400000).toISOString().split("T")[0]}
                  value={extendDate}
                  onChange={e => setExtendDate(e.target.value)}
                  className="w-full bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold rounded-xl px-4 py-3 text-sm text-luxury-cream focus:outline-none"
                />
              </div>

              {extendDate && (
                <div className="p-4 rounded-xl bg-blue-500/8 border border-blue-500/20 mb-4 text-xs">
                  <p className="text-luxury-cream/60">Extra nights: <strong className="text-blue-400">
                    {Math.ceil((new Date(extendDate) - new Date(extendModal.checkOut)) / 86400000)} night(s)
                  </strong></p>
                  <p className="text-luxury-cream/60 mt-1">Extra charge: <strong className="text-luxury-gold">
                    ₹{(Math.ceil((new Date(extendDate) - new Date(extendModal.checkOut)) / 86400000) * (extendModal.roomPricePerNight || 0)).toLocaleString("en-IN")}
                  </strong></p>
                </div>
              )}

              {extendResult && (
                <div className={`p-3 rounded-xl border mb-4 text-xs ${extendResult.startsWith("Error") ? "bg-red-500/10 border-red-500/25 text-red-400" : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"}`}>
                  {extendResult}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setExtendModal(null); setExtendDate(""); setExtendResult(""); }} className="flex-1 py-3 rounded-xl border border-luxury-gold/20 text-luxury-cream/60 text-xs font-bold uppercase tracking-widest focus:outline-none">Cancel</button>
                <button
                  onClick={handleExtend}
                  disabled={!extendDate || extendLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none"
                >
                  {extendLoading ? <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-3 h-3" /> : <FaExpandAlt />}
                  {extendLoading ? "Extending..." : "Extend Stay"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Nav Bar ── */}
      <div className="border-b border-luxury-gold/10 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-luxury-gold w-5 h-5" />
              <div>
                <span className="font-serif text-base font-bold text-luxury-cream tracking-wide">ADMIN PORTAL</span>
                <span className="text-[9px] block text-luxury-gold/60 uppercase tracking-widest">Hotel Meghdoot · Management</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={dataLoading}
              className="p-2.5 rounded-xl border border-luxury-gold/20 text-luxury-cream/60 hover:text-luxury-gold hover:border-luxury-gold/40 transition-all focus:outline-none"
              title="Refresh data"
            >
              <FaSync className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
            </button>
            <a href="/" className="px-4 py-2 rounded-xl border border-luxury-gold/20 text-luxury-cream/60 hover:text-luxury-cream text-xs font-bold uppercase tracking-widest transition-all focus:outline-none flex items-center gap-1.5">
              <FaArrowLeft className="w-3 h-3" /> Hotel Site
            </a>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all focus:outline-none"
              title="Logout"
            >
              <FaSignOutAlt className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── KPI Cards ── */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Bookings", value: summary.totalBookings, icon: <FaCalendarAlt />, color: "text-luxury-gold" },
              { label: "Confirmed", value: summary.confirmedBookings, icon: <FaCheck />, color: "text-emerald-400" },
              { label: "Cancelled", value: summary.cancelledBookings, icon: <FaTimes />, color: "text-red-400" },
              { label: "Net Revenue", value: `₹${(summary.netRevenue || 0).toLocaleString("en-IN")}`, icon: <FaMoneyBillWave />, color: "text-luxury-gold-bright" },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#0d1117] border border-luxury-gold/10 rounded-2xl p-5"
              >
                <div className={`${kpi.color} mb-3`}>{kpi.icon}</div>
                <p className="text-[10px] uppercase tracking-widest text-luxury-cream/40">{kpi.label}</p>
                <p className={`font-serif text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6 border-b border-luxury-gold/10 pb-0">
          {[
            { id: "bookings", label: "All Bookings", icon: <FaCalendarAlt /> },
            { id: "rooms", label: "Room Manager", icon: <FaHotel /> },
            { id: "payments", label: "Revenue & Payments", icon: <FaChartBar /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest font-sans rounded-t-xl border-b-2 transition-all focus:outline-none ${
                activeTab === tab.id
                  ? "border-luxury-gold text-luxury-gold bg-luxury-gold/5"
                  : "border-transparent text-luxury-cream/50 hover:text-luxury-cream"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {dataError && (
          <div className="p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
            <FaExclamationTriangle /> {dataError}
          </div>
        )}

        {/* ════════════════════════════════════════════════
            TAB: ALL BOOKINGS
        ════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === "bookings" && (
            <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif text-xl font-bold">All Reservations</h2>
                <span className="text-xs text-luxury-cream/40 font-sans">Sorted by check-in date</span>
              </div>

              {dataLoading ? (
                <div className="flex items-center justify-center py-20 text-luxury-gold/40">
                  <FaSync className="animate-spin w-8 h-8" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-20 text-luxury-cream/30 font-sans">
                  <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>No bookings yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-luxury-gold/10">
                  <table className="w-full text-xs font-sans">
                    <thead>
                      <tr className="bg-[#0d1117] border-b border-luxury-gold/10 text-luxury-cream/40 uppercase tracking-widest">
                        {["Booking ID", "Guest", "Room Type", "Check-In", "Check-Out", "Nights", "Addons", "Room Rate", "Total Paid", "Status", "Payment Mode", "Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b, i) => (
                        <tr
                          key={b.id}
                          className={`border-b border-luxury-gold/5 transition-colors ${
                            b.status === "Cancelled" ? "bg-red-950/10 opacity-70" :
                            b.extendedBy ? "bg-blue-950/10" : i % 2 === 0 ? "bg-[#0a0f15]" : "bg-[#0d1117]"
                          } hover:bg-luxury-gold/5`}
                        >
                          <td className="px-4 py-3 font-mono text-luxury-gold font-bold whitespace-nowrap">{b.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="font-semibold text-luxury-cream">{b.guestName}</p>
                            <p className="text-luxury-cream/40 text-[10px]">{b.userEmail}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-luxury-cream/80">{b.roomType}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-luxury-cream/80">
                            {new Date(b.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-luxury-cream/80">
                              {new Date(b.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            {b.extendedBy && (
                              <span className="block text-[9px] text-blue-400 mt-0.5">+{b.extendedBy}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-luxury-cream/80">{b.nightsCount || "—"}</td>
                          <td className="px-4 py-3 max-w-[140px] truncate text-luxury-cream/50" title={b.addons?.join(", ")}>
                            {b.addons?.length ? b.addons.join(", ") : "None"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-luxury-cream/70">
                            {b.roomPricePerNight ? `₹${b.roomPricePerNight.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-bold text-luxury-gold-bright">
                            ₹{(b.totalPaid || 0).toLocaleString("en-IN")}
                            {b.refundAmount > 0 && (
                              <span className="block text-[9px] text-emerald-400 font-normal">
                                Refund: ₹{b.refundAmount.toLocaleString("en-IN")}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={b.status || "Paid"} /></td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${b.paymentMode === "live" ? "bg-emerald-500/15 text-emerald-400" : "bg-luxury-gold/10 text-luxury-gold/60"}`}>
                              {b.paymentMode === "live" ? "Razorpay" : "Simulated"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {b.status !== "Cancelled" && (
                                <>
                                  <button
                                    onClick={() => { setExtendModal(b); setExtendDate(""); setExtendResult(""); }}
                                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none whitespace-nowrap"
                                  >
                                    <FaExpandAlt className="inline mr-1" />Extend
                                  </button>
                                  <button
                                    onClick={() => handleAdminCancel(b.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-[10px] font-bold uppercase tracking-wider transition-all focus:outline-none"
                                  >
                                    <FaTimes className="inline mr-1" />Cancel
                                  </button>
                                </>
                              )}
                              {b.status === "Cancelled" && (
                                <span className="text-[10px] text-red-400/40 italic">Cancelled{b.cancelledBy === "admin" ? " (by admin)" : ""}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════
              TAB: ROOM MANAGER
          ════════════════════════════════════════════════ */}
          {activeTab === "rooms" && (
            <motion.div key="rooms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl font-bold">Room Inventory Manager</h2>
                <p className="text-xs text-luxury-cream/40">Changes reflect live on the booking page</p>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {Object.entries(inventory).map(([type, data]) => {
                  const isEditing = editingRoom === type;
                  const occupancy = data.totalCount > 0 ? ((data.totalCount - data.availableCount) / data.totalCount * 100).toFixed(0) : 0;

                  return (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0d1117] border border-luxury-gold/10 hover:border-luxury-gold/25 rounded-2xl overflow-hidden transition-all"
                    >
                      {/* Room Image */}
                      <div className="relative aspect-video overflow-hidden">
                        <img src={ROOM_IMAGES[type]} alt={type} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="font-serif text-sm font-bold text-luxury-cream leading-tight">{type}</h3>
                        </div>
                        {/* Availability indicator */}
                        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                          data.availableCount === 0
                            ? "bg-red-500/80 border-red-400 text-white"
                            : data.availableCount <= 2
                            ? "bg-amber-500/80 border-amber-400 text-white"
                            : "bg-emerald-500/80 border-emerald-400 text-white"
                        }`}>
                          {data.availableCount === 0 ? "Full" : `${data.availableCount} left`}
                        </div>
                      </div>

                      <div className="p-5">
                        {/* Occupancy bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-[9px] text-luxury-cream/40 uppercase tracking-widest mb-1.5">
                            <span>Occupancy</span>
                            <span>{occupancy}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-luxury-cream/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${occupancy}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-full rounded-full ${occupancy >= 80 ? "bg-red-400" : occupancy >= 50 ? "bg-amber-400" : "bg-emerald-400"}`}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-luxury-cream/50 mt-1.5 font-sans">
                            <span>{data.totalCount - data.availableCount} occupied</span>
                            <span>{data.availableCount} available</span>
                          </div>
                        </div>

                        {/* Editable fields */}
                        {isEditing ? (
                          <div className="flex flex-col gap-3">
                            <div>
                              <label className="text-[9px] uppercase tracking-widest text-luxury-cream/40 block mb-1">Total Room Count</label>
                              <div className="relative">
                                <FaBed className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-gold/40 text-xs" />
                                <input
                                  type="number"
                                  min={1}
                                  value={roomEdits.totalCount}
                                  onChange={e => setRoomEdits(p => ({ ...p, totalCount: parseInt(e.target.value) || 1 }))}
                                  className="w-full bg-luxury-navy/60 border border-luxury-gold/30 focus:border-luxury-gold rounded-lg pl-8 pr-3 py-2.5 text-sm text-luxury-cream focus:outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] uppercase tracking-widest text-luxury-cream/40 block mb-1">Price Per Night (₹)</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-gold/40 text-xs font-bold">₹</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={roomEdits.pricePerNight}
                                  onChange={e => setRoomEdits(p => ({ ...p, pricePerNight: parseInt(e.target.value) || 1 }))}
                                  className="w-full bg-luxury-navy/60 border border-luxury-gold/30 focus:border-luxury-gold rounded-lg pl-7 pr-3 py-2.5 text-sm text-luxury-cream focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingRoom(null)}
                                className="flex-1 py-2.5 rounded-lg border border-luxury-gold/20 text-luxury-cream/60 text-[10px] font-bold uppercase tracking-widest focus:outline-none"
                              >Cancel</button>
                              <button
                                onClick={() => saveRoom(type)}
                                disabled={roomSaving}
                                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark text-luxury-charcoal text-[10px] font-bold uppercase tracking-widest focus:outline-none disabled:opacity-50 flex items-center justify-center gap-1"
                              >
                                {roomSaving ? <span className="animate-spin border-2 border-luxury-charcoal/30 border-t-luxury-charcoal rounded-full w-3 h-3" /> : <FaSave />}
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-luxury-navy/40 rounded-xl p-3 text-center">
                                <p className="text-[9px] uppercase tracking-widest text-luxury-cream/40">Total Rooms</p>
                                <p className="font-serif text-lg font-bold text-luxury-cream mt-0.5">{data.totalCount}</p>
                              </div>
                              <div className="bg-luxury-navy/40 rounded-xl p-3 text-center">
                                <p className="text-[9px] uppercase tracking-widest text-luxury-cream/40">Price/Night</p>
                                <p className="font-serif text-lg font-bold text-luxury-gold mt-0.5">₹{data.pricePerNight.toLocaleString("en-IN")}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => startEditRoom(type)}
                              className="w-full py-3 rounded-xl border border-luxury-gold/20 hover:border-luxury-gold/50 hover:bg-luxury-gold/5 text-luxury-gold text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none flex items-center justify-center gap-2"
                            >
                              <FaEdit /> Edit Count & Price
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════
              TAB: REVENUE & PAYMENTS
          ════════════════════════════════════════════════ */}
          {activeTab === "payments" && (
            <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 className="font-serif text-xl font-bold mb-6">Revenue & Payment Summary</h2>

              {!summary ? (
                <div className="flex items-center justify-center py-20 text-luxury-gold/40">
                  <FaSync className="animate-spin w-8 h-8" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Revenue summary card */}
                  <div className="bg-[#0d1117] border border-luxury-gold/10 rounded-2xl p-6">
                    <h3 className="text-xs uppercase tracking-widest text-luxury-gold mb-5 font-semibold">Financial Overview</h3>
                    {[
                      { label: "Gross Revenue (Confirmed)", value: `₹${summary.totalRevenue.toLocaleString("en-IN")}`, color: "text-emerald-400" },
                      { label: "Cancelled Bookings Value", value: `₹${summary.cancelledRevenue.toLocaleString("en-IN")}`, color: "text-red-400" },
                      { label: "Total Refunds Issued", value: `₹${summary.totalRefunds.toLocaleString("en-IN")}`, color: "text-amber-400" },
                      { label: "Net Revenue", value: `₹${summary.netRevenue.toLocaleString("en-IN")}`, color: "text-luxury-gold-bright", large: true },
                    ].map((row, i) => (
                      <div key={i} className={`flex justify-between items-center ${row.large ? "pt-4 mt-4 border-t border-luxury-gold/15" : "mb-4"}`}>
                        <span className="text-xs text-luxury-cream/50">{row.label}</span>
                        <span className={`font-serif font-bold ${row.large ? "text-xl" : "text-base"} ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Revenue by room type */}
                  <div className="bg-[#0d1117] border border-luxury-gold/10 rounded-2xl p-6">
                    <h3 className="text-xs uppercase tracking-widest text-luxury-gold mb-5 font-semibold">Revenue by Room Type</h3>
                    {Object.entries(summary.revenueByRoom).length === 0 ? (
                      <p className="text-xs text-luxury-cream/30 italic py-8 text-center">No confirmed bookings yet</p>
                    ) : (
                      Object.entries(summary.revenueByRoom)
                        .sort((a, b) => b[1] - a[1])
                        .map(([type, rev], i) => {
                          const maxRev = Math.max(...Object.values(summary.revenueByRoom));
                          const pct = maxRev > 0 ? (rev / maxRev * 100).toFixed(0) : 0;
                          return (
                            <div key={type} className="mb-4">
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-luxury-cream/70">{type}</span>
                                <span className="font-bold text-luxury-gold">₹{rev.toLocaleString("en-IN")}</span>
                              </div>
                              <div className="w-full h-1.5 bg-luxury-cream/8 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ delay: i * 0.1, duration: 0.8 }}
                                  className="h-full rounded-full bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark"
                                />
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>

                  {/* Date-wise bookings */}
                  <div className="md:col-span-2 bg-[#0d1117] border border-luxury-gold/10 rounded-2xl p-6">
                    <h3 className="text-xs uppercase tracking-widest text-luxury-gold mb-5 font-semibold">Date-Wise Booking Summary</h3>
                    {Object.entries(summary.dateWise).length === 0 ? (
                      <p className="text-xs text-luxury-cream/30 italic py-4 text-center">No bookings recorded yet</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-luxury-gold/10 text-luxury-cream/40 uppercase tracking-widest">
                              {["Date", "Confirmed", "Cancelled", "Revenue"].map(h => (
                                <th key={h} className="pb-3 text-left font-semibold">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(summary.dateWise)
                              .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                              .map(([date, data]) => (
                                <tr key={date} className="border-b border-luxury-gold/5 hover:bg-luxury-gold/5 transition-colors">
                                  <td className="py-3 text-luxury-cream/70 font-semibold">{date}</td>
                                  <td className="py-3 text-emerald-400 font-bold">{data.confirmed}</td>
                                  <td className="py-3 text-red-400 font-bold">{data.cancelled}</td>
                                  <td className="py-3 font-bold text-luxury-gold">₹{(data.revenue || 0).toLocaleString("en-IN")}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Room inventory at a glance */}
                  <div className="md:col-span-2 bg-[#0d1117] border border-luxury-gold/10 rounded-2xl p-6">
                    <h3 className="text-xs uppercase tracking-widest text-luxury-gold mb-5 font-semibold">Current Room Inventory Snapshot</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(summary.inventory || inventory).map(([type, data]) => (
                        <div key={type} className="bg-luxury-navy/40 border border-luxury-gold/10 rounded-xl p-4">
                          <p className="text-[10px] uppercase tracking-widest text-luxury-cream/40 mb-2">{type}</p>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs text-luxury-cream/60">Available</p>
                              <p className={`text-lg font-serif font-bold ${data.availableCount === 0 ? "text-red-400" : "text-emerald-400"}`}>{data.availableCount}/{data.totalCount}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-luxury-cream/60">Price</p>
                              <p className="text-sm font-bold text-luxury-gold">₹{data.pricePerNight.toLocaleString("en-IN")}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPortal;
