<p align="center">
  <img width="500" height="100" alt="GoldCinema" src="https://github.com/user-attachments/assets/804703dc-0e03-4b04-8073-48e5a15e11b3" />
</p>

<p align="center">
  <strong>A full-stack digital cinema booking platform</strong>
</p>

<p align="center">
  Discover movies · Browse showtimes · Choose seats · Book tickets · Manage your account
</p>

<p align="center">
  <a href="https://donathalimi.github.io/GoldCinema/" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/Live%20Demo-GoldCinema-c9a45c?style=for-the-badge" alt="Live Demo">
  </a>
  &nbsp;
  <a href="https://github.com/DonatHalimi/GoldCinema" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repository">
  </a>
  &nbsp;
 <a href="https://platform-api-team-5444.postman.co/workspace/GoldCinema~b036de09-bd7c-4f1b-bd29-3a1579ead5aa/overview?sideView=agentMode" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/API%20Docs-Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white" alt="Postman API Docs">
 </a>
</p>

<p align="center">
  <a href="https://react.dev/" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React">
  </a>
  <a href="https://vite.dev/" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  </a>
  <a href="https://nodejs.org/" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js">
  </a>
  <a href="https://expressjs.com/" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express">
  </a>
  <a href="https://www.mongodb.com/" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB">
  </a>
</p>

> ⚠️ **Live Demo Notice** — The hosted demo runs on a free-tier backend. The first request after inactivity may take **20–30 seconds** to cold-start. Payments use **Stripe test mode only** — no real charges are made.

---

GoldCinema is a complete cinema platform built with a **React frontend**, **Node.js/Express REST API**, and **MongoDB database**.

Users can discover movies, explore showtimes, select seats, purchase tickets, manage their accounts, save favourites, write reviews, purchase gift cards, and manage payment methods.

The platform also includes a dedicated **administration dashboard** for managing cinema content, users, roles, bookings, payments, showtimes, and other operational data.

---

## Table of Contents

