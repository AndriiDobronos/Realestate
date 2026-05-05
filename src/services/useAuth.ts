import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setIsRegistration, setUserName, setUserId, resetRegistration } from '../features/registration/registrationSlice';
import { setAuthProperty, resetAuthProperty, setAuthChecking } from '../features/auth/authSlice';
import { fetchListings } from './ListingService';

interface AuthUser {
    id: string;
    name: string;
    email: string;
    authMethod?: string;
}

interface AuthSuccessData {
    user: AuthUser;
    message?: string;
}

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleAuthSuccess = (data: AuthSuccessData, redirectTo: string = '/') => {
        const { user } = data;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('registrationState', JSON.stringify({
            isRegistered: true,
            userName: user.name,
            userId: user.id,
        }));

        dispatch(setIsRegistration(true));
        dispatch(setUserName(user.name));
        dispatch(setUserId(user.id));
        dispatch(setAuthProperty(true));

        setTimeout(() => navigate(redirectTo), 1500);
    };

    const handleResetUserData = async (setListings?: (data: any[]) => void) => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // clear locally anyway
        }
        localStorage.removeItem('registrationState');
        localStorage.removeItem('userImages');
        localStorage.removeItem('user');
        dispatch(resetRegistration());
        dispatch(resetAuthProperty());
        dispatch(setAuthChecking(false));
        if (setListings) {
            const freshData = await fetchListings();
            setListings(freshData);
        }
    };

    const checkAuth = async (): Promise<{ isAuthenticated: boolean; user?: AuthUser }> => {
        try {
            const response = await fetch(`${API_URL}/check-auth`, {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.isAuthenticated && data.user) {
                return {
                    isAuthenticated: true,
                    user: {
                        id: data.id,
                        name: data.user,
                        email: data.email ?? '',
                    },
                };
            }
            return { isAuthenticated: false };
        } catch {
            return { isAuthenticated: false };
        }
    };

    return { handleAuthSuccess, handleResetUserData, checkAuth, API_URL };
};
