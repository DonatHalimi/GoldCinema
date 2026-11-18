import { BadgeAlert, CheckCircle2, Lock, Mail, Save, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getProfile, resendEmailVerification, updatePassword, updateProfile } from '../../../api/auth';
import { Field, PasswordField } from '../../ui/FormUI';
import SocialAccounts from './SocialAccounts';

function SectionCard({ icon: Icon, title, description, children, id }) {
    return (
        <section id={id} className="scroll-mt-28 rounded-xl border border-marquee-line bg-marquee-bg p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-marquee-line bg-marquee-panel2 text-marquee-gold">
                    <Icon size={19} />
                </div>
                <div>
                    <h3 className="font-semibold text-marquee-cream">{title}</h3>
                    <p className="mt-1 text-sm text-marquee-muted">{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

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

            setPasswordForm({ currentPassword: '', newPassword: '' });

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

    return (
        <div className="space-y-7">
            <header className="border-b border-marquee-line pb-6">
                <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                    {t('profileHeader')}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-marquee-muted">
                    {t('manageAccountInformation')}
                </p>
            </header>

            <div className="space-y-5">
                <SectionCard
                    icon={User}
                    title={t('profileHeader')}
                    description={t('manageAccountInformation')}
                >
                    {loading ? (
                        <p className="text-sm text-marquee-muted">Loading profile…</p>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="flex flex-col">
                                    <div className="mb-2 flex h-6 items-center gap-2">
                                        <label className="text-sm font-medium text-marquee-muted">
                                            {t('fullName')}
                                        </label>
                                    </div>

                                    <Field
                                        label=""
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
                                </div>

                                <div className="flex flex-col">
                                    <div className="mb-2 flex h-6 items-center gap-2">
                                        <label className="text-sm font-medium text-marquee-muted">
                                            {t('email')}
                                        </label>

                                        {form.emailVerified ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs font-medium leading-none text-green-400">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                {t('isVerified')}
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={resendVerification}
                                                className="inline-flex items-center gap-1 text-xs leading-none text-yellow-400 transition hover:text-marquee-gold"
                                            >
                                                <BadgeAlert className="h-3.5 w-3.5" />
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

                            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-gold disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    {saving ? t('saving') : t('save')}
                                </button>
                            </div>
                        </form>
                    )}
                </SectionCard>

                <SectionCard
                    icon={Lock}
                    title={t('changePasswordHeader')}
                    description={t('changePasswordDesc')}
                >
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <PasswordField
                                label={t('currentPsw')}
                                name="currentPassword"
                                value={passwordForm.currentPassword || ''}
                                onChange={(value) =>
                                    setPasswordForm((prev) => ({
                                        ...prev,
                                        currentPassword: value,
                                    }))
                                }
                            />

                            <PasswordField
                                label={t('newPsw')}
                                name="newPassword"
                                value={passwordForm.newPassword || ''}
                                onChange={(value) =>
                                    setPasswordForm((prev) => ({
                                        ...prev,
                                        newPassword: value,
                                    }))
                                }
                            />
                        </div>

                        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-marquee-line px-3 py-2 text-xs font-medium text-marquee-muted transition hover:border-marquee-gold/40 hover:text-marquee-gold disabled:opacity-50"
                            >
                                <Lock className="h-4 w-4" />
                                {changingPassword ? t('updatingPsw') : t('updatePsw')}
                            </button>
                        </div>
                    </form>
                </SectionCard>

                <SectionCard
                    icon={Users}
                    title="Connected Accounts"
                    description="Connect external accounts to sign in to GoldCinema. You can disconnect an account when another sign-in method remains available."
                >
                    <SocialAccounts />
                </SectionCard>
            </div>
        </div>
    );
}