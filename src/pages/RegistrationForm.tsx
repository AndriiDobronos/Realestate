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

// Машина состояний формы — только одно состояние активно одновременно.
// Это исключает противоречивые комбинации boolean-флагов.
type FormStatus =
    | 'idle'              // форма пустая, ожидает ввода
    | 'loading'           // идёт запрос к серверу
    | 'success'           // регистрация успешна, идёт редирект
    | 'duplicate_account' // 409: email уже зарегистрирован
    | 'forgot_loading'    // идёт отправка письма о пароле
    | 'forgot_sent'       // письмо отправлено
    | 'error';            // ошибка валидации или сети

// ─── Component ────────────────────────────────────────────────────────────────

const RegistrationForm: React.FC = () => {
    const { language } = useLanguage();
    const contents = language === 'en' ? allEnTexts : allUaTexts;

    // Если пользователь уже авторизован — сразу редиректим на главную
    const isRegistration = useSelector((state: RootState) => state.registration.isRegistered);
    const navigate = useNavigate();
    const { handleAuthSuccess, API_URL } = useAuth();

    const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' });
    const [status, setStatus] = useState<FormStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // Email сохраняем отдельно для использования в блоке duplicate
    const [duplicateEmail, setDuplicateEmail] = useState('');

    // ─── Если уже залогинен — не показываем форму регистрации
    useEffect(() => {
        if (isRegistration) {
            navigate('/');
        }
    }, [isRegistration, navigate]);

    // ─── Helpers ──────────────────────────────────────────────────────────────

    const onAuthSuccess = (data: any) => {
        setSuccessMessage(data.message || 'Реєстрацію завершено!');
        setStatus('success');
        handleAuthSuccess(data); // сохраняет в Redux + localStorage + редирект
    };

    const onDuplicateAccount = (email: string) => {
        setDuplicateEmail(email);
        setStatus('duplicate_account');
    };

    // ─── Forgot password (из блока duplicate) ─────────────────────────────────
    // Кнопка "Забули пароль?" доступна только когда мы уже знаем email
    // пользователя (после 409), поэтому она уместна именно здесь.

    const handleForgotPassword = async () => {
        setStatus('forgot_loading');
        try {
            await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: duplicateEmail }),
                credentials: 'include',
            });
            // Всегда показываем "отправлено" — сервер не раскрывает существование email
            setStatus('forgot_sent');
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
                onAuthSuccess(data);
            } else if (response.status === 409) {
                onDuplicateAccount(data.email ?? formData.email);
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
        setErrorMessage('Google login failed');
        setStatus('error');
    };

    // ─── Regular registration ─────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            setErrorMessage('Усі поля обов\'язкові.');
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
                setErrorMessage(data.message || 'Не вдалося зареєструватись. Спробуйте ще раз.');
                setStatus('error');
            }
        } catch {
            setErrorMessage('Помилка з\'єднання. Спробуйте пізніше.');
            setStatus('error');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (status === 'error') { setStatus('idle'); setErrorMessage(''); }
    };

    const isLoading = status === 'loading' || status === 'forgot_loading';

    // ─── Render: блок "дублирующий аккаунт" ──────────────────────────────────

    const renderDuplicateBlock = () => (
        <div style={styles.centeredBlock}>
            <div style={styles.bigIcon}>⚠️</div>
            <p style={styles.blockTitle}>{contents.registration[30].text}{/*Не вдалося завершити реєстрацію.*/}</p>
            <p style={styles.blockSubtitle}>{contents.registration[31].text}{/*Можливо, у вас вже є акаунт.*/}</p>
            <div style={styles.actionRow}>
                <button
                    onClick={() => navigate('/login', { state: { prefilledEmail: duplicateEmail } })}
                    style={styles.btnPrimary}
                >
                    {contents.registration[23].text}{/*Увійти*/}
                </button>
                <button
                    onClick={handleForgotPassword}
                    disabled={status === 'forgot_loading'}
                    style={styles.btnSecondary}
                >
                    {status === 'forgot_loading' ? contents.registration[32].text : contents.registration[33].text}
                    {/*'Надсилаємо...' : 'Забули пароль?'*/}
                </button>
            </div>
            <button
                onClick={() => { setStatus('idle'); setErrorMessage(''); setDuplicateEmail(''); }}
                style={styles.btnLink}
            >
                {contents.registration[29].text}{/*← Повернутись до реєстрації*/}
            </button>
        </div>
    );

    // ─── Render: письмо отправлено ────────────────────────────────────────────

    const renderForgotSentBlock = () => (
        <div style={styles.centeredBlock}>
            <div style={styles.bigIcon}>✉️</div>
            <p style={styles.blockTitle}>{contents.registration[26].text}{/*Листа надіслано!*/}</p>
            <p style={styles.blockSubtitle}>
                {contents.registration[27].text}{/*Перевірте поштову скриньку*/}<strong>{duplicateEmail}</strong>.
                {contents.registration[28].text}{/*Посилання дійсне 30 хвилин.*/}
            </p>
            <button
                onClick={() => navigate('/login', { state: { prefilledEmail: duplicateEmail } })}
                style={{ ...styles.btnPrimary, marginTop: '16px' }}
            >
                {contents.registration[25].text}{/*Перейти до входу*/}
            </button>
        </div>
    );

    // ─── Main render ──────────────────────────────────────────────────────────

    return (
        <div>
            <div style={styles.offset} />
            <div style={styles.container}>
                <div style={styles.glassCard}>
                    <h2 style={styles.title}>{contents.registration[0].text}</h2>

                    {status === 'error' && <p style={styles.errorText}>{errorMessage}</p>}
                    {status === 'success' && <p style={styles.successText}>{successMessage}</p>}
                    {isLoading && <p style={styles.loadingText}>Завантаження...</p>}

                    {status === 'duplicate_account' && renderDuplicateBlock()}
                    {status === 'forgot_sent' && renderForgotSentBlock()}

                    {(status === 'idle' || status === 'error' || status === 'loading') && (
                        <>
                            <form onSubmit={handleSubmit} noValidate>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder={contents.registration[1].text}
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    style={styles.input}
                                    autoComplete="name"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder={contents.registration[2].text}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    style={styles.input}
                                    autoComplete="email"
                                />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder={contents.registration[3].text}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    style={styles.input}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{ ...styles.btnPrimary, width: '100%', marginTop: '8px' }}
                                >
                                    {contents.registration[11].text}
                                </button>
                            </form>

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

                            {/* Ссылка на страницу входа — для тех кто уже регистрировался */}
                            <p style={styles.footerText}>
                                {contents.registration[24].text}{/*{'Вже маєте акаунт? '}*/}
                                <button
                                    onClick={() => navigate('/login')}
                                    style={styles.btnLink}
                                >
                                    {contents.registration[23].text}{/*{'Login'}*/}
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
    offset: { height: '64px' },
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 64px)',
        backgroundImage:
            'url(https://images.pexels.com/photos/681331/pexels-photo-681331.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    glassCard: {
        padding: '32px 40px',
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
    title: { fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' },
    input: {
        display: 'block', width: '100%', padding: '10px 14px', marginBottom: '12px',
        border: '1px solid rgba(255,255,255,0.5)', borderRadius: '8px',
        background: 'rgba(255,255,255,0.6)', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
    },
    btnPrimary: {
        display: 'inline-block', padding: '10px 24px', background: '#3b82f6',
        color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px',
        fontWeight: 600, cursor: 'pointer',
    },
    btnSecondary: {
        display: 'inline-block', padding: '10px 24px', background: 'transparent',
        color: '#1a1a2e', border: '1.5px solid rgba(30,30,60,0.4)',
        borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
    },
    btnLink: {
        background: 'none', border: 'none', color: '#3b82f6',fontWeight: 'bold',marginLeft: '8px',
        fontSize: '14px', cursor: 'pointer', textDecoration: 'none', padding: '10px',marginTop: '16px'
    },
    divider: { display: 'flex', alignItems: 'center', margin: '20px 0' },
    hr: { flex: 1, border: 'none', borderTop: '1px solid rgba(0,0,0,0.15)' },
    dividerText: { margin: '0 10px', fontSize: '13px', color: '#555' },
    googleWrapper: { display: 'flex', justifyContent: 'center' },
    errorText: { color: '#ef4444', marginBottom: '12px', fontSize: '14px' },
    successText: { color: '#22c55e', marginBottom: '12px', fontSize: '14px' },
    loadingText: { color: '#3b82f6', marginBottom: '12px', fontSize: '14px' },
    footerText: { marginTop: '16px', fontSize: '14px', color: '#1a1a2e' },
    centeredBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' },
    bigIcon: { fontSize: '40px', marginBottom: '12px' },
    blockTitle: { fontWeight: 700, fontSize: '17px', color: '#1a1a2e', marginBottom: '4px' },
    blockSubtitle: { color: '#1a1a2e', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 },
    actionRow: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'},
};

export default RegistrationForm;
