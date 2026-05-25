// import React, { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { RootState } from '../app/store';
// import { setIsRegistration, setUserName, setUserId } from '../features/registration/registrationSlice';
// import {useLanguage} from "../context/LanguageContext";
// import allEnTexts from '../contents/allEnTexts';
// import allUaTexts from '../contents/allUaTexts';
// import { GoogleLogin } from '@react-oauth/google';
//
// const RegistrationForm = () => {
//     const { language } = useLanguage();
//     const contents = language === "en" ? allEnTexts : allUaTexts
//     const isRegistration = useSelector((state: RootState) => state.registration.isRegistered);
//     //const userName = useSelector((state: RootState) => state.registration.userName);
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const [error, setError] = useState('');
//     const [isSession, setIsSession] = useState(false);
//     const [info, setInfo] = useState(['']);
//     const [registrationMessage, setRegistrationMessage] = useState('');
//     //const [decodedEmail, setDecodedEmail] = useState('');
//     //const [decodedName, setDecodedName] = useState('');
//     //const [decodedPicture, setDecodedPicture] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         password: '',
//     });
//     const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
//
//     const parseJwt = (token: string) => {
//         try {
//             const base64Url = token.split('.')[1];
//             const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//             const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//                 return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//             }).join(''));
//
//             return JSON.parse(jsonPayload);
//         } catch (e) {
//             console.error('Ошибка парсинга токена:', e);
//             return null;
//         }
//     };
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
//                 // Успешная регистрация/авторизация через Google
//                 handleAuthSuccess(data);
//             } else if (response.status === 409) {
//                 // Пользователь зарегистрирован обычным способом
//                 setError(contents.registrationErrors.registeredWithPassword);
//                 //setTimeout(() => navigate('/login'), 3000);
//                 setTimeout(navigate('/login', {
//                     state: {
//                         prefilledEmail: data.email,
//                         suggestedMethod: 'google' // или 'password'
//                     }
//                 }), 3000);
//             } else {
//                 // Другие ошибки
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
//     const handleAuthSuccess = (data: any) => {
//         setRegistrationMessage(data.message);
//         localStorage.setItem('user', JSON.stringify(data.user));
//         localStorage.setItem('registrationState', JSON.stringify({
//             isRegistered: true,
//             userName: data.user.name,
//             id: data.user.id,
//         }));
//
//         dispatch(setIsRegistration(true));
//         dispatch(setUserName(data.user.name));
//         dispatch(setUserId(data.user.id));
//
//         setTimeout(() => navigate('/'), 2000);
//     };
//
//     const handleGoogleError = () => {
//         console.log('Google login failed');
//         setError('Google login failed')
//     };
//
//     const submitUserData = async (data: typeof formData) => {
//         setIsLoading(true);
//         if (!data.name || !data.email || !data.password) {
//             setError('All fields are required.');
//             setIsLoading(false);
//             return;
//         }
//         try {
//             const response = await fetch(`${API_URL}/api/usersBase`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(data),
//                 credentials: 'include',
//             });
//
//             if (response.ok) {
//                 const data = await response.json();
//                 handleAuthSuccess(data);
//                 setFormData({ name: '', email: '', password: ''});
//                 setRegistrationMessage(data.message);
//             } else {
//                 // Обработка ошибок
//                 if (response.status === 409) {
//                     const errorData = await response.json();
//                     // Конфликт: email уже существует
//                     if (errorData.authMethod === 'google') {
//                         setError(contents.registrationErrors.registeredWithGoogle);
//                         setTimeout(() => {
//                             // Предложить войти через Google
//                             navigate('/login', {state: {suggestedMethod: 'google', email: formData.email}});
//                         }, 3000);
//                     } else {
//                         // Обычная регистрация
//                         if (errorData.passwordMatch) {
//                             // Пароль совпадает - авторизовать
//                             handleAuthSuccess(data);
//                         } else {
//                             setError(contents.registrationErrors.incorrectPassword);
//                             setTimeout(() => {
//                                 navigate('/login', {state: {prefilledEmail: data.email}});
//                             }, 3000);
//                         }
//                     }
//                 } else {
//                 setError(data.message || 'Failed to register. Please try again.');
//                 }
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             setError('An error occurred. Please try again later.');
//         } finally {
//             setIsLoading(false);
//         }
//     };
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         submitUserData(formData);
//     };
//
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//         const { name, value } = e.target;
//         setFormData({
//             ...formData,
//             [name]: value,
//         });
//     };
//
//     const checkSession = async () => {
//         try {
//             const response = await fetch(`${API_URL}/session`, {
//                 method: 'GET',
//                 credentials: 'include',
//             });
//             setIsSession(response.ok);
//             const infoData = await response.json();
//             setInfo(infoData.message)
//         } catch {
//             return null;
//         }
//     };
//
//     useEffect(() => {
//         if (isRegistration) {
//             navigate('/');
//         }
//         checkSession();
//     }, []);
//
//     return (
//         <div>
//             <div style={styles.offset}></div>
//             <div style={styles.container}>
//                 <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md mt-10" style={styles.glassCard}>
//                     <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">{contents.registration[0].text}</h2>
//                     {/*{Registration form}*/}
//                     {error && <p className="text-red-500 mb-4">{error}</p>}
//                     {isRegistration && <p className="text-green-500 mb-4">{registrationMessage}</p>}
//                     {isLoading && <p className="text-blue-500 mb-4">Loading...</p>}
//
//                     <form onSubmit={handleSubmit}>
//                         <input type="text" name="name" placeholder={contents.registration[1].text} value={formData.name} onChange={handleChange} required className="block w-full border p-2 mb-4" />
//                         {/*{"Full Name"}*/}
//                         <input type="email" name="email" placeholder={contents.registration[2].text} value={formData.email} onChange={handleChange} required className="block w-full border p-2 mb-4" />
//                         {/*{"Email"}*/}
//                         <input type="password" name="password" placeholder={contents.registration[3].text} value={formData.password} onChange={handleChange} required className="block w-full border p-2 mb-4" />
//                         {/*{"Password"}*/}
//                         <button type="submit" className="w-full bg-blue-500 text-white py-2 mt-4 rounded-md hover:bg-blue-600">{contents.registration[11].text}</button>
//                         {/*{Register}*/}
//                     </form>
//
//                     <div className="flex items-center my-6">
//                         <hr className="flex-grow border-gray-300" />
//                         <span className="mx-2 text-gray-700">or</span>
//                         <hr className="flex-grow border-gray-300" />
//                     </div>
//
//                     <div className="flex justify-center">
//                         <GoogleLogin
//                             onSuccess={handleGoogleSuccess}
//                             onError={handleGoogleError}
//                         />
//                     </div>
//
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// const styles: { [key: string]: React.CSSProperties } = {
//     container: {
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: 'calc(100vh - 64px)',
//         backgroundImage: 'url(https://images.pexels.com/photos/681331/pexels-photo-681331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//     },
//     offset: {
//         height: '64px',
//     },
//     glassCard: {
//         padding: '24px 36px',
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
//
// export default RegistrationForm;


