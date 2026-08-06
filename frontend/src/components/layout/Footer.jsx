import {
    Mail,
    Phone,
    Contact,
    PhoneCall,
    MailIcon,
    Contact2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedInIcon } from '../ui/Icons';

export const Footer = () => {
    const footerLinks = {
        social: [
            {
                href: 'https://facebook.com',
                icon: <FacebookIcon />,
                label: 'Facebook',
            },
            {
                href: 'https://instagram.com',
                icon: <InstagramIcon />,
                label: 'Instagram',
            },
            {
                href: 'https://www.linkedin.com/in/donat-halimi-0719b0193/',
                icon: <LinkedInIcon />,
                label: 'LinkedIn',
            },
            {
                href: 'https://github.com/DonatHalimi/GoldCinema',
                icon: <GithubIcon />,
                label: 'GitHub',
            },
        ],

        quick: [
            { to: '/', label: 'Home' },
            { to: '/movies', label: 'Movies' },
            { to: '/my-tickets', label: 'My Tickets' },
            { to: '/account', label: 'Account' },
        ],

        support: [
            { to: '/contact', label: 'Contact Us' },
            { to: '/faq', label: 'FAQs' },
            { to: '/privacy', label: 'Privacy Policy' },
            { to: '/terms', label: 'Terms of Service' },
        ],

        contact: [
            {
                linkType: 'external',
                href: 'mailto:goldcinema.info@gmail.com',
                icon: <MailIcon />,
                label: 'Email',
            },
            {
                linkType: 'external',
                href: 'tel:+38344111222',
                icon: <PhoneCall />,
                label: 'Phone',
            },
            {
                linkType: 'internal',
                to: '/contact',
                icon: <Contact2 />,
                label: 'Contact',
            },
        ],
    };

    const currentYear = new Date().getFullYear();
    const displayYear = () => {
        const currentYear = new Date().getFullYear();
        return currentYear === 2026 ? '2026' : `2026 - ${currentYear}`;
    };

    return (
        <footer className="mt-40 border-t border-marquee-line bg-marquee-panel">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
                    <div>
                        <Link to="/" className="flex items-center gap-2">
                            <span className="font-display text-3xl tracking-wide text-marquee-goldBright">
                                GOLD<span className="text-marquee-cream">CINEMA</span>
                            </span>
                        </Link>

                        <p className="mb-4 text-sm leading-6 text-marquee-muted">
                            Experience blockbuster entertainment with seamless ticket
                            booking, premium seats, and unforgettable movie nights.
                        </p>

                        <p className="mb-3 text-sm text-marquee-muted">
                            Stay connected with us
                        </p>

                        <div className="flex gap-4">
                            {footerLinks.social.map(({ href, icon, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="text-marquee-muted transition hover:text-marquee-gold"
                                >
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 font-semibold text-marquee-cream">
                            Quick Links
                        </h3>

                        <ul className="space-y-2">
                            {footerLinks.quick.map(({ to, label }) => (
                                <li key={label}>
                                    <Link
                                        to={to}
                                        className="text-sm text-marquee-muted transition hover:text-marquee-gold"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="mb-4 font-semibold text-marquee-cream">
                            Support
                        </h3>

                        <ul className="space-y-2">
                            {footerLinks.support.map(({ to, label }) => (
                                <li key={label}>
                                    <Link
                                        to={to}
                                        className="text-sm text-marquee-muted transition hover:text-marquee-gold"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 font-semibold text-marquee-cream">
                            Contact Us
                        </h3>

                        <p className="mb-4 text-sm text-marquee-muted">
                            Need help with your booking? We're here to assist.
                        </p>

                        <div className="space-y-3">
                            {footerLinks.contact.map(
                                ({ linkType, href, to, icon, label }) =>
                                    linkType === 'external' ? (
                                        <a
                                            key={label}
                                            href={href}
                                            className="flex items-center gap-2 text-sm text-marquee-muted transition hover:text-marquee-gold"
                                        >
                                            {icon}
                                            <span>{label}</span>
                                        </a>
                                    ) : (
                                        <Link
                                            key={label}
                                            to={to}
                                            className="flex items-center gap-2 text-sm text-marquee-muted transition hover:text-marquee-gold"
                                        >
                                            {icon}
                                            <span>{label}</span>
                                        </Link>
                                    )
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-10 border-t border-marquee-line pt-6 text-center text-xs text-marquee-muted">
                    &copy; {displayYear()} GoldCinema. All rights reserved. |{' '}
                    <a
                        href="https://github.com/DonatHalimi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline transition hover:text-marquee-gold"
                    >
                        Donat Halimi
                    </a>
                </div>
            </div>
        </footer>
    );
};