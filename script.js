const svgIcons = {
    "credit-card": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h3"/></svg>',
    "layers": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>',
    "clapperboard": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><path d="M3 7h18v13H3z"/><path d="M3 7l2-4 4 4 2-4 4 4 2-4 4 4"/><path d="M8 12h8"/></svg>',
    "armchair": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><path d="M5 12V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4"/><path d="M5 11a3 3 0 0 0-3 3v1a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3"/><path d="M5 18v3M19 18v3"/></svg>',
    "shield-check": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><path d="M12 3l8 3v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3z"/><path d="m8.5 12 2.3 2.3 4.7-4.7"/></svg>',
    "key": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><circle cx="7.5" cy="15.5" r="3.5"/><path d="m10 13 8-8"/><path d="m15 7 2 2"/><path d="m18 4 2 2"/></svg>',
    "gauge": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><path d="M12 14 8 10"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
    "globe": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>',
    "link": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1"/></svg>',
    "layout-dashboard": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
    "network": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-2h14v2"/></svg>',
    "receipt": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>',
    "terminal": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="h-9 w-9"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3"/><path d="M13 15h5"/></svg>',
};

const slides = [
    {
        title: "GoldCinema Experience",
        subtitle: "A complete digital cinema platform",
        description: "A full-stack cinema booking platform where users can discover movies, explore showtimes, reserve seats, purchase tickets, manage their account, and interact with the cinema ecosystem.",
        tag: "PLATFORM OVERVIEW",
        navLabel: "Introduction",
        icon: "clapperboard",
        type: "intro"
    },
    {
        title: "Smart Ticket Booking",
        subtitle: "Interactive reservations built around real-time seat availability",
        description: "The booking flow combines interactive seat maps, temporary seat holds, countdown timers, conflict prevention, checkout summaries, and digital QR tickets into one seamless experience.",
        tag: "BOOKING EXPERIENCE",
        navLabel: "Booking",
        icon: "armchair",
        highlights: ["Interactive Seat Maps", "Temporary Seat Holds", "Hold Expiration Timers", "Conflict Prevention", "Showtime & Cinema Selection", "QR-Code Digital Tickets"]
    },
    {
        title: "Interactive Seat Selection",
        subtitle: "Four seat types — pick the one that fits you",
        description: "Standard, Recliner, Love Seat, and Wheelchair-accessible seats each have their own price and layout. Click any available seat below to build your reservation and see the ticket update live.",
        tag: "TRY IT HERE",
        navLabel: "Seat Map",
        icon: "armchair",
        type: "seatmap"
    },
    {
        title: "Checkout Experience",
        subtitle: "Step through the flow — order, payment, confirmation",
        description: "An abstract preview of the checkout journey. Click the steps to move through them, pick a payment method, apply a gift card, and watch the amount due update live. Reaching the confirmation step fires a small celebration.",
        tag: "TRY IT HERE",
        navLabel: "Checkout",
        icon: "receipt",
        type: "checkout"
    },
    {
        title: "Payments & Digital Extras",
        subtitle: "Flexible checkout with multiple ways to pay",
        description: "A dedicated checkout experience supports Stripe, PayPal, gift cards, saved payment methods, payment confirmation, unpaid-order handling, and digital gift card purchases.",
        tag: "CHECKOUT",
        navLabel: "Payments",
        icon: "credit-card",
        highlights: ["Stripe Integration", "PayPal Integration", "Gift Card Payments", "Saved Payment Methods", "Digital Gift Cards", "Order Confirmation"]
    },
    {
        title: "Security & Account Control",
        subtitle: "Modern authentication with layered account protection",
        description: "GoldCinema includes password authentication, email verification, MFA, passwordless passkeys, trusted devices, session controls, login tracking, and role-based authorization.",
        tag: "SECURITY",
        navLabel: "Security",
        icon: "shield-check",
        highlights: ["WebAuthn Passkeys", "TOTP & SMS OTP", "Email Verification", "Trusted Devices", "Session Revocation", "Role-Based Authorization"]
    },
    {
        title: "Multi-Factor Authentication",
        subtitle: "Three independent second factors, all user-managed",
        description: "Users can enable, rename, and revoke Email OTP, SMS OTP, and TOTP authenticator methods from their account. Each factor is stored independently and can be used interchangeably at login.",
        tag: "SECURITY DEEP DIVE",
        navLabel: "MFA",
        icon: "key",
        highlights: ["Email One-Time Codes", "SMS One-Time Codes", "TOTP Authenticator Apps", "Per-Method Enable / Disable", "Backup Codes", "Login Challenge Flow"]
    },
    {
        title: "Passkeys & Passwordless Auth",
        subtitle: "WebAuthn credentials for a modern login experience",
        description: "GoldCinema supports registering, renaming, and removing passkeys. Users can authenticate entirely without a password, and each passkey is bound to a trusted device for additional protection.",
        tag: "SECURITY DEEP DIVE",
        navLabel: "Passkeys",
        icon: "shield-check",
        highlights: ["WebAuthn Registration", "Passwordless Login", "Multiple Passkeys per Account", "Rename & Revoke", "Trusted Device Binding", "Fallback to Password"]
    },
    {
        title: "Internationalization",
        subtitle: "Three locales, one platform",
        description: "The interface is fully translated through translation keys on both the frontend and backend. Users can switch languages at any time from the language selector.",
        tag: "LOCALIZATION",
        navLabel: "Languages",
        icon: "globe",
        highlights: ["English (en)", "Albanian (sq)", "Serbian Latin (sr-Latn)", "Frontend Translation Keys", "Backend Localized Messages", "Runtime Language Switching"]
    },
    {
        title: "Admin Dashboard",
        subtitle: "Full CRUD control over the entire cinema platform",
        description: "A dedicated admin area built on reusable CRUD components and server-side role authorization. Administrators manage every entity in the platform from one interface.",
        tag: "ADMINISTRATION",
        navLabel: "Admin",
        icon: "layout-dashboard",
        highlights: ["Movies & Showtimes", "Cinemas, Screens & Seats", "Orders & Payments", "Users & Roles", "Gift Cards & Reviews", "Slideshows & Contacts"]
    },
    {
        title: "Architecture & Data Flow",
        subtitle: "React SPA, Express API, and MongoDB persistence",
        description: "A three-tier architecture. The React client handles all UI, the Express API owns business logic and authorization, and MongoDB persists every domain model. External providers handle email, SMS, and payments.",
        tag: "SYSTEM ARCHITECTURE",
        navLabel: "Architecture",
        icon: "network",
        type: "architecture"
    },
    {
        title: "Getting Started",
        subtitle: "One command boots the whole stack",
        description: "From the repository root, `npm start` launches the frontend and backend together with concurrently. Vite serves the client on port 3000, and nodemon watches the Express server for changes.",
        tag: "DEVELOPER EXPERIENCE",
        navLabel: "Terminal",
        icon: "terminal",
        type: "terminal"
    },
    {
        title: "Tech Stack",
        subtitle: "Everything that makes GoldCinema run",
        description: "A modern JavaScript stack end to end, with real payments, real authentication, and real tests.",
        tag: "TECHNOLOGY",
        navLabel: "Stack",
        icon: "layers",
        type: "techstack"
    },
    {
        title: "By The Numbers",
        subtitle: "A snapshot of what's under the hood",
        description: "GoldCinema is more than a demo. It is a production-shaped application covering authentication, payments, administration, localization, and testing.",
        tag: "PROJECT STATS",
        navLabel: "Stats",
        icon: "gauge",
        type: "stats"
    },
    {
        title: "Explore & Try It Yourself",
        subtitle: "Documentation, API collection, and source code",
        description: "The full REST API is documented as a Postman collection. Import it to explore every endpoint, or browse the repository on GitHub.",
        tag: "RESOURCES",
        navLabel: "Resources",
        icon: "link",
        type: "links"
    }
];

