import { Trash } from 'lucide-react';
import React, { useState } from 'react';
import DeleteAccountModal from '../ui/DeleteAccountModal';

export default function DangerZone() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
        Danger Zone
      </h2>
      <p className="mt-1 text-sm text-marquee-muted">
        Permanently deactivate your account. This action requires your password and can be undone only during the grace period.
      </p>
      <div>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-500 px-5 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
        >
          <Trash className="h-4 w-4" />
          <span>Delete Account</span>
        </button>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}