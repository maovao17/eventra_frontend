# Eventra Frontend

Eventra Frontend is a modern web application built with Next.js that allows users to plan events, connect with vendors, chat in real time, and make secure payments.

---

# Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Firebase (Auth + Firestore)
- Razorpay (Checkout UI)
- WebSockets

---

# Features

## Authentication

- Phone OTP login
- Google Sign-In
- Role-based routing

## Customer

- Create events
- Add services
- Discover vendors
- Send requests
- Chat with vendors
- Make payments

## Vendor

- Manage requests
- Accept or reject bookings
- Chat with customers
- Upload completion proof
- Track payouts

## Chat System

- Built using Firebase Firestore
- Real-time messaging
- Secured via Firestore rules
- Only participants can access chat

## Payments

- Razorpay checkout integration
- Backend verification ensures security

---

# Setup

## 1. Clone Repository

```bash
git clone https://github.com/your-username/eventra-frontend.git
cd eventra-frontend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 4. Run App

```bash
npm run dev
```

---

# Firebase Setup

## Authentication

Enable:

- Phone Authentication
- Google Sign-In

## Firestore

- Create Firestore Database
- Select:
  - Standard edition
  - Region: `asia-south1` (Mumbai)
  - Production mode

## Firestore Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /chats/{chatId} {
      allow read, update: if request.auth != null &&
        request.auth.uid in resource.data.participantIds;

      allow create: if request.auth != null &&
        request.auth.uid in request.resource.data.participantIds;
    }

    match /chats/{chatId}/messages/{messageId} {
      allow read: if request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participantIds;

      allow create: if request.auth != null &&
        request.resource.data.senderId == request.auth.uid;

      allow update, delete: if false;
    }
  }
}
```

---

# Realtime Updates

- Uses WebSockets for live updates
- Uses Firebase Firestore for chat

---

# Notes

- Backend handles all critical logic
- Frontend interacts with backend APIs for protected operations
- Chat is secured using Firestore rules
