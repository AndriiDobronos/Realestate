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
import loginBackground from '../assets/images/loginBackground.png';
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
            setErrorMessage(contents.registrationErrors?.registeredWithGoogle || 'Будь ласка, увійдіть через Google.');
            setStatus('wrong_method');
        }
    }, [location]);

    // ─── Проверяем активную сессию при открытии страницы.
    // Если сессия активна — не показываем форму, показываем кнопку "На головну".
    useEffect(() => {
        if (isRegistration) {
            // Пользователь уже в системе — редиректим туда откуда пришёл
            const from = location.state?.from || '/';
            navigate(from, { replace: true });
        }
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
                        ? 'Цей email зареєстровано через Google. Скористайтесь кнопкою входу нижче.'
                        : `Цей email зареєстровано через ${data.authMethod}.`
                );
                setStatus('wrong_method');
            } else if (response.status === 401) {
                // Неверный пароль — показываем "Забули пароль?"
                setErrorMessage('Невірний email або пароль.');
                setStatus('wrong_credentials');
            } else {
                setErrorMessage(data.message || 'Помилка входу. Спробуйте ще раз.');
                setStatus('error');
            }
        } catch {
            setErrorMessage('Помилка з\'єднання. Спробуйте пізніше.');
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
                // Email зарегистрирован через пароль
                setErrorMessage('Цей email зареєстровано з паролем. Увійдіть через форму вище.');
                setStatus('wrong_method');
            } else {
                setErrorMessage(data.message || 'Google authentication failed');
                setStatus('error');
            }
        } catch {
            setErrorMessage('Помилка з\'єднання. Спробуйте пізніше.');
            setStatus('error');
        }
    };

    const handleGoogleError = () => {
        setErrorMessage('Google login failed. Please try again.');
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
            return <p style={styles.errorText}>{errorMessage}</p>;
        }
        if (status === 'success') {
            return <p style={styles.successText}>Вхід успішний! Перенаправляємо...</p>;
        }
        if (isLoading) {
            return <p style={styles.loadingText}>Завантаження...</p>;
        }
        return null;
    };

    // ─── Render: блок "Забули пароль?" (после неверного пароля) ───────────────

    const renderForgotPasswordHint = () => {
        if (status !== 'wrong_credentials') return null;
        return (
            <div style={styles.forgotBlock}>
                <button
                    onClick={() => navigate('/forgot-password', { state: { prefilledEmail: email } })}
                    style={styles.btnLink}
                >
                    Забули пароль?
                </button>
            </div>
        );
    };

    // ─── Main render ──────────────────────────────────────────────────────────

    return (
        <div style={styles.container}>
            <div style={styles.glassCard}>
                <h1 style={styles.title}>{contents.login[0].text}</h1>

                {renderStatusMessage()}

                {/* Форма входа — скрываем только при финальном успехе */}
                {status !== 'success' && (
                    <>
                        <form onSubmit={handleLogin} noValidate style={styles.form}>
                            <input
                                style={styles.input}
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); resetForm(); }}
                                placeholder="Email"
                                required
                                disabled={isLoading}
                                autoComplete="email"
                            />
                            <input
                                style={styles.input}
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); resetForm(); }}
                                placeholder={contents.login[6]?.text || 'Пароль'}
                                required
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{ ...styles.btnPrimary, width: '100%' }}
                            >
                                {isLoading ? 'Завантаження...' : contents.login[3].text}
                            </button>
                        </form>

                        {/* "Забули пароль?" появляется только после ошибки 401 */}
                        {renderForgotPasswordHint()}

                        <div style={styles.divider}>
                            <hr style={styles.hr} />
                            <span style={styles.dividerText}>або</span>
                            <hr style={styles.hr} />
                        </div>

                        <div style={styles.googleWrapper}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                            />
                        </div>

                        <div style={styles.divider}>
                            <hr style={styles.hr} />
                            <span style={styles.dividerText}>якщо</span>
                            <hr style={styles.hr} />
                        </div>

                        {/* Ссылка на регистрацию */}
                        <p style={styles.footerText}>
                            Немає акаунту?{' '}
                            <button
                                onClick={() => navigate('/registration')}
                                style={styles.btnLink}
                            >
                                Зареєструватись
                            </button>
                        </p>
                    </>
                )}

                {/* Кнопка "На головну" после успешного входа */}
                {status === 'success' && (
                    <button
                        onClick={() => navigate('/')}
                        style={{ ...styles.btnPrimary, marginTop: '16px' }}
                    >
                        На головну
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        alignItems: 'center',
        height: '100vh',
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    glassCard: {
        padding: '32px 40px',
        marginLeft: '12vw',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
    },
    title: { fontSize: '26px', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    input: {
        padding: '10px 14px',
        border: '1.5px solid rgba(200,200,220,0.6)',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.65)',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box' as const,
        width: '100%',
    },
    btnPrimary: {
        display: 'inline-block', padding: '10px 24px', background: '#3b82f6',
        color: '#fff', border: 'none', borderRadius: '8px',
        fontSize: '15px', fontWeight: 600, cursor: 'pointer',
    },
    btnLink: {
        background: 'none', border: 'none', color: '#3b82f6',marginLeft: '6px',
        fontSize: '13px', cursor: 'pointer', textDecoration: 'none', padding: '10px',
    },
    divider: { display: 'flex', alignItems: 'center', margin: '20px 0' },
    hr: { flex: 1, border: 'none', borderTop: '1px solid rgba(0,0,0,0.15)' },
    dividerText: { margin: '0 10px', fontSize: '13px', color: '#555' },
    googleWrapper: { display: 'flex', justifyContent: 'center' },
    errorText: { color: '#ef4444', marginBottom: '12px', fontSize: '14px' },
    successText: { color: '#22c55e', marginBottom: '12px', fontSize: '14px' },
    loadingText: { color: '#3b82f6', marginBottom: '12px', fontSize: '14px' },
    footerText: { marginTop: '16px', fontSize: '13px', color: '#555' },
    forgotBlock: { marginTop: '8px', textAlign: 'right' as const },
};

export default Login;