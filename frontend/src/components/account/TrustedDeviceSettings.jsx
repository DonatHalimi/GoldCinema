import { useState, useEffect } from 'react';
import { Laptop, Trash2 } from 'lucide-react';
import api from '../../api/client';
import { toast } from 'react-toastify';

export default function TrustedDevicesSettings() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const { data } = await api.get('/auth/devices');
                setDevices(data.devices || []);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load trusted devices.');
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    const handleRevokeDevice = async (deviceId) => {
        try {
            setActionLoading(deviceId);
            await api.delete(`/auth/devices/${deviceId}`);
            setDevices((prev) => prev.filter((d) => d._id !== deviceId));
            toast.success('Device removed successfully.');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to remove device.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
            <div className="flex items-center gap-3">
                <Laptop className="h-6 w-6 text-marquee-gold" />
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
                            <div
                                key={device._id}
                                className="flex items-center justify-between rounded-lg border border-marquee-line bg-marquee-panel2 p-3 text-sm"
                            >
                                <div>
                                    <p className="font-medium text-marquee-cream">
                                        {device.name || 'Unknown Device'}
                                    </p>
                                    <p className="text-xs text-marquee-muted">
                                        Added on {new Date(device.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRevokeDevice(device._id)}
                                    disabled={actionLoading === device._id}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {actionLoading === device._id ? 'Removing...' : 'Revoke'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}