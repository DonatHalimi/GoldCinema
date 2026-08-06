import { ShieldCheck } from 'lucide-react';

export default function SecuritySettings() {
    return (
        <div>
            <h1 className="font-display text-2xl text-marquee-goldBright">
                Security
            </h1>

            <div className="mt-6 rounded-xl border border-marquee-line bg-marquee-bg p-5">

                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-marquee-gold" />

                    <div>
                        <h3 className="font-semibold text-marquee-cream">
                            Two-Factor Authentication
                        </h3>

                        <p className="text-sm text-marquee-muted">
                            Add an extra layer of protection to your account.
                        </p>
                    </div>
                </div>

                <button
                    disabled
                    className="mt-5 cursor-not-allowed rounded-full bg-marquee-panel2 px-5 py-2 text-sm text-marquee-muted"
                >
                    Coming soon
                </button>

            </div>
        </div>
    );
}