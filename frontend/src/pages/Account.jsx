import AccountSidebar from '../components/account/AccountSidebar';
import { Outlet } from 'react-router-dom';

export default function Account() {
    return (
        <div className="mx-auto flex max-w-6xl items-start gap-8 px-6 py-12">

            <AccountSidebar />

            <main className="min-w-0 flex-1 rounded-xl border border-marquee-line bg-marquee-panel p-8">
                <Outlet />
            </main>

        </div>
    );
}