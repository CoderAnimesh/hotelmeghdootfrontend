import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { getClientFingerprint, requestBackend, BACKEND_URL } from "../config/backend";
import { RoomDetailModal } from "./Rooms.jsx";
import { rooms } from "../config/roomsData";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaCalendarAlt,
  FaConciergeBell,
  FaShieldAlt,
  FaKey,
  FaCheck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPrint,
  FaArrowLeft,
  FaHistory,
  FaSignOutAlt,
  FaCreditCard,
  FaUniversity,
  FaMobileAlt,
  FaQrcode,
  FaTimes
} from "react-icons/fa";

// Numeric pricing map matching the main suite cards
const SUITE_PRICES = {
  "Deluxe Room": 4999,
  "Super Deluxe Room": 6999,
  "Family Suite": 9999,
  "Premium Royal Suite": 14999
};

const SUITE_IMAGES = {
  "Deluxe Room": "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop",
  "Super Deluxe Room": "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=800&auto=format&fit=crop",
  "Family Suite": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop",
  "Premium Royal Suite": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop"
};

const ADDONS = [
  { id: "spa", name: "Royal Spa Couples Treatment", price: 2499, description: "90-minute holistic therapy with organic essential oils" },
  { id: "pickup", name: "Luxury Airport Chauffeur (One-Way)", price: 3499, description: "Airport pickup in a premium Mercedes-Benz luxury sedan" },
  { id: "dinner", name: "Michelin-starred Dining Voucher", price: 4999, description: "5-course curated heritage Rajasthani thali for two" },
  { id: "breakfast", name: "Private Floating Pool Breakfast", price: 1999, description: "Gourmet butler-served breakfast in your suite pool" },
  { id: "tour", name: "Private Udaipur Heritage Tour", price: 5999, description: "Personal historian-guided boat tour of Lake Pichola & City Palace" }
];

