import { Laptop, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../../api/client';
import RevokeDeviceModal from '../../ui/modals/RevokeDeviceModal';
import { getTrustedDevices } from '../../../api/auth';

export default function TrustedDevicesSettings() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState(null);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const { data } = await getTrustedDevices();
                setDevices(data.devices || []);
            } catch (err) {
                toast.error('Failed to load trusted devices.');
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    const handleSuccessRevoke = (deviceId) => {
        setDevices((prev) => prev.filter((d) => d._id !== deviceId));
        setSelectedDevice(null);
        toast.success('Device removed successfully.');
    };

    return (
        <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                    <Laptop className="h-5 w-5" />
                </div>

                <div>
                    <h3 className="font-semibold text-marquee-cream">Trusted Devices</h3>
                    <p className="text-sm text-marquee-muted">
                        Manage devices you've marked as trusted for quicker and safer sign-ins
                    </p>
                </div>
            </div>

            <div className="mt-5">
                {loading ? (
                    <p className="text-sm text-marquee-muted">Loading devices...</p>
                ) : devices.length === 0 ? (
                    <p className="text-sm text-marquee-muted">No trusted devices found.</p>
                ) : (
                    <div className="space-y-3">
                        {devices.map((device) => (
                            <div key={device._id} className="flex items-center justify-between rounded-lg border border-marquee-line bg-marquee-panel2 p-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-marquee-cream">
                                            {device.label || device.name || 'Unknown Device'}
                                        </p>
                                        <p className="text-xs text-marquee-muted">
                                            Added on {new Date(device.createdAt).toLocaleDateString('en-GB')}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedDevice(device)}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Revoke
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedDevice && (
                <RevokeDeviceModal
                    device={selectedDevice}
                    onClose={() => setSelectedDevice(null)}
                    onSuccess={handleSuccessRevoke}
                />
            )}
        </div>
    );
}