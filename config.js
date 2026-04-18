// ============================================================
//  NATIONAL FOOTWEAR — Central Configuration
//  Change the brand name, contact details, and Firebase config here
// ============================================================

const BRAND = {
  name: "National Agencies",
  shortName: "National",
  tagline: "Walk With Pride",
  subTagline: "India's Premium Multi-Brand Footwear Store",
  phone: "+91 79040 42547",
  email: "info@nationalfootwear.in",
  address: "5/3, Harijan Colony, UTHAMAPLAYAM, THENI - 625533",
  gst: "GSTIN-24AAAAA0000A1Z5",
  upi: "nationalfootwear@ybl",
  whatsapp: "917904042547",
  founded: "1995",
  freeDeliveryAbove: 499,
  deliveryDays: 5,
  returnDays: 30,

  // Social Media
  social: {
    facebook: "#",
    instagram: "#",
    youtube: "#",
    twitter: "#"
  },

  // Wholesale Settings
  wholesale: {
    discountPercent: 25,   // % below retail price for wholesale customers
    minOrderValue: 5000,   // Minimum wholesale order value in ₹
    password: "NATIONAL_WS_2025"
  }
};

// ============================================================
//  FIREBASE CONFIGURATION
//  Replace these values with your Firebase project credentials
//  from https://console.firebase.google.com
// ============================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDOIQAA7X1aWx7hLQvDT1dwNZ3F0a5sn9U",
  authDomain: "national-footwear.firebaseapp.com",
  projectId: "national-footwear",
  storageBucket: "national-footwear.firebasestorage.app",
  messagingSenderId: "506367413362",
  appId: "1:506367413362:web:0e199c3a76ee4568ab86eb",
  databaseURL: "https://national-footwear-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const RAZORPAY_KEY_ID = "rzp_test_YOUR_KEY_HERE"; // Replace with live key from Razorpay dashboard

// ============================================================
//  BRANDS DISPLAYED IN HOMEPAGE BANNER
//  Add/remove brands as you stock them
// ============================================================

const FEATURED_BRANDS = [
  { name: "Walkaroo", logo: "images/walkaroo.jpg" },
  { name: "Bata", logo: "images/bata.jpg" },
  { name: "Paragon", logo: "images/paragon.png" },
  { name: "VKC", logo: "images/VKC.png" },
  { name: "Liberty", logo: "images/liberty.png" },
  { name: "Campus", logo: "images/campus.png" }
];

// ============================================================
//  SKU CATEGORY CODES
// ============================================================

const SKU_CODES = {
  men: "M",
  women: "W",
  kids: "K"
};
