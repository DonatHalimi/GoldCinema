export default function ProfileSettings() {
    return (
        <div>
            <h1 className="font-display text-2xl text-marquee-goldBright">
                Profile Settings
            </h1>

            <div className="mt-6 space-y-5">
                <div>
                    <label className="text-sm text-marquee-muted">
                        Email
                    </label>

                    <input
                        className="mt-2 w-full rounded-lg border border-marquee-line bg-marquee-bg px-4 py-3 text-marquee-cream"
                        placeholder="email@example.com"
                    />
                </div>

                <div>
                    <label className="text-sm text-marquee-muted">
                        Password
                    </label>

                    <button className="mt-2 rounded-lg border border-marquee-gold px-5 py-2 text-marquee-gold transition hover:bg-marquee-gold hover:text-marquee-bg">
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
}