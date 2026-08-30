import { LogOut } from 'lucide-react';
import Modal from './Modal';

export default function LogoutAllDevicesModal({ isOpen, count, loading, onCancel, onConfirm }) {
    if (!isOpen) return null;

    return (
        <Modal
            isOpen
            onClose={onCancel}
            title="Log out of all devices?"
            closeDisabled={loading}
        >
            <div className="mt-5">
                <p className="text-sm text-marquee-muted">
                    This ends {count} active session{count !== 1 ? 's' : ''}, including this
                    device. You'll need to sign in again everywhere
                </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition-colors hover:border-marquee-gold hover:text-marquee-cream disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                >
                    <LogOut size={16} />
                    {loading ? 'Logging out...' : 'Log out everywhere'}
                </button>
            </div>
        </Modal>
    );
}