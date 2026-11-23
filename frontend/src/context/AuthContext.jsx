import { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    changeUserPassword,
    deleteUserAccount,
    forgotUserPassword,
    loginUser,
    loginUserWithFacebook,
    loginUserWithGoogle,
    logoutUser,
    registerUser,
    resetUserPassword,
    verifyUserLogin,
} from '../api/auth';
import { beginAuthLogout, getInitialAuthRequestState, setAuthRequestState } from '../api/client';
import { apiSlice } from '../store/api/apiSlice';
import {
    useGetCurrentProfileQuery,
    useLazyGetCurrentProfileQuery,
    useSelectActiveRoleMutation,
    useSwitchActiveRoleMutation,
} from '../store/api/usersApiSlice';
import {
    beginLogout,
    beginSessionCheck,
    completeSessionCheck,
    disableSession,
    enableSession,
    finishLogout,
} from '../store/slices/authSlice';
import { LoadingAnimation } from '../components/ui/LoadingAnimation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const dispatch = useDispatch();
    const sessionEnabled = useSelector((state) => state.auth.sessionEnabled);
    const sessionChecked = useSelector((state) => state.auth.sessionChecked);
    const loggingOut = useSelector((state) => state.auth.loggingOut);
    const { data: profileData, error: profileError, isLoading, isUninitialized } = useGetCurrentProfileQuery(undefined, { skip: !sessionEnabled });
    const [refetchProfile] = useLazyGetCurrentProfileQuery();
    const [selectRoleRequest] = useSelectActiveRoleMutation();
    const [switchRoleRequest] = useSwitchActiveRoleMutation();
    const invalidSession = profileError?.status === 401 || profileError?.status === 403;
    const user = sessionEnabled && !loggingOut && !invalidSession ? profileData?.user || null : null;
    const loading = !sessionChecked || (sessionEnabled && isLoading && !profileData);
    const navigate = useNavigate();

    async function refreshUser() {
        dispatch(enableSession());
        const data = await refetchProfile(undefined, false).unwrap();
        setAuthRequestState('authenticated');
        dispatch(completeSessionCheck());
        return data.user;
    }

    useEffect(() => {
        setAuthRequestState(getInitialAuthRequestState());
        dispatch(beginSessionCheck());
    }, [dispatch]);

    useEffect(() => {
        if (!sessionEnabled || isLoading || isUninitialized) return;
        const authenticated = Boolean(profileData?.user);
        if (profileError?.data?.code === 'ROLE_SELECTION_REQUIRED') {
            setAuthRequestState('authenticated');
            dispatch(completeSessionCheck());
            return;
        }
        setAuthRequestState(authenticated ? 'authenticated' : 'unauthenticated');
        if (authenticated) dispatch(completeSessionCheck());
        else dispatch(disableSession());
    }, [dispatch, isLoading, isUninitialized, profileData, profileError, sessionEnabled]);

    useEffect(() => {
        if (user?.roleSelectionRequired && window.location.pathname !== '/select-role') {
            navigate('/select-role', { replace: true });
        }
    }, [navigate, user?.roleSelectionRequired]);

    function setUser(nextUser) {
        const resolvedUser = typeof nextUser === 'function' ? nextUser(user) : nextUser;
        if (!resolvedUser) {
            setAuthRequestState('unauthenticated');
            dispatch(disableSession());
            dispatch(apiSlice.util.resetApiState());
            return;
        }
        setAuthRequestState('authenticated');
        dispatch(enableSession());
        dispatch(apiSlice.util.upsertQueryData('getCurrentProfile', undefined, { user: resolvedUser }));
    }

    useEffect(() => {
        const handleForcedLogout = () => {
            if (loggingOut) return;
            setAuthRequestState('unauthenticated');
            dispatch(disableSession());
            dispatch(apiSlice.util.resetApiState());
            navigate('/login', { replace: true, state: { message: 'Your session has been revoked.' } });
        };

        const handleRoleSelectionRequired = (event) => {
            const payloadUser = event?.detail?.user;
            const payloadRoles = Array.isArray(event?.detail?.roles) ? event.detail.roles : [];

            setAuthRequestState('authenticated');
            dispatch(enableSession());
            dispatch(apiSlice.util.upsertQueryData('getCurrentProfile', undefined, { user: {
                ...(user || {}),
                ...(payloadUser || {}),
                roles: payloadRoles.length ? payloadRoles : (payloadUser?.roles || user?.roles || []),
                activeRole: null,
                role: null,
                roleSelectionRequired: true,
            } }));

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
    }, [dispatch, loggingOut, navigate, user]);

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
        setAuthRequestState('authenticated');
        dispatch(apiSlice.util.resetApiState());
        dispatch(beginSessionCheck());
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
        const result = await selectRoleRequest(role).unwrap();
        setAuthRequestState('authenticated');
        dispatch(apiSlice.util.resetApiState());
        dispatch(enableSession());
        dispatch(apiSlice.util.upsertQueryData('getCurrentProfile', undefined, { user: result.user }));
        return result;
    };

    const switchRole = async (role) => {
        const result = await switchRoleRequest(role).unwrap();
        setAuthRequestState('authenticated');
        dispatch(apiSlice.util.resetApiState());
        dispatch(enableSession());
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
        const refreshCancellation = beginAuthLogout();
        dispatch(beginLogout());
        dispatch(apiSlice.util.resetApiState());
        try {
            await refreshCancellation;
            const { data } = await logoutUser();
            return data;
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                return { message: 'Already logged out.' };
            }
            throw error;
        } finally {
            setAuthRequestState('unauthenticated');
            dispatch(finishLogout());
            dispatch(apiSlice.util.resetApiState());
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