//********************************************************************************************************

// import React, { useState, useEffect, useCallback } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { RootState } from '../app/store';
// import { setIsRegistration, setUserName, setUserId } from '../features/registration/registrationSlice';
// import { useLanguage } from '../context/LanguageContext';
// import allEnTexts from '../contents/allEnTexts';
// import allUaTexts from '../contents/allUaTexts';
// import { GoogleLogin } from '@react-oauth/google';
//
// // ─── Types ───────────────────────────────────────────────────────────────────
//
// interface FormData {
//     name: string;
//     email: string;
//     password: string;
// }
//
// interface AuthSuccessPayload {
//     message: string;
//     user: {
//         id: string;
//         name: string;
//     };
// }
//
// type FormStatus =
//     | 'idle'
//     | 'loading'
//     | 'success'
//     | 'duplicate_account'   // 409 — email уже существует
//     | 'forgot_sent'         // письмо с паролем отправлено
//     | 'forgot_loading'      // отправка письма
//     | 'error';
//
// // ─── Email template (текст письма для восстановления пароля) ──────────────────
// //
// // Этот текст отправляется на сервер и используется в письме пользователю.
// // Сервер подставляет имя пользователя и пароль в плейсхолдеры.
// //
// // Предлагаемый текст письма (на русском/украинском — настрой под свой язык):
// //
// //   Тема:    Информация о вашем аккаунте
// //
// //   Здравствуйте, {{name}}!
// //
// //   Вы запросили напоминание данных для входа в аккаунт на [Название сайта].
// //
// //   Ваш email: {{email}}
// //   Ваш пароль: {{password}}
// //
// //   Если вы не делали этот запрос — просто проигнорируйте это письмо.
// //   Для вашей безопасности рекомендуем сменить пароль после входа.
// //
// //   С уважением,
// //   Команда [Название сайта]
// //
// // ⚠️  Важно: отправка пароля в открытом виде — временное решение.
// //     В продакшне следует хранить только хэш пароля и использовать
// //     ссылку для сброса пароля вместо его прямой отправки.
// // ─────────────────────────────────────────────────────────────────────────────
//
// // ─── Component ───────────────────────────────────────────────────────────────

