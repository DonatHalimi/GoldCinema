import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../../api/client.js';
import Disable2faModal from '../../ui/Disable2faModal.jsx.jsx';
import EnableEmail2faModal from '../../ui/EnableEmail2faModal.jsx';
import EnableTotpModal from '../../ui/EnableTotpModal.jsx';
import LoginAlertsSettings from './LoginAlertsSettings.jsx';
import PasskeySettings from './PasskeySettings.jsx';
import SecurityActivityCard from '../SecurityActivityCard.jsx';
import TrustedDevicesSettings from './TrustedDeviceSettings.jsx';
import TwoFactorSettings from './TwoFactorSettings';
import BackupCodesCard from '../../ui/BackupCodesCard.jsx';
import SecurityLogExportCard from '../../ui/SecurityLogExportCard.jsx';

export default function SecuritySettings() {
    const [showEmailVerify, setShowEmailVerify] = useState(false);
    const [showTotpSetup, setShowTotpSetup] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [disableMethod, setDisableMethod] = useState(null);

    const [twoFactor, setTwoFactor] = useState({
        enabled: false,
        methods: [],
    });

    const [loginAlerts, setLoginAlerts] = useState(true);
    const [loading, setLoading] = useState(false);
    const [alertsLoading, setAlertsLoading] = useState(false);

    useEffect(() => {
        const fetchSecurityStatus = async () => {
            try {
                const { data } = await api.get('/auth/me');

                const userData = data.user || data;

                setTwoFactor({
                    enabled: userData?.twoFactor?.enabled || false,
                    methods: userData?.twoFactor?.methods || [],
                });

                if (userData?.loginAlerts !== undefined) {
                    setLoginAlerts(userData.loginAlerts);
                }
            } catch (err) {
                toast.error('Failed to load security status.');
            }
        };

        fetchSecurityStatus();
    }, []);

    const handle2FASuccess = (method = 'email') => {
        setTwoFactor((prev) => ({
            enabled: true,
            methods: prev.methods.includes(method)
                ? prev.methods
                : [...prev.methods, method],
        }));

        setShowEmailVerify(false);
        setShowTotpSetup(false);
    };

    const handle2FADisableSuccess = () => {
        setTwoFactor((prev) => {
            const methods = prev.methods.filter(
                (method) => method !== disableMethod
            );

            return {
                enabled: methods.length > 0,
                methods,
            };
        });

        setDisableMethod(null);
        setShowDisableModal(false);
    };

    return (
        <div>
            <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                Security
            </h2>

            <p className="mt-2 text-sm text-marquee-muted">
                Manage your account security and authentication methods
            </p>

            <div className="mt-6 space-y-5">
                <TwoFactorSettings />

                <BackupCodesCard twoFactor={twoFactor} />

                <PasskeySettings twoFactor={twoFactor} />

                <SecurityActivityCard />

                <SecurityLogExportCard />

                <TrustedDevicesSettings />

                <LoginAlertsSettings initialLoginAlerts={loginAlerts} onUpdate={setLoginAlerts} />

                {showEmailVerify && (
                    <EnableEmail2faModal
                        onClose={() => setShowEmailVerify(false)}
                        onSuccess={() => handle2FASuccess('email')}
                    />
                )}

                {showDisableModal && (
                    <Disable2faModal
                        method={disableMethod}
                        onClose={() => {
                            setShowDisableModal(false);
                            setDisableMethod(null);
                        }}
                        onSuccess={handle2FADisableSuccess}
                    />
                )}

                {showTotpSetup && (
                    <EnableTotpModal
                        onClose={() => setShowTotpSetup(false)}
                        onSuccess={() => handle2FASuccess('totp')}
                    />
                )}
            </div>
        </div>
    );
}