# National Footwear — Production Deployment Guide
## Complete Setup for Multi-Brand Footwear E-Commerce

---

## 📁 PROJECT STRUCTURE

```
paaduka/
├── frontend/           ← This HTML/CSS/JS (deploy to Vercel/Netlify)
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── products.js     ← Replace with API calls in production
│
├── backend/            ← Node.js + Express API
│   ├── server.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── payments.js
│   ├── models/
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── User.js
│   ├── middleware/
│   └── .env
│
└── admin/              ← Admin dashboard (optional)
```

---

## 🗄️ DATABASE SETUP

### Option 1: MongoDB Atlas (Recommended for India)
- Free tier: 512MB (good for ~10,000 products)
- URL: https://www.mongodb.com/atlas
- Region: AWS Mumbai (ap-south-1)

**Product Schema:**
```js
const ProductSchema = new mongoose.Schema({
  name: String,
  category: { type: String, enum: ['men','women','kids'] },
  price: Number,
  originalPrice: Number,
  images: [{
    colorName: String,
    colorHex: String,
    urls: [String]   // Cloudinary URLs
  }],
  sizes: [Number],
  unavailableSizes: [Number],
  description: String,
  rating: Number,
  reviewCount: Number,
  inStock: Boolean,
  badge: String
}, { timestamps: true });
```

### Option 2: PostgreSQL on Supabase
- Free tier available
- Better for complex queries / reports
- URL: https://supabase.com

---

## 🖼️ IMAGE STORAGE

### Cloudinary (Best for India, free tier: 25GB)
1. Sign up: https://cloudinary.com
2. Upload images via API or Dashboard
3. Store the public_id/URL in MongoDB

**Setup:**
```bash
npm install cloudinary multer multer-storage-cloudinary
```

```js
// cloudinary.config.js
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

---

## 💳 PAYMENT GATEWAY INTEGRATION

### Razorpay (Best for India — supports all your required methods)
- Supports: UPI, Cards (Visa/MC/RuPay), Net Banking, QR Code, Wallets
- Charges: 2% per transaction (no monthly fee)
- Settlement: T+2 days
- Dashboard: https://dashboard.razorpay.com

**Installation:**
```bash
npm install razorpay
```

**Backend (server.js):**
```js
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
app.post('/api/payment/create-order', async (req, res) => {
  const { amount } = req.body; // in paise (₹1 = 100 paise)
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt: 'rcpt_' + Date.now(),
    payment_capture: 1
  });
  res.json({ orderId: order.id, amount: order.amount });
});

// Verify Payment
const crypto = require('crypto');
app.post('/api/payment/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const sign = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign).digest('hex');
  if (expected === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
});
```

**Frontend Integration (replace confirmOrder function):**
```js
async function confirmOrder() {
  // 1. Create Razorpay order
  const res = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: grandTotal })
  });
  const { orderId, amount } = await res.json();

  // 2. Open Razorpay checkout
  const options = {
    key: 'YOUR_RAZORPAY_KEY_ID',
    amount: amount,
    currency: 'INR',
    name: 'National Footwear',
    description: 'Premium Footwear Store',
    image: '/logo.png',
    order_id: orderId,
    prefill: {
      name: document.getElementById('cName').value,
      email: document.getElementById('cEmail').value,
      contact: document.getElementById('cPhone').value,
    },
    theme: { color: '#FF6B00' },
    handler: async (response) => {
      // 3. Verify on backend
      const verify = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      });
      const { success } = await verify.json();
      if (success) showOrderConfirmation();
    }
  };
  const rzp = new Razorpay(options);
  rzp.open();
}
```

Add to HTML head:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## 🚀 HOSTING OPTIONS

### Frontend Hosting

| Platform | Cost | Speed | Best For |
|----------|------|-------|----------|
| **Vercel** (Recommended) | Free | Very Fast | Static + API Routes |
| **Netlify** | Free | Fast | Static Sites |
| **Cloudflare Pages** | Free | Fastest | Global CDN |

**Deploy to Vercel:**
```bash
npm install -g vercel
vercel --prod
```

### Backend Hosting

| Platform | Cost | vCPU | RAM | Best For |
|----------|------|------|-----|---------|
| **Railway** (Recommended) | ₹400–800/mo | 2 | 512MB | Node.js API |
| **Render** | Free–$7/mo | 0.1 | 512MB | Small apps |
| **DigitalOcean App Platform** | $12/mo | 1 | 512MB | Production |
| **AWS EC2 (t2.micro)** | ~₹700/mo | 1 | 1GB | Full control |

### Best Production Stack for India:
```
Frontend: Vercel (free) + Cloudflare CDN (free)
Backend: Railway (₹500/mo) OR DigitalOcean ($12/mo)
Database: MongoDB Atlas (free tier → M10 at ₹1500/mo)
Images: Cloudinary (free 25GB → Pro at ₹800/mo)
Payments: Razorpay (2% per txn, no monthly fee)
Domain: GoDaddy / BigRock (~₹800/year)
SSL: Free via Let's Encrypt (auto on Vercel/Railway)
Email: SendGrid (free 100/day) or Mailgun
SMS OTP: Twilio / MSG91 (~₹0.10 per SMS)
```

**Estimated Monthly Cost (Small Scale):**
- Traffic: 1000 visitors/day
- Orders: 50/day
- Total: **₹2,500–4,000/month**

---

## 📦 BACKEND API ROUTES

```
GET    /api/products            → All products
GET    /api/products?cat=men    → Filter by category
GET    /api/products/:id        → Single product
POST   /api/products            → Add product (admin)
PUT    /api/products/:id        → Update product (admin)