const SEAT_TYPES = {
    standard: {
        label: 'Standard',
        price: 12.50,
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="seat-type-icon"><path d="M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/><path d="M5 10h14v6H5z"/><path d="M7 16v3M17 16v3"/></svg>'
    },
    recliner: {
        label: 'Recliner',
        price: 18.00,
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="seat-type-icon"><path d="M4 16v-4a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4"/><path d="M4 16h16"/><path d="M6 12 4 8M18 12l2-4"/></svg>'
    },
    loveseat: {
        label: 'Love Seat',
        price: 24.00,
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="seat-type-icon"><path d="M12 20s-6-4.2-6-8.5a3.5 3.5 0 0 1 6-2.4 3.5 3.5 0 0 1 6 2.4C18 15.8 12 20 12 20Z"/></svg>'
    },
    wheelchair: {
        label: 'Wheelchair',
        price: 10.00,
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="seat-type-icon"><circle cx="12" cy="5" r="1.6"/><path d="M12 7.5v6h5.5"/><path d="M11 10 8.5 15h5l2 4"/><circle cx="10" cy="20" r="1.8"/></svg>'
    }
};

const seatLayout = [
    { row: 'A', seats: ['standard', 'standard', 'standard', 'standard', 'standard', 'standard', 'standard', 'standard'], taken: [2, 5] },
    { row: 'B', seats: ['standard', 'standard', 'standard', 'standard', 'standard', 'standard', 'standard', 'standard'], taken: [7] },
    { row: 'C', seats: ['recliner', 'recliner', 'recliner', 'recliner', 'recliner', 'recliner', 'recliner', 'recliner'], taken: [] },
    { row: 'D', seats: ['loveseat', 'loveseat', 'standard', 'standard', 'standard', 'standard', 'loveseat', 'loveseat'], taken: [1, 8] },
    { row: 'E', seats: ['wheelchair', 'wheelchair', 'standard', 'standard', 'standard', 'standard', 'wheelchair', 'wheelchair'], taken: [4] }
];

/* ---------------- State ---------------- */
let currentSlide = 0;
let isAutoPlaying = false;
let autoPlayInterval = null;
let selectedSeats = [];
let checkoutStep = 0;
let checkoutProvider = 'stripe';
let checkoutGiftApplied = false;
const CHECKOUT_GIFT = 5.00;
let typingTimers = [];
let statAnimationFrame = null;

/* ---------------- Elements ---------------- */
const slideContainer = document.getElementById('slide-container');
const slideCounter = document.getElementById('slide-counter');
const autoPlayBtn = document.getElementById('auto-play-btn');
const autoPlayIcon = document.getElementById('auto-play-icon');
const segmentContainer = document.getElementById('segment-container');
const sideNav = document.getElementById('side-nav');

function renderSegments() {
    segmentContainer.innerHTML = slides.map((_, index) => {
        const isActive = index === currentSlide;
        const isPast = index < currentSlide;
        let stateClass = '';
        if (isActive) stateClass = 'is-active';
        else if (isPast) stateClass = 'is-past';
        const fill = isActive && isAutoPlaying
            ? '<div class="segment-fill animating"></div>'
            : '';
        return `<button type="button" onclick="goToSlide(${index})" aria-label="Go to slide ${index + 1}" class="slide-segment segment-track h-1.5 flex-1 rounded-full ${stateClass} cursor-pointer">${fill}</button>`;
    }).join('');
}

