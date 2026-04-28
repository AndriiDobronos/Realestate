// ─── useAuth.ts ───────────────────────────────────────────────────────────────
// Централизованный хук для всей логики авторизации.
// Используется в Login, RegistrationForm и любом компоненте где нужна сессия.
// Это позволяет избежать дублирования кода между страницами.

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setIsRegistration, setUserName, setUserId } from '../features/registration/registrationSlice';

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

    // ─── Сохраняем данные в Redux + localStorage и редиректим на главную.
    // Вынесено в хук чтобы не дублировать в каждом компоненте.
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

        setTimeout(() => navigate(redirectTo), 1500);
    };

    // ─── Выход: удаляем сессию на сервере, чистим localStorage и Redux.
    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // Если сервер недоступен — всё равно разлогиниваем локально
        }
        localStorage.removeItem('registrationState');
        localStorage.removeItem('userImages');
        localStorage.removeItem('user');
        dispatch(setIsRegistration(false));
        dispatch(setUserName(''));
        dispatch(setUserId(''));
        navigate('/');
    };

    // ─── Проверка активной сессии на сервере (для главной страницы и /login).
    const checkAuth = async (): Promise<{ isAuthenticated: boolean; user?: AuthUser }> => {
        try {
            const response = await fetch(`${API_URL}/check-auth`, {
                credentials: 'include',
            });
            const data = await response.json();
            return data;
        } catch {
            return { isAuthenticated: false };
        }
    };

    return { handleAuthSuccess, handleLogout, checkAuth, API_URL };
};