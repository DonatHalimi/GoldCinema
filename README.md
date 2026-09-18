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
  <a href="https://donathalimi.github.io/GoldCinema/">
    <img src="https://img.shields.io/badge/Live%20Demo-GoldCinema-c9a45c?style=for-the-badge" alt="Live Demo">
  </a>
  <a href="https://github.com/DonatHalimi/GoldCinema">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repository">
  </a>
</p>

<p align="center">
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React">
  </a>
  <a href="https://vite.dev/">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite">
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js">
  </a>
  <a href="https://expressjs.com/">
    <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express">
  </a>
  <a href="https://www.mongodb.com/">
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB">
  </a>
</p>

---

GoldCinema is a complete cinema platform built with a **React frontend**, **Node.js/Express REST API**, and **MongoDB database**.

Users can discover movies, explore showtimes, select seats, purchase tickets, manage their accounts, save favourites, write reviews, purchase gift cards, and manage payment methods.

The platform also includes a dedicated **administration dashboard** for managing cinema content, users, roles, bookings, payments, showtimes, and other operational data.

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
  * [Movie Discovery](#movie-discovery)
  * [Ticket Booking](#ticket-booking)
  * [Payments & Checkout](#payments--checkout)
  * [User Accounts & Security](#user-accounts--security)
  * [Gift Cards](#gift-cards)
  * [Reviews & Favourites](#reviews--favourites)
  * [Notifications](#notifications)
  * [Administration](#administration)
  * [Internationalization](#internationalization)
* [Technology Stack](#technology-stack)
* [Architecture](#architecture)
  - [Database Design](https://github.com/DonatHalimi/GoldCinema#database-design)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Environment Configuration](#environment-configuration)
  * [Database Setup](#database-setup)
  * [Running the Application](#running-the-application)
* [Testing](#testing)
* [Usage](#usage)

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

---

## Internationalization

The application supports multiple languages.

Currently supported locales include:

* **English (`en`)**
* **Albanian (`sq`)**
* **Serbian Latin (`sr-Latn`)**

The frontend and backend use translation keys to provide localized interface content.

Users can switch the application's language through the language selector.

---
<p align="center">
  <a href="https://github.com/DonatHalimi/GoldCinema">
    <img src="https://img.shields.io/badge/Status-Active%20Development-E8C773?style=flat-square" alt="Status: Active Development">
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square" alt="Frontend: React + Vite">
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square" alt="Backend: Node.js + Express">
  </a>
  <a href="https://www.mongodb.com/">
    <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square" alt="Database: MongoDB">
  </a>
</p>

# Technology Stack

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

## Other Technologies

* QR code generation
* Email services
* SMS services
* File uploads
* RESTful API architecture
* Automated API tests

---

# Architecture

GoldCinema follows a layered full-stack architecture.

<img width="4466" height="7164" alt="diagram" src="https://github.com/user-attachments/assets/caf2623e-8185-443b-9da3-54ccceaba955" />

## Database Design

GoldCinema uses **MongoDB** with **Mongoose** for data persistence. The database is organized around the application's core entities, including users, movies, cinemas, screens, seats, showtimes, orders, payments, reviews, gift cards, notifications, and authentication-related data.

The following Entity Relationship Diagram (ERD) provides a visual representation of the main database collections and their relationships:

<img width="1792" height="1765" alt="GoldCinema_ERD drawio" src="https://github.com/user-attachments/assets/126cef85-085a-42d5-8038-83665def37da" />

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

---

### 2. Install root dependencies

If the root project contains the required scripts and dependencies:

```bash
npm install
```

---

### 3. Install backend dependencies

```bash
cd backend
npm install
```

---

### 4. Install frontend dependencies

Open another terminal or navigate back to the project root:

```bash
cd ../frontend
npm install
```

---

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

---

# Environment Configuration

GoldCinema uses environment variables for sensitive configuration such as database credentials, authentication secrets, email services, SMS services, and payment providers.

Create the appropriate environment configuration files for the backend and frontend based on the project's existing configuration.

Typical backend configuration may include values for:

```text
MongoDB connection
JWT secrets
Email configuration
SMS configuration
Stripe credentials
PayPal credentials
Google authentication
Facebook authentication
WebAuthn configuration
```

> Never commit production secrets, API keys, private keys, or database credentials to GitHub.

---

# Database Setup

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

---

# Running the Application

## Start MongoDB

Make sure your MongoDB server is running before starting the backend.

---

## Start the Backend

From the `backend` directory:

```bash
npm start
```

The backend runs on the port configured by the application environment.

For development, the project may also be run using the development script defined in `backend/package.json`.

---

## Start the Frontend

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

---

# Author

Developed by:

| Author                                             | Repository                                                              |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| **[Donat Halimi](https://github.com/DonatHalimi)** | **[DonatHalimi/GoldCinema](https://github.com/DonatHalimi/GoldCinema)** |

---

# License

This project was developed for educational and demonstration purposes.
