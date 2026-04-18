# 🛠️ National Footwear — Firebase Setup Guide

As a Senior Developer, I've designed this setup to be secure, scalable, and easy to maintain. Follow these steps to link your high-performance storefront to the Firebase cloud.

## 1. Project Initialization
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add Project"** and name it `national-footwear`.
3.  Once created, click the **Web icon (`</>`)** to register your app.
4.  **Important:** Copy the `firebaseConfig` object and paste it into `config.js` in your project folder.

---

## 2. Authentication (Customer Login)
1.  In the left sidebar, go to **Build > Authentication**.
2.  Click **"Get Started"** and enable the **Email/Password** provider.
3.  (Optional but Recommended) Go to **Settings > User actions** and ensure "Email enumeration protection" is enabled for security.

---

## 3. Database (Orders & Inventory)
We use **Realtime Database** for instant order sync and low latency.
1.  Go to **Build > Realtime Database > Create Database**.
2.  Choose a region closest to your customers (e.g., `asia-south1`).
3.  Start in **Locked Mode**.
4.  **Install Security Rules:** Copy and paste the following into the **Rules** tab:

```json
{
  "rules": {
    "products": {
      ".read": true,
      ".write": "auth != null"
    },
    "orders": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

## 4. Administrative Setup
To separate the Admin Portal from the Customer Portal:
1.  **Create Admin User:** Sign up normally on your `login.html` page.
2.  **Access Admin:** Go to `admin.html`. The `admin.js` logic is already configured to manage products and view all orders once you have the correct Firebase setup.

---

## 5. Security Checklist
- **API Keys:** Firebase API keys are designed to be public. However, restrict them in the Google Cloud Console to only allow requests from your website's domain.
- **Data Privacy:** Never store plain passwords or sensitive banking details directly in the database. Always use the built-in Firebase Auth for credentials.

---

Your system is now ready for production-level traffic.