function renderSideNav() {
    const existingGroup = sideNav.querySelector('.side-nav-group');
    if (existingGroup) existingGroup.remove();

    const group = document.createElement('div');
    group.className = 'side-nav-group';

    const frag = document.createDocumentFragment();
    slides.forEach((slide, index) => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'side-nav-item' + (index === currentSlide ? ' is-active' : '');
        a.dataset.slide = index;
        a.setAttribute('aria-label', `Go to ${slide.navLabel}`);
        a.innerHTML = `<span class="side-nav-line"></span><span class="side-nav-label">${slide.navLabel}</span>`;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(index);
        });
        frag.appendChild(a);
    });
    group.appendChild(frag);
    sideNav.appendChild(group);
}

function renderIndicators() {
    slideCounter.innerText = `${currentSlide + 1} / ${slides.length}`;
    renderSegments();
    renderSideNav();
}

function updateThemeIcon() {
    const isLight = document.documentElement.dataset.theme === 'light';
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    if (!themeToggle || !themeIcon) return;

    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    themeIcon.innerHTML = isLight
        ? '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"></path>'
        : '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>';
}

function toggleTheme() {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = nextTheme;
    root.classList.toggle('dark', nextTheme === 'dark');
    updateThemeIcon();
    window.setTimeout(() => root.classList.remove('theme-transition'), 500);
}

