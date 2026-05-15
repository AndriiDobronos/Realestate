// import React, { useEffect, useState } from "react";
// //import {RootState} from "../app/store";
// import { useDispatch } from 'react-redux';
// import { useNavigate, Link, useLocation } from 'react-router-dom';
// import {setIsRegistration, setUserId, setUserName} from '../features/registration/registrationSlice';
// import allEnTexts from '../contents/allEnTexts';
// import allUaTexts from '../contents/allUaTexts';
// import loginBackground from '../assets/images/loginBackground.png';
// import {useLanguage} from "../context/LanguageContext";
// import { GoogleLogin } from '@react-oauth/google';
//
// const Login = () => {
//     const { language } = useLanguage();
//     const contents = language === "en" ? allEnTexts : allUaTexts
//     //const isRegistration = useSelector((state: RootState) => state.registration.isRegistered);
//     //const userName = useSelector((state: RootState) => state.registration.userName);
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [email, setEmail] = useState(location.state?.prefilledEmail || '');
//     const [password, setPassword] = useState('');
//     const [authMethod, setAuthMethod] = useState('')
//     const [user, setUser] = useState(null);
//     const [error, setError] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
//
//     // Проверка состояния аутентификации
//     useEffect(() => {
//         checkAuth();
//         setAuthMethod(location.state?.suggestedMethod)
//
//         // Обработка состояния из location
//         if (location.state?.suggestedMethod === 'google') {
//             setError(contents.loginErrors.suggestGoogleLogin);
//             //setShowGoogleButton(true);
//         }
//     }, [location]);
//
//     const handleGoogleSuccess = async (credentialResponse: any) => {
//         setIsLoading(true);
//         try {
//             const response = await fetch(`${API_URL}/api/auth/google`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ token: credentialResponse.credential }),
//                 credentials: 'include',
//             });
//
//             const data = await response.json();
//
//             if (response.ok) {
//                 handleAuthSuccess(data.user);
//             } else {
//                 setError(data.message || 'Google authentication failed');
//             }
//         } catch (error) {
//             console.error('Google auth error:', error);
//             setError('An error occurred. Please try again later.');
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     const handleGoogleError = () => {
//         setError('Google login failed. Please try again.');
//     };
//
//     const handleLogin = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError('');
//
//         try {
//             const response = await fetch(`${API_URL}/login`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email, password, authMethod: 'password' }),
//                 credentials: 'include',
//             });
//
//             const data = await response.json();
//
//             if (response.ok) {
//                 handleAuthSuccess(data.user);
//             } else {
//                 // Обработка специфических ошибок
//                 if (response.status === 409) {
//                     setError(contents.loginErrors[`registeredWith${data.authMethod}`]);
//                     if (data.authMethod === 'google') {
//                         //setShowGoogleButton(true);
//                     }
//                 } else {
//                     setError(data.message || 'Login failed');
//                 }
//             }
//         } catch (err: any) {
//             setError('An error occurred. Please try again later.');
//             console.error('Login Error:', err);
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     const handleAuthSuccess = (user: any) => {
//         // Сохранение данных в хранилище
//         localStorage.setItem('user', JSON.stringify(user));
//         localStorage.setItem('registrationState', JSON.stringify({
//             isRegistered: true,
//             userName: user.name,
//             userId: user.id,
//         }));
//         // Обновление состояния Redux
//         dispatch(setIsRegistration(true));
//         dispatch(setUserName(user.name));
//         dispatch(setUserId(user.id));
//
//         setUser(user);
//
//         // Перенаправление на главную
//         //navigate('/');
//     };
//
//     const checkAuth = async () => {
//         try {
//             const response = await fetch(`${API_URL}/check-auth`, {
//                 credentials: "include"
//             });
//             const data = await response.json();
//             if (data.isAuthenticated) {
//                 setUser(data.user);
//             }
//         } catch (err) {
//             console.error('Auth check error:', err);
//         }
//     };
//
//     const handleLogout = async () => {
//         await fetch(`${API_URL}/logout`, {
//             method: "POST",
//             credentials: "include"
//         });
//         setUser(null);
//         handleRemoveStorage()
//     };
//
//     const handleRemoveStorage = () => {
//         localStorage.removeItem('registrationState');
//         localStorage.removeItem('userImages');
//         localStorage.removeItem('user');
//         dispatch(setIsRegistration(false));
//         dispatch(setUserName(''));
//         dispatch(setUserId(''));
//     };
//
//     return (
//         <div style={styles.container}>
//             <div className="mt-16"></div>
//             <div style={styles.glassCard}>
//                 <h1 className="text-3xl font-bold mb-8">
//                     {contents.login[0].text}
//                     {/*{Check authorization}*/}
//                 </h1>
//                 {isLoading && <p className="text-blue-500 mb-4">Loading...</p>}
//                 {error && <p className="text-red-500 mb-4">{error}</p>}
//                 {authMethod && <p className="text-red-500 mb-4">{authMethod}</p>}
//
//                 {user ? (
//                     <div className="flex flex-col">
//                         <p  className="text-xl text-green-600 mb-2">{contents.login[1].text} {/*{user.name}*/}</p>
//                         <p  className="text-xl text-green-600 mb-8">{contents.login[5].text}</p>
//                         {/*{Welcome, }*/}
//
//
//                         {/*{!!!!!!!!!!!!!!!!!!!!!!!!!!!!   ОБЯЗАТЕЛЬНО УДАЛИТЬ ПЕРЕД ЗАГРУЗКОЙ   !!!!!!!!!!!!!!!!!!!!}*/}
//                         <button onClick={handleLogout} className="bg-red-500 text-white mb-8">Logout</button>
//                         {/*{!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!}*/}
//
//
//                         <Link to="/">
//                             <button className="bg-blue-500 text-white w-full"
//                             //onClick={handleRemoveStorage}
//                             >
//                                 {contents.login[2].text}
//                                 {/*{Back to Home}*/}
//                             </button>
//                         </Link>
//                     </div>
//                 ) : (
//                     <>
//                         <form onSubmit={handleLogin} className="flex flex-col gap-4">
//                             <input
//                                 className="border-gray-300 border-2 p-2 rounded-md"
//                                 type="email"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 placeholder="Email"
//                                 required
//                             />
//                             <input
//                                 className="border-gray-300 border-2 p-2 rounded-md"
//                                 type="password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 placeholder="Password"
//                                 required
//                             />
//                             <button type="submit" className="bg-blue-500 text-white"> {contents.login[3].text}</button>
//                             {/*{Login}*/}
//                         </form>
//
//                         {/* Разделитель и Google Login */}
//                         <div className="flex items-center my-6">
//                             <hr className="flex-grow border-gray-300" />
//                             <span className="mx-2 text-gray-500">or</span>
//                             <hr className="flex-grow border-gray-300" />
//                         </div>
//
//                         <div className="flex justify-center">
//                             <GoogleLogin
//                                 onSuccess={handleGoogleSuccess}
//                                 onError={handleGoogleError}
//                             />
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }
// export default Login;
//
// const styles: { [key: string]: React.CSSProperties } = {
//     container: {
//         display: 'flex',
//         //justifyContent: 'center',
//         alignItems: 'center',
//         height: 'calc(100vh - 0px)',
//         // backgroundImage: 'url(https://images.pexels.com/photos/681331/pexels-photo-681331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
//         // backgroundImage:'url(https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
//         //backgroundImage:'url(https://images.pexels.com/photos/565324/pexels-photo-565324.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
//         backgroundImage: `url(${loginBackground})`,
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//     },
//     glassCard: {
//         padding: '24px 36px',
//         marginLeft: '12vw',
//         borderRadius: '15px',
//         background: 'rgba(255, 255, 255, 0.1)',
//         boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
//         backdropFilter: 'blur(10px)',
//         WebkitBackdropFilter: 'blur(10px)',
//         border: '1px solid rgba(255, 255, 255, 0.3)',
//         maxWidth: '1000px',
//         textAlign: 'center',
//         position: "fixed",
//     },
// };

//******************************************************************************

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState } from '../app/store';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../services/useAuth.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

