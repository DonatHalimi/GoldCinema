import { LogOut, Trash } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logoutAllDevices } from '../../../api/auth';
import { useAuth } from '../../../context/AuthContext';
import DeleteAccountModal from '../../ui/modals/DeleteAccountModal';
import LogoutAllDevicesModal from '../../ui/modals/LogOutAllDevicesModal';

export default function DangerZone() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogoutAll() {
    try {
      setLoggingOut(true);
      await logoutAllDevices();

      setUser(null);
      toast.success('Logged out of all devices.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Failed to log out of all devices.');
    } finally {
      setLoggingOut(false);
      setShowLogoutAllModal(false);
    }
  }

  return (
    <>
      <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
        Danger Zone
      </h2>
      <p className="mt-1 text-sm text-marquee-muted">
        Permanently deactivate your account. This action requires your password and can be undone only during the grace period
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowLogoutAllModal(true)}
          className="inline-flex items-center gap-2 rounded-full border border-marquee-line px-5 py-2 text-sm font-semibold text-marquee-cream transition hover:border-red-500/50 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out of All Devices</span>
        </button>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 rounded-full border border-red-500 px-5 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
        >
          <Trash className="h-4 w-4" />
          <span>Delete Account</span>
        </button>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}

      <LogoutAllDevicesModal
        isOpen={showLogoutAllModal}
        count={null}
        loading={loggingOut}
        onCancel={() => setShowLogoutAllModal(false)}
        onConfirm={handleLogoutAll}
      />
    </>
  );
}