POST   /api/orders              → Create order
GET    /api/orders/:id          → Track order

POST   /api/payment/create-order → Create Razorpay order
POST   /api/payment/verify       → Verify payment

POST   /api/auth/login          → User login
POST   /api/auth/register       → User register
POST   /api/auth/otp            → OTP verification
```

---

## 📧 NOTIFICATIONS

### Order Confirmation SMS (MSG91):
```js
const sendSMS = async (mobile, orderId, total) => {
  await fetch('https://api.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: { 'authkey': process.env.MSG91_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template_id: 'YOUR_TEMPLATE_ID',
      recipients: [{ mobiles: '91' + mobile,
        orderId, amount: total }]
    })
  });
};
```

### Email (SendGrid):
```bash
npm install @sendgrid/mail
```
```js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
await sgMail.send({
  to: customerEmail,
  from: 'orders@nationalfootwear.in',
  subject: `Order Confirmed — ${orderId}`,
  html: orderEmailTemplate(order)
});
```

---

## 🔐 ENVIRONMENT VARIABLES (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/paaduka
JWT_SECRET=your_super_secret_key_here
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
SENDGRID_API_KEY=SG.xxxxx
MSG91_KEY=your_msg91_key
FRONTEND_URL=https://paaduka.vercel.app
```

---

## 📱 ADDITIONAL FEATURES TO ADD

1. **OTP Login** — Aadhaar-linked mobile OTP via MSG91
2. **Address Autocomplete** — Google Maps Places API
3. **COD (Cash on Delivery)** — Very popular in India, add as payment method
4. **Pincode Serviceability** — Check delivery to customer's PIN via Shiprocket API
5. **Product Reviews** — Allow customers to upload photos
6. **Size Recommendation AI** — Prompt Claude API with foot measurement
7. **WhatsApp Order Notifications** — Twilio WhatsApp API
8. **Loyalty Points / Rewards** — Track in MongoDB
9. **Admin Dashboard** — React admin panel
10. **GST Invoice** — Auto-generate PDF invoice with GST (18% footwear ≤₹1000: 5%)

---

## 🚢 SHIPPING INTEGRATION

### Shiprocket (Best for India):
```bash
npm install axios
```
```js
// After order confirmed:
const shipOrder = async (order) => {
  const token = await getShiprocketToken();
  await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
    order_id: order.id,
    order_date: new Date().toISOString(),
    billing_customer_name: order.name,
    billing_address: order.address,
    billing_city: order.city,
    billing_pincode: order.pin,
    billing_state: order.state,
    billing_email: order.email,
    billing_phone: order.phone,
    order_items: order.items.map(i => ({
      name: i.name, sku: i.id, units: i.qty, selling_price: i.price
    })),
    payment_method: 'Prepaid',
    sub_total: order.total,
    length: 25, breadth: 20, height: 10, weight: 0.5
  }, { headers: { Authorization: `Bearer ${token}` } });
};
```

---

## ✅ GO-LIVE CHECKLIST

- [ ] Register business (GST registration if turnover > ₹20L)
- [ ] Open current account (Razorpay needs it for payouts)
- [ ] Upload product photos (minimum 4 per product, 1000×1000px)
- [ ] Set up MongoDB Atlas with proper indexes
- [ ] Configure Cloudinary transforms (auto WebP, resize on-the-fly)
- [ ] Test all payment methods in Razorpay sandbox
- [ ] Set up Shiprocket account and test shipping
- [ ] Configure SendGrid domain authentication
- [ ] Set up SSL certificate (auto on Vercel)
- [ ] Test on mobile (60%+ Indian traffic is mobile)
- [ ] Add Google Analytics + Meta Pixel for ads
- [ ] Set up Google Search Console for SEO
- [ ] Test site on slow 3G (most Indian rural users)
- [ ] Enable PWA for app-like experience
- [ ] Load test with k6 or Artillery

---

*Built with ❤️ for National Footwear artisans and footwear lovers.*