// Машина состояний страницы входа.
type LoginStatus =
    | 'idle'              // форма ожидает ввода
    | 'loading'           // идёт запрос
    | 'success'           // вход успешен, идёт редирект
    | 'wrong_credentials' // неверный email или пароль → показываем "Забули пароль?"
    | 'wrong_method'      // 409: зарегистрирован другим методом
    | 'error';            // общая ошибка сети

// ─── Component ────────────────────────────────────────────────────────────────

const Login: React.FC = () => {
    const { language } = useLanguage();
    const contents = language === 'en' ? allEnTexts : allUaTexts;
    const isRegistration = useSelector((state: RootState) => state.registration.isRegistered);
    const navigate = useNavigate();
    const location = useLocation();
    const { handleAuthSuccess, API_URL } = useAuth();

    // Если пришли с /register с предзаполненным email — используем его
    const [email, setEmail] = useState<string>(location.state?.prefilledEmail || '');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<LoginStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
// ─── Если уже авторизован — редирект или показ кнопки "На головну"
    useEffect(() => {
        // Подсказка метода входа пришла из RegistrationForm
        if (location.state?.suggestedMethod === 'google') {
            setErrorMessage(contents.registrationErrors?.registeredWithGoogle || contents.loginErrors.googleEmailWithGoogle);
            setStatus('wrong_method');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    // ─── Проверяем активную сессию при открытии страницы.
    // Если сессия активна — не показываем форму, показываем кнопку "На головну".
    useEffect(() => {
        if (isRegistration) {
            // Пользователь уже в системе — редиректим туда откуда пришёл
            const from = location.state?.from || '/';
            navigate(from, { replace: true });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRegistration]);

    // ─── Стандартный вход по email + password ─────────────────────────────────

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, authMethod: 'password' }),
                credentials: 'include',
            });
            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                handleAuthSuccess(data);
            } else if (response.status === 409) {
                // Пользователь зарегистрирован другим методом (например Google)
                setErrorMessage(
                    data.authMethod === 'google'
                        ? contents.loginErrors.googleEmailWithGoogle
                        : `${contents.loginErrors.googleEmailWithMethod} ${data.authMethod}.`
                );
                setStatus('wrong_method');
            } else if (response.status === 401) {
                setErrorMessage(contents.loginErrors.wrongPassword);
                setStatus('wrong_credentials');
            } else {
                setErrorMessage(data.message || contents.loginErrors.loginFailed);
                setStatus('error');
            }
        } catch {
            setErrorMessage(contents.loginErrors.connectionError);
            setStatus('error');
        }
    };

    // ─── Google OAuth ──────────────────────────────────────────────────────────

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        setStatus('loading');
        try {
            const response = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
                credentials: 'include',
            });
            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                handleAuthSuccess(data);
            } else if (response.status === 409) {
                setErrorMessage(contents.loginErrors.googleEmailWithPassword);
                setStatus('wrong_method');
            } else {
                setErrorMessage(data.message || contents.loginErrors.googleAuthFailed);
                setStatus('error');
            }
        } catch {
            setErrorMessage(contents.loginErrors.connectionError);
            setStatus('error');
        }
    };

    const handleGoogleError = () => {
        setErrorMessage(contents.loginErrors.googleLoginFailed);
        setStatus('error');
    };

    const resetForm = () => {
        setStatus('idle');
        setErrorMessage('');
    };

    const isLoading = status === 'loading';

    // ─── Render: статусные сообщения ───────────────────────────────────────────

    const renderStatusMessage = () => {
        if (status === 'error' || status === 'wrong_credentials' || status === 'wrong_method') {
            return (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#ef4444" className="shrink-0 mt-0.5">
                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                    </svg>
                    <p className="text-sm text-red-700 leading-snug">{errorMessage}</p>
                </div>
            );
        }
        if (status === 'success') {
            return (
                <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#10b981" className="shrink-0">
                        <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                    </svg>
                    <p className="text-sm text-green-700">{contents.login[9].text}</p>
                </div>
            );
        }
        return null;
    };

    // ─── Render: блок "Забули пароль?" (после неверного пароля) ───────────────

    const renderForgotPasswordHint = () => {
        if (status !== 'wrong_credentials') return null;
        return (
            <div className="flex justify-end mt-2">
                <button
                    onClick={() => navigate('/forgot-password', { state: { prefilledEmail: email } })}
                    className="text-sm text-[#2563EB] hover:text-[#1d4ed8] font-medium cursor-pointer transition-colors duration-200 !bg-transparent !shadow-none !border-0 !p-0"
                >
                    {contents.login[10].text}
                </button>
            </div>
        );
    };

    // ─── Main render ──────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen flex">

            {/* ── Left: hero panel ─────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col justify-center px-16 py-20"
                 style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1e3a8a 50%, #0c1445 100%)' }}>

                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full opacity-10 -translate-y-1/2 translate-x-1/3"
                     style={{ background: 'radial-gradient(circle, #2563EB, transparent 70%)' }} />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 translate-y-1/3 -translate-x-1/3"
                     style={{ background: 'radial-gradient(circle, #2563EB, transparent 70%)' }} />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2"
                     style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)' }} />

                {/* Brand */}
                <div className="relative z-10 flex items-center gap-3 mb-16">
                    <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="white">
                            <path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z"/>
                        </svg>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">My Dream House</span>
                </div>

                {/* Headline */}
                <div className="relative z-10 mb-12">
                    <h2 className="text-5xl font-bold text-white leading-tight mb-5">
                        {contents.login[16].text}
                    </h2>
                    <p className="text-white/55 text-base leading-relaxed max-w-xs">
                        {contents.login[17].text}
                    </p>
                </div>

                {/* Stats */}
                <div className="relative z-10 flex gap-10">
                    <div>
                        <p className="text-white font-bold text-2xl">1 200+</p>
                        <p className="text-white/45 text-sm mt-0.5">{contents.login[18].text}</p>
                    </div>
                    <div className="w-px bg-white/15 self-stretch" />
                    <div>
                        <p className="text-white font-bold text-2xl">98%</p>
                        <p className="text-white/45 text-sm mt-0.5">{contents.login[19].text}</p>
                    </div>
                    <div className="w-px bg-white/15 self-stretch" />
                    <div>
                        <p className="text-white font-bold text-2xl">24/7</p>
                        <p className="text-white/45 text-sm mt-0.5">{contents.login[20].text}</p>
                    </div>
                </div>
            </div>

            {/* ── Right: form panel ────────────────────────────── */}
            <div className="w-full lg:w-[42%] flex items-center justify-center min-h-screen bg-[#F8FAFC] px-6 py-16">
                <div className="w-full max-w-[380px]">

                    {/* Mobile brand */}
                    <div className="flex items-center gap-2.5 mb-8 lg:hidden">
                        <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
                                <path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z"/>
                            </svg>
                        </div>
                        <span className="font-bold text-[#0F172A] text-base">My Dream House</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-[#0F172A] mb-1.5">
                        {contents.login[0].text}
                    </h1>
                    <p className="text-[#64748B] text-sm mb-7">
                        {contents.login[7].text}
                    </p>

                    {/* Status message */}
                    {renderStatusMessage()}

                    {/* ── Form ─────────────────────────────── */}
                    {status !== 'success' && (
                        <>
                            <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4 mb-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-[#0F172A]" htmlFor="login-email">
                                        Email
                                    </label>
                                    <input
                                        id="login-email"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#0F172A] placeholder-[#94a3b8] focus:outline-none focus:border-[#2563EB] focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        style={{ focusRingColor: 'rgba(37,99,235,0.15)' } as React.CSSProperties}
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); resetForm(); }}
                                        placeholder="name@example.com"
                                        required
                                        disabled={isLoading}
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-[#0F172A]" htmlFor="login-password">
                                        {contents.login[6].text}
                                    </label>
                                    <input
                                        id="login-password"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#0F172A] placeholder-[#94a3b8] focus:outline-none focus:border-[#2563EB] focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        type="password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); resetForm(); }}
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                        autoComplete="current-password"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 !shadow-none !border-0 mt-1"
                                    style={{ background: '#2563EB' }}
                                    onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563EB'; }}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="white">
                                                <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z"/>
                                            </svg>
                                            {contents.login[8].text}
                                        </>
                                    ) : contents.login[3].text}
                                </button>
                            </form>

                            {renderForgotPasswordHint()}

                            {/* Divider */}
                            <div className="flex items-center gap-3 my-5">
                                <hr className="flex-1 border-gray-200" />
                                <span className="text-xs text-[#64748B] font-medium">{contents.login[11].text}</span>
                                <hr className="flex-1 border-gray-200" />
                            </div>

                            {/* Google OAuth */}
                            <div className="flex justify-center mb-5">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                />
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3 my-5">
                                <hr className="flex-1 border-gray-200" />
                                <span className="text-xs text-[#64748B] font-medium">{contents.login[12].text}</span>
                                <hr className="flex-1 border-gray-200" />
                            </div>

                            {/* Register link */}
                            <p className="text-center text-sm text-[#64748B]">
                                {contents.login[13].text}{' '}
                                <button
                                    onClick={() => navigate('/registration')}
                                    className="text-[#2563EB] font-semibold hover:text-[#1d4ed8] transition-colors duration-200 cursor-pointer !bg-transparent !shadow-none !border-0 !p-0 ml-1"
                                >
                                    {contents.login[14].text}
                                </button>
                            </p>
                        </>
                    )}

                    {/* Success: go home */}
                    {status === 'success' && (
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 rounded-xl text-white text-sm font-semibold cursor-pointer !shadow-none !border-0 transition-colors duration-200"
                            style={{ background: '#2563EB' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563EB'; }}
                        >
                            {contents.login[15].text}
                        </button>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Login;