function introMarkup() {
    const highlights = ["Movie Discovery & Showtimes", "Digital Ticket Booking", "Account & Profile Management", "Favourites & Reviews", "Notifications & Preferences", "Multilingual Experience"];

    return `
        <p class="max-w-2xl text-sm leading-relaxed text-marquee-muted sm:text-base">
            ${slides[0].description}
        </p>
        <div class="mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            ${highlights.map(h => `
                <div class="feature-card flex items-center justify-center gap-2 rounded-xl border border-marquee-line/70 bg-marquee-bg/60 px-4 py-3 text-xs font-medium text-marquee-muted shadow-sm transition hover:border-marquee-gold/30 hover:text-marquee-cream">
                    <span class="text-marquee-gold/80">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="m5 12 4 4L19 6"/></svg>
                    </span>
                    <span>${h}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function seatMapMarkup() {
    const rows = seatLayout.map(({ row, seats, taken }) => {
        const seatEls = seats.map((type, i) => {
            const seatId = `${row}${i + 1}`;
            const isTaken = taken.includes(i + 1);
            const isSelected = selectedSeats.some(s => s.id === seatId);
            const cls = `seat seat-type-${type} ${isTaken ? 'taken' : ''} ${isSelected ? 'selected' : ''}`;
            const handler = isTaken ? '' : `onclick="toggleSeat('${seatId}', '${type}')"`;
            const icon = isSelected
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-2.5 w-2.5"><path d="m5 12 4 4L19 6"/></svg>'
                : SEAT_TYPES[type].icon;
            return `<div class="${cls}" ${handler}>${icon}</div>`;
        }).join('');
        return `
            <div class="flex items-center gap-2.5">
                <span class="w-3.5 text-center font-mono text-[9px] text-marquee-muted">${row}</span>
                <div class="flex gap-1">${seatEls}</div>
            </div>
        `;
    }).join('');

    const { total, seatLabels } = computeTicketTotal();
    const seatList = seatLabels.length ? seatLabels.join(', ') : '';

    return `
        <div class="mt-5 w-full max-w-md rounded-xl border border-marquee-line bg-marquee-panel p-5">
            <div class="screen-curve"></div>
            <p class="mb-3 text-center text-[9px] uppercase tracking-[0.3em] text-marquee-muted">Screen</p>
            <div class="flex flex-col items-center gap-1.5">${rows}</div>

            <div class="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[9px] text-marquee-muted">
                <div class="legend-item"><div class="legend-swatch standard"></div><span>Standard · $12.50</span></div>
                <div class="legend-item"><div class="legend-swatch recliner"></div><span>Recliner · $18.00</span></div>
                <div class="legend-item"><div class="legend-swatch loveseat"></div><span>Love Seat · $24.00</span></div>
                <div class="legend-item"><div class="legend-swatch wheelchair"></div><span>Wheelchair · $10.00</span></div>
            </div>

            <div class="ticket mt-5">
                <div class="ticket-left">
                    <p class="ticket-label">${selectedSeats.length} seat${selectedSeats.length === 1 ? '' : 's'}</p>
                    <p class="ticket-value">${seatList}</p>
                </div>
                <div class="ticket-divider"></div>
                <div class="ticket-right">
                    <p class="ticket-label">Total</p>
                    <p class="ticket-total">$${total.toFixed(2)}</p>
                </div>
            </div>
        </div>
    `;
}

function computeTicketTotal() {
    const total = selectedSeats.reduce((sum, s) => sum + SEAT_TYPES[s.type].price, 0);
    const seatLabels = selectedSeats.map(s => s.id);
    return { total, seatLabels };
}

function checkoutMarkup() {
    const stepIcon = {
        order: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/></svg>',
        payment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg>',
        confirm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M12 3l8 3v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3z"/><path d="m8.5 12 2.3 2.3 4.7-4.7"/></svg>'
    };

    const arrow = (lit) => `
        <div class="flow-arrow ${lit ? 'is-lit' : ''}" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
        </div>
    `;

    const demoSeats = selectedSeats.length
        ? selectedSeats
        : [{ id: 'B4', type: 'standard' }, { id: 'B5', type: 'standard' }];
    const subtotal = demoSeats.reduce((sum, s) => sum + SEAT_TYPES[s.type].price, 0);
    const discount = checkoutGiftApplied ? Math.min(CHECKOUT_GIFT, subtotal) : 0;
    const total = Math.max(0, subtotal - discount);
    const seatLabels = demoSeats.map(s => s.id).join(', ');

    const steps = [
        { key: 'order', label: 'Order', sub: `${demoSeats.length} seats · ${seatLabels}` },
        { key: 'payment', label: 'Payment', sub: checkoutGiftApplied ? `Gift card −$${discount.toFixed(2)}` : 'Stripe · PayPal · Gift cards' },
        { key: 'confirm', label: 'Confirm', sub: 'Digital QR ticket' }
    ];

    const stepsHtml = steps.map((s, i) => {
        const state = i < checkoutStep ? 'is-done' : i === checkoutStep ? 'is-active' : '';
        return `
            <button type="button" onclick="setCheckoutStep(${i})" class="flow-step ${state}">
                <div class="flow-step-icon">${stepIcon[s.key]}</div>
                <p class="flow-step-label">${s.label}</p>
                <p class="flow-step-sub">${s.sub}</p>
            </button>
        `;
    });

    const grid = `
        <div class="flow-grid">
            ${stepsHtml[0]}
            ${arrow(checkoutStep > 0)}
            ${stepsHtml[1]}
            ${arrow(checkoutStep > 1)}
            ${stepsHtml[2]}
        </div>
    `;

    let panel;
    if (checkoutStep === 0) {
        panel = `
            <div class="flow-panel">
                <p class="flow-panel-title">Order summary</p>
                <div class="ticket">
                    <div class="ticket-left">
                        <p class="ticket-label">${demoSeats.length} seat${demoSeats.length === 1 ? '' : 's'}</p>
                        <p class="ticket-value">${seatLabels}</p>
                    </div>
                    <div class="ticket-divider"></div>
                    <div class="ticket-right">
                        <p class="ticket-label">Subtotal</p>
                        <p class="ticket-total">$${subtotal.toFixed(2)}</p>
                    </div>
                </div>
                <button type="button" class="flow-pay" onclick="setCheckoutStep(1)">Continue to payment</button>
            </div>
        `;
    } else if (checkoutStep === 1) {
        panel = `
            <div class="flow-panel">
                <p class="flow-panel-title">Payment method</p>
                <div class="flow-panel-row">
                    <button type="button" onclick="setCheckoutProvider('stripe')" class="flow-option ${checkoutProvider === 'stripe' ? 'is-active' : ''}">Stripe</button>
                    <button type="button" onclick="setCheckoutProvider('paypal')" class="flow-option ${checkoutProvider === 'paypal' ? 'is-active' : ''}">PayPal</button>
                    <button type="button" onclick="setCheckoutProvider('saved')" class="flow-option ${checkoutProvider === 'saved' ? 'is-active' : ''}">Saved</button>
                </div>

                <button type="button" onclick="toggleCheckoutGift()" class="flow-gift ${checkoutGiftApplied ? 'is-applied' : ''}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-4 w-4 flex-shrink-0">
                        <rect x="3" y="8" width="18" height="13" rx="2"/>
                        <path d="M3 12h18M12 8v13"/>
                        <path d="M12 8a3 3 0 1 0-3-3c0 1.5 1.5 3 3 3zM12 8a3 3 0 1 1 3-3c0 1.5-1.5 3-3 3z"/>
                    </svg>
                    <span>${checkoutGiftApplied ? 'Gift card applied' : 'Apply gift card'}</span>
                    <span class="flow-gift-amount">${checkoutGiftApplied ? '−$' + discount.toFixed(2) : '$' + CHECKOUT_GIFT.toFixed(2)}</span>
                </button>

                <div class="ticket">
                    <div class="ticket-left">
                        <p class="ticket-label">Amount due</p>
                        <p class="ticket-value">${checkoutProvider === 'stripe' ? 'Stripe' : checkoutProvider === 'paypal' ? 'PayPal' : 'Saved card'}</p>
                    </div>
                    <div class="ticket-divider"></div>
                    <div class="ticket-right">
                        <p class="ticket-label">Total</p>
                        <p class="ticket-total">$${total.toFixed(2)}</p>
                    </div>
                </div>

                <button type="button" class="flow-pay" onclick="setCheckoutStep(2)">Complete purchase</button>
            </div>
        `;
    } else {
        panel = `
            <div class="flow-panel">
                <p class="flow-panel-title">Confirmation</p>
                <div class="ticket">
                    <div class="ticket-left">
                        <p class="ticket-label">Paid</p>
                        <p class="ticket-value">${checkoutProvider === 'stripe' ? 'Stripe' : checkoutProvider === 'paypal' ? 'PayPal' : 'Saved card'}</p>
                    </div>
                    <div class="ticket-divider"></div>
                    <div class="ticket-right">
                        <p class="ticket-label">Total</p>
                        <p class="ticket-total">$${total.toFixed(2)}</p>
                    </div>
                </div>
                <p class="flow-hint">A QR ticket was generated for ${demoSeats.length} seat${demoSeats.length === 1 ? '' : 's'}.</p>
                <button type="button" class="flow-pay" onclick="resetCheckoutFlow()">Start over</button>
            </div>
        `;
    }

    return grid + panel;
}

function architectureMarkup() {
    const downArrow = `
        <div class="arch-down" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
        </div>
    `;

    return `
        <div class="mt-6 w-full max-w-4xl">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div class="flex flex-col gap-1.5">
                    <p class="text-[9px] uppercase tracking-[0.25em] text-marquee-muted text-center mb-1">Frontend</p>
                    <div class="arch-block arch-front"><span class="arch-title">Cross-route state</span><span class="arch-file">AuthContext.jsx</span></div>
                    ${downArrow}
                    <div class="arch-block arch-front"><span class="arch-title">App bootstrap</span><span class="arch-file">main.jsx</span></div>
                    ${downArrow}
                    <div class="arch-block arch-front"><span class="arch-title">Route composition</span><span class="arch-file">AppRoutes.jsx</span></div>
                    ${downArrow}
                    <div class="grid grid-cols-2 gap-1.5">
                        <div class="arch-block arch-front"><span class="arch-title">Booking UI</span><span class="arch-file">SeatSelection.jsx</span></div>
                        <div class="arch-block arch-front"><span class="arch-title">Access guards</span><span class="arch-file">RequireAuth.jsx</span></div>
                    </div>
                </div>
                <div class="flex flex-col gap-1.5">
                    <p class="text-[9px] uppercase tracking-[0.25em] text-marquee-muted text-center mb-1">Backend</p>
                    <div class="arch-block arch-back"><span class="arch-title">Server entrypoint</span><span class="arch-file">server.js</span></div>
                    ${downArrow}
                    <div class="arch-block arch-back"><span class="arch-title">HTTP application</span><span class="arch-file">app.js</span></div>
                    ${downArrow}
                    <div class="grid grid-cols-2 gap-1.5">
                        <div class="arch-block arch-back"><span class="arch-title">Domain routes</span><span class="arch-file">orders.js</span></div>
                        <div class="arch-block arch-back"><span class="arch-title">Admin CRUD</span><span class="arch-file">adminRoutes.js</span></div>
                    </div>
                    ${downArrow}
                    <div class="grid grid-cols-3 gap-1.5">
                        <div class="arch-block arch-back"><span class="arch-title">Seat holds</span><span class="arch-file">seatHolds.js</span></div>
                        <div class="arch-block arch-back"><span class="arch-title">Identity</span><span class="arch-file">auth.js</span></div>
                        <div class="arch-block arch-back"><span class="arch-title">Payments</span><span class="arch-file">payments.js</span></div>
                    </div>
                </div>
                <div class="flex flex-col gap-1.5">
                    <p class="text-[9px] uppercase tracking-[0.25em] text-marquee-muted text-center mb-1">Data & Providers</p>
                    <div class="arch-block arch-data"><span class="arch-title">Domain models</span><span class="arch-file">showtime.js · order.js</span></div>
                    ${downArrow}
                    <div class="arch-block arch-data"><span class="arch-title">DB lifecycle</span><span class="arch-file">db.js</span></div>
                    <div class="arch-down" aria-hidden="true" style="opacity:0.3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                    </div>
                    <div class="arch-block arch-ext"><span class="arch-title">Email & SMS</span><span class="arch-file">mailer.js</span></div>
                    ${downArrow}
                    <div class="arch-block arch-ext"><span class="arch-title">Payments provider</span><span class="arch-file">stripeClient.js</span></div>
                </div>
            </div>
            <div class="arch-flow-row mt-6">
                <div class="arch-flow-label">React SPA</div>
                <div class="arch-down" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></div>
                <div class="arch-flow-label">Express API</div>
                <div class="arch-down" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></div>
                <div class="arch-flow-label">MongoDB</div>
            </div>
        </div>
    `;
}

function terminalMarkup() {
    return `
        <div class="terminal">
            <div class="terminal-bar">
                <span class="terminal-dot red"></span>
                <span class="terminal-dot yellow"></span>
                <span class="terminal-dot green"></span>
                <span class="terminal-title">PowerShell — C:\\Users\\donat\\Documents\\GoldCinema</span>
            </div>
            <div class="terminal-body" id="terminal-body"></div>
        </div>
    `;
}

function runTerminalSequence() {
    const body = document.getElementById('terminal-body');
    if (!body) return;

    const lines = [
        { text: '<span class="term-gold">PS</span> <span class="term-blue">C:\\Users\\donat\\Documents\\GoldCinema&gt;</span> <span class="term-white">npm start</span>', delay: 0 },
        { text: '', delay: 180 },
        { text: '<span class="term-dim">&gt; movie-booking-app@1.0.0 start</span>', delay: 120 },
        { text: '<span class="term-dim">&gt; concurrently "npm run dev --prefix frontend" "npm run dev --prefix backend"</span>', delay: 120 },
        { text: '', delay: 100 },
        { text: '<span class="term-warn">[0]</span> <span class="term-dim">npm warn cli npm v12.0.2 does not support Node.js v22.18.0.</span>', delay: 200 },
        { text: '<span class="term-warn">[1]</span> <span class="term-dim">npm warn cli npm v12.0.2 does not support Node.js v22.18.0.</span>', delay: 100 },
        { text: '<span class="term-ok">[0]</span> <span class="term-dim">npm notice run frontend@0.0.0 dev</span>', delay: 240 },
        { text: '<span class="term-ok">[1]</span> <span class="term-dim">npm notice run backend@1.0.0 dev</span>', delay: 120 },
        { text: '<span class="term-ok">[1]</span> <span class="term-dim">npm notice run nodemon server.js</span>', delay: 120 },
        { text: '<span class="term-ok">[0]</span> <span class="term-dim">npm notice run vite --port 3000 --open</span>', delay: 120 },
        { text: '', delay: 100 },
        { text: '<span class="term-gold">[0]</span>  <span class="term-purple">VITE</span> <span class="term-gold">v8.1.5</span>  <span class="term-ok">ready in 1159 ms</span>', delay: 260 },
        { text: '<span class="term-gold">[0]</span>  <span class="term-dim">➜</span>  <span class="term-white">Local:</span>   <span class="term-blue">http://localhost:3000/</span>', delay: 120 },
        { text: '<span class="term-gold">[0]</span>  <span class="term-dim">➜</span>  <span class="term-white">Network:</span> <span class="term-dim">use --host to expose</span>', delay: 120 },
        { text: '<span class="term-ok">[1]</span> <span class="term-dim">[nodemon] 3.1.14</span>', delay: 200 },
        { text: '<span class="term-ok">[1]</span> <span class="term-dim">[nodemon] to restart at any time, enter</span> <span class="term-gold">rs</span>', delay: 100 },
        { text: '<span class="term-ok">[1]</span> <span class="term-dim">[nodemon] watching path(s):</span> <span class="term-white">*.*</span>', delay: 100 },
        { text: '<span class="term-ok">[1]</span> <span class="term-dim">[nodemon] watching extensions: js,mjs,cjs,json</span>', delay: 100 },
        { text: '<span class="term-ok">[1]</span> <span class="term-dim">[nodemon] starting</span> <span class="term-gold">`node server.js`</span>', delay: 140 }
    ];

    body.innerHTML = '';
    let accumulatedDelay = 0;

    lines.forEach((line) => {
        accumulatedDelay += line.delay;
        const el = document.createElement('p');
        el.className = 'terminal-line';
        body.appendChild(el);
        setTimeout(() => {
            el.innerHTML = line.text;
            body.scrollTop = body.scrollHeight;
        }, accumulatedDelay);
    });

    const cursorLine = document.createElement('p');
    cursorLine.className = 'terminal-line';
    cursorLine.innerHTML = '<span class="term-cursor"></span>';
    setTimeout(() => {
        body.appendChild(cursorLine);
        body.scrollTop = body.scrollHeight;
    }, accumulatedDelay + 400);
}

function techMarkup() {
    const tech = [
        {
            name: 'React',
            url: 'https://react.dev',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="color:#61dafb"><circle cx="12" cy="12" r="2" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/></svg>'
        },
        {
            name: 'Vite',
            url: 'https://vitejs.dev',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:#a259ff"><path d="M12 2 3 5l9 17 9-17z"/><path d="m9 6 3 12 3-12" fill="currentColor" opacity="0.7"/></svg>'
        },
        {
            name: 'Node.js',
            url: 'https://nodejs.org',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:#7cc242"><path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M12 6 6 9v6l6 3 6-3V9z" fill="currentColor" opacity="0.45" stroke="none"/></svg>'
        },
        {
            name: 'Express',
            url: 'https://expressjs.com',
            svg: '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#d0d0d0"><text x="12" y="16" text-anchor="middle" font-family="ui-monospace, monospace" font-size="8" font-weight="700">EX</text></svg>'
        },
        {
            name: 'MongoDB',
            url: 'https://www.mongodb.com',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:#4db33d"><path d="M12 2c-3 4-4 8-4 11 0 3 1.5 6 4 9 2.5-3 4-6 4-9 0-3-1-7-4-11z"/><path d="M12 5v16"/></svg>'
        },
        {
            name: 'Mongoose',
            url: 'https://mongoosejs.com',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" style="color:#c9534b"><circle cx="12" cy="12" r="8"/><path d="m8 12 3 3 5-5"/></svg>'
        },
        {
            name: 'Tailwind',
            url: 'https://tailwindcss.com',
            svg: '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#38bdf8"><path d="M6 10c1-3 3-4 5-4 3 0 4 2 6 2 2 0 3-1 4-3-1 3-3 4-5 4-3 0-4-2-6-2-2 0-3 1-4 3z"/><path d="M3 16c1-3 3-4 5-4 3 0 4 2 6 2 2 0 3-1 4-3-1 3-3 4-5 4-3 0-4-2-6-2-2 0-3 1-4 3z"/></svg>'
        },
        {
            name: 'Redux',
            url: 'https://redux-toolkit.js.org',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:#764abc"><circle cx="12" cy="12" r="8"/><path d="m8 8 4 8 4-8"/></svg>'
        },
        {
            name: 'Stripe',
            url: 'https://stripe.com',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:#635bff"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 14c1 0 2-1 2-2s-3-1-3-2 1-2 2-2"/></svg>'
        },
        {
            name: 'PayPal',
            url: 'https://developer.paypal.com',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" style="color:#0070ba"><path d="M7 20 9 5h6a3 3 0 0 1 0 6h-3l-1 6H8"/><path d="M11 20 13 5h6a3 3 0 0 1 0 6h-3l-1 6h-3" opacity="0.55"/></svg>'
        },
        {
            name: 'JWT',
            url: 'https://jwt.io',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:#d63aff"><rect x="4" y="8" width="16" height="10" rx="2"/><path d="M9 12h6"/></svg>'
        },
        {
            name: 'WebAuthn',
            url: 'https://webauthn.guide',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:#e8c773"><circle cx="10" cy="12" r="4"/><path d="M14 12h7M18 12v3"/></svg>'
        },
        {
            name: 'i18next',
            url: 'https://www.i18next.com',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="color:#26a69a"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>'
        },
        {
            name: 'Framer Motion',
            url: 'https://www.framer.com/motion',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:#e8c773"><path d="M6 3h12v6H12zM6 9h12v6H6zM6 15h6v6z"/></svg>'
        },
        {
            name: 'Axios',
            url: 'https://axios-http.com',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" style="color:#5a29e4"><path d="m4 18 8-14 8 14"/><path d="M8 14h8"/></svg>'
        },
        {
            name: 'Lucide',
            url: 'https://lucide.dev',
            svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:#e8c773"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>'
        }
    ];

    const chip = (t) => `
        <a href="${t.url}" target="_blank" rel="noopener noreferrer" class="marquee-item">
            ${t.svg}
            <span>${t.name}</span>
        </a>
    `;

    const chips = tech.map(chip).join('');

    return `
        <div class="marquee" aria-label="Technologies used">
            <div class="marquee-track">
                <div class="marquee-group">
                    ${chips}
                </div>
                <div class="marquee-group" aria-hidden="true">
                    ${chips}
                </div>
            </div>
        </div>
    `;
}

function statsMarkup() {
    const stats = [
        { value: 18, suffix: '+', label: 'Database Models' },
        { value: 3, suffix: '', label: 'MFA Methods' },
        { value: 3, suffix: '', label: 'Languages' },
        { value: 2, suffix: '', label: 'Payment Providers' },
        { value: 9, suffix: '+', label: 'Security Layers' },
        { value: 15, suffix: '+', label: 'Admin Entities' }
    ];
    return `
        <div class="mt-8 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
            ${stats.map((s, i) => `
                <div class="feature-card rounded-xl border border-marquee-line/70 bg-marquee-bg/60 px-4 py-5 text-center">
                    <p class="stat-number font-display text-4xl tracking-wide" data-target="${s.value}" data-suffix="${s.suffix}" data-index="${i}">0${s.suffix}</p>
                    <p class="mt-1 text-[10px] uppercase tracking-[0.2em] text-marquee-muted">${s.label}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function linksMarkup() {
    return `
        <div class="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            <a href="https://go.postman.co/workspace/b036de09-bd7c-4f1b-bd29-3a1579ead5aa" target="_blank" rel="noopener noreferrer"
                class="feature-card flex items-center justify-center gap-3 rounded-xl border border-marquee-gold/40 bg-marquee-gold/10 px-5 py-4 text-sm font-semibold text-marquee-goldBright transition hover:border-marquee-gold hover:bg-marquee-gold/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1"/>
                    <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1"/>
                </svg>
                <span>Postman API Collection</span>
            </a>
            <a href="https://github.com/DonatHalimi/goldcinema" target="_blank" rel="noopener noreferrer"
                class="feature-card flex items-center justify-center gap-3 rounded-xl border border-marquee-line/70 bg-marquee-bg/60 px-5 py-4 text-sm font-semibold text-marquee-cream transition hover:border-marquee-gold/40">
                <svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
                    <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.94c.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z"/>
                </svg>
                <span>GitHub Repository</span>
            </a>
        </div>
        <p class="mt-5 text-[10px] uppercase tracking-[0.25em] text-marquee-muted">
            Built by <a href="https://github.com/DonatHalimi" target="_blank" rel="noopener noreferrer" class="text-marquee-gold hover:text-marquee-goldBright">Donat Halimi</a>
        </p>
    `;
}

function clearSlideTimers() {
    typingTimers.forEach(t => clearTimeout(t));
    typingTimers = [];
    if (statAnimationFrame) {
        cancelAnimationFrame(statAnimationFrame);
        statAnimationFrame = null;
    }
}

function renderSlide() {
    clearSlideTimers();
    const data = slides[currentSlide];
    let extras = '';

    if (data.type === 'intro') {
        extras = introMarkup();
    } else if (data.type === 'seatmap') {
        extras = seatMapMarkup();
    } else if (data.type === 'checkout') {
        extras = checkoutMarkup();
    } else if (data.type === 'architecture') {
        extras = architectureMarkup();
    } else if (data.type === 'terminal') {
        extras = terminalMarkup();
    } else if (data.type === 'techstack') {
        extras = techMarkup();
    } else if (data.type === 'stats') {
        extras = statsMarkup();
    } else if (data.type === 'links') {
        extras = linksMarkup();
    } else if (data.highlights) {
        extras = `
            <div class="mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                ${data.highlights.map(highlight => `
                    <div class="feature-card flex items-center justify-center gap-2 rounded-xl border border-marquee-line/70 bg-marquee-bg/60 px-4 py-3 text-xs font-medium text-marquee-muted shadow-sm transition hover:border-marquee-gold/30 hover:text-marquee-cream">
                        <span class="text-marquee-gold/80">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="m5 12 4 4L19 6"/></svg>
                        </span>
                        <span>${highlight}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    slideContainer.innerHTML = `
    <div class="slide-enter slide-card relative w-full overflow-hidden rounded-2xl border border-marquee-line/70 bg-marquee-panel/80 shadow-[0_18px_55px_-35px_rgb(var(--color-gold)/0.16)] backdrop-blur-xl">
        <div class="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-marquee-gold/5 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-marquee-goldDim/5 blur-3xl"></div>

        <div class="relative z-10 flex flex-col items-center text-center">
            <span class="mb-5 rounded-full border border-marquee-gold/25 bg-marquee-gold/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-marquee-gold">
                ${data.tag}
            </span>

            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-marquee-line bg-marquee-panel2 text-3xl shadow-inner">
                ${svgIcons[data.icon] || svgIcons.clapperboard}
            </div>

            <h2 class="font-display text-4xl tracking-wide text-marquee-goldBright sm:text-5xl" data-title="
                ${data.title}" id="slide-title">
            </h2>

            <h3 class="mt-2 font-serif text-base text-marquee-goldDim sm:text-lg">
                ${data.subtitle}
            </h3>

            <div class="gold-line my-4 h-px w-24"></div>

            ${data.type === 'intro'
            ? ''
            : `<p class="max-w-2xl text-sm leading-relaxed text-marquee-muted sm:text-base">${data.description}</p>`}

            ${extras}
        </div>
    </div>`;

    renderIndicators();

    startTitleTyping();
    if (data.type === 'terminal') runTerminalSequence();
    if (data.type === 'stats') startStatCounters();
}

function startTitleTyping() {
    const target = document.getElementById('slide-title');
    if (!target) return;
    const full = target.dataset.title || '';
    target.textContent = '';

    let i = 0;
    const speed = 30;

    function step() {
        if (i <= full.length) {
            target.textContent = full.slice(0, i);
            target.insertAdjacentHTML('beforeend', '<span class="typing-cursor"></span>');
            i++;
            typingTimers.push(setTimeout(step, speed));
        } else {
            const cursor = target.querySelector('.typing-cursor');
            if (cursor) cursor.remove();
        }
    }
    step();
}

function startStatCounters() {
    const els = document.querySelectorAll('.stat-number[data-target]');
    els.forEach((el, i) => {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 900 + i * 80;
        const startTime = performance.now();

        function tick(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const value = Math.round(target * eased);
            el.textContent = value + suffix;
            if (t < 1) {
                statAnimationFrame = requestAnimationFrame(tick);
            }
        }
        statAnimationFrame = requestAnimationFrame(tick);
    });
}

function fireConfetti() {
    const colors = ['#e8c773', '#c6a15b', '#8a713c', '#f3ecdd', '#d9a94c'];
    const count = 90;
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.35;

    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = originX + 'px';
        piece.style.top = originY + 'px';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.width = (6 + Math.random() * 6) + 'px';
        piece.style.height = (8 + Math.random() * 8) + 'px';
        piece.style.borderRadius = Math.random() > 0.7 ? '50%' : '2px';
        piece.style.zIndex = '99999';
        piece.style.position = 'fixed';
        piece.style.pointerEvents = 'none';

        const dx = (Math.random() - 0.5) * 500;
        const dy = window.innerHeight * 0.7;
        const rot = Math.random() * 720;

        piece.style.transform = `translate(0, 0) rotate(0deg)`;
        piece.style.opacity = '0';

        document.documentElement.appendChild(piece);

        requestAnimationFrame(() => {
            piece.style.transition = 'transform 2.4s cubic-bezier(0.2, 0.6, 0.4, 1), opacity 2.4s ease-out';
            piece.style.opacity = '1';
            piece.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
            piece.style.opacity = '0';
        });

        setTimeout(() => piece.remove(), 2600);
    }
}

function initCursorTrail() {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail';
    document.body.appendChild(dot);

    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;
    let visible = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!visible) {
            visible = true;
            trailX = mouseX;
            trailY = mouseY;
            dot.classList.add('is-visible');
        }
    });

    document.addEventListener('mouseleave', () => {
        visible = false;
        dot.classList.remove('is-visible');
    });

    function loop() {
        trailX += (mouseX - trailX) * 0.18;
        trailY += (mouseY - trailY) * 0.18;
        dot.style.transform = `translate(${trailX}px, ${trailY}px) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
    }
    loop();
}

function toggleSeat(seatId, type) {
    const existing = selectedSeats.find(s => s.id === seatId);
    if (existing) {
        selectedSeats = selectedSeats.filter(s => s.id !== seatId);
    } else {
        selectedSeats = [...selectedSeats, { id: seatId, type }];
    }
    renderSlide();
    if (selectedSeats.length === 1) {
        showToast('Seat reserved', 'Hold expires in 5:00 — continue to checkout to keep it.');
    }
}

function setCheckoutStep(step) {
    const prev = checkoutStep;
    checkoutStep = step;
    renderSlide();
    if (step === 2 && prev !== 2) {
        showToast('Payment confirmed', 'A digital ticket has been generated.');
        fireConfetti();
    }
}

function setCheckoutProvider(p) {
    checkoutProvider = p;
    renderSlide();
}

function toggleCheckoutGift() {
    checkoutGiftApplied = !checkoutGiftApplied;
    renderSlide();
}

function resetCheckoutFlow() {
    checkoutStep = 0;
    checkoutProvider = 'stripe';
    checkoutGiftApplied = false;
    renderSlide();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    selectedSeats = [];
    resetCheckoutFlowState();
    renderSlide();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    selectedSeats = [];
    resetCheckoutFlowState();
    renderSlide();
}

function goToSlide(index) {
    if (index === currentSlide) return;
    currentSlide = index;
    selectedSeats = [];
    resetCheckoutFlowState();
    renderSlide();
}

function resetCheckoutFlowState() {
    checkoutStep = 0;
    checkoutProvider = 'stripe';
    checkoutGiftApplied = false;
}

function toggleAutoPlay() {
    isAutoPlaying = !isAutoPlaying;
    if (isAutoPlaying) {
        autoPlayIcon.innerHTML = '<path d="M7 5h3v14H7zM14 5h3v14h-3z"/>';
        autoPlayBtn.classList.add('border-marquee-gold/40', 'text-marquee-gold', 'bg-marquee-gold/10');
        renderSegments();
        autoPlayInterval = setInterval(nextSlide, 5000);
        showToast('Auto-play on', 'Slides advance every 5 seconds.');
    } else {
        autoPlayIcon.innerHTML = '<path d="m8 5 11 7-11 7V5Z"/>';
        autoPlayBtn.classList.remove('border-marquee-gold/40', 'text-marquee-gold', 'bg-marquee-gold/10');
        renderSegments();
        clearInterval(autoPlayInterval);
    }
}

let toastTimer = null;
function showToast(title, message, duration = 4000) {
    const toast = document.getElementById('toast');
    toast.querySelector('.toast-title').textContent = title;
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), duration);
}

document.querySelector('.toast-close').addEventListener('click', () => {
    document.getElementById('toast').classList.remove('is-visible');
});

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
    } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        toggleAutoPlay();
    }
});

updateThemeIcon();
renderSlide();
initCursorTrail();

setTimeout(() => {
    showToast('Welcome to GoldCinema', 'Use arrow keys or the side nav to explore.', 5000);
}, 800);