- [Overview](#overview)
- [API Documentation](#api-documentation)
- [Features](#features)
  - [Movie Discovery](#movie-discovery)
  - [Ticket Booking](#ticket-booking)
  - [Payments & Checkout](#payments--checkout)
  - [User Accounts & Security](#user-accounts--security)
  - [Gift Cards](#gift-cards)
  - [Reviews & Favourites](#reviews--favourites)
  - [Notifications](#notifications)
  - [Administration](#administration)
  - [Internationalization](#internationalization)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
  - [Database Design](#database-design)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Ports & Services](#ports--services)
  - [Seeding the Database](#seeding-the-database)
  - [Demo Accounts](#demo-accounts)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Testing](#testing)
- [Usage](#usage)
- [Security](#security)
- [Stripe Payment Testing](#stripe-payment-testing)
- [Author](#author)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**GoldCinema** is a modern full-stack cinema booking application designed to simulate a complete digital cinema platform.

Users can browse movies currently showing in the cinema, view movie details and showtimes, select available seats, and purchase tickets through an online checkout process.

The application also provides a dedicated account area where users can manage their profile, tickets, favourites, reviews, payment methods, notifications, sessions, and security settings.

An administrative dashboard provides tools for managing the cinema's content and operational data.

The project follows a **client-server architecture**, with the frontend, backend, and database separated into distinct layers. The frontend communicates with the backend through a REST API, while the backend handles application logic, authentication, validation, and database operations.

The diagram below provides a high-level overview of how these layers interact. A detailed explanation of each architectural layer and its responsibilities can be found in the [Architecture](#architecture) section below.

```text
┌──────────────────────────────────────┐
│             React + Vite             │
│              Frontend                │
│                                      │
│  Pages • Components • API • Redux    │
└──────────────────┬───────────────────┘
                   │
                   │ HTTP / REST API
                   │
┌──────────────────▼───────────────────┐
│          Node.js + Express           │
│              Backend                 │
│                                      │
│ Controllers • Routes • Middleware    │
│ Services • Validation • Utilities    │
└──────────────────┬───────────────────┘
                   │
                   │ Mongoose
                   │
┌──────────────────▼───────────────────┐
│              MongoDB                 │
│             Database                 │
└──────────────────────────────────────┘
```

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## API Documentation

The full REST API is documented as a Postman collection:

**[Postman API Documentation →](https://platform-api-team-5444.postman.co/workspace/GoldCinema~b036de09-bd7c-4f1b-bd29-3a1579ead5aa/overview?sideView=agentMode)**

The collection includes:

- Authentication endpoints (register, login, refresh, logout, MFA)
- Movie, cinema, screen, and showtime endpoints
- Seat hold and order endpoints
- Payment intent creation (Stripe + PayPal)
- Gift card endpoints
- Admin CRUD endpoints
- Environment variables for local and deployed URLs

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

# Features

## Movie Discovery

Users can explore the cinema's movie catalogue and discover currently available films.

* Browse movies
* View detailed movie information
* View movie ratings
* Browse current showtimes
* View cinema and screening information
* Add movies to favourites
* Write and manage movie reviews

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Ticket Booking

GoldCinema provides an interactive seat reservation and ticket purchasing experience.

* Browse available showtimes
* Select seats using an interactive seat map
* View seat availability
* Temporarily hold selected seats
* Countdown timer for active seat holds
* Prevent conflicting seat reservations
* Review selected seats before checkout
* Complete ticket purchases
* Generate digital tickets
* View ticket information after purchase
* QR-code ticket generation

Seat holds are managed separately from completed orders to help prevent multiple users from purchasing the same seats during checkout.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Payments & Checkout

The platform supports multiple payment methods and a dedicated checkout flow.

### Supported Payment Methods

* **Stripe**
* **PayPal**
* Gift card payments
* Saved payment methods

### Checkout Features

* Order summary
* Seat selection summary
* Payment method selection
* Stripe checkout
* PayPal checkout
* Gift card application
* Full gift card coverage
* Payment method management
* Payment confirmation
* Unpaid order handling
* Order confirmation

Users can also save and manage payment methods through their account.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## User Accounts & Security

GoldCinema includes an extensive authentication and account security system.

### Authentication

* User registration
* Login
* Logout
* Password reset
* Email verification
* Resend verification email
* Remember-me functionality
* Protected routes
* Guest-only routes
* Role-based authorization

### Multi-Factor Authentication

The application supports multiple MFA methods:

* Email OTP
* SMS OTP
* TOTP authenticator applications

Users can enable, disable, and manage their available two-factor authentication methods.

### Passkeys

GoldCinema supports passwordless authentication through **passkeys/WebAuthn**.

Users can:

* Register passkeys
* Rename passkeys
* Remove passkeys
* Authenticate using a passkey

### Session Management

Users can manage their active sessions and trusted devices.

* View active sessions
* Identify devices
* Revoke individual sessions
* Revoke all sessions
* Trusted device management
* Login alerts
* Security activity

### Social Authentication

The application also supports social authentication providers.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Gift Cards

Users can purchase and redeem digital GoldCinema gift cards.

Features include:

* Preset gift card amounts
* Custom gift card amounts
* Gift card templates
* Gift card checkout
* PayPal gift card payments
* Gift card redemption
* Full order payment using gift cards
* Gift card code generation

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Reviews & Favourites

### Favourites

Users can maintain a personal list of favourite movies.

* Add movies to favourites
* Remove movies from favourites
* View favourite movies

### Reviews

Authenticated users can interact with movie reviews.

* Write reviews
* Edit reviews
* Delete reviews
* View review ratings
* Star rating system
* Personal review management

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Notifications

GoldCinema includes an integrated notification system.

Users can:

* View notifications
* Filter notifications
* Navigate through notifications
* Delete notifications
* Receive account and platform notifications
* Manage notification preferences

The application also includes a notification bell integrated into the main navigation.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Administration

GoldCinema includes a dedicated **Admin Dashboard** for managing the cinema platform.

Administrators can manage cinema-related data including:

* Movies
* Showtimes
* Cinemas
* Screens
* Seats
* Orders
* Payments
* Users
* Roles
* Gift cards
* Reviews
* Notifications
* Slideshows
* Contacts

The administration system uses reusable CRUD components and server-side authorization to restrict administrative functionality.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Internationalization

The application supports multiple languages.

Currently supported locales include:

* **English (`en`)**
* **Albanian (`sq`)**
* **Serbian Latin (`sr-Latn`)**

The frontend and backend use translation keys to provide localized interface content.

Users can switch the application's language through the language selector.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

<p align="center">
  <a href="https://github.com/DonatHalimi/GoldCinema" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/Status-Active%20Development-E8C773?style=flat-square" alt="Status: Active Development">
  </a>
  <a href="https://react.dev/" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square" alt="Frontend: React + Vite">
  </a>
  <a href="https://nodejs.org/" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square" alt="Backend: Node.js + Express">
  </a>
  <a href="https://www.mongodb.com/" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square" alt="Database: MongoDB">
  </a>
</p>

# Technology Stack

### Frontend

- [React](https://react.dev/) — UI library
- [Vite](https://vite.dev/) — Frontend build tool
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Redux Toolkit](https://redux-toolkit.js.org/) — State management
- [React Router](https://reactrouter.com/) — Routing
- [Axios](https://axios-http.com/) — HTTP client
- [i18next](https://www.i18next.com/) — Internationalization
- [Framer Motion](https://motion.dev/) — Animations
- [Lucide React](https://lucide.dev/) — Icons

### Backend

- [Node.js](https://nodejs.org/) — JavaScript runtime
- [Express.js](https://expressjs.com/) — REST API framework
- [MongoDB](https://www.mongodb.com/) — Database
- [Mongoose](https://mongoosejs.com/) — MongoDB object modeling

### Authentication & Security

- [JSON Web Tokens](https://jwt.io/) — Token-based authentication
- [WebAuthn](https://webauthn.guide/) — Passkeys
- [TOTP](https://en.wikipedia.org/wiki/Time-based_one-time_password) — Authenticator-based MFA

### Payments

- [Stripe](https://stripe.com/) — Payment processing
- [PayPal](https://www.paypal.com/) — Payment processing

### Other Technologies

* QR code generation
* Email services
* SMS services
* File uploads
* RESTful API architecture
* Automated API tests

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

# Architecture

GoldCinema follows a layered full-stack architecture, with each layer holding a distinct responsibility:

- **Frontend (React + Vite)** — Renders the UI, manages client-side routing and state (Redux Toolkit), handles form validation, and communicates with the backend exclusively through the REST API. It never talks to the database directly.
- **Backend (Node.js + Express)** — Exposes the REST API, enforces authentication and authorization, validates incoming requests, runs business logic (seat holds, pricing, payment intent creation), and is the only layer allowed to read from or write to the database.
- **Database (MongoDB + Mongoose)** — Stores all persistent data: users, movies, cinemas, screens, seats, showtimes, orders, payments, gift cards, reviews, notifications, and audit/security records. Mongoose schemas enforce structure and validation at the model layer.

This separation means the frontend can be swapped (e.g. a mobile app) without touching the backend, and the database can be scaled or migrated independently.

<img width="4466" height="7164" alt="diagram" src="https://github.com/user-attachments/assets/caf2623e-8185-443b-9da3-54ccceaba955" />

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Database Design

GoldCinema uses **MongoDB** with **Mongoose** for data persistence. The database is organized around the application's core entities, including users, movies, cinemas, screens, seats, showtimes, orders, payments, reviews, gift cards, notifications, and authentication-related data.

The following Entity Relationship Diagram (ERD) provides a visual representation of the main database collections and their relationships:

<img width="1792" height="1764" alt="GoldCinema_ERD drawio" src="https://github.com/user-attachments/assets/a1f0a6c9-dd9b-4ac0-8a32-213a3eda765c" />

The ERD illustrates relationships between the main entities involved in movie discovery, cinema management, seat reservations, ticket orders, payments, user accounts, reviews, favourites, and gift cards.

For example:

- **Cinemas** contain multiple **Screens**.
- **Screens** contain multiple **Seats**.
- **Movies** are associated with **Showtimes**.
- **Showtimes** belong to a specific **Cinema Screen**.
- **Users** can create **Orders**, **Reviews**, and **Favourites**.
- **Orders** contain selected seats and are associated with **Payments**.
- **Seat Holds** temporarily reserve seats for users during checkout.
- **Gift Cards** can be purchased and redeemed toward orders.
- **Roles** determine administrative permissions.

The database is implemented using MongoDB and Mongoose models located in:

```text
backend/src/models/
```

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

# Project Structure

The project is divided into two primary applications: `frontend` and `backend`.

```text
donathalimi-goldcinema/
│
├── backend/                              # Node.js / Express backend
│   ├── src/
│   │   ├── config/                       # Database configuration
│   │   ├── controllers/                  # Request controllers
│   │   ├── db/                           # Database initialization and seed
│   │   ├── middleware/                   # Authentication and request middleware
│   │   ├── models/                       # Mongoose models
│   │   ├── routes/                       # REST API routes
│   │   ├── services/                     # External/application services
│   │   ├── utils/                        # Shared backend utilities
│   │   └── validations/                  # Request validation schemas
│   │
│   ├── tests/                            # Backend tests
│   ├── server.js                         # Backend entry point
│   └── package.json
│
├── frontend/                             # React / Vite frontend
│   ├── src/
│   │   ├── api/                          # API client modules
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── account/
│   │   │   ├── auth/
│   │   │   ├── checkout/
│   │   │   ├── confirmation/
│   │   │   ├── giftcards/
│   │   │   ├── layout/
│   │   │   ├── movies/
│   │   │   ├── notifications/
│   │   │   ├── order/
│   │   │   ├── payments/
│   │   │   ├── reviews/
│   │   │   ├── tickets/
│   │   │   └── ui/
│   │   ├── context/                      # React contexts
│   │   ├── hooks/                        # Custom React hooks
│   │   ├── pages/                        # Application pages
│   │   ├── store/                        # Redux store and slices
│   │   ├── utils/                        # Frontend utilities
│   │   └── validations/                  # Frontend validation
│   │
│   ├── App.jsx                           # Root application component
│   ├── main.jsx                          # Application entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── package.json                          # Root project configuration
└── README.md
```

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

# Getting Started

## Prerequisites

Before running GoldCinema, make sure the following are installed:

* **Node.js**
* **npm**
* **MongoDB**
* **Git**

You can verify Node.js and npm with:

```bash
node --version
npm --version
```

Verify MongoDB is available according to your local installation.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/DonatHalimi/GoldCinema.git
```

Navigate into the project:

```bash
cd GoldCinema
```

### 2. Install root dependencies

If the root project contains the required scripts and dependencies:

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Install frontend dependencies

Open another terminal or navigate back to the project root:

```bash
cd ../frontend
npm install
```

### 5. Start the application

After installing all dependencies, navigate back to the project root:

```bash
cd ..
```

Start the application with:

```bash
npm start
```

The root `package.json` contains the required scripts to start the GoldCinema application.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Environment Configuration

GoldCinema reads all sensitive configuration from environment variables. Copy the example files and fill in your own values.

### Backend — `backend/.env`

```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/goldcinema

# JWT
JWT_ACCESS_SECRET=replace_with_long_random_string
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=replace_with_long_random_string
JWT_REFRESH_EXPIRES=7d

# Email (Nodemailer)
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_password
EMAIL_FROM=your_email

# SMS (Twilio or equivalent)
SMS_ACCOUNT_SID=your_sms_account_sid
SMS_AUTH_TOKEN=your_sms_auth_token
SMS_FROM=your_sms_from

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
STRIPE_CURRENCY=eur

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENV=sandbox

# OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# WebAuthn / Passkeys
WEBAUTHN_RP_ID=localhost
WEBAUTHN_RP_NAME=GoldCinema
WEBAUTHN_ORIGIN=http://localhost:3000

# Frontend origin (CORS)
CLIENT_URL=http://localhost:3000
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:4000/api
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

> Never commit production secrets. Both `.env` files should be listed in `.gitignore`.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Ports & Services

| Service      | Default URL                     | Notes                                |
|--------------|---------------------------------|--------------------------------------|
| Frontend     | `http://localhost:3000`         | Vite dev server                      |
| Backend API  | `http://localhost:4000/api`     | Express                              |
| MongoDB      | `mongodb://localhost:27017`     | Local or Atlas URI                   |
| Stripe CLI   | `http://localhost:4000/api/payments/webhook` | Forwarded via `stripe listen` |

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Seeding the Database

The seed script populates MongoDB with demo movies, roles, users, one cinema, one screen with 80 seats, and 30 days of showtimes. It is **idempotent**: if any collection already contains documents, it exits without writing.

Run it from the backend directory:

```bash
cd backend
npm run seed
```

Or directly with Node:

```bash
node src/db/seed.js
```

Expected output:

```text
🚀 Starting database seed...

📽️  Creating movies...
  ✅ 10 movies created

👤 Creating roles...
  ✅ 2 roles created

👥 Creating users...
  ✅ 2 users created

🏢 Creating cinema...
  ✅ Cinema "GoldCinema Pristina" created

💺 Creating screen and seats...
📊 Seat Types Summary:
  • Standard: 60 seats
  • Recliner: 20 seats
  • Love Seats: 8 seats
  • Wheelchair: 4 seats
  ─────────────────
  • Total: 92 seats
  ✅ Screen "Screen 1" created

🎬 Creating showtimes...
  ✅ 100 showtimes created

✨ Database seeded successfully! ✨
```

> 💡 To re-seed from scratch, drop the database first: `mongosh goldcinema --eval "db.dropDatabase()"`, then re-run the seed command.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Demo Accounts

After seeding, the following accounts are available. Both use the same password.

| Role     | Email                          | Password        |
|----------|--------------------------------|-----------------|
| Admin    | `admin@gmail.com`              | `Admin123@`     |
| Customer | `customer@gmail.com`      | `Customer123@`  |

> 🔐 These are **demo credentials for local development only.** Change them before deploying anywhere public.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Database Setup

GoldCinema uses **MongoDB** with **Mongoose** for database management.

The database configuration is located in:

```text
backend/src/config/db.js
```

Database initialization and seed functionality is located in:

```text
backend/src/db/
```

The seed script can be used to populate the database with the initial application data.

The application contains models for:

* Users
* Roles
* Movies
* Cinemas
* Screens
* Seats
* Showtimes
* Orders
* Seat Holds
* Payments
* Gift Cards
* Reviews
* Favourites
* Notifications
* Slideshows
* Contacts
* Login Attempts
* Snacks

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

## Running the Application

### Start MongoDB

Make sure your MongoDB server is running before starting the backend.

### Start the Backend

From the `backend` directory:

```bash
npm start
```

The backend runs on the port configured by the application environment.

For development, the project may also be run using the development script defined in `backend/package.json`.

### Start the Frontend

Open another terminal:

```bash
cd frontend
```

Start the Vite development server:

```bash
npm run dev
```

The frontend is configured to run on the Vite development server.

The backend and frontend URLs should match the values configured in the application's environment and WebAuthn settings.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

# Testing

The backend contains automated tests located in:

```text
backend/tests/
```

Current test files include:

```text
api.test.js
notifications.test.js
```

Tests can be executed using the test script defined in:

```text
backend/package.json
```

For example:

```bash
npm test
```

if the project's test configuration defines the standard `test` script.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

# Usage

Once GoldCinema is running, users can:

1. Open the GoldCinema homepage.
2. Browse movies currently showing.
3. Select a movie.
4. Browse available showtimes.
5. Select a screening.
6. Choose available seats.
7. Hold the selected seats temporarily.
8. Continue to checkout.
9. Select a payment method.
10. Apply a gift card if available.
11. Complete the payment.
12. Receive a confirmation and digital QR ticket.
13. View tickets from their account.
14. Manage favourites and reviews.
15. Manage payment methods.
16. Review notifications and security activity.
17. Manage active sessions and authentication settings.

Administrators can access the **Admin Dashboard** to manage the cinema's operational and content data.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

# Security

GoldCinema implements several security mechanisms designed to protect user accounts and transactions.

These include:

* HTTP-only authentication cookies
* Access and refresh token authentication
* Refresh token rotation
* Login attempt tracking
* Account lockout handling
* Email verification
* Password reset
* Multi-factor authentication
* TOTP authentication
* SMS authentication
* Passkey authentication
* Trusted devices
* Session revocation
* Role-based authorization
* Request validation
* Centralized error handling
* Security event tracking

Sensitive authentication information is intentionally excluded from application audit and security records.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

# Stripe Payment Testing

You can use the following test card details to simulate payments in Stripe. If any problem occurs, refer to the [official Stripe documentation](https://docs.stripe.com/testing?testing-method=card-numbers).

| Brand                | Number              | CVC           | Expiry Date   |
|----------------------|---------------------|---------------|---------------|
| **Visa**             | 4242424242424242     | Any 3 digits  | Any future date |
| **Visa (debit)**     | 4000056655665556     | Any 3 digits  | Any future date |
| **Mastercard**        | 5555555555554444     | Any 3 digits  | Any future date |
| **Mastercard (2-series)** | 2223003122003222 | Any 3 digits  | Any future date |
| **Mastercard (debit)** | 5200828282828210    | Any 3 digits  | Any future date |
| **Mastercard (prepaid)** | 5105105105105100 | Any 3 digits  | Any future date |
| **American Express**  | 378282246310005      | Any 4 digits  | Any future date |
| **American Express**  | 371449635398431      | Any 4 digits  | Any future date |
| **Discover**          | 6011111111111117     | Any 3 digits  | Any future date |
| **Discover**          | 6011000990139424     | Any 3 digits  | Any future date |
| **Discover (debit)**  | 6011981111111113     | Any 3 digits  | Any future date |
| **Diners Club**       | 3056930009020004     | Any 3 digits  | Any future date |
| **Diners Club (14-digit card)** | 36227206271667 | Any 3 digits | Any future date |
| **BCcard and DinaCard** | 6555900000604105   | Any 3 digits  | Any future date |
| **JCB**              | 3566002020360505     | Any 3 digits  | Any future date |
| **UnionPay**         | 6200000000000005     | Any 3 digits  | Any future date |
| **UnionPay (debit)** | 6200000000000047     | Any 3 digits  | Any future date |
| **UnionPay (19-digit card)** | 6205500000000000004 | Any 3 digits | Any future date |

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

# Author

Developed by:

| Author                                             | Repository                                                              |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| **[Donat Halimi](https://github.com/DonatHalimi)** | **[DonatHalimi/GoldCinema](https://github.com/DonatHalimi/GoldCinema)** |

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

# Contributing

Contributions are welcome. To keep the project maintainable, please follow these steps:

1. **Fork** the repository and clone your fork locally.
2. **Create a branch** with a descriptive name:

   ```bash
   git checkout -b feat/feat-title
   ```

3. Follow the existing style — **ESLint + Prettier** are configured for both `frontend` and `backend`. Run `npm run lint` before committing.
4. **Write tests** for any new backend logic in `backend/tests/`.
5. **Use conventional commits** where possible:

   ```text
   feat: add {feature}
   fix: prevent {bug}
   docs: update README setup steps
   ```

6. **Push and open a Pull Request** against `main`, describing what changed and why.

### Reporting Issues

When opening an issue, please include:

* Steps to reproduce
* Expected vs. actual behavior
* Browser / Node version
* Relevant logs or screenshots

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>

---

# License

This project was developed for educational and demonstration purposes.

<p align="right"><sub><a href="#table-of-contents">↑ Top</a></sub></p>
