import { LogOut, Trash } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logoutAllDevices } from '../../../api/auth';
import { useAuth } from '../../../context/AuthContext';
import DeleteAccountModal from '../../ui/modals/DeleteAccountModal';
import LogoutAllDevicesModal from '../../ui/modals/LogOutAllDevicesModal';

export default function DangerZone() {
  const { t } = useTranslation('account');

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

      toast.success(t('logoutAllSuccess'));
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
        error.message ||
        t('logoutAllError')
      );
    } finally {
      setLoggingOut(false);
      setShowLogoutAllModal(false);
    }
  }

  return (
    <>
      <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
        {t('dangerZone')}
      </h2>
      <p className="mt-1 text-sm text-marquee-muted">
        {t('dangerZoneDesc')}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowLogoutAllModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-gold disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('logoutAllDevices')}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-500/30 bg-marquee-bg/40 px-3 py-2 text-xs font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
        >
          <Trash className="h-4 w-4" />
          <span>{t('deleteAccount')}</span>
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