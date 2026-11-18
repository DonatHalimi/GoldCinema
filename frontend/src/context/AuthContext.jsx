import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    changeUserPassword,
    deleteUserAccount,
    forgotUserPassword,
    getProfile,
    loginUser,
    loginUserWithFacebook,
    loginUserWithGoogle,
    logoutUser,
    registerUser,
    resetUserPassword,
    verifyUserLogin,
} from '../api/auth';
import { selectActiveRole, switchActiveRole } from '../api/multiRole';
import { LoadingAnimation } from '../components/ui/LoadingAnimation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    async function refreshUser() {
        const data = await getProfile();
        setUser(data.user);
        return data.user;
    }

    useEffect(() => {
        let mounted = true;
        const restoreSession = async () => {
            try {
                const data = await getProfile();
                if (!mounted) return;
                setUser(data.user);
                if (data.user?.roleSelectionRequired && window.location.pathname !== '/select-role') {
                    navigate('/select-role', { replace: true });
                }
            } catch (error) {
                if (mounted) setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        restoreSession();
        return () => { mounted = false; };
    }, [navigate]);

    useEffect(() => {
        const handleForcedLogout = () => {
            setUser(null);
            navigate('/login', { replace: true, state: { message: 'Your session has been revoked.' } });
        };

                const handleRoleSelectionRequired = (event) => {
            const payloadUser = event?.detail?.user;
            const payloadRoles = Array.isArray(event?.detail?.roles) ? event.detail.roles : [];

            setUser((currentUser) => ({
                ...(currentUser || {}),
                ...(payloadUser || {}),
                roles: payloadRoles.length ? payloadRoles : (payloadUser?.roles || currentUser?.roles || []),
                activeRole: null,
                role: null,
                roleSelectionRequired: true,
            }));

            if (window.location.pathname !== '/select-role') {
                navigate('/select-role', { replace: true });
            }
        };

        window.addEventListener('auth:logout', handleForcedLogout);
        window.addEventListener('auth:role-selection-required', handleRoleSelectionRequired);
        return () => {
            window.removeEventListener('auth:logout', handleForcedLogout);
            window.removeEventListener('auth:role-selection-required', handleRoleSelectionRequired);
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

    async function finishLogin(data) {
        const profile = await refreshUser();
        return {
            ...data,
            roleSelectionRequired: Boolean(profile?.roleSelectionRequired),
        };
    }

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
        return finishLogin(data);
    };

    const verifyLoginMfa = async (mfaToken, code, method, rememberMe, trustDevice) => {
        const data = await verifyUserLogin(mfaToken, code, method, rememberMe, trustDevice);
        return finishLogin(data);
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
        return finishLogin(data);
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
        return finishLogin(data);
    };

    const loginWithGithub = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/github`;
    };

    const selectRole = async (role) => {
        const result = await selectActiveRole(role);
        setUser(result.user);
        return result;
    };

    const switchRole = async (role) => {
        const result = await switchActiveRole(role);
        setUser(result.user);
        await refreshUser();
        return result;
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

    if (loading) return <LoadingAnimation />;

    return (
        <AuthContext.Provider value={{
            user, setUser, register, forgotPassword, resetPassword, login,
            verifyLoginMfa, changePassword, deleteAccount, loginWithGoogle,
            loginWithFacebook, loginWithGithub, logout, selectRole, switchRole,
            refreshUser, loading,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);