// Top-level secure generators outside of the render body to comply with react compiler purity rules
const generateOtpCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateReceiptId = (email) => `rcpt_${email.replace(/[^a-zA-Z0-9]/g, "")}_${Date.now()}`;
const generateSimPaymentId = () => `pay_SIM_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

const BookingPortal = ({ selectedRoom, setView, onBack }) => {
  // Navigation states: 'signup' | 'otp' | 'login' | 'dashboard' | 'voucher' | 'history'
  const [portalState, setPortalState] = useState("signup");
  
  // Auth Form details
  const [signupData, setSignupData] = useState({ name: "", email: "", phone: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [otpValue, setOtpValue] = useState("");
  const [errors, setErrors] = useState({});
  const [simulatedEmailNotify, setSimulatedEmailNotify] = useState(null);
  
  // Logged in User state
  const [currentUser, setCurrentUser] = useState(null);

  // Booking config states
  const [bookingConfig, setBookingConfig] = useState({
    checkIn: "",
    checkOut: "",
    roomType: selectedRoom || "Deluxe Room",
    guests: 2,
    selectedAddons: [],
    specialRequests: ""
  });

  // Active bookings list
  const [bookingsHistory, setBookingsHistory] = useState([]);
  
  // Checkout & Payment panel states
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'upi' | 'netbanking'
  const [paymentError, setPaymentError] = useState("");
  const [currentBookingVoucher, setCurrentBookingVoucher] = useState(null);

  // 3-Token Route Protection and Secure History states
  const [historyUnlocked, setHistoryUnlocked] = useState(false);
  const [historyOtp, setHistoryOtp] = useState("");
  const [historyRequesting, setHistoryRequesting] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [checkoutOtp, setCheckoutOtp] = useState("");

  const [cancelModal, setCancelModal] = useState(null); // { booking } or null
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelResult, setCancelResult] = useState(null); // { refundAmount, refundLabel, message }

  const [liveInventory, setLiveInventory] = useState({});
  const [detailRoom, setDetailRoom] = useState(null);
  const [razorpayPaymentDetails, setRazorpayPaymentDetails] = useState(null);

  // ── Refund calculation helper ──────────────────────────────────────────────
  const getRefundInfo = (checkInDate, totalPaid) => {
    const daysUntil = Math.ceil((new Date(checkInDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil >= 7)  return { pct: 100, label: "Full Refund",    color: "text-emerald-400", amount: totalPaid };
    if (daysUntil >= 3)  return { pct: 50,  label: "50% Partial Refund", color: "text-amber-400",  amount: Math.floor(totalPaid * 0.5) };
    if (daysUntil >= 1)  return { pct: 25,  label: "25% Partial Refund", color: "text-orange-400", amount: Math.floor(totalPaid * 0.25) };
    return                      { pct: 0,   label: "No Refund",       color: "text-red-400",     amount: 0 };
  };

  // ── Cancel booking handler ──────────────────────────────────────────────────
  const handleCancelBooking = async () => {
    if (!cancelModal) return;
    setCancelLoading(true);
    try {
      const response = await requestBackend("/api/bookings/cancel", "POST", {
        bookingId: cancelModal.booking.id
      });
      if (response.success) {
        // Update local state to mark booking as cancelled
        setBookingsHistory(prev =>
          prev.map(b =>
            b.id === cancelModal.booking.id
              ? { ...b, status: "Cancelled", refundAmount: response.refundAmount, refundLabel: response.refundLabel }
              : b
          )
        );
        setCancelResult({
          refundAmount: response.refundAmount,
          refundLabel: response.refundLabel,
          message: response.message
        });
      }
    } catch (err) {
      alert(err.message || "Failed to cancel booking. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  // Sync selectedRoom if changed at root
  useEffect(() => {
    if (selectedRoom) {
      setTimeout(() => {
        setBookingConfig(prev => ({ ...prev, roomType: selectedRoom }));
      }, 0);
    }
  }, [selectedRoom]);

  // Load existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("meghdoot_active_user");
    const savedToken = localStorage.getItem("meghdoot_jwt");
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setTimeout(() => {
        setCurrentUser(parsedUser);
        setPortalState("dashboard");
        setBookingsHistory([]);
      }, 0);
    }
  }, []);

  // Load live room inventory and poll every 10 seconds
  useEffect(() => {
    const fetchInventory = () => {
      fetch(`${BACKEND_URL}/api/rooms`)
        .then(r => r.json())
        .then(d => {
          if (d.success && d.inventory) {
            setLiveInventory(d.inventory);
          }
        })
        .catch(() => {});
    };
    fetchInventory();
    const interval = setInterval(fetchInventory, 10000);
    return () => clearInterval(interval);
  }, []);

  const getRoomPrice = (roomType) => {
    if (liveInventory[roomType]) {
      return liveInventory[roomType].pricePerNight;
    }
    return SUITE_PRICES[roomType] || 4999;
  };

  const getRoomAvailability = (roomType) => {
    if (liveInventory[roomType]) {
      return liveInventory[roomType].availableCount;
    }
    return 10;
  };

  // Form input Handlers
  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleBookingConfigChange = (e) => {
    const { name, value } = e.target;
    setBookingConfig(prev => ({ ...prev, [name]: value }));
  };

  const toggleAddon = (addonId) => {
    setBookingConfig(prev => {
      const alreadySelected = prev.selectedAddons.includes(addonId);
      const updated = alreadySelected
        ? prev.selectedAddons.filter(id => id !== addonId)
        : [...prev.selectedAddons, addonId];
      return { ...prev, selectedAddons: updated };
    });
  };

  // Auth Operations
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!signupData.name.trim()) newErrors.name = "Full name is required";
    if (!signupData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = "Specify a valid email address";
    }
    if (!signupData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(signupData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    if (!signupData.password || signupData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const fingerprint = getClientFingerprint();
      const response = await requestBackend("/api/auth/register", "POST", {
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.password,
        clientFingerprint: fingerprint
      });

      if (response.success) {
        setPortalState("otp");
        setErrors({});
        // Setup visual simulated email mailbox tray
        setSimulatedEmailNotify({
          subject: "Verify Your Hotel Meghdoot Registration",
          otp: "CHECK SERVER CONSOLE",
          email: signupData.email
        });
      }
    } catch (err) {
      setErrors({ email: err.message || "Failed to register account via backend." });
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otpValue) {
      setErrors({ otp: "Please enter verification code." });
      return;
    }

    try {
      const response = await requestBackend("/api/auth/verify-otp", "POST", {
        email: signupData.email,
        otp: otpValue
      });

      if (response.success && response.token) {
        localStorage.setItem("meghdoot_jwt", response.token);
        localStorage.setItem("meghdoot_active_user", JSON.stringify(response.user));
        setCurrentUser(response.user);
        setSimulatedEmailNotify(null);
        setPortalState("dashboard");
        setBookingsHistory([]);
        
        alert(`Registration Successful! Welcome to Hotel Meghdoot, VIP Guest ${response.user.name}.`);
      }
    } catch (err) {
      setErrors({ otp: err.message || "Invalid verification passcode. Please check server terminal logs." });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!loginData.email.trim()) newErrors.email = "Email is required";
    if (!loginData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const fingerprint = getClientFingerprint();
      const response = await requestBackend("/api/auth/login", "POST", {
        email: loginData.email,
        password: loginData.password,
        clientFingerprint: fingerprint
      });

      if (response.success && response.token) {
        localStorage.setItem("meghdoot_jwt", response.token);
        localStorage.setItem("meghdoot_active_user", JSON.stringify(response.user));
        setCurrentUser(response.user);
        setPortalState("dashboard");
        setBookingsHistory([]);
      }
    } catch (err) {
      setErrors({ general: err.message || "Invalid credentials or offline backend server." });
    }
  };

  // Google OAuth Handlers
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const fingerprint = getClientFingerprint();
      const response = await requestBackend("/api/auth/google", "POST", {
        credential: credentialResponse.credential,
        clientFingerprint: fingerprint
      });

      if (response.success && response.token) {
        localStorage.setItem("meghdoot_jwt", response.token);
        localStorage.setItem("meghdoot_active_user", JSON.stringify(response.user));
        setCurrentUser(response.user);
        setPortalState("dashboard");
        setBookingsHistory([]);
        alert(`Google Log-In Successful! Welcome, VIP Guest ${response.user.name}.`);
      }
    } catch (err) {
      setErrors({ general: err.message || "Google authentication failed. Please try again." });
    }
  };

  const handleGoogleLoginError = () => {
    setErrors({ general: "Google Authentication returned an error. Please try standard sign-in." });
  };

  const handleSimulatedGoogleLogin = async () => {
    try {
      const fingerprint = getClientFingerprint();
      const mockPayload = {
        email: "google.vip@gmail.com",
        name: "Google Royal Guest",
        sub: "google_1234567890"
      };
      const mockHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const mockPayloadStr = btoa(JSON.stringify(mockPayload));
      const simulatedCredential = `${mockHeader}.${mockPayloadStr}.mocksignature`;

      const response = await requestBackend("/api/auth/google", "POST", {
        credential: simulatedCredential,
        clientFingerprint: fingerprint
      });

      if (response.success && response.token) {
        localStorage.setItem("meghdoot_jwt", response.token);
        localStorage.setItem("meghdoot_active_user", JSON.stringify(response.user));
        setCurrentUser(response.user);
        setPortalState("dashboard");
        setBookingsHistory([]);
        alert(`Simulated Google Log-In Successful! Welcome, VIP Guest ${response.user.name}.`);
      }
    } catch (err) {
      setErrors({ general: err.message || "Simulated Google Auth failed." });
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("meghdoot_active_user");
    localStorage.removeItem("meghdoot_jwt");
    setCurrentUser(null);
    setSignupData({ name: "", email: "", phone: "", password: "" });
    setLoginData({ email: "", password: "" });
    setPortalState("signup");
    setHistoryUnlocked(false);
    setBookingsHistory([]);
  };

  // Pricing calculation helper
  const calculateBilling = () => {
    const checkInDate = new Date(bookingConfig.checkIn);
    const checkOutDate = new Date(bookingConfig.checkOut);
    
    let nights = 0;
    if (bookingConfig.checkIn && bookingConfig.checkOut && checkOutDate > checkInDate) {
      const diffTime = Math.abs(checkOutDate - checkInDate);
      nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const roomRate = getRoomPrice(bookingConfig.roomType);
    const roomSubtotal = roomRate * nights;

    const addonsSubtotal = bookingConfig.selectedAddons.reduce((sum, addonId) => {
      const add = ADDONS.find(a => a.id === addonId);
      return sum + (add ? add.price : 0);
    }, 0);

    const subtotal = roomSubtotal + addonsSubtotal;
    const gstAndTax = Math.round(subtotal * 0.18); // 18% luxury tax
    const total = subtotal + gstAndTax;

    return {
      nights,
      roomRate,
      roomSubtotal,
      addonsSubtotal,
      subtotal,
      tax: gstAndTax,
      total
    };
  };

  const billing = calculateBilling();

  const handleProceedToPayment = async () => {
    // Validate booking dates
    if (!bookingConfig.checkIn || !bookingConfig.checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    const checkInDate = new Date(bookingConfig.checkIn);
    const checkOutDate = new Date(bookingConfig.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      alert("Check-in date cannot be in the past.");
      return;
    }

    if (checkOutDate <= checkInDate) {
      alert("Check-out date must be after your check-in date.");
      return;
    }

    // Check if room is available
    const availability = getRoomAvailability(bookingConfig.roomType);
    if (availability <= 0) {
      alert(`Sorry, ${bookingConfig.roomType} is fully booked for these dates.`);
      return;
    }

    try {
      // 1. Request OTP (Stay Authorization Code) first
      await requestBackend("/api/auth/request-operation", "POST");
      alert("A dynamic stay authorization passcode has been dispatched to your email. Please enter it in the checkout panel.");
      
      setSimulatedEmailNotify({
        subject: "Dynamic Booking Authorization Code",
        otp: "CHECK SERVER CONSOLE",
        email: currentUser.email
      });

      // 2. Call backend to create Razorpay Order
      const orderResponse = await requestBackend("/api/payments/create-order", "POST", {
        amount: billing.total,
        receipt: generateReceiptId(currentUser.email)
      });

      if (!orderResponse.success) {
        alert("Failed to initiate secure booking payment transaction.");
        return;
      }

      const { order, keyId, mode } = orderResponse;

      if (mode === "live" && keyId) {
        // Real Razorpay Flow
        const loadRazorpayScript = () => {
          return new Promise((resolve) => {
            if (window.Razorpay) {
              resolve(true);
              return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const loaded = await loadRazorpayScript();
        if (!loaded) {
          alert("Razorpay checkout engine failed to load. Please check your internet connection.");
          return;
        }

        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Hotel Meghdoot",
          description: `Luxury Stay Booking — ${bookingConfig.roomType}`,
          image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=200&auto=format&fit=crop",
          order_id: order.id,
          handler: async function (response) {
            // Directly call verify on backend without OTP check on payment success
            try {
              const paymentBody = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                bookingConfig,
                billing,
                mode: "live"
              };
              const verifyRes = await requestBackend("/api/payments/verify", "POST", paymentBody);
              if (verifyRes.success && verifyRes.voucher) {
                setCurrentBookingVoucher(verifyRes.voucher);
                setBookingsHistory(prev => [verifyRes.voucher, ...prev]);
                setHistoryUnlocked(true);
                setPortalState("voucher");
                alert("Stay Reservation Secured Successfully!");
              }
            } catch (err) {
              alert(err.message || "Failed to verify stay payment.");
            }
          },
          prefill: {
            name: currentUser.name,
            email: currentUser.email,
            contact: currentUser.phone
          },
          theme: {
            color: "#C5A880"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp){
          setPaymentError(resp.error.description || "Secure transaction failed.");
          setShowRazorpay(true);
        });
        rzp.open();
      } else {
        // Simulated / Fallback Mode
        setRazorpayPaymentDetails({
          razorpay_payment_id: generateSimPaymentId(),
          razorpay_order_id: order.id,
          razorpay_signature: null,
          mode: "simulated"
        });
        setShowRazorpay(true);
        setPaymentError("");
      }
    } catch (err) {
      alert(err.message || "Failed to secure booking order transaction.");
    }
  };

  const handleRazorpaySuccess = async () => {
    if (!checkoutOtp) {
      setPaymentError("Stay Authorization Code (3rd Token) is required to secure this luxury booking.");
      return;
    }

    try {
      const paymentBody = {
        razorpay_payment_id: razorpayPaymentDetails?.razorpay_payment_id || null,
        razorpay_order_id: razorpayPaymentDetails?.razorpay_order_id || null,
        razorpay_signature: razorpayPaymentDetails?.razorpay_signature || null,
        bookingConfig,
        billing,
        mode: razorpayPaymentDetails?.mode || "simulated"
      };

      const response = await requestBackend(
        "/api/payments/verify",
        "POST",
        paymentBody
      );

      if (response.success && response.voucher) {
        // Transition to Voucher View
        setCurrentBookingVoucher(response.voucher);
        setShowRazorpay(false);
        setCheckoutOtp("");
        setRazorpayPaymentDetails(null);
        setSimulatedEmailNotify(null);

        // Clear booking configurator for next time
        setBookingConfig({
          checkIn: "",
          checkOut: "",
          roomType: "Deluxe Room",
          guests: 2,
          selectedAddons: [],
          specialRequests: ""
        });

        // Add to active bookings history locally
        setBookingsHistory(prev => [response.voucher, ...prev]);
        setHistoryUnlocked(true);

        setPortalState("voucher");
        alert("Stay Reservation Secured Successfully!");
      }
    } catch (err) {
      setPaymentError(err.message || "Failed to verify stay authorization passcode.");
    }
  };

  const handleRequestHistoryOtp = async () => {
    setHistoryRequesting(true);
    setHistoryError("");
    try {
      const response = await requestBackend("/api/auth/request-operation", "POST");
      if (response.success) {
        alert("Stay history verification code has been dispatched to your email.");
        setSimulatedEmailNotify({
          subject: "Dynamic Booking Authorization Code",
          otp: "CHECK SERVER CONSOLE",
          email: currentUser.email
        });
      }
    } catch (err) {
      setHistoryError(err.message || "Failed to dispatch stay history verification code.");
    } finally {
      setHistoryRequesting(false);
    }
  };

  const handleVerifyHistoryOtp = async (e) => {
    e.preventDefault();
    if (!historyOtp) {
      setHistoryError("Please enter the verification code.");
      return;
    }
    setHistoryError("");
    try {
      const response = await requestBackend("/api/bookings", "GET", null, historyOtp);
      if (response.success && response.history) {
        setBookingsHistory(response.history);
        setHistoryUnlocked(true);
        setSimulatedEmailNotify(null);
      }
    } catch (err) {
      setHistoryError(err.message || "Incorrect verification token or session expired.");
    }
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  return (
    <div className="relative w-full min-h-screen bg-luxury-charcoal text-luxury-cream py-24 px-6 md:px-12 flex flex-col items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-cover bg-center opacity-5 pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920')` }} />
      <div className="absolute top-1/4 right-1/4 w-[60vw] h-[60vw] rounded-full bg-luxury-gold/5 blur-[150px] pointer-events-none" />

      {/* ── Cancel Booking Confirmation Modal ── */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4"
            onClick={() => { if (!cancelLoading) { setCancelModal(null); setCancelResult(null); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="bg-[#0d1117] border border-luxury-gold/25 rounded-3xl shadow-2xl w-full max-w-md p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {!cancelResult ? (
                <>
                  {/* Confirm Cancel */}
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                      <FaTimes className="text-red-400 w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-luxury-cream mb-1">Cancel Booking?</h3>
                    <p className="text-xs font-sans text-luxury-cream/50 leading-relaxed">
                      Booking <span className="text-luxury-gold font-bold">{cancelModal.booking.id}</span> — {cancelModal.booking.roomType}
                    </p>
                  </div>

                  {/* Refund Calculation Card */}
                  {(() => {
                    const refund = getRefundInfo(cancelModal.booking.checkIn, cancelModal.booking.totalPaid);
                    return (
                      <div className={`p-5 rounded-2xl border mb-6 ${
                        refund.pct === 100 ? "bg-emerald-500/8 border-emerald-500/25" :
                        refund.pct >= 50  ? "bg-amber-500/8 border-amber-500/25" :
                        refund.pct >= 25  ? "bg-orange-500/8 border-orange-500/25" :
                        "bg-red-500/8 border-red-500/25"
                      }`}>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] uppercase tracking-widest text-luxury-cream/40 font-sans">Cancellation Tier</span>
                          <span className={`text-xs font-bold font-sans ${refund.color}`}>{refund.label}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] uppercase tracking-widest text-luxury-cream/40 font-sans">Amount Paid</span>
                          <span className="text-sm font-semibold text-luxury-cream font-sans">₹{cancelModal.booking.totalPaid.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] uppercase tracking-widest text-luxury-cream/40 font-sans">Deduction (Cancellation Fee)</span>
                          <span className="text-sm font-semibold text-red-400 font-sans">₹{(cancelModal.booking.totalPaid - refund.amount).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="h-px bg-luxury-cream/10 mb-3" />
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-widest text-luxury-cream/40 font-sans">Refund Amount</span>
                          <span className={`text-2xl font-extrabold font-serif ${refund.pct > 0 ? refund.color : "text-red-400"}`}>
                            {refund.pct > 0 ? `₹${refund.amount.toLocaleString("en-IN")}` : "₹0"}
                          </span>
                        </div>
                        {refund.pct === 0 && (
                          <p className="text-[10px] text-red-400/70 font-sans mt-2 leading-relaxed italic">
                            ⚠️ Check-in is less than 24 hours away. No refund is applicable per our policy.
                          </p>
                        )}
                        {refund.pct > 0 && refund.pct < 100 && (
                          <p className="text-[10px] text-luxury-cream/35 font-sans mt-2 leading-relaxed italic">
                            Refund will be credited within 5–7 business days.
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* ── Room Detail Modal ── */}
                  <AnimatePresence>
                    {detailRoom && (
                      <RoomDetailModal
                        room={detailRoom}
                        onClose={() => setDetailRoom(null)}
                        onBook={() => setDetailRoom(null)}
                      />
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setCancelModal(null); setCancelResult(null); }}
                      disabled={cancelLoading}
                      className="flex-1 py-3.5 rounded-xl border border-luxury-gold/20 hover:border-luxury-gold/40 text-luxury-cream/70 hover:text-luxury-cream font-sans font-bold text-xs uppercase tracking-widest transition-all focus:outline-none disabled:opacity-50"
                    >
                      Keep Booking
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      disabled={cancelLoading}
                      className="flex-1 py-3.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-sans font-bold text-xs uppercase tracking-widest transition-all focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {cancelLoading ? (
                        <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-3 h-3" />Processing...</>
                      ) : "Confirm Cancel"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Cancel Success */}
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                      <FaCheck className="text-emerald-400 w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-luxury-cream mb-2">Booking Cancelled</h3>
                    <p className="text-xs font-sans text-luxury-cream/50 leading-relaxed mb-6">{cancelResult.message}</p>
                    {cancelResult.refundAmount > 0 ? (
                      <div className="p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 mb-6">
                        <p className="text-[10px] uppercase tracking-widest text-luxury-cream/40 font-sans mb-2">Refund Initiated</p>
                        <p className="font-serif text-3xl font-extrabold text-emerald-400">
                          ₹{cancelResult.refundAmount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-luxury-cream/40 font-sans mt-2">{cancelResult.refundLabel} · 5–7 business days</p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/8 mb-6">
                        <p className="text-sm text-red-400 font-sans font-semibold">No refund applicable</p>
                        <p className="text-[10px] text-luxury-cream/40 font-sans mt-1">Per our cancellation policy (less than 24 hours)</p>
                      </div>
                    )}
                    <button
                      onClick={() => { setCancelModal(null); setCancelResult(null); }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-charcoal font-sans font-bold text-xs uppercase tracking-widest focus:outline-none"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated Premium VIP Email Notification Tray */}

      <AnimatePresence>
        {simulatedEmailNotify && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -80, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 max-w-sm w-full glass-panel border border-luxury-gold/40 shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
          >
            <div className="p-4 bg-luxury-navy flex justify-between items-center border-b border-luxury-gold/20">
              <div className="flex items-center gap-2 text-luxury-gold">
                <FaEnvelope className="animate-pulse" />
                <span className="text-[10px] tracking-[0.2em] font-sans font-bold uppercase">Simulated Guest Mailbox</span>
              </div>
              <button 
                onClick={() => setSimulatedEmailNotify(null)} 
                className="text-luxury-cream/40 hover:text-luxury-cream text-xs focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-5 font-sans">
              <span className="text-[9px] uppercase tracking-widest text-luxury-gold">From: concierge@hotelmeghdoot.com</span>
              <h4 className="font-serif text-sm font-semibold text-luxury-cream mt-1 leading-snug">{simulatedEmailNotify.subject}</h4>
              <p className="text-[11px] text-luxury-cream/70 mt-3">
                Dear guest, thank you for registering for the premium guest portal. Your account verification passcode is:
              </p>
              <div className="my-4 p-3 bg-luxury-charcoal/80 rounded-xl border border-luxury-gold/30 flex justify-between items-center">
                <span className="font-mono text-2xl font-extrabold tracking-[0.4em] text-luxury-gold-bright pl-3">{simulatedEmailNotify.otp}</span>
                <span className="text-[9px] uppercase font-bold text-luxury-cream/30 border border-luxury-cream/10 px-2 py-1 rounded">TEST KEY</span>
              </div>
              <p className="text-[10px] text-luxury-cream/50 italic text-center">
                *Enter this 6-digit OTP code in the verification field below to register.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl w-full flex-grow flex flex-col gap-8 relative z-10 print:p-0 print:my-0">
        
        {/* Navigation Bar inside the Portal (only if not printing) */}
        <div className="flex justify-between items-center border-b border-luxury-gold/15 pb-6 print:hidden">
          <button
            onClick={() => {
              if (portalState === "voucher" || portalState === "history") {
                setPortalState("dashboard");
              } else {
                onBack ? onBack() : setView("home");
              }
            }}
            className="flex items-center gap-2.5 font-sans font-semibold text-xs tracking-widest uppercase text-luxury-cream/70 hover:text-luxury-gold transition-colors focus:outline-none"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            {portalState === "voucher" || portalState === "history" ? "Back to Dashboard" : "Return to Home"}
          </button>
          
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl tracking-[0.2em] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-light via-luxury-gold to-luxury-gold-dark">
              MEGHDOOT PORTAL
            </span>
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPortalState(portalState === "history" ? "dashboard" : "history")}
                  className="flex items-center gap-2.5 px-4 py-2 border border-luxury-gold/20 rounded-full text-xs font-sans text-luxury-cream/80 hover:border-luxury-gold hover:text-luxury-gold transition-colors focus:outline-none"
                >
                  <FaHistory className="w-3 h-3 text-luxury-gold" />
                  {portalState === "history" ? "Dashboard" : "My Bookings"}
                </button>
                <button
                  onClick={handleLogOut}
                  className="p-2.5 bg-luxury-gold/10 hover:bg-red-500/20 text-luxury-gold hover:text-red-400 border border-luxury-gold/20 hover:border-red-500/30 rounded-full transition-all duration-300 focus:outline-none"
                  title="Royal Guest Log Out"
                >
                  <FaSignOutAlt className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-[10px] tracking-widest uppercase font-semibold text-luxury-gold">
                VIP Access Gate
              </span>
            )}
          </div>
        </div>

        {/* ==================== SIGN UP SUBVIEW ==================== */}
        {portalState === "signup" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full mx-auto glass-panel p-8 md:p-10 rounded-3xl border border-luxury-gold/20 shadow-2xl self-center"
          >
            <div className="text-center mb-8">
              <div className="text-luxury-gold mb-3 flex justify-center">
                <FaConciergeBell className="w-10 h-10 stroke-[0.5]" />
              </div>
              <h2 className="font-serif text-2xl uppercase tracking-wider mb-2">Create Royal Account</h2>
              <p className="font-sans font-light text-xs text-luxury-cream/70 leading-relaxed">
                Register to gain entry to our VIP Stay portal, customize premium room add-ons, and secure complete dynamic bookings.
              </p>
            </div>

            <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-5 font-sans">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-luxury-cream/60">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold/50 text-sm" />
                  <input
                    type="text"
                    name="name"
                    value={signupData.name}
                    onChange={handleSignupChange}
                    placeholder="Lord / Lady Full Name"
                    className={`w-full bg-luxury-navy/60 border ${errors.name ? "border-red-500" : "border-luxury-gold/20 focus:border-luxury-gold"} rounded-xl pl-11 pr-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors duration-300`}
                  />
                </div>
                {errors.name && <span className="text-xs text-red-400">{errors.name}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-luxury-cream/60">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold/50 text-sm" />
                  <input
                    type="email"
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    placeholder="lord.guest@gmail.com"
                    className={`w-full bg-luxury-navy/60 border ${errors.email ? "border-red-500" : "border-luxury-gold/20 focus:border-luxury-gold"} rounded-xl pl-11 pr-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors duration-300`}
                  />
                </div>
                {errors.email && <span className="text-xs text-red-400">{errors.email}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-luxury-cream/60">Contact Phone</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold/50 text-sm" />
                  <input
                    type="tel"
                    name="phone"
                    value={signupData.phone}
                    onChange={handleSignupChange}
                    placeholder="9876543210"
                    className={`w-full bg-luxury-navy/60 border ${errors.phone ? "border-red-500" : "border-luxury-gold/20 focus:border-luxury-gold"} rounded-xl pl-11 pr-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors duration-300`}
                  />
                </div>
                {errors.phone && <span className="text-xs text-red-400">{errors.phone}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-luxury-cream/60">Security Passcode</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold/50 text-sm" />
                  <input
                    type="password"
                    name="password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    placeholder="••••••••"
                    className={`w-full bg-luxury-navy/60 border ${errors.password ? "border-red-500" : "border-luxury-gold/20 focus:border-luxury-gold"} rounded-xl pl-11 pr-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors duration-300`}
                  />
                </div>
                {errors.password && <span className="text-xs text-red-400">{errors.password}</span>}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-charcoal font-sans font-bold text-xs uppercase tracking-[0.25em] shadow-xl hover:shadow-luxury-gold/20 hover:scale-[1.01] hover:bg-gradient-to-l transition-all duration-300 mt-4 min-h-[50px]"
              >
                SEND VERIFICATION OTP
              </motion.button>

              <div className="flex items-center my-2 text-[10px] text-luxury-cream/40 uppercase tracking-widest font-sans justify-center gap-3">
                <span className="h-[1px] w-full bg-luxury-gold/15" />
                <span>Or</span>
                <span className="h-[1px] w-full bg-luxury-gold/15" />
              </div>

              {/* Google Register Component */}
              <div className="flex justify-center w-full min-h-[40px] relative z-20">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  theme="filled_dark"
                  shape="rectangular"
                  width="100%"
                />
              </div>

              <div className="text-center mt-4">
                <span className="text-xs font-light text-luxury-cream/60">Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setPortalState("login");
                    setErrors({});
                  }}
                  className="text-xs font-bold text-luxury-gold hover:text-luxury-gold-bright underline transition-colors focus:outline-none"
                >
                  Log In Securely
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ==================== OTP VERIFICATION SUBVIEW ==================== */}
        {portalState === "otp" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full mx-auto glass-panel p-8 md:p-10 rounded-3xl border border-luxury-gold/20 shadow-2xl self-center"
          >
            <div className="text-center mb-8">
              <div className="text-luxury-gold mb-3 flex justify-center">
                <FaKey className="w-10 h-10 stroke-[0.5] animate-bounce" />
              </div>
              <h2 className="font-serif text-2xl uppercase tracking-wider mb-2">Verify Registration</h2>
              <p className="font-sans font-light text-xs text-luxury-cream/70 leading-relaxed">
                An verification OTP was sent to <strong className="text-luxury-cream">{signupData.email}</strong>. Enter the passcode from your simulated inbox at the top-right to complete authentication.
              </p>
            </div>

            <form onSubmit={handleOtpVerify} className="flex flex-col gap-6 font-sans">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-luxury-cream/60 text-center">6-Digit Code</label>
                <input
                  type="text"
                  maxLength="6"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="0 0 0 0 0 0"
                  className="w-full bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold rounded-xl py-4 text-center font-mono text-2xl font-bold tracking-[0.4em] text-luxury-gold-bright focus:outline-none transition-colors duration-300"
                />
                {errors.otp && <span className="text-xs text-red-400 text-center mt-1">{errors.otp}</span>}
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPortalState("signup");
                    setOtpValue("");
                    setErrors({});
                  }}
                  className="w-1/2 py-3.5 rounded-xl border border-luxury-gold/30 hover:border-luxury-gold text-luxury-cream text-xs uppercase tracking-wider font-bold transition-all focus:outline-none"
                >
                  Edit Details
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-charcoal text-xs uppercase tracking-wider font-bold shadow-xl hover:shadow-luxury-gold/20 transition-all focus:outline-none"
                >
                  Verify & Register
                </button>
              </div>

              <div className="text-center mt-2">
                <span className="text-[10px] font-light text-luxury-cream/50">Didn't receive email? </span>
                <button
                  type="button"
                  onClick={() => {
                    // Re-dispatch OTP
                    const otp = generateOtpCode();
                    setSimulatedEmailNotify({
                      subject: "Verify Your Hotel Meghdoot Registration",
                      otp: otp,
                      email: signupData.email
                    });
                    alert("Simulated verification OTP has been re-dispatched.");
                  }}
                  className="text-[10px] font-bold text-luxury-gold hover:underline focus:outline-none"
                >
                  Resend Verification OTP
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ==================== SECURE LOGIN SUBVIEW ==================== */}
        {portalState === "login" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full mx-auto glass-panel p-8 md:p-10 rounded-3xl border border-luxury-gold/20 shadow-2xl self-center"
          >
            <div className="text-center mb-8">
              <div className="text-luxury-gold mb-3 flex justify-center">
                <FaShieldAlt className="w-10 h-10 stroke-[0.5]" />
              </div>
              <h2 className="font-serif text-2xl uppercase tracking-wider mb-2">Member Log In</h2>
              <p className="font-sans font-light text-xs text-luxury-cream/70 leading-relaxed">
                Log in with your royal membership credentials to access stay configurations and active vouchers.
              </p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs flex gap-2 items-center font-sans">
                <FaExclamationTriangle className="flex-shrink-0 text-base" />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5 font-sans">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-luxury-cream/60">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold/50 text-sm" />
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="registered.email@gmail.com"
                    className={`w-full bg-luxury-navy/60 border ${errors.email ? "border-red-500" : "border-luxury-gold/20 focus:border-luxury-gold"} rounded-xl pl-11 pr-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors duration-300`}
                  />
                </div>
                {errors.email && <span className="text-xs text-red-400">{errors.email}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-luxury-cream/60">Security Passcode</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold/50 text-sm" />
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="••••••••"
                    className={`w-full bg-luxury-navy/60 border ${errors.password ? "border-red-500" : "border-luxury-gold/20 focus:border-luxury-gold"} rounded-xl pl-11 pr-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors duration-300`}
                  />
                </div>
                {errors.password && <span className="text-xs text-red-400">{errors.password}</span>}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-charcoal font-sans font-bold text-xs uppercase tracking-[0.25em] shadow-xl hover:shadow-luxury-gold/20 hover:scale-[1.01] hover:bg-gradient-to-l transition-all duration-300 mt-4 min-h-[50px]"
              >
                LOG IN SECURELY
              </motion.button>

              <div className="flex items-center my-2 text-[10px] text-luxury-cream/40 uppercase tracking-widest font-sans justify-center gap-3">
                <span className="h-[1px] w-full bg-luxury-gold/15" />
                <span>Or</span>
                <span className="h-[1px] w-full bg-luxury-gold/15" />
              </div>

              {/* Google Login Component */}
              <div className="flex justify-center w-full min-h-[40px] relative z-20">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  theme="filled_dark"
                  shape="rectangular"
                  width="100%"
                />
              </div>



              <div className="text-center mt-4">
                <span className="text-xs font-light text-luxury-cream/60">New to Meghdoot? </span>
                <button
                  type="button"
                  onClick={() => {
                    setPortalState("signup");
                    setErrors({});
                  }}
                  className="text-xs font-bold text-luxury-gold hover:text-luxury-gold-bright underline transition-colors focus:outline-none"
                >
                  Create Account
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ==================== VIP PORTAL DASHBOARD ==================== */}
        {portalState === "dashboard" && currentUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start"
          >
            {/* Left side: Stay Configurator Form */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Portal Greeting Banner */}
              <div className="glass-panel p-6 rounded-2xl border border-luxury-gold/15 relative overflow-hidden">
                <div className="absolute right-4 bottom-0 opacity-10 text-luxury-gold">
                  <FaConciergeBell className="w-32 h-32 stroke-[0.3]" />
                </div>
                <span className="text-[10px] tracking-[0.35em] text-luxury-gold font-semibold uppercase font-sans">ROYAL PORTAL ACTIVATED</span>
                <h2 className="font-serif text-2xl font-bold uppercase mt-1">Welcome, Lord {currentUser.name}</h2>
                <p className="font-sans font-light text-xs text-luxury-cream/70 mt-1 leading-relaxed max-w-xl">
                  Configure your bespoke heritage vacation below. Customize check-in schedules, select royal suites, and incorporate hand-selected premium hotel features.
                </p>
              </div>

              {/* Booking Configuration Block */}
              <div className="glass-panel p-6 md:p-8 rounded-3xl border border-luxury-gold/15 flex flex-col gap-6">
                <h3 className="font-serif text-lg text-luxury-gold-bright pb-3 border-b border-luxury-gold/10 uppercase tracking-widest">
                  Bespeak Your stay
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                  {/* Check In */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-luxury-cream/70 font-semibold flex items-center gap-2">
                      <FaCalendarAlt className="text-luxury-gold" /> Check-In Date
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      value={bookingConfig.checkIn}
                      onChange={handleBookingConfigChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold text-luxury-cream rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-300 cursor-pointer"
                    />
                  </div>

                  {/* Check Out */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-luxury-cream/70 font-semibold flex items-center gap-2">
                      <FaCalendarAlt className="text-luxury-gold" /> Check-Out Date
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      value={bookingConfig.checkOut}
                      onChange={handleBookingConfigChange}
                      min={bookingConfig.checkIn || new Date().toISOString().split("T")[0]}
                      className="bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold text-luxury-cream rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-300 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                  {/* Room Type */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-luxury-cream/70 font-semibold">Select Royal Suite</label>
                    <select
                      name="roomType"
                      value={bookingConfig.roomType}
                      onChange={handleBookingConfigChange}
                      className="bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold text-luxury-cream rounded-xl px-4 py-3.5 text-sm focus:outline-none transition-colors duration-300 cursor-pointer appearance-none animate-none"
                    >
                      <option value="Deluxe Room">Deluxe Room — ₹{getRoomPrice("Deluxe Room").toLocaleString("en-IN")}/night</option>
                      <option value="Super Deluxe Room">Super Deluxe Room — ₹{getRoomPrice("Super Deluxe Room").toLocaleString("en-IN")}/night</option>
                      <option value="Family Suite">Family Suite — ₹{getRoomPrice("Family Suite").toLocaleString("en-IN")}/night</option>
                      <option value="Premium Royal Suite">Premium Royal Suite — ₹{getRoomPrice("Premium Royal Suite").toLocaleString("en-IN")}/night</option>
                    </select>
                  </div>

                  {/* Guests */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-luxury-cream/70 font-semibold">Adult Guests</label>
                    <select
                      name="guests"
                      value={bookingConfig.guests}
                      onChange={handleBookingConfigChange}
                      className="bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold text-luxury-cream rounded-xl px-4 py-3.5 text-sm focus:outline-none transition-colors duration-300 cursor-pointer"
                    >
                      <option value="1">1 Royal Guest</option>
                      <option value="2">2 Royal Guests</option>
                      <option value="3">3 Royal Guests</option>
                      <option value="4">4+ Royal Guests</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Selected Room Preview Card */}
                {(() => {
                  const currentRoom = rooms.find(r => r.name === bookingConfig.roomType);
                  if (!currentRoom) return null;
                  const availableCount = getRoomAvailability(currentRoom.name);
                  const isSoldOut = availableCount <= 0;
                  const livePrice = getRoomPrice(currentRoom.name);

                  return (
                    <div className="border border-luxury-gold/15 bg-luxury-navy/35 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-5 font-sans mt-4">
                      {/* Room Mini Image */}
                      <div className="relative w-full md:w-48 aspect-[16/10] md:aspect-square rounded-xl overflow-hidden flex-shrink-0">
                        <img src={currentRoom.image} alt={currentRoom.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-luxury-gold text-luxury-charcoal text-[9.5px] font-bold uppercase tracking-widest rounded-md">
                          {currentRoom.tag}
                        </div>
                      </div>

                      {/* Room Mini Description */}
                      <div className="flex-grow flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h4 className="text-lg font-serif font-bold text-luxury-cream">{currentRoom.name}</h4>
                            
                            {/* Availability Badge */}
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase font-sans w-fit ${
                              isSoldOut 
                                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                : availableCount <= 3 
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse" 
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {isSoldOut ? "❌ Sold Out!" : `🟢 ${availableCount} Rooms Available`}
                            </span>
                          </div>
                          <p className="text-xs text-luxury-cream/70 mt-1 leading-relaxed">{currentRoom.description}</p>
                          
                          {/* Key amenities */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="bg-luxury-dark/40 px-2.5 py-1 rounded text-[10px] text-luxury-cream/65 border border-white/5">{currentRoom.size}</span>
                            <span className="bg-luxury-dark/40 px-2.5 py-1 rounded text-[10px] text-luxury-cream/65 border border-white/5">{currentRoom.view}</span>
                            <span className="bg-luxury-dark/40 px-2.5 py-1 rounded text-[10px] text-luxury-cream/65 border border-white/5">{currentRoom.floor}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-luxury-gold/10">
                          <button
                            type="button"
                            onClick={() => setDetailRoom(currentRoom)}
                            className="px-4 py-2 border border-luxury-gold/30 hover:border-luxury-gold/60 text-luxury-gold hover:text-luxury-gold-bright rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors duration-300 focus:outline-none"
                          >
                            Show Details & Policies
                          </button>
                          <span className="text-xs font-serif text-luxury-cream/50 ml-auto font-light">
                            Live Rate: <strong className="text-luxury-gold-bright font-serif text-sm">₹{livePrice.toLocaleString("en-IN")}</strong> / Night
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* VIP Addons selection */}
                <div className="flex flex-col gap-3 font-sans">
                  <label className="text-xs uppercase tracking-widest text-luxury-cream/70 font-semibold">Add Premium Custom Services</label>
                  <div className="flex flex-col gap-3.5">
                    {ADDONS.map(addon => {
                      const isSelected = bookingConfig.selectedAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? "bg-luxury-gold/10 border-luxury-gold shadow-[0_0_15px_rgba(197,168,128,0.1)]" 
                              : "bg-luxury-navy/40 border-luxury-gold/10 hover:border-luxury-gold/35"
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isSelected ? "bg-luxury-gold border-luxury-gold text-luxury-charcoal" : "border-luxury-gold/30"
                          }`}>
                            {isSelected && <FaCheck className="w-2.5 h-2.5" />}
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-baseline gap-2">
                              <h4 className="text-sm font-semibold tracking-wide text-luxury-cream">{addon.name}</h4>
                              <span className="text-xs text-luxury-gold font-bold">₹{addon.price.toLocaleString("en-IN")}</span>
                            </div>
                            <p className="text-[11px] text-luxury-cream/50 mt-0.5 leading-relaxed font-light">{addon.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Special Requests */}
                <div className="flex flex-col gap-2 font-sans">
                  <label className="text-xs uppercase tracking-widest text-luxury-cream/70 font-semibold">Special Requests / Private Butler Directives</label>
                  <textarea
                    name="specialRequests"
                    value={bookingConfig.specialRequests}
                    onChange={handleBookingConfigChange}
                    rows="3"
                    placeholder="Specific dining requests, dietary restrictions, arrival coordination requirements..."
                    className="bg-luxury-navy/60 border border-luxury-gold/20 focus:border-luxury-gold rounded-xl px-4 py-3.5 text-sm text-luxury-cream placeholder-luxury-cream/30 focus:outline-none transition-colors duration-300 resize-none font-light"
                  />
                </div>
              </div>
            </div>

            {/* Right side: Real-time Live Calculator & Preview */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
              
              {/* Selected Suite Live Preview Card */}
              <div className="glass-panel rounded-2xl border border-luxury-gold/10 overflow-hidden relative group">
                <div className="aspect-[16/8] overflow-hidden relative">
                  <img
                    src={SUITE_IMAGES[bookingConfig.roomType]}
                    alt={bookingConfig.roomType}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[9px] uppercase tracking-widest text-luxury-gold bg-luxury-navy/80 px-2 py-0.5 rounded border border-luxury-gold/20">Active Selection</span>
                    <h3 className="font-serif text-xl font-bold mt-1 uppercase tracking-wide">{bookingConfig.roomType}</h3>
                  </div>
                </div>
              </div>

              {/* Dynamic Bill Summary Sheet */}
              <div className="glass-panel p-6 md:p-8 rounded-3xl border border-luxury-gold/20 shadow-2xl flex flex-col gap-6 font-sans">
                <h3 className="font-serif text-base text-luxury-gold-bright pb-3 border-b border-luxury-gold/10 uppercase tracking-widest">
                  Pricing Breakdown
                </h3>

                <div className="flex flex-col gap-4 text-xs font-light text-luxury-cream/80">
                  {/* Rooms base */}
                  <div className="flex justify-between items-center">
                    <span>Suite Rate ({bookingConfig.roomType})</span>
                    <span className="font-semibold text-luxury-cream">₹{billing.roomRate.toLocaleString("en-IN")} / Night</span>
                  </div>

                  {/* Duration */}
                  <div className="flex justify-between items-center">
                    <span>Total Stay Duration</span>
                    <span className="font-semibold text-luxury-cream">{billing.nights} {billing.nights === 1 ? "Night" : "Nights"}</span>
                  </div>

                  {/* Suite subtotal */}
                  <div className="flex justify-between items-center pb-3 border-b border-luxury-gold/5">
                    <span>Suites Subtotal</span>
                    <span className="font-bold text-luxury-cream">₹{billing.roomSubtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Addons subtotal */}
                  {bookingConfig.selectedAddons.length > 0 && (
                    <div className="flex flex-col gap-2 pb-3 border-b border-luxury-gold/5">
                      <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-wider">Premium Custom Add-ons:</span>
                      {bookingConfig.selectedAddons.map(id => {
                        const add = ADDONS.find(a => a.id === id);
                        return (
                          <div key={id} className="flex justify-between text-[11px] pl-2 text-luxury-cream/60">
                            <span>• {add.name}</span>
                            <span>₹{add.price.toLocaleString("en-IN")}</span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between text-xs mt-1">
                        <span>Services Subtotal</span>
                        <span className="font-bold text-luxury-cream">₹{billing.addonsSubtotal.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  )}

                  {/* Tax */}
                  <div className="flex justify-between items-center">
                    <span>Luxury GST & Service Surcharge (18%)</span>
                    <span>₹{billing.tax.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Grand total */}
                  <div className="flex justify-between items-center pt-4 border-t border-luxury-gold/15 text-sm">
                    <span className="font-serif font-bold text-luxury-gold uppercase tracking-wider">Grand Total Amount</span>
                    <span className="font-serif font-extrabold text-xl text-luxury-gold-bright gold-text-glow">
                      ₹{billing.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {billing.nights === 0 ? (
                  <div className="p-3.5 bg-luxury-gold/5 border border-luxury-gold/20 rounded-xl text-center text-xs text-luxury-gold tracking-wide flex items-center justify-center gap-2">
                    <FaExclamationTriangle /> Please select stay dates to unlock checkout
                  </div>
                ) : getRoomAvailability(bookingConfig.roomType) <= 0 ? (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs text-red-400 tracking-wide flex items-center justify-center gap-2 font-bold uppercase">
                    ❌ This room category is fully booked. Please select another category.
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProceedToPayment}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-bright text-luxury-charcoal font-sans font-bold text-xs uppercase tracking-[0.25em] shadow-[0_0_20px_rgba(197,168,128,0.2)] hover:shadow-[0_0_30px_rgba(197,168,128,0.4)] transition-all duration-300"
                  >
                    SECURE ROYAL BOOKING (₹{billing.total.toLocaleString("en-IN")})
                  </motion.button>
                )}

                <div className="flex items-center justify-center gap-2 text-[10px] text-luxury-cream/40 uppercase tracking-widest mt-2">
                  <FaShieldAlt className="text-luxury-gold" /> Secure SSL 256-Bit Stay booking
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== RAZORPAY SECURE PAYMENT MODAL ==================== */}
        <AnimatePresence>
          {showRazorpay && currentUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-luxury-charcoal/90 backdrop-blur-md flex items-center justify-center p-4 font-sans"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="max-w-md w-full rounded-2xl overflow-hidden shadow-2xl border border-luxury-gold/20 bg-luxury-dark text-luxury-cream flex flex-col font-sans"
              >
                {/* Razorpay Premium Header */}
                <div className="bg-[#1b2430] p-6 border-b border-luxury-gold/15 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg select-none shadow-md">
                      R
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
                          {razorpayPaymentDetails?.mode === "live" ? "REAL SECURE GATEWAY" : "TEST GATEWAY"}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold tracking-wide text-luxury-cream uppercase mt-0.5">Hotel Meghdoot Checkout</h4>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRazorpay(false)}
                    className="text-luxury-cream/40 hover:text-red-400 p-1 rounded-full transition-colors focus:outline-none"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>

                {/* Payment summary tray */}
                <div className="bg-luxury-navy px-6 py-4 flex justify-between items-center border-b border-luxury-gold/5 text-xs">
                  <div>
                    <span className="text-luxury-cream/50 text-[10px] uppercase">Royal Guest Email</span>
                    <p className="font-semibold text-luxury-cream">{currentUser.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-luxury-cream/50 text-[10px] uppercase">Total Payable</span>
                    <p className="font-bold text-luxury-gold-bright text-sm gold-text-glow">₹{billing.total.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* Main payment panel columns */}
                {razorpayPaymentDetails?.mode === "live" ? (
                  /* LIVE MODE Captured Message */
                  <div className="p-8 bg-luxury-navy/95 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl animate-bounce">
                      ✓
                    </div>
                    <h4 className="font-serif text-lg font-bold text-luxury-cream">Payment Capture Successful</h4>
                    <p className="text-xs text-luxury-cream/70 leading-relaxed max-w-sm">
                      A premium transaction of <strong className="text-luxury-gold">₹{billing.total.toLocaleString("en-IN")}</strong> has been authorized via secure Razorpay checkout.
                    </p>
                    <div className="bg-luxury-dark/60 border border-luxury-gold/15 rounded-xl px-4 py-2 text-[10px] font-mono text-luxury-gold-bright">
                      Reference ID: {razorpayPaymentDetails.razorpay_payment_id}
                    </div>
                    
                    <div className="w-full text-center py-4 border-t border-b border-luxury-gold/10 my-4 text-xs text-luxury-cream/60">
                      Payment is verified. Click below to view your receipt.
                    </div>
                    <button
                      onClick={handleRazorpaySuccess}
                      className="w-full py-3 bg-gradient-to-r from-luxury-gold to-luxury-gold-dark hover:from-luxury-gold-bright hover:to-luxury-gold text-luxury-charcoal font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg focus:outline-none"
                    >
                      <FaCheckCircle /> View Booking Voucher
                    </button>
                  </div>
                ) : (
                  /* SIMULATOR MODE Panel columns */
                  <div className="grid grid-cols-12 min-h-[300px]">
                    {/* Left Column: Nav Methods */}
                    <div className="col-span-5 bg-[#171e28] border-r border-luxury-gold/5 flex flex-col font-medium text-xs select-none">
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`p-4 flex items-center gap-3 border-b border-luxury-gold/5 transition-colors text-left focus:outline-none ${
                          paymentMethod === "card" ? "bg-luxury-navy text-luxury-gold border-r-2 border-r-luxury-gold" : "text-luxury-cream/60 hover:bg-luxury-navy/40"
                        }`}
                      >
                        <FaCreditCard className="w-3.5 h-3.5 text-luxury-gold" /> Card Checkout
                      </button>
                      <button
                        onClick={() => setPaymentMethod("upi")}
                        className={`p-4 flex items-center gap-3 border-b border-luxury-gold/5 transition-colors text-left focus:outline-none ${
                          paymentMethod === "upi" ? "bg-luxury-navy text-luxury-gold border-r-2 border-r-luxury-gold" : "text-luxury-cream/60 hover:bg-luxury-navy/40"
                        }`}
                      >
                        <FaMobileAlt className="w-3.5 h-3.5 text-luxury-gold" /> UPI Express
                      </button>
                      <button
                        onClick={() => setPaymentMethod("netbanking")}
                        className={`p-4 flex items-center gap-3 border-b border-luxury-gold/5 transition-colors text-left focus:outline-none ${
                          paymentMethod === "netbanking" ? "bg-luxury-navy text-luxury-gold border-r-2 border-r-luxury-gold" : "text-luxury-cream/60 hover:bg-luxury-navy/40"
                        }`}
                      >
                        <FaUniversity className="w-3.5 h-3.5 text-luxury-gold" /> Netbanking
                      </button>
                    </div>

                    {/* Right Column: Active method Inputs */}
                    <div className="col-span-7 p-6 bg-luxury-navy/90 flex flex-col justify-between text-xs">
                      
                      {paymentMethod === "card" && (
                        <div className="flex flex-col gap-4">
                          <h4 className="font-semibold text-luxury-gold uppercase tracking-wider text-[10px]">Enter Test Card Details</h4>
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] uppercase tracking-wider text-luxury-cream/50">Card Number</label>
                              <input
                                type="text"
                                maxLength="19"
                                placeholder="1111 2222 3333 4444"
                                defaultValue="1111 2222 3333 4444"
                                className="bg-luxury-dark border border-luxury-gold/20 rounded-lg px-3 py-2 text-luxury-cream focus:outline-none focus:border-luxury-gold font-mono"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] uppercase tracking-wider text-luxury-cream/50">Expiry Date</label>
                                <input
                                  type="text"
                                  placeholder="12/28"
                                  defaultValue="12/28"
                                  className="bg-luxury-dark border border-luxury-gold/20 rounded-lg px-3 py-2 text-luxury-cream focus:outline-none focus:border-luxury-gold font-mono text-center"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] uppercase tracking-wider text-luxury-cream/50">CVV Code</label>
                                <input
                                  type="password"
                                  maxLength="3"
                                  placeholder="123"
                                  defaultValue="123"
                                  className="bg-luxury-dark border border-luxury-gold/20 rounded-lg px-3 py-2 text-luxury-cream focus:outline-none focus:border-luxury-gold font-mono text-center"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === "upi" && (
                        <div className="flex flex-col gap-4 items-center text-center">
                          <h4 className="font-semibold text-luxury-gold uppercase tracking-wider text-[10px] w-full text-left">Scan QR or enter UPI ID</h4>
                          
                          <div className="p-3 bg-white rounded-lg flex items-center justify-center border border-luxury-gold/20">
                            <FaQrcode className="w-24 h-24 text-luxury-charcoal" />
                          </div>
                          
                          <div className="flex flex-col gap-1 w-full mt-2">
                            <label className="text-[9px] uppercase tracking-wider text-luxury-cream/50 text-left">Virtual Payment Address (VPA)</label>
                            <input
                              type="text"
                              placeholder="royal.guest@upi"
                              defaultValue="royal.guest@upi"
                              className="bg-luxury-dark border border-luxury-gold/20 rounded-lg px-3 py-2 text-luxury-cream focus:outline-none focus:border-luxury-gold font-mono text-center w-full"
                            />
                          </div>
                        </div>
                      )}

                      {paymentMethod === "netbanking" && (
                        <div className="flex flex-col gap-4">
                          <h4 className="font-semibold text-luxury-gold uppercase tracking-wider text-[10px]">Select Popular Bank</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank"].map((bank, i) => (
                              <div
                                key={bank}
                                className={`p-3 rounded-lg border text-center font-medium cursor-pointer transition-colors ${
                                  i === 0 ? "border-luxury-gold bg-luxury-gold/10 text-luxury-cream" : "border-luxury-gold/10 hover:border-luxury-gold/30 bg-luxury-dark/40"
                                }`}
                              >
                                {bank}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="w-full text-center py-4 border-t border-luxury-gold/10 my-4 text-[10px] text-luxury-cream/50">
                        Simulation Mode — Click Sim Success below to instantly generate your guest stay records.
                      </div>

                      {/* Simulation checkout buttons */}
                      <div className="flex flex-col gap-2 pt-4 border-t border-luxury-gold/5">
                        <button
                          onClick={handleRazorpaySuccess}
                          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg focus:outline-none"
                        >
                          <FaCheckCircle /> Sim Success Payment
                        </button>
                        <button
                          onClick={() => {
                            setPaymentError("Simulator Surcharge Failure: Card CVV check failed. Transaction aborted.");
                          }}
                          className="w-full py-2 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-sans font-bold text-[10px] uppercase tracking-widest rounded-lg border border-red-500/20 transition-colors focus:outline-none"
                        >
                          Sim Payment Failure
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error panel */}
                {paymentError && (
                  <div className="p-4 bg-red-950/80 border-t border-red-500/30 text-red-300 text-xs flex gap-2 items-center font-sans">
                    <FaExclamationTriangle className="flex-shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Footer Security tags */}
                <div className="bg-[#131922] px-6 py-4 flex justify-between items-center text-[9px] uppercase tracking-wider text-luxury-cream/40 border-t border-luxury-gold/10">
                  <span className="flex items-center gap-1.5"><FaShieldAlt /> 256-Bit Encryption</span>
                  <span>RAZORPAY SECURE PRO</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== COMPLETED STAY VOUCHER VIEW ==================== */}
        {portalState === "voucher" && currentBookingVoucher && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full mx-auto flex flex-col gap-6"
          >
            {/* Action Bar (hidden in printing) */}
            <div className="flex justify-between items-center print:hidden">
              <span className="text-xs uppercase tracking-[0.3em] font-sans font-semibold text-green-400 flex items-center gap-2">
                <FaCheckCircle className="text-lg" /> STAY RESERVATION SECURED SUCCESSFUL
              </span>
              <button
                onClick={handlePrintVoucher}
                className="flex items-center gap-2 px-5 py-2.5 bg-luxury-gold text-luxury-charcoal font-sans font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:shadow-luxury-gold/20 hover:scale-[1.02] transition-all focus:outline-none"
              >
                <FaPrint /> Print Voucher / PDF
              </button>
            </div>

            {/* Print Container */}
            <div className="glass-panel p-8 md:p-12 rounded-3xl border-2 border-luxury-gold/30 relative flex flex-col gap-8 bg-luxury-navy/90 print:bg-white print:text-black print:border-black print:p-8 print:shadow-none shadow-2xl">
              
              {/* Gold Crest background */}
              <div className="absolute inset-0 bg-contain bg-center opacity-5 pointer-events-none print:hidden" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600')` }} />

              {/* Voucher header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b-2 border-dashed border-luxury-gold/20 print:border-black/20">
                <div>
                  <span className="text-[10px] tracking-[0.3em] text-luxury-gold font-bold uppercase print:text-black/80">Heritage Sanctuary Voucher</span>
                  <h2 className="font-serif text-3xl font-extrabold tracking-widest text-luxury-cream mt-1 uppercase print:text-black">Hotel Meghdoot</h2>
                  <p className="font-sans font-light text-[10px] text-luxury-cream/50 mt-1 print:text-black/60 leading-relaxed">
                    12, Royal Heritage Road, Udaipur, Rajasthan, 313001, India <br />
                    stay@hotelmeghdoot.com • +91 98765 43210
                  </p>
                </div>
                
                <div className="flex flex-col items-start md:items-end text-left md:text-right font-sans">
                  <span className="text-[9px] uppercase tracking-widest text-luxury-cream/50 print:text-black/60">CONFIRMATION CODE</span>
                  <span className="font-serif text-2xl font-bold tracking-widest text-luxury-gold-bright gold-text-glow mt-1 print:text-black print:text-shadow-none">
                    {currentBookingVoucher.id}
                  </span>
                  <div className="mt-1 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold rounded uppercase tracking-wider print:border-black print:text-black">
                    Guaranteed Booking
                  </div>
                </div>
              </div>

              {/* Main specifications grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
                {/* Left side: Reservation details */}
                <div className="flex flex-col gap-5">
                  <h4 className="font-serif text-sm font-bold uppercase text-luxury-gold-bright tracking-widest border-b border-luxury-gold/10 pb-1.5 print:text-black print:border-black/20">
                    Stay Specifications
                  </h4>

                  <div className="flex flex-col gap-4 text-xs font-light">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40 print:text-black/60">Primary Guest</span>
                      <p className="font-semibold text-sm mt-0.5 text-luxury-cream print:text-black">{currentBookingVoucher.guestName}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40 print:text-black/60">Suite Accommodation</span>
                      <p className="font-semibold text-sm mt-0.5 text-luxury-cream print:text-black">{currentBookingVoucher.roomType}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40 print:text-black/60">Check-In Date</span>
                        <p className="font-semibold mt-0.5 text-luxury-cream print:text-black">
                          {new Date(currentBookingVoucher.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <span className="text-[9px] text-luxury-cream/40 print:text-black/60">14:00 Hrs onwards</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40 print:text-black/60">Check-Out Date</span>
                        <p className="font-semibold mt-0.5 text-luxury-cream print:text-black">
                          {new Date(currentBookingVoucher.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <span className="text-[9px] text-luxury-cream/40 print:text-black/60">Before 12:00 Noon</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40 print:text-black/60">Nights Stayed</span>
                        <p className="font-semibold mt-0.5 text-luxury-cream print:text-black">{currentBookingVoucher.nightsCount} {currentBookingVoucher.nightsCount === 1 ? "Night" : "Nights"}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40 print:text-black/60">Royal Guests</span>
                        <p className="font-semibold mt-0.5 text-luxury-cream print:text-black">{currentBookingVoucher.guestsCount} Guest(s)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Addons, Payment and QR Code */}
                <div className="flex flex-col gap-5 justify-between">
                  <div className="flex flex-col gap-4">
                    <h4 className="font-serif text-sm font-bold uppercase text-luxury-gold-bright tracking-widest border-b border-luxury-gold/10 pb-1.5 print:text-black print:border-black/20">
                      Bespoke Inclusions
                    </h4>
                    {currentBookingVoucher.addons.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {currentBookingVoucher.addons.map((addName, i) => (
                          <span
                            key={i}
                            className="bg-luxury-gold/10 text-luxury-gold px-3 py-1 rounded text-[10px] border border-luxury-gold/20 font-semibold tracking-wide print:bg-black/5 print:text-black print:border-black/20"
                          >
                            {addName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-luxury-cream/50 italic print:text-black/55">No custom stay inclusions chosen.</p>
                    )}
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-luxury-gold/10 print:border-black/20 mt-4">
                    <div className="flex-grow text-xs font-light">
                      <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40 print:text-black/60">Payment Succeeded</span>
                      <p className="font-serif font-extrabold text-lg text-luxury-gold-bright mt-0.5 print:text-black">
                        ₹{currentBookingVoucher.totalPaid.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[9px] text-luxury-cream/40 font-mono mt-1 print:text-black/60 leading-none">
                        TXN: {currentBookingVoucher.paymentId} <br />
                        DATE: {currentBookingVoucher.dateCreated}
                      </p>
                    </div>
                    {/* Simulated High-Fidelity Verification QR */}
                    <div className="p-2.5 bg-white rounded-xl border border-luxury-gold/20 print:border-black/30 flex-shrink-0 flex items-center justify-center shadow-lg">
                      <FaQrcode className="w-16 h-16 text-luxury-charcoal" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking terms footnotes */}
              <div className="pt-6 border-t border-dashed border-luxury-gold/20 print:border-black/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[10px] font-sans font-light text-luxury-cream/40 print:text-black/50 leading-relaxed">
                <div className="max-w-md">
                  <strong>VIP Reservation Protocol:</strong> A government-issued photo ID is mandatory at check-in. Any cancellation must be coordinated 72 hours prior to arrival for full refund.
                </div>
                <div className="flex items-center gap-2 text-luxury-gold print:text-black font-semibold uppercase tracking-wider">
                  <FaShieldAlt /> VERIFIED SECURE STAY
                </div>
              </div>
            </div>

            {/* Print Footer actions */}
            <div className="flex gap-4 items-center justify-center font-sans mt-4 print:hidden">
              <button
                onClick={() => setPortalState("dashboard")}
                className="px-6 py-3 border border-luxury-gold/30 hover:border-luxury-gold rounded-full text-xs font-bold uppercase tracking-wider text-luxury-cream hover:text-luxury-gold transition-colors focus:outline-none"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => setPortalState("history")}
                className="px-6 py-3 border border-luxury-gold/30 hover:border-luxury-gold rounded-full text-xs font-bold uppercase tracking-wider text-luxury-cream hover:text-luxury-gold transition-colors focus:outline-none"
              >
                View Stay History
              </button>
              <button
                onClick={() => setView("home")}
                className="px-8 py-3 bg-luxury-gold/10 hover:bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30 hover:border-luxury-gold rounded-full text-xs font-bold uppercase tracking-widest transition-all focus:outline-none"
              >
                Return to Home Site
              </button>
            </div>
          </motion.div>
        )}

        {/* ==================== BOOKING HISTORY SUBVIEW ==================== */}
        {portalState === "history" && currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 rounded-3xl border border-luxury-gold/15 shadow-2xl flex flex-col gap-6"
          >
            {!historyUnlocked ? (
              <div className="py-16 flex flex-col items-center justify-center text-center gap-6 font-sans max-w-md mx-auto">
                <div className="text-luxury-gold animate-pulse">
                  <FaShieldAlt className="w-16 h-16 stroke-[0.3]" />
                </div>
                <h3 className="font-serif text-2xl text-luxury-cream uppercase tracking-widest mt-2">Security Verification Gate</h3>
                <p className="text-xs text-luxury-cream/70 leading-relaxed font-light">
                  Stay Booking history logs are strictly protected. To retrieve your records, please verify your session using a Dynamic Operation verification token.
                </p>

                {historyError && (
                  <div className="w-full p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-xs flex gap-2 items-center justify-center">
                    <FaExclamationTriangle className="flex-shrink-0" />
                    <span>{historyError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyHistoryOtp} className="w-full flex flex-col gap-4">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] uppercase tracking-widest text-luxury-cream/50 pl-1">Dynamic Operational Code</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={historyOtp}
                      onChange={(e) => setHistoryOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="0 0 0 0 0 0"
                      className="bg-luxury-navy border border-luxury-gold/20 focus:border-luxury-gold rounded-xl py-3.5 text-center font-mono text-xl font-bold tracking-[0.3em] text-luxury-gold-bright focus:outline-none transition-all duration-300 w-full"
                    />
                  </div>

                  <div className="flex gap-4 w-full">
                    <button
                      type="button"
                      disabled={historyRequesting}
                      onClick={handleRequestHistoryOtp}
                      className="w-1/2 py-3 rounded-xl border border-luxury-gold/30 hover:border-luxury-gold text-luxury-cream text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50 focus:outline-none"
                    >
                      {historyRequesting ? "Dispatching..." : "Send OTP"}
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-luxury-charcoal text-xs uppercase tracking-wider font-bold shadow-xl hover:shadow-luxury-gold/20 transition-all focus:outline-none"
                    >
                      Unlock Records
                    </button>
                  </div>

                  <span className="text-[10px] text-luxury-cream/40 italic">
                    *The verification passcode is dispatched via Resend email. Look at your node backend terminal console logs 
                  </span>
                </form>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center pb-4 border-b border-luxury-gold/10">
                  <div>
                    <h2 className="font-serif text-2xl uppercase tracking-wider">Stay Booking History</h2>
                    <p className="font-sans font-light text-xs text-luxury-cream/70 mt-1">
                      Manage your secured heritage stays, download PDF vouchers, and review premium custom features.
                    </p>
                  </div>
                  <button
                    onClick={() => setPortalState("dashboard")}
                    className="px-5 py-2.5 bg-luxury-gold text-luxury-charcoal font-sans font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg hover:scale-102 transition-all focus:outline-none"
                  >
                    Bespoke New Stay
                  </button>
                </div>

                {bookingsHistory.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center gap-4 font-sans">
                    <div className="text-luxury-gold/40">
                      <FaConciergeBell className="w-16 h-16 stroke-[0.3]" />
                    </div>
                    <h3 className="font-serif text-xl text-luxury-cream uppercase tracking-widest mt-2">No Bookings Found</h3>
                    <p className="text-xs text-luxury-cream/60 max-w-sm leading-relaxed font-light">
                      You have not secured any luxury reservations yet. Customize and complete a stay from your stay planner panel.
                    </p>
                    <button
                      onClick={() => setPortalState("dashboard")}
                      className="mt-4 px-6 py-2.5 border border-luxury-gold/30 hover:border-luxury-gold text-luxury-gold rounded-full text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none"
                    >
                      Configure Stay
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 font-sans">
                    {bookingsHistory.map((booking) => (
                      <div
                        key={booking.id}
                        className={`p-5 rounded-2xl border transition-all duration-300 ${
                          booking.status === "Cancelled"
                            ? "border-red-500/20 bg-red-950/20 opacity-80"
                            : "border-luxury-gold/10 hover:border-luxury-gold/30 bg-luxury-navy/40"
                        } flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}
                      >
                        <div className="flex-grow flex flex-col md:flex-row md:items-center gap-6">
                          {/* Left: Suite Type + Status Badge */}
                          <div className="w-full md:w-48 flex-shrink-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] uppercase tracking-widest text-luxury-gold font-bold">{booking.id}</span>
                              {booking.status === "Cancelled" ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[8px] font-bold uppercase tracking-widest">
                                  Cancelled
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[8px] font-bold uppercase tracking-widest">
                                  Confirmed
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif text-base font-bold text-luxury-cream mt-0.5">{booking.roomType}</h4>
                            <p className="text-[11px] text-luxury-cream/50 mt-1 font-light leading-none">
                              Secured: {booking.dateCreated}
                            </p>
                          </div>

                          {/* Middle: Stay dates */}
                          <div className="grid grid-cols-2 gap-4 text-xs font-light">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40">Check-In</span>
                              <p className="font-semibold text-luxury-cream mt-0.5">
                                {new Date(booking.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40">Check-Out</span>
                              <p className="font-semibold text-luxury-cream mt-0.5">
                                {new Date(booking.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                          </div>

                          {/* Add-ons */}
                          <div className="hidden lg:flex flex-col max-w-[200px]">
                            <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40">Custom Inclusions</span>
                            <p className="text-[11px] text-luxury-cream/80 truncate mt-0.5 font-light" title={booking.addons.join(", ") || "None"}>
                              {booking.addons.join(", ") || "No add-ons selected"}
                            </p>
                          </div>
                        </div>

                        {/* Right: Payment details + refund + actions */}
                        <div className="w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end gap-3 flex-shrink-0 pt-4 md:pt-0 border-t border-luxury-gold/5 md:border-none">
                          <div className="text-left md:text-right">
                            <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40">Amount Paid</span>
                            <p className={`font-serif font-extrabold text-base mt-0.5 ${booking.status === "Cancelled" ? "text-luxury-cream/40 line-through" : "text-luxury-gold-bright"}`}>
                              ₹{booking.totalPaid.toLocaleString("en-IN")}
                            </p>
                            {/* Refund display when cancelled */}
                            {booking.status === "Cancelled" && (
                              <div className="mt-1">
                                <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40">Refund</span>
                                <p className={`font-serif font-extrabold text-sm mt-0.5 ${booking.refundAmount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                                  {booking.refundAmount > 0
                                    ? `₹${booking.refundAmount.toLocaleString("en-IN")}`
                                    : "No Refund"}
                                </p>
                                {booking.refundLabel && (
                                  <p className="text-[9px] text-luxury-cream/30 font-sans mt-0.5">{booking.refundLabel}</p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 items-end">
                            {booking.status !== "Cancelled" && (
                              <button
                                onClick={() => {
                                  setCurrentBookingVoucher(booking);
                                  setPortalState("voucher");
                                }}
                                className="px-4 py-2 bg-luxury-gold/10 hover:bg-luxury-gold text-luxury-gold hover:text-luxury-charcoal border border-luxury-gold/30 hover:border-luxury-gold rounded-xl font-bold text-xs uppercase tracking-wider transition-all focus:outline-none"
                              >
                                Open Voucher
                              </button>
                            )}
                            {booking.status !== "Cancelled" && (() => {
                              const refund = getRefundInfo(booking.checkIn, booking.totalPaid);
                              return (
                                <button
                                  onClick={() => setCancelModal({ booking })}
                                  className="px-4 py-2 bg-red-500/8 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-xl font-bold text-xs uppercase tracking-wider transition-all focus:outline-none flex items-center gap-1.5"
                                >
                                  <FaTimes className="w-2.5 h-2.5" />
                                  Cancel
                                  <span className={`text-[9px] font-normal ${refund.color}`}>
                                    ({refund.pct}%)
                                  </span>
                                </button>
                              );
                            })()}
                            {booking.status === "Cancelled" && (
                              <span className="text-[10px] text-red-400/50 font-sans italic">Booking cancelled</span>
                            )}
                          </div>
                        </div>
                      </div>

                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const BookingPortalWrapper = (props) => {
  const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || "1090730602636-g8ocmt26a3h6q8oitepmk3vcuk0t05oc.apps.googleusercontent.com";
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <BookingPortal {...props} />
    </GoogleOAuthProvider>
  );
};

export default BookingPortalWrapper;