// const RegistrationForm: React.FC = () => {
//     const { language } = useLanguage();
//     const contents = language === 'en' ? allEnTexts : allUaTexts;
//
//     const isRegistration = useSelector((state: RootState) => state.registration.isRegistered);
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//
//     const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' });
//     const [status, setStatus] = useState<FormStatus>('idle');
//     const [errorMessage, setErrorMessage] = useState('');
//     const [successMessage, setSuccessMessage] = useState('');
//     // Сохраняем email для использования в кнопках "Войти" / "Забыли пароль?"
//     const [duplicateEmail, setDuplicateEmail] = useState('');
//
//     const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
//
//     // Редирект если уже авторизован
//     useEffect(() => {
//         if (isRegistration) {
//             navigate('/');
//         }
//     }, [isRegistration, navigate]);
//
//     // ─── Helpers ────────────────────────────────────────────────────────────────
//
//     const handleAuthSuccess = useCallback(
//         (data: AuthSuccessPayload) => {
//             setSuccessMessage(data.message);
//             localStorage.setItem('user', JSON.stringify(data.user));
//             localStorage.setItem(
//                 'registrationState',
//                 JSON.stringify({ isRegistered: true, userName: data.user.name, id: data.user.id })
//             );
//             dispatch(setIsRegistration(true));
//             dispatch(setUserName(data.user.name));
//             dispatch(setUserId(data.user.id));
//             setStatus('success');
//             setTimeout(() => navigate('/'), 2000);
//         },
//         [dispatch, navigate]
//     );
//
//     const handleDuplicateAccount = useCallback((email: string) => {
//         setDuplicateEmail(email);
//         setStatus('duplicate_account');
//     }, []);
//
//     // ─── Forgot password ────────────────────────────────────────────────────────
//
//     const handleForgotPassword = async () => {
//         if (!duplicateEmail) return;
//         setStatus('forgot_loading');
//         try {
//             const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email: duplicateEmail }),
//                 credentials: 'include',
//             });
//
//             if (response.ok) {
//                 setStatus('forgot_sent');
//             } else {
//                 const data = await response.json();
//                 setErrorMessage(data.message || 'Не удалось отправить письмо. Попробуйте позже.');
//                 setStatus('error');
//             }
//         } catch {
//             setErrorMessage('Ошибка соединения. Попробуйте позже.');
//             setStatus('error');
//         }
//     };
//
//     // ─── Google OAuth ────────────────────────────────────────────────────────────
//
//     const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
//         setStatus('loading');
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
//                 handleAuthSuccess(data);
//             } else if (response.status === 409) {
//                 handleDuplicateAccount(data.email ?? formData.email);
//             } else {
//                 setErrorMessage(data.message || 'Google authentication failed');
//                 setStatus('error');
//             }
//         } catch {
//             setErrorMessage('Ошибка соединения. Попробуйте позже.');
//             setStatus('error');
//         }
//     };
//
//     const handleGoogleError = () => {
//         setErrorMessage('Google login failed');
//         setStatus('error');
//     };
//
//     // ─── Regular registration ────────────────────────────────────────────────────
//
//     const submitUserData = async (data: FormData) => {
//         if (!data.name || !data.email || !data.password) {
//             setErrorMessage('Все поля обязательны для заполнения.');
//             setStatus('error');
//             return;
//         }
//         setStatus('loading');
//         try {
//             const response = await fetch(`${API_URL}/api/usersBase`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(data),
//                 credentials: 'include',
//             });
//
//             const responseData = await response.json();
//
//             if (response.ok) {
//                 handleAuthSuccess(responseData);
//                 setFormData({ name: '', email: '', password: '' });
//             } else if (response.status === 409) {
//                 // Email уже зарегистрирован — показываем специальный блок
//                 handleDuplicateAccount(responseData.email ?? data.email);
//             } else {
//                 setErrorMessage(responseData.message || 'Не удалось зарегистрироваться. Попробуйте ещё раз.');
//                 setStatus('error');
//             }
//         } catch {
//             setErrorMessage(contents.registration[20].text);{/*'Ошибка соединения. Попробуйте позже.'*/}
//             setStatus('error');
//         }
//     };
//
//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         submitUserData(formData);
//     };
//
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//         // Сброс ошибки при редактировании
//         if (status === 'error') {
//             setStatus('idle');
//             setErrorMessage('');
//         }
//     };
//
//     const isLoading = status === 'loading' || status === 'forgot_loading';
//
//     // ─── Render: duplicate account block ────────────────────────────────────────
//
//     const renderDuplicateBlock = () => (
//         <div style={styles.duplicateBlock}>
//             <div style={styles.duplicateIcon}>⚠️</div>
//             <p style={styles.duplicateTitle}>
//                 {contents.registration[19].text}{/*Не удалось завершить регистрацию.*/}
//             </p>
//             <p style={styles.duplicateSubtitle}>
//                 {contents.registration[18].text}{/*Возможно, у вас уже есть аккаунт.*/}
//             </p>
//
//             <div style={styles.duplicateActions}>
//                 <button
//                     onClick={() => navigate('/login', { state: { prefilledEmail: duplicateEmail } })}
//                     style={styles.btnPrimary}
//                 >
//                     {contents.registration[16].text}{/*Войти*/}
//                 </button>
//                 <button
//                     onClick={handleForgotPassword}
//                     disabled={status === 'forgot_loading'}
//                     style={styles.btnSecondary}
//                 >
//                    {status === 'forgot_loading' ?  contents.registration[21].text : contents.registration[22].text }
//                     {/*'Отправляем...' : 'Забыли пароль?'*/}
//                 </button>
//             </div>
//
//             <button
//                 onClick={() => { setStatus('idle'); setErrorMessage(''); setDuplicateEmail(''); }}
//                 style={styles.btnLink}
//             >
//                 {contents.registration[17].text}{/*← Вернуться к регистрации*/}
//             </button>
//         </div>
//     );
//
//     // ─── Render: forgot password sent ───────────────────────────────────────────
//
//     const renderForgotSentBlock = () => (
//         <div style={styles.successBlock}>
//             <div style={styles.successIcon}>✉️</div>
//             <p style={styles.successTitle}>{contents.registration[13].text}</p>
//             <p style={styles.successSubtitle}>
//                 {contents.registration[14].text}{/*Мы отправили информацию для входа на адрес*/} <strong>{duplicateEmail}</strong>.
//                 {contents.registration[15].text}{/*Проверьте папку «Входящие» или «Спам».*/}
//             </p>
//             <button
//                 onClick={() => navigate('/login', { state: { prefilledEmail: duplicateEmail } })}
//                 style={{ ...styles.btnPrimary, marginTop: '16px' }}
//             >
//                 {contents.registration[16].text}{/*Перейти к входу*/}
//             </button>
//         </div>
//     );
//
//     // ─── Main render ─────────────────────────────────────────────────────────────
//
//     return (
//         <div>
//             <div style={styles.offset} />
//             <div style={styles.container}>
//                 <div style={styles.glassCard}>
//                     <h2 style={styles.title}>{contents.registration[0].text}</h2>
//
//                     {/* Status messages */}
//                     {status === 'error' && (
//                         <p style={styles.errorText}>{errorMessage}</p>
//                     )}
//                     {status === 'success' && (
//                         <p style={styles.successText}>{successMessage}</p>
//                     )}
//                     {isLoading && (
//                         <p style={styles.loadingText}>{contents.registration[12].text}...</p>
//                     )}
//                     {/* Loading */}
//
//                     {/* Duplicate account state */}
//                     {status === 'duplicate_account' && renderDuplicateBlock()}
//
//                     {/* Forgot password sent state */}
//                     {status === 'forgot_sent' && renderForgotSentBlock()}
//
//                     {/* Normal registration form */}
//                     {(status === 'idle' || status === 'error' || status === 'loading') && (
//                         <>
//                             <form onSubmit={handleSubmit} noValidate>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     placeholder={contents.registration[1].text}
//                                     value={formData.name}
//                                     onChange={handleChange}
//                                     required
//                                     disabled={isLoading}
//                                     style={styles.input}
//                                     autoComplete="name"
//                                 />
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     placeholder={contents.registration[2].text}
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     required
//                                     disabled={isLoading}
//                                     style={styles.input}
//                                     autoComplete="email"
//                                 />
//                                 <input
//                                     type="password"
//                                     name="password"
//                                     placeholder={contents.registration[3].text}
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     required
//                                     disabled={isLoading}
//                                     style={styles.input}
//                                     autoComplete="new-password"
//                                 />
//                                 <button
//                                     type="submit"
//                                     disabled={isLoading}
//                                     style={{ ...styles.btnPrimary, width: '100%', marginTop: '8px' }}
//                                 >
//                                     {contents.registration[11].text}
//                                 </button>
//                             </form>
//
//                             <div style={styles.divider}>
//                                 <hr style={styles.hr} />
//                                 <span style={styles.dividerText}>или</span>
//                                 <hr style={styles.hr} />
//                             </div>
//
//                             <div style={styles.googleWrapper}>
//                                 <GoogleLogin
//                                     onSuccess={handleGoogleSuccess}
//                                     onError={handleGoogleError}
//                                 />
//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// // ─── Styles ──────────────────────────────────────────────────────────────────
//
// const styles: Record<string, React.CSSProperties> = {
//     offset: {
//         height: '64px',
//     },
//     container: {
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: 'calc(100vh - 64px)',
//         backgroundImage:
//             'url(https://images.pexels.com/photos/681331/pexels-photo-681331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//     },
//     glassCard: {
//         padding: '32px 40px',
//         borderRadius: '16px',
//         background: 'rgba(255, 255, 255, 0.12)',
//         boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
//         backdropFilter: 'blur(12px)',
//         WebkitBackdropFilter: 'blur(12px)',
//         border: '1px solid rgba(255, 255, 255, 0.3)',
//         width: '100%',
//         maxWidth: '420px',
//         textAlign: 'center',
//     },
//     title: {
//         fontSize: '24px',
//         fontWeight: 700,
//         color: '#1a1a2e',
//         marginBottom: '20px',
//     },
//     input: {
//         display: 'block',
//         width: '100%',
//         padding: '10px 14px',
//         marginBottom: '12px',
//         border: '1px solid rgba(255,255,255,0.5)',
//         borderRadius: '8px',
//         background: 'rgba(255,255,255,0.6)',
//         fontSize: '15px',
//         outline: 'none',
//         boxSizing: 'border-box',
//     },
//     btnPrimary: {
//         display: 'inline-block',
//         padding: '10px 24px',
//         background: '#3b82f6',
//         color: '#fff',
//         border: 'none',
//         borderRadius: '8px',
//         fontSize: '15px',
//         fontWeight: 600,
//         cursor: 'pointer',
//         transition: 'background 0.2s',
//     },
//     btnSecondary: {
//         display: 'inline-block',
//         padding: '10px 24px',
//         background: 'transparent',
//         color: '#1a1a2e',
//         border: '1.5px solid rgba(30,30,60,0.4)',
//         borderRadius: '8px',
//         fontSize: '15px',
//         fontWeight: 600,
//         cursor: 'pointer',
//     },
//     btnLink: {
//         marginTop: '14px',
//         background: 'none',
//         border: 'none',
//         color: '#3b82f6',
//         fontSize: '13px',
//         cursor: 'pointer',
//         textDecoration: 'underline',
//     },
//     divider: {
//         display: 'flex',
//         alignItems: 'center',
//         margin: '20px 0',
//     },
//     hr: {
//         flex: 1,
//         border: 'none',
//         borderTop: '1px solid rgba(0,0,0,0.15)',
//     },
//     dividerText: {
//         margin: '0 10px',
//         fontSize: '13px',
//         color: '#555',
//     },
//     googleWrapper: {
//         display: 'flex',
//         justifyContent: 'center',
//     },
//     errorText: {
//         color: '#ef4444',
//         marginBottom: '12px',
//         fontSize: '14px',
//     },
//     successText: {
//         color: '#22c55e',
//         marginBottom: '12px',
//         fontSize: '14px',
//     },
//     loadingText: {
//         color: '#3b82f6',
//         marginBottom: '12px',
//         fontSize: '14px',
//     },
//
//     // Duplicate account block
//     duplicateBlock: {
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         padding: '8px 0',
//     },
//     duplicateIcon: {
//         fontSize: '40px',
//         marginBottom: '12px',
//     },
//     duplicateTitle: {
//         fontWeight: 700,
//         fontSize: '17px',
//         color: '#1a1a2e',
//         marginBottom: '4px',
//     },
//     duplicateSubtitle: {
//         color: '#555',
//         fontSize: '14px',
//         marginBottom: '20px',
//     },
//     duplicateActions: {
//         display: 'flex',
//         gap: '12px',
//         justifyContent: 'center',
//         flexWrap: 'wrap',
//     },
//
//     // Forgot sent block
//     successBlock: {
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         padding: '8px 0',
//     },
//     successIcon: {
//         fontSize: '40px',
//         marginBottom: '12px',
//     },
//     successTitle: {
//         fontWeight: 700,
//         fontSize: '17px',
//         color: '#1a1a2e',
//         marginBottom: '6px',
//     },
//     successSubtitle: {
//         color: '#555',
//         fontSize: '14px',
//         lineHeight: 1.5,
//     },
// };
//
// export default RegistrationForm;

