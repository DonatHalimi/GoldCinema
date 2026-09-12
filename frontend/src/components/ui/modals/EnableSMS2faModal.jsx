import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { activateSms2FA, verifySms2FA } from '../../../api/auth';
import Modal from './Modal';

const COUNTRIES = [
    {
        code: 'AL',
        name: 'Albania',
        dialCode: '+355',
        flag: (
            <img
                src="https://flagcdn.com/al.svg"
                alt="Albania"
                className="h-4 w-6 rounded-sm object-cover shadow-sm"
            />
        ),
        prefixes: [
            '62',
            '63',
            '64',
            '65',
            '66',
            '67',
            '68',
            '69',
        ],
        placeholder: '69 XXX XXX',
        format: (val) => {
            const cleaned = val.replace(/\D/g, '').substring(0, 9);

            if (cleaned.length > 5) {
                return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
            }

            if (cleaned.length > 2) {
                return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
            }

            return cleaned;
        },
    },

    {
        code: 'XK',
        name: 'Kosovo',
        dialCode: '+383',
        flag: (
            <img
                src="https://flagcdn.com/xk.svg"
                alt="Kosovo"
                className="h-4 w-6 rounded-sm object-cover shadow-sm"
            />
        ),
        prefixes: [
            '43',
            '44',
            '45',
            '46',
            '47',
            '48',
            '49',
        ],
        placeholder: '44 XXX XXX',
        format: (val) => {
            const cleaned = val.replace(/\D/g, '').substring(0, 8);

            if (cleaned.length > 5) {
                return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
            }

            if (cleaned.length > 2) {
                return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
            }

            return cleaned;
        },
    },

    {
        code: 'MK',
        name: 'North Macedonia',
        dialCode: '+389',
        flag: (
            <img
                src="https://flagcdn.com/mk.svg"
                alt="North Macedonia"
                className="h-4 w-6 rounded-sm object-cover shadow-sm"
            />
        ),
        prefixes: [
            '70',
            '71',
            '72',
            '75',
            '76',
            '77',
            '78',
        ],
        placeholder: '70 XXX XXX',
        format: (val) => {
            const cleaned = val.replace(/\D/g, '').substring(0, 8);

            if (cleaned.length > 5) {
                return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
            }

            if (cleaned.length > 2) {
                return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
            }

            return cleaned;
        },
    },
];

