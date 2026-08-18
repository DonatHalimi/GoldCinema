export default function SessionSkeleton() {
    return (
        <div className="flex animate-pulse items-start gap-4 rounded-xl border border-marquee-line bg-marquee-bg p-4">
            <div className="h-11 w-11 rounded-xl bg-marquee-panel2" />

            <div className="flex-1 space-y-2.5">
                <div className="h-3.5 w-40 rounded bg-marquee-panel2" />
                <div className="h-2.5 w-64 rounded bg-marquee-panel2" />
                <div className="h-2.5 w-48 rounded bg-marquee-panel2" />
            </div>
        </div>
    );
}