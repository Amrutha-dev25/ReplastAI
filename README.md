<div align="center">

# ♻️ ReplastAI

### AI-Powered Plastic Circular Economy Platform

**An intelligent marketplace that leverages Artificial Intelligence and Computer Vision to streamline plastic waste collection, classification, procurement, and recycling—enabling a smarter circular economy.**

<br>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io)
![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge)

</div>

---

# 📖 Overview

ReplastAI is an end-to-end AI-powered platform designed to bridge the gap between plastic contributors and recyclers. The system combines a digital marketplace, computer vision, procurement management, real-time communication, and sustainability analytics into one unified platform.

---

# ✨ Features

| Module | Description |
|---------|-------------|
| 🔐 Authentication | Secure JWT authentication with role-based authorization |
| ♻ Marketplace | Plastic listing, search, filters, image upload and management |
| 🤖 AI Classification | Automatic plastic type prediction using a pretrained Computer Vision model |
| 📦 Procurement | Buyer–seller workflow with live order tracking |
| 💬 Chat | Real-time communication using Socket.IO |
| 🔔 Notifications | Order updates, procurement requests and chat notifications |
| 📊 Dashboard | Revenue, plastic traded, CO₂ saved and analytics |
| 🧠 AI Assistant | Google Gemini powered recycling assistant |

---

# 🏛 System Architecture

```mermaid
flowchart LR

A["React Frontend"]
B["Express Backend"]
C["MongoDB Atlas"]
D["FastAPI ML Service"]
E["Google Gemini"]

A -->|REST APIs| B
A -->|Realtime| B

B --> C
B -->|Multipart Image| D
D -->|Prediction| B
B -->|AI Context| E

E --> A
```

---

# 🔄 Complete Workflow

```mermaid
flowchart TD

A[Register/Login]
B[Upload Plastic]
C[Cloudinary Upload]
D[AI Classification]
E[Prediction Saved]
F[Listing Published]
G[Marketplace]
H[Buyer Requests Procurement]
I[Seller Accepts]
J[Order Created]
K[Live Chat]
L[Order Tracking]
M[Delivered]
N[Analytics Updated]

A --> B
B --> C
C --> D
D --> E
E --> F
F --> G
G --> H
H --> I
I --> J
J --> K
K --> L
L --> M
M --> N
```

---

# 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Authentication | JWT |
| AI Service | FastAPI + Transformers |
| Computer Vision | PyTorch + OpenCV + Pillow |
| AI Assistant | Google Gemini |
| Image Storage | Cloudinary |
| Realtime | Socket.IO |

---

# 📂 Project Structure

```text
ReplastAI
│
├── src/                  React Frontend
├── server/               Express Backend
├── ml-service/           FastAPI ML Service
├── public/
├── package.json
├── server.ts
├── tsconfig.json
└── README.md
```

---

# ⚙ Installation

```bash
git clone https://github.com/your-username/ReplastAI.git

cd ReplastAI

npm install

npm run dev
```

---

## ML Service

```bash
cd ml-service

pip install -r requirements.txt

uvicorn main:app --reload
```

---

# 🔑 Environment Variables

Create a `.env` file.

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

# 📊 Sustainability Metrics

ReplastAI estimates environmental impact using the approximation:

> **1 kg of recycled plastic ≈ 1.5 kg of CO₂ emissions avoided**

This value is used for dashboard analytics and sustainability reporting.

---

# 🚀 Future Enhancements

- Fine-tuned Plastic Classification Model
- IoT Smart Bin Integration
- Blockchain Traceability
- Mobile Application
- Carbon Credit Marketplace

---

<div align="center">

### 👨‍💻 Developed by

**Amrutha Kattimani**

**ReplastAI — AI-Powered Plastic Circular Economy Platform**

⭐ If you found this project useful, consider giving it a star!

</div>