import { useState } from 'react';
import { Mail, PhoneCall, Contact2, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.post('/contact', formData);
            toast.success('Your message has been sent successfully!');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="text-center">
                <h2 className="font-display text-3xl font-semibold tracking-wide text-marquee-goldBright">
                    Get in Touch
                </h2>
                <p className="mt-2 text-sm text-marquee-muted">
                    Have questions about bookings, movies, or your account? We're here to help.
                </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
                {/* Contact Info Cards */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-marquee-line bg-marquee-panel p-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-marquee-panel2 p-3 text-marquee-gold">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-marquee-cream">Email Us</h3>
                                <a href="mailto:goldcinema.info@gmail.com" className="text-sm text-marquee-muted transition hover:text-marquee-gold">
                                    goldcinema.info@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-marquee-line bg-marquee-panel p-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-marquee-panel2 p-3 text-marquee-gold">
                                <PhoneCall className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-marquee-cream">Call Us</h3>
                                <a href="tel:+38344111222" className="text-sm text-marquee-muted transition hover:text-marquee-gold">
                                    +383 44 111 222
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="rounded-xl border border-marquee-line bg-marquee-panel p-8 lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-marquee-cream mb-2">Your Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                    className="w-full rounded-lg border border-marquee-line bg-marquee-bg px-4 py-3 text-sm text-marquee-cream focus:border-marquee-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-marquee-cream mb-2">Your Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="john@example.com"
                                    className="w-full rounded-lg border border-marquee-line bg-marquee-bg px-4 py-3 text-sm text-marquee-cream focus:border-marquee-gold focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-marquee-cream mb-2">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                placeholder="How can we help you?"
                                className="w-full rounded-lg border border-marquee-line bg-marquee-bg px-4 py-3 text-sm text-marquee-cream focus:border-marquee-gold focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-marquee-cream mb-2">Message</label>
                            <textarea
                                name="message"
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                placeholder="Type your message here..."
                                className="w-full rounded-lg border border-marquee-line bg-marquee-bg px-4 py-3 text-sm text-marquee-cream focus:border-marquee-gold focus:outline-none"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-full bg-marquee-gold px-8 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-marquee-goldBright disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}