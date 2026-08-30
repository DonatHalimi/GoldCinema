import { Loader2 } from 'lucide-react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { changeUserPassword, deleteUserAccount, forgotUserPassword, getProfile, loginUser, loginUserWithFacebook, loginUserWithGoogle, logoutUser, registerUser, resetUserPassword, verifyUserLogin } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        getProfile()
            .then(({ data }) => {
                setUser(data.user);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const handleForcedLogout = () => {
            setUser(null);
            navigate('/login', { replace: true, state: { message: 'Your session has been revoked.' } });
        };

        window.addEventListener('auth:logout', handleForcedLogout);

        return () => {
            window.removeEventListener(
                'auth:logout',
                handleForcedLogout
            );
        };
    }, [navigate]);

    async function register(name, email, password) {
        const { data } = await registerUser(name, email, password);
        return data;
    }

    const forgotPassword = async (email) => {
        const { data } = await forgotUserPassword(email);

        return data;
    };

    const resetPassword = async (token, password) => {
        const { data } = await resetUserPassword(token, password);

        return data;
    };

    const login = async (email, password, rememberMe = false) => {
        const data = await loginUser(email, password, rememberMe);

        if (data.mfaRequired) {
            return {
                mfaRequired: true,
                mfaToken: data.mfaToken,
                methods: data.methods,
                rememberMe: data.rememberMe,
            };
        }

        setUser(data.user);
        return data;
    };

    const verifyLoginMfa = async (
        mfaToken,
        code,
        method,
        rememberMe,
        trustDevice
    ) => {
        const { data } = await verifyUserLogin(mfaToken, code, method, rememberMe, trustDevice);

        const { data: userData } = await getProfile();

        setUser(userData.user);

        return data;
    };

    const loginWithGoogle = async (credential) => {
        const data = await loginUserWithGoogle(credential);

        if (data.mfaRequired) {
            return {
                mfaRequired: true,
                mfaToken: data.mfaToken,
                methods: data.methods || [],
                rememberMe: data.rememberMe ?? false,
            };
        }

        setUser(data.user);
        return data;
    };

    const loginWithFacebook = async (accessToken) => {
        const data = await loginUserWithFacebook(accessToken);

        if (data.mfaRequired) {
            return {
                mfaRequired: true,
                mfaToken: data.mfaToken,
                methods: data.methods || [],
                rememberMe: data.rememberMe ?? false,
            };
        }

        setUser(data.user);
        return data;
    };

    const changePassword = async (currentPassword, newPassword) => {
        const { data } = await changeUserPassword(currentPassword, newPassword);

        setUser(null);

        return data;
    };

    const deleteAccount = async (password) => {
        const { data } = await deleteUserAccount(password);

        setUser(null);

        return data;
    };

    const logout = async () => {
        try {
            const { data } = await logoutUser();

            return data;
        } finally {
            setUser(null);
        }
    };

    if (loading) {
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-marquee-gold" />
        </div>;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                register,
                forgotPassword,
                resetPassword,
                login,
                verifyLoginMfa,
                changePassword,
                deleteAccount,
                loginWithGoogle,
                loginWithFacebook,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);