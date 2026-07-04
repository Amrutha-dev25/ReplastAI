<div align="center">

# ♻️ ReplastAI
### AI-Powered Plastic Circular Economy Platform

Transforming plastic waste management through Artificial Intelligence, Computer Vision, and a Circular Marketplace.

![Banner](https://ai.google.dev/static/site-assets/images/share-ais-513315318.png)

![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![FastAPI](https://img.shields.io/badge/FastAPI-ML_Service-teal)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Gemini](https://img.shields.io/badge/AI-Gemini-orange)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Upload-blueviolet)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-black)

</div>

---

# 📌 Overview

ReplastAI is an **AI-powered Plastic Circular Economy Platform** designed to connect **Plastic Contributors (Sellers)** and **Innovators/Recyclers (Buyers)** through an intelligent marketplace.

The platform combines:

- ♻️ Plastic Marketplace
- 🤖 AI Plastic Classification
- 💬 Real-Time Communication
- 📦 Procurement Workflow
- 📊 Sustainability Analytics
- 🧠 AI Recycling Assistant

to promote efficient plastic recycling and sustainable waste management.

---

# 🚀 Key Features

## 🔐 Authentication

- User Registration
- Login
- JWT Authentication
- Role-based Authorization
- Refresh Token
- Password Reset (Stub)

---

## ♻️ Marketplace

- Create Listings
- Update Listings
- Delete Listings
- Search
- Filters
- Sorting
- Pagination
- Listing Details
- Cloudinary Image Upload

---

## 🤖 AI Plastic Classification

- Upload Plastic Image
- Automatic Classification
- Confidence Score
- Plastic Condition
- Recyclability Information
- Stored with Listing

> Uses a **pretrained Computer Vision model** through a dedicated FastAPI microservice.

---

## 📦 Procurement Workflow

Buyer Workflow

```
Browse Listing
      ↓
Create Request
      ↓
Seller Accepts
      ↓
Order Created
      ↓
Packed
      ↓
Dispatched
      ↓
Delivered
      ↓
Completed
```

---

## 💬 Real-Time Chat

- Socket.IO
- Persistent MongoDB Storage
- Order-specific Chat Rooms

---

## 🔔 Notifications

- Procurement Requests
- Order Status Updates
- Chat Notifications
- Unread Count

---

## 📊 Sustainability Dashboard

- Plastic Traded
- Revenue
- Orders
- CO₂ Saved
- Plastic Distribution

CO₂ calculation:

```
1 kg recycled plastic ≈ 1.5 kg CO₂ emissions avoided
```

---

## 🧠 AI Recycling Assistant

Powered by **Google Gemini**

Supports:

- Plastic Identification
- Recycling Advice
- Marketplace Guidance
- Sustainability Queries
- Image + Text Questions

---

# 🏗 System Architecture

```text
                   ┌──────────────────────┐
                   │      React Frontend  │
                   │   (Vite + TypeScript)│
                   └──────────┬───────────┘
                              │ REST APIs
                              ▼
                ┌────────────────────────────┐
                │      Express Backend       │
                │ Authentication             │
                │ Marketplace                │
                │ Orders                     │
                │ Chat APIs                  │
                │ Notifications              │
                │ Analytics                  │
                └───────┬─────────┬──────────┘
                        │         │
          MongoDB       │         │ HTTP
                        ▼         ▼
              ┌────────────┐   ┌───────────────────┐
              │ MongoDB    │   │ FastAPI ML Service│
              │ Users      │   │ Pretrained CV     │
              │ Listings   │   │ Image Processing  │
              │ Orders     │   │ Prediction API    │
              │ Messages   │   └─────────┬─────────┘
              │ Notifications│            │
              └────────────┘             ▼
                                  AI Prediction
                           Plastic Type + Confidence

                        │
                        ▼

                 Google Gemini API

      Plastic Recycling Assistant & AI Guidance
```

---

# 🗂 Project Structure

```text
REPLAST-AI/

├── src/                  # React Frontend
├── server/               # Express Backend
├── ml-service/           # FastAPI AI Service
├── public/
├── package.json
├── server.ts
└── README.md
```

---

# 🛠 Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- JWT
- Socket.IO
- Multer

### Database

- MongoDB
- Mongoose

### AI

- FastAPI
- PyTorch
- Transformers
- OpenCV
- Pillow
- Google Gemini API

### Cloud

- Cloudinary
- MongoDB Atlas

---

# 🔄 Complete Workflow

```
Contributor

Register
     ↓
Upload Plastic
     ↓
Cloudinary Upload
     ↓
AI Classification
     ↓
Prediction Saved
     ↓
Listing Published

                ↓

Marketplace

                ↓

Innovator

Browse Listing
     ↓
Request Procurement
     ↓
Seller Accepts
     ↓
Order Created
     ↓
Live Chat
     ↓
Notifications
     ↓
Order Tracking
     ↓
Delivered
     ↓
Completed

                ↓

Dashboard Updates
Analytics Updated
CO₂ Saved Updated
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/<username>/Replast-AI.git

cd Replast-AI
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

Create a `.env` file in the project root.

```env
MONGO_URI=

JWT_SECRET=

GEMINI_API_KEY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

ML_SERVICE_URL=http://localhost:8000
```

---

## Start Backend & Frontend

```bash
npm run dev
```

---

## Start ML Service

```bash
cd ml-service

pip install -r requirements.txt

uvicorn main:app --reload
```

---

# 📊 Future Enhancements

- Fine-tuned Plastic Classification Model
- Barcode & QR-based Waste Tracking
- IoT Smart Bin Integration
- Blockchain Material Traceability
- Carbon Credit Marketplace
- Push Notifications
- Mobile Application

---

# 👨‍💻 Developed By

Amrutha Kattimani

**ReplastAI — AI-Powered Plastic Circular Economy Platform**

---

## ⭐ If you found this project useful, consider giving it a star!