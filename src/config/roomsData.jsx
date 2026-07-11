import React from "react";
import {
  FaWifi, FaTv, FaWind, FaCoffee, FaGlassMartiniAlt, FaShieldAlt
} from "react-icons/fa";

// ─── Cancellation Policy (shared across all rooms) ───────────────────────────
export const CANCELLATION_POLICY = [
  {
    days: "7+ days before check-in",
    refund: "100% Full Refund",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: "✅"
  },
  {
    days: "3–6 days before check-in",
    refund: "50% Partial Refund",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: "⚠️"
  },
  {
    days: "1–2 days before check-in",
    refund: "25% Partial Refund",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    icon: "⚠️"
  },
  {
    days: "Less than 24 hours",
    refund: "No Refund",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    icon: "❌"
  }
];

// ─── Room Data ────────────────────────────────────────────────────────────────
export const rooms = [
  {
    id: "deluxe",
    name: "Deluxe Room",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800&auto=format&fit=crop",
    ],
    price: "₹4,999",
    priceNum: 4999,
    size: "320 sq ft",
    view: "City View",
    floor: "2nd – 4th Floor",
    maxGuests: 2,
    bedType: "1 Queen Bed (180×200 cm)",
    description: "Elegant layout styled with warm luxury finishes. Features a queen-size bed, private vanity desk, and modern ambient lighting.",
    tagline: "Your perfect city escape — modern, warm, and indulgent.",
    facilities: [
      { icon: <FaWifi />, label: "Free Wi-Fi (100 Mbps)" },
      { icon: <FaWind />, label: "Air Conditioning" },
      { icon: <FaTv />, label: "43\" 4K Smart TV" },
      { icon: <FaShieldAlt />, label: "Digital In-Room Safe" },
    ],
    inclusions: [
      "1 Queen pillow-top bed with premium 400-thread linen",
      "En-suite bathroom with power rain shower",
      "City-facing window with motorized blackout curtains",
      "43\" 4K Smart TV with OTT streaming (Netflix, Prime)",
      "High-speed 100 Mbps dedicated Wi-Fi",
      "Daily turndown & housekeeping service",
      "24/7 in-room dining service",
      "Complimentary welcome fruit platter",
      "Digital safe and direct-dial phone",
      "Vanity desk & ergonomic work chair",
    ],
    notIncluded: [
      "Breakfast (available as add-on)",
      "Airport transfer (available as add-on)",
      "Mini bar",
    ],
    tag: "Best Value"
  },
  {
    id: "super-deluxe",
    name: "Super Deluxe Room",
    image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=800&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop",
    ],
    price: "₹6,999",
    priceNum: 6999,
    size: "450 sq ft",
    view: "Garden View",
    floor: "3rd – 6th Floor",
    maxGuests: 2,
    bedType: "1 King Bed (200×210 cm)",
    description: "Expanded spaces featuring handcrafted furniture, king-size pillow-top mattress, luxury chaise longue, and a marble bath oasis.",
    tagline: "A spacious retreat with a lush garden view and a marble sanctuary.",
    facilities: [
      { icon: <FaWifi />, label: "Free Wi-Fi (100 Mbps)" },
      { icon: <FaWind />, label: "Air Conditioning" },
      { icon: <FaTv />, label: "55\" 4K Smart TV" },
      { icon: <FaCoffee />, label: "Tea/Coffee Maker" },
      { icon: <FaShieldAlt />, label: "Digital Safe" },
    ],
    inclusions: [
      "1 King ultra-plush bed with 600-thread Egyptian cotton linen",
      "Marble en-suite bathroom with rainfall shower + soaking bathtub",
      "Private garden-view balcony with outdoor seating",
      "55\" 4K Smart TV with premium OTT suite",
      "Tea & Coffee maker with premium blends",
      "Mini-fridge stocked on arrival",
      "Dedicated workspace with ergonomic leather chair",
      "Daily turndown service with pillow chocolates",
      "24/7 room dining & butler call service",
      "Luxury Molton Brown bath amenities",
    ],
    notIncluded: [
      "Breakfast (available as add-on)",
      "Airport transfer (available as add-on)",
    ],
    tag: "Most Popular"
  },
  {
    id: "family-suite",
    name: "Family Suite",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop",
    ],
    price: "₹9,999",
    priceNum: 9999,
    size: "680 sq ft",
    view: "Pool View",
    floor: "4th – 7th Floor",
    maxGuests: 4,
    bedType: "1 King + 2 Single Beds (connected rooms)",
    description: "Tailor-made sanctuary for family comfort. Includes two connected master bedrooms, a private dining alcove, and a spacious terrace.",
    tagline: "Two connected bedrooms, a pool-view terrace, and memories that last a lifetime.",
    facilities: [
      { icon: <FaWifi />, label: "Free Wi-Fi (200 Mbps)" },
      { icon: <FaWind />, label: "Air Conditioning" },
      { icon: <FaTv />, label: "Dual Smart TVs" },
      { icon: <FaCoffee />, label: "Tea/Coffee Maker" },
      { icon: <FaGlassMartiniAlt />, label: "Mini Bar" },
      { icon: <FaShieldAlt />, label: "Digital Safe" },
    ],
    inclusions: [
      "2 connected bedrooms: 1 King + 1 twin room (2 Singles)",
      "Spacious living room with sofa & private dining table",
      "Pool-view private terrace with sun loungers",
      "Two full marble bathrooms with dual rainfall showers",
      "Dual 55\" 4K Smart TVs in both bedrooms",
      "Premium stocked mini bar (replenished daily)",
      "Dedicated family concierge service",
      "Kids welcome amenity pack (toys, nightlights, child menu)",
      "Daily butler-served breakfast tray on terrace (1x complimentary)",
      "Interconnecting door with private deadbolt locks",
    ],
    notIncluded: [
      "Airport transfer (available as add-on)",
      "Spa treatment (available as add-on)",
    ],
    tag: "Families & Groups"
  },
  {
    id: "premium-suite",
    name: "Premium Royal Suite",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop",
    ],
    price: "₹14,999",
    priceNum: 14999,
    size: "950 sq ft",
    view: "Mountain View",
    floor: "8th – Penthouse",
    maxGuests: 2,
    bedType: "1 Royal King Bed (handcrafted heritage frame)",
    description: "The pinnacle of royal indulgence. Sweeping floor-to-ceiling glass layout, standalone jacuzzi bath, dedicated butler service, and private lounge.",
    tagline: "The pinnacle of royal heritage living — floor-to-ceiling grandeur with 24/7 butler service.",
    facilities: [
      { icon: <FaWifi />, label: "Free Wi-Fi (500 Mbps)" },
      { icon: <FaWind />, label: "Climate Control" },
      { icon: <FaTv />, label: "75\" 8K Smart TV" },
      { icon: <FaCoffee />, label: "Espresso Machine" },
      { icon: <FaGlassMartiniAlt />, label: "Premium Bar" },
      { icon: <FaShieldAlt />, label: "24/7 Concierge" },
    ],
    inclusions: [
      "Handcrafted royal king bed with 800-thread silk-blend linen",
      "Standalone soaking jacuzzi tub + steam rain shower",
      "Floor-to-ceiling panoramic mountain-view windows",
      "Dedicated 24/7 personal butler service",
      "Private lounge with bespoke handwoven rugs",
      "Premium curated bar (stocked with vintage wine & spirits)",
      "75\" 8K Smart TV with surround sound system",
      "Complimentary airport limousine transfer (both ways)",
      "Champagne welcome upon arrival",
      "Daily gourmet breakfast in private dining room (included)",
      "Complimentary in-suite spa treatment (1x per stay)",
    ],
    notIncluded: [
      "Additional spa treatments (available as add-on)",
    ],
    tag: "Pinnacle of Luxury"
  },
];
