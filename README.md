# 🛒 RecoverCart — Autonomous AI Agent for Cart Abandonment Recovery

> Razorpay AI Builder Internship 2026 · Track 1: AI Growth & Agentic Commerce

---

## 🎯 The Problem

Over 70% of online shopping carts are abandoned before checkout — costing merchants billions in lost revenue every year. Existing solutions rely on generic, static email blasts that customers immediately ignore.

RecoverCart deploys an autonomous AI agent that:
- Diagnoses the real reason a cart was abandoned (Price Sensitivity, Indecision, Distraction, or Unclear Value)
- Generates a hyper-personalized recovery email tailored to the specific customer and their exact items
- Offers bounded, AI-recommended discounts (strictly capped at 0–15%) to protect merchant margins
- Converts the customer back to a sale through integrated Razorpay Checkout
- Tracks every recovery with live merchant dashboard metrics

---

## 🚀 Live Demo Flow

1. Sign Up / Log In — Register as a customer with name, email, and password
2. Add items to cart — Browse 20 products with matching high-resolution images
3. Abandon the cart — Click "Leave without paying" to simulate abandonment
4. AI generates recovery — Groq LLM diagnoses reason & writes personalized email
5. View audit trail — See the full raw AI reasoning behind every decision
6. Customer pays — Razorpay Test Checkout opens with discount applied
7. Dashboard updates — Revenue Recovered & Recovery Rate update live

---

## 🏗️ Architecture

React + Vite (Frontend)
        |
        v
Django REST Framework (Backend API)
        |
        |---> Groq / Llama LLM (AI Agent)
        |         - Diagnoses abandonment reason
        |         - Generates recovery message
        |         - Recommends bounded discount (0-15%)
        |
        |---> Razorpay API (Payments)
        |         - Creates test orders
        |         - Verifies payment signatures
        |         - Tracks recovered revenue
        |
        +---> SQLite Database
                  - Cart sessions & items
                  - RecoveryDecision audit log
                  - User authentication

---

## 🧠 AI Agent Design

- Input: Cart items, product categories, quantities, total value, customer name
- Output: likely_reason, recovery_message, discount_percent (always 0–15%)
- Guardrails: Server-side clamping ensures the AI can never set a discount above 15%
- Explainability: Every decision stores the complete raw model output in an audit log

---

## ✨ Key Features

- Full Authentication (Sign Up / Login / Logout)
- Personalized Cart Sessions per user
- AI Recovery Message Generation with Groq/Llama
- Razorpay Test Checkout with signature verification
- Live Merchant Dashboard with real-time metrics
- Full Audit Trail for every AI decision
- Stale Recovery Prevention — new cycles always get fresh AI messages
- 20-product catalog with matching high-resolution product images
- Floating Cart Bar with instant add-to-cart feedback

---

## 🛠️ Tech Stack

Frontend   — React 18, Vite, CSS3
Backend    — Django 6.1, Django REST Framework
AI / LLM   — Groq API (Llama 3)
Payments   — Razorpay Orders + Verification API
Auth       — Django Session Authentication
Database   — SQLite

---

## ⚙️ Setup & Installation

1. Clone the repository
git clone https://github.com/ABDULRAZAK78/cartmind.git
cd cartmind

2. Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_catalog
python manage.py runserver 8000

3. Frontend Setup
cd frontend
npm install
npm run dev

Open http://localhost:5173

---

## 🧪 Test Payment Details (Razorpay Test Mode)

Card Number : 4111 1111 1111 1111
Expiry      : 12/28
CVV         : 123

---

## 🏆 Why This Fits Track 1

Real problem     — Cart abandonment is the #1 revenue leak for Razorpay merchants
AI meaningfully  — LLM does genuine reasoning, not just templating
Measurable impact— Live revenue recovered, recovery rate, and carts converted metrics
Explainable      — Every AI financial decision has a complete audit trail
Razorpay native  — Full Orders API + Signature Verification + live payment conversion

---

## 🔮 Future Enhancements

- WhatsApp & Email Dispatch — auto-send via WhatsApp Business API and SendGrid
- Celery + Redis Worker — auto-detect cart inactivity instead of manual trigger
- Reinforcement Learning — improve AI strategy using payment webhook signals
- A/B Testing — test different message tones and discount levels

---

## 👨‍💻 Built By

Syed Abdul Razak
Razorpay AI Builder Internship 2026 — Track 1: AI Growth & Agentic Commerce

Built with love for the Razorpay AI Builder Internship 2026