export default function EnableSms2faModal({ onSuccess, onClose }) {
    const [step, setStep] = useState('phone');
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [localNumber, setLocalNumber] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [otp, setOtp] = useState(Array(6).fill(''));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const inputRefs = useRef([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (step !== 'code') return;
        const timer = setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, [step]);

    const handlePhoneChange = (e) => {
        const formatted = selectedCountry.format(e.target.value);
        setLocalNumber(formatted);
    };

    const handleSendCode = async (e) => {
        e.preventDefault();

        if (loading) return;

        const cleanedNumber = localNumber.replace(/\D/g, '');
        const expectedLength =
            selectedCountry.code === 'AL' ? 9 : 8;

        if (cleanedNumber.length !== expectedLength) {
            setError(
                `Please enter a valid ${expectedLength}-digit mobile number.`
            );
            return;
        }

        const prefix = cleanedNumber.substring(0, 2);

        if (!selectedCountry.prefixes.includes(prefix)) {
            setError(
                `Invalid mobile prefix for ${selectedCountry.name}.`
            );
            return;
        }

        const fullPhoneNumber =
            `${selectedCountry.dialCode}${cleanedNumber}`;

        try {
            setLoading(true);
            setError('');

            await activateSms2FA(fullPhoneNumber);

            setStep('code');
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Failed to send code.'
            );
        } finally {
            setLoading(false);
        }
    };

    const submitCode = async (codeToSubmit) => {
        if (codeToSubmit.length !== 6 || loading) return;

        try {
            setLoading(true);
            setError('');

            await verifySms2FA(codeToSubmit);

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) inputRefs.current[index + 1]?.focus();

        const fullCode = newOtp.join('');
        if (fullCode.length === 6 && newOtp.every((digit) => digit !== '')) {
            submitCode(fullCode);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtp(digits);
            inputRefs.current[5]?.focus();
            submitCode(pastedData);
        }
    };

    const handleVerifySubmit = (e) => {
        e.preventDefault();
        submitCode(otp.join(''));
    };

    const fullDisplayNumber = `${selectedCountry.dialCode} ${localNumber}`;

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={step === 'phone' ? 'Set Up SMS 2FA' : 'Verify SMS 2FA'}
            closeDisabled={loading}
        >
            {step === 'phone' ? (
                <>
                    <p className="mt-2 text-sm text-marquee-muted">
                        Enter the phone number to receive verification codes.
                    </p>

                    <form onSubmit={handleSendCode} className="mt-5 space-y-4">
                        <div className="flex gap-2">
                            <div className="relative shrink-0" ref={dropdownRef}>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex h-[42px] items-center gap-2 rounded-md border border-marquee-line bg-marquee-panel2 px-3 text-sm font-medium text-marquee-cream transition hover:border-marquee-gold disabled:opacity-50"
                                >
                                    {selectedCountry.flag}
                                    <span>{selectedCountry.code}</span>
                                    <span className="text-marquee-muted">
                                        {selectedCountry.dialCode}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 text-marquee-muted" />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute left-0 z-20 mt-1 w-56 overflow-hidden rounded-md border border-marquee-line bg-marquee-panel2 shadow-xl">
                                        {COUNTRIES.map((c) => (
                                            <button
                                                key={c.code}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCountry(c);
                                                    setLocalNumber('');
                                                    setError('');
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs text-marquee-cream transition hover:bg-marquee-line/30"
                                            >
                                                {c.flag}

                                                <span className="font-medium">
                                                    {c.name}
                                                </span>

                                                <span className="ml-auto text-marquee-muted">
                                                    {c.dialCode}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <input
                                type="tel"
                                value={localNumber}
                                disabled={loading}
                                onChange={handlePhoneChange}
                                placeholder={
                                    selectedCountry.code === 'AL'
                                        ? '69 XXX XXX'
                                        : selectedCountry.code === 'XK'
                                            ? '44 XXX XXX'
                                            : '70 XXX XXX'
                                }
                                required
                                className="h-[42px] min-w-0 w-full rounded-md border border-marquee-line bg-marquee-panel2 px-4 text-marquee-cream placeholder:text-marquee-muted outline-none transition focus:border-marquee-gold disabled:opacity-50"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-400">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !localNumber.trim()}
                            className="w-full rounded-full bg-marquee-gold py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send code'}
                        </button>
                    </form>
                </>
            ) : (
                <>
                    <p className="mt-2 text-sm text-marquee-muted">
                        Enter the 6-digit code sent to <span className="font-medium text-marquee-cream">{fullDisplayNumber}</span>.
                    </p>

                    <form onSubmit={handleVerifySubmit} className="mt-5 space-y-4">
                        <div onPaste={handlePaste} className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) =>
                                        (inputRefs.current[index] = el)
                                    }
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    disabled={loading}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) =>
                                        handleKeyDown(index, e)
                                    }
                                    className="h-12 w-12 rounded-md border border-marquee-line bg-marquee-panel2 text-center text-lg font-semibold text-marquee-cream outline-none transition focus:border-marquee-gold disabled:opacity-50"
                                />
                            ))}
                        </div>

                        {error && (
                            <p className="text-sm text-red-400">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                otp.join('').length < 6
                            }
                            className="w-full rounded-full bg-marquee-gold py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Enable 2FA'}
                        </button>

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => {
                                setStep('phone');
                                setOtp(Array(6).fill(''));
                                setError('');
                            }}
                            className="w-full text-center text-xs text-marquee-muted transition hover:text-marquee-gold disabled:opacity-50"
                        >
                            Use a different number
                        </button>
                    </form>
                </>
            )}
        </Modal>
    );
}