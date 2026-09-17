import { BadgeAlert, BadgeCheck, Lock, Mail, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getProfile, resendEmailVerification, updatePassword, updateProfile } from '../../../api/auth';
import { Field, PasswordField } from '../../ui/FormUI';
import { useTranslation } from 'react-i18next';

export default function ProfileSettings() {
    const { t } = useTranslation('account');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        emailVerified: false,
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const data = await getProfile();

            const userData = data?.user || data || {};

            setForm({
                name: userData.name || '',
                email: userData.email || '',
                emailVerified: userData.emailVerified || false,
            });
        } catch (error) {
            toast.error('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e) {
        e.preventDefault();

        try {
            setSaving(true);

            const { data } = await updateProfile(form);

            toast.success(data.message || 'Profile updated successfully');

            setForm((prev) => ({
                ...prev,
                emailVerified: data.user?.emailVerified || prev.emailVerified,
            }));
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    }

    async function handlePasswordChange(e) {
        e.preventDefault();

        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            toast.error('Please fill in both password fields.');
            return;
        }

        if (passwordForm.currentPassword === passwordForm.newPassword) {
            toast.error('New password must be different from your current password.');
            return;
        }

        try {
            setChangingPassword(true);

            const response = await updatePassword(passwordForm);

            toast.success(response.data?.message || 'Password updated successfully. Please log in again.');

            setPasswordForm({
                currentPassword: '',
                newPassword: '',
            });

            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update password.');
        } finally {
            setChangingPassword(false);
        }
    }

    async function resendVerification() {
        try {
            const { data } = await resendEmailVerification();

            toast.success(data.message || 'Verification email sent.');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Unable to resend email.');
        }
    }

    if (loading) {
        return (
            <div className="rounded-xl border border-marquee-line bg-marquee-panel p-6">
                Loading...
            </div>
        );
    }

    return (
        <div>
            <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                {t("profileHeader")}
            </h2>

            <p className="mt-1 text-sm text-marquee-muted">
                {t("manageAccountInformation")}
            </p>

            <form onSubmit={handleSave} className="mt-8 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
                    <Field
                        label={t("fullName")}
                        name="name"
                        icon={User}
                        value={form.name || ''}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                    />

                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <label className="text-sm font-medium text-marquee-muted">
                                {t("email")}
                            </label>

                            {form.emailVerified ? (
                                <div className="flex items-center gap-1 text-xs text-green-400">
                                    <BadgeCheck className="h-4 w-4" />
                                    {t("isVerified")}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={resendVerification}
                                    className="flex items-center gap-1 text-xs text-yellow-400 transition hover:text-marquee-gold"
                                >
                                    <BadgeAlert className="h-4 w-4" />
                                    Verify email
                                </button>
                            )}
                        </div>

                        <Field
                            label=""
                            name="email"
                            type="email"
                            icon={Mail}
                            value={form.email || ''}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 rounded-lg border border-marquee-gold px-5 py-3 text-marquee-gold transition hover:bg-marquee-gold hover:text-marquee-bg disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? t("saving") : t("save")}
                    </button>
                </div>
            </form>

            <div className="mt-12 border-t border-marquee-line pt-8">
                <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                    {t("changePasswordHeader")}
                </h2>

                <p className="mt-1 text-sm text-marquee-muted">
                    {t("changePasswordDescription")}
                </p>

                <form onSubmit={handlePasswordChange} className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <PasswordField
                            label={t('currentPsw')}
                            name="currentPassword"
                            value={passwordForm.currentPassword || ''}
                            onChange={(value) => setPasswordForm((prev) => ({ ...prev, currentPassword: value }))}
                        />

                        <PasswordField
                            label={t('newPsw')}
                            name="newPassword"
                            value={passwordForm.newPassword || ''}
                            onChange={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={changingPassword}
                        className="flex items-center gap-2 rounded-lg border border-marquee-gold px-5 py-3 text-marquee-gold transition hover:bg-marquee-gold hover:text-marquee-bg disabled:opacity-50"
                    >
                        <Lock className="h-4 w-4" />
                        {changingPassword ? t('updatingPsw') : t('updatePsw')}
                    </button>
                </form>
            </div>
        </div>
    );
}