//***************************************************************************************


import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../app/store';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../services/useAuth.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
    name: string;
    email: string;
    password: string;
}

type FormStatus =
    | 'idle'
    | 'loading'
    | 'success'
    | 'duplicate_account'
    | 'forgot_loading'
    | 'forgot_sent'
    | 'error';

// ─── Component ────────────────────────────────────────────────────────────────

const RegistrationForm: React.FC = () => {
    const { language } = useLanguage();
    const contents = language === 'en' ? allEnTexts : allUaTexts;

    const isRegistration = useSelector((state: RootState) => state.registration.isRegistered);
    const navigate = useNavigate();
    const { handleAuthSuccess, API_URL } = useAuth();

    const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' });
    const [status, setStatus] = useState<FormStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [duplicateEmail, setDuplicateEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isRegistration) navigate('/');
    }, [isRegistration, navigate]);

    // ─── Helpers ──────────────────────────────────────────────────────────────

    const onAuthSuccess = (data: { user: { id: string; name: string; email: string }; message?: string }) => {
        setSuccessMessage(data.message || contents.registrationErrors.successMessage);
        setStatus('success');
        handleAuthSuccess(data);
    };

    const onDuplicateAccount = (email: string) => {
        setDuplicateEmail(email);
        setStatus('duplicate_account');
    };

    // ─── Forgot password ──────────────────────────────────────────────────────

    const handleForgotPassword = async () => {
        setStatus('forgot_loading');
        try {
            await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: duplicateEmail }),
                credentials: 'include',
            });
            setStatus('forgot_sent');
        } catch {
            setErrorMessage(contents.registrationErrors.connectionError);
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
                onAuthSuccess(data);
            } else if (response.status === 409) {
                onDuplicateAccount(data.email ?? formData.email);
            } else {
                setErrorMessage(data.message || contents.registrationErrors.googleAuthFailed);
                setStatus('error');
            }
        } catch {
            setErrorMessage(contents.registrationErrors.connectionError);
            setStatus('error');
        }
    };

    const handleGoogleError = () => {
        setErrorMessage(contents.registrationErrors.googleLoginFailed);
        setStatus('error');
    };

    // ─── Regular registration ─────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            setErrorMessage(contents.registrationErrors.allFieldsRequired);
            setStatus('error');
            return;
        }
        setStatus('loading');
        try {
            const response = await fetch(`${API_URL}/api/usersBase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include',
            });
            const data = await response.json();

            if (response.ok) {
                setFormData({ name: '', email: '', password: '' });
                onAuthSuccess(data);
            } else if (response.status === 409) {
                onDuplicateAccount(data.email ?? formData.email);
            } else {
                setErrorMessage(data.message || contents.registrationErrors.registrationFailed);
                setStatus('error');
            }
        } catch {
            setErrorMessage(contents.registrationErrors.connectionError);
            setStatus('error');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (status === 'error') { setStatus('idle'); setErrorMessage(''); }
    };

    const isLoading = status === 'loading' || status === 'forgot_loading';

    // ─── Shared classes ───────────────────────────────────────────────────────

    const inputCls = "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#0F172A] placeholder-[#94a3b8] focus:outline-none focus:border-[#2563EB] focus:ring-2 transition-all duration-200 disabled:opacity-50";

    const btnPrimaryCls = "flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white text-sm font-semibold transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed !shadow-none !border-0";

    // ─── Render: error / success banners ─────────────────────────────────────

    const renderBanner = () => {
        if (status === 'error') return (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#ef4444" className="shrink-0 mt-0.5">
                    <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                </svg>
                <p className="text-sm text-red-700 leading-snug">{errorMessage}</p>
            </div>
        );
        if (status === 'success') return (
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#10b981" className="shrink-0">
                    <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                </svg>
                <p className="text-sm text-green-700">{successMessage}</p>
            </div>
        );
        return null;
    };

    // ─── Render: duplicate account block ─────────────────────────────────────

    const renderDuplicateBlock = () => (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="#f59e0b">
                    <path d="M109-120q-11 0-20-5.5T75-140q-5-9-5.5-19.5T75-180l370-640q6-10 15.5-15t19.5-5q10 0 19.5 5t15.5 15l370 640q6 10 5.5 20.5T886-140q-5 9-14 14.5t-20 5.5H109Zm371-120q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Z"/>
                </svg>
            </div>
            <div>
                <p className="text-base font-bold text-[#0F172A] mb-1">{contents.registration[30].text}</p>
                <p className="text-sm text-[#64748B]">{contents.registration[31].text}</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center w-full">
                <button
                    onClick={() => navigate('/login', { state: { prefilledEmail: duplicateEmail } })}
                    className={`${btnPrimaryCls} flex-1 min-w-[120px]`}
                    style={{ background: '#2563EB' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563EB'; }}
                >
                    {contents.registration[23].text}
                </button>
                <button
                    onClick={handleForgotPassword}
                    disabled={status === 'forgot_loading'}
                    className="flex-1 min-w-[120px] py-3 px-6 rounded-xl text-sm font-semibold text-[#0F172A] border border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200 cursor-pointer disabled:opacity-50 !shadow-none"
                >
                    {status === 'forgot_loading' ? contents.registration[32].text : contents.registration[33].text}
                </button>
            </div>
            <button
                onClick={() => { setStatus('idle'); setErrorMessage(''); setDuplicateEmail(''); }}
                className="text-sm text-[#2563EB] hover:text-[#1d4ed8] font-medium cursor-pointer transition-colors duration-200 !bg-transparent !shadow-none !border-0 !p-0 mt-1"
            >
                {contents.registration[29].text}
            </button>
        </div>
    );

    // ─── Render: forgot password sent ─────────────────────────────────────────

    const renderForgotSentBlock = () => (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="#2563EB">
                    <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/>
                </svg>
            </div>
            <div>
                <p className="text-base font-bold text-[#0F172A] mb-1">{contents.registration[26].text}</p>
                <p className="text-sm text-[#64748B] leading-relaxed">
                    {contents.registration[27].text}{' '}<strong className="text-[#0F172A]">{duplicateEmail}</strong>.{' '}
                    {contents.registration[28].text}
                </p>
            </div>
            <button
                onClick={() => navigate('/login', { state: { prefilledEmail: duplicateEmail } })}
                className={`${btnPrimaryCls} w-full`}
                style={{ background: '#2563EB' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563EB'; }}
            >
                {contents.registration[25].text}
            </button>
        </div>
    );

    // ─── Main render ──────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen flex">

            {/* ── Left: hero panel ─────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col justify-center px-16 py-20"
                 style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1e3a8a 50%, #0c1445 100%)' }}>

                <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full opacity-10 -translate-y-1/2 translate-x-1/3"
                     style={{ background: 'radial-gradient(circle, #2563EB, transparent 70%)' }} />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 translate-y-1/3 -translate-x-1/3"
                     style={{ background: 'radial-gradient(circle, #2563EB, transparent 70%)' }} />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2"
                     style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)' }} />

                <div className="relative z-10 flex items-center gap-3 mb-16">
                    <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="white">
                            <path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z"/>
                        </svg>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">My Dream House</span>
                </div>

                <div className="relative z-10 mb-12">
                    <h2 className="text-5xl font-bold text-white leading-tight mb-5">
                        {contents.login[16].text}
                    </h2>
                    <p className="text-white/55 text-base leading-relaxed max-w-xs">
                        {contents.login[17].text}
                    </p>
                </div>

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
                    <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-1.5">
                        {contents.registration[0].text}
                    </h1>
                    <p className="text-[#64748B] text-sm mb-7">
                        {contents.registration[11].text} — {contents.registration[4].text}
                    </p>

                    {/* Status banners */}
                    {renderBanner()}

                    {/* ── Duplicate account ─────────────────── */}
                    {status === 'duplicate_account' && renderDuplicateBlock()}

                    {/* ── Forgot sent ───────────────────────── */}
                    {status === 'forgot_sent' && renderForgotSentBlock()}

                    {/* ── Main form ─────────────────────────── */}
                    {(status === 'idle' || status === 'error' || status === 'loading') && (
                        <>
                            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 mb-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-[#0F172A]" htmlFor="reg-name">
                                        {contents.registration[1].text}
                                    </label>
                                    <input
                                        id="reg-name"
                                        className={inputCls}
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={contents.registration[1].text}
                                        required
                                        disabled={isLoading}
                                        autoComplete="name"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-[#0F172A]" htmlFor="reg-email">
                                        {contents.registration[2].text}
                                    </label>
                                    <input
                                        id="reg-email"
                                        className={inputCls}
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@example.com"
                                        required
                                        disabled={isLoading}
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-[#0F172A]" htmlFor="reg-password">
                                        {contents.registration[3].text}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="reg-password"
                                            className={`${inputCls} pr-12`}
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            disabled={isLoading}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(v => !v)}
                                            tabIndex={-1}
                                            aria-label={showPassword ? contents.resetPassword.hidePassword : contents.resetPassword.showPassword}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors duration-200 cursor-pointer !bg-transparent !shadow-none !border-0 !p-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                                    <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"/>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                                    <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`${btnPrimaryCls} w-full mt-1`}
                                    style={{ background: '#2563EB' }}
                                    onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563EB'; }}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="white">
                                                <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z"/>
                                            </svg>
                                            {contents.registration[12].text}
                                        </>
                                    ) : contents.registration[11].text}
                                </button>
                            </form>

                            {/* Divider: або */}
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

                            {/* Divider: якщо */}
                            <div className="flex items-center gap-3 my-5">
                                <hr className="flex-1 border-gray-200" />
                                <span className="text-xs text-[#64748B] font-medium">{contents.login[12].text}</span>
                                <hr className="flex-1 border-gray-200" />
                            </div>

                            {/* Login link */}
                            <p className="text-center text-sm text-[#64748B]">
                                {contents.registration[24].text}{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-[#2563EB] font-semibold hover:text-[#1d4ed8] transition-colors duration-200 cursor-pointer !bg-transparent !shadow-none !border-0 !p-0 ml-1"
                                >
                                    {contents.registration[23].text}
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm;
