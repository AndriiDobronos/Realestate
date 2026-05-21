import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';

type Status =
    | 'validating'
    | 'ready'
    | 'loading'
    | 'success'
    | 'invalid_token'
    | 'error';

const ResetPassword: React.FC = () => {
    const { language } = useLanguage();
    const contents = language === 'en' ? allEnTexts : allUaTexts;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<Status>('validating');
    const [errorMessage, setErrorMessage] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (!token) {
            setStatus('invalid_token');
            return;
        }

        const validateToken = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/auth/reset-password/validate?token=${token}`,
                    { method: 'GET', credentials: 'include' }
                );
                setStatus(response.ok ? 'ready' : 'invalid_token');
            } catch {
                // On network error don't block the user — let them try submitting.
                setStatus('ready');
            }
        };

        validateToken();
    }, [token, API_URL]);

    const validatePasswords = (): string | null => {
        if (password.length < 8) return contents.resetPassword.passwordTooShort;
        if (password !== confirmPassword) return contents.resetPassword.passwordsMismatch;
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validatePasswords();
        if (validationError) {
            setErrorMessage(validationError);
            setStatus('error');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setTimeout(() => navigate('/login', {
                    state: { message: contents.resetPassword.successRedirectMsg }
                }), 3000);
            } else if (response.status === 400 || response.status === 410) {
                setStatus('invalid_token');
            } else {
                setErrorMessage(data.message || contents.resetPassword.serverError);
                setStatus('error');
            }
        } catch {
            setErrorMessage(contents.resetPassword.connectionError);
            setStatus('error');
        }
    };

    const isLoading = status === 'loading';

    const renderRightContent = () => {
        if (status === 'validating') {
            return (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#2563EB">
                        <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z"/>
                    </svg>
                    <p className="text-[#64748B] text-sm">{contents.resetPassword.validatingTitle}</p>
                </div>
            );
        }

        if (status === 'invalid_token') {
            return (
                <>
                    <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#ef4444">
                            <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
                        {contents.resetPassword.invalidTitle}
                    </h1>
                    <p className="text-[#64748B] text-sm leading-relaxed mb-8">
                        {contents.resetPassword.invalidText}
                    </p>
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 cursor-pointer !shadow-none !border-0 mb-3"
                        style={{ background: '#2563EB' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563EB'; }}
                    >
                        {contents.resetPassword.requestNewBtn}
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full text-center text-sm text-[#2563EB] hover:text-[#1d4ed8] transition-colors duration-200 cursor-pointer !bg-transparent !shadow-none !border-0 !p-0"
                    >
                        {contents.resetPassword.backToLogin}
                    </button>
                </>
            );
        }

        if (status === 'success') {
            return (
                <>
                    <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#10b981">
                            <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
                        {contents.resetPassword.successTitle}
                    </h1>
                    <p className="text-[#64748B] text-sm leading-relaxed">
                        {contents.resetPassword.successText}
                    </p>
                </>
            );
        }

        // ready | loading | error — show the form
        return (
            <>
                <h1 className="text-2xl font-bold text-[#0F172A] mb-1.5">
                    {contents.resetPassword.formTitle}
                </h1>
                <p className="text-[#64748B] text-sm mb-7">
                    {contents.resetPassword.formSubtitle}
                </p>

                {status === 'error' && (
                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#ef4444" className="shrink-0 mt-0.5">
                            <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                        </svg>
                        <p className="text-sm text-red-700 leading-snug">{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#0F172A]" htmlFor="reset-password">
                            {contents.resetPassword.newPasswordLabel}
                        </label>
                        <div className="relative">
                            <input
                                id="reset-password"
                                className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-sm text-[#0F172A] placeholder-[#94a3b8] focus:outline-none focus:border-[#2563EB] focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); if (status === 'error') setStatus('ready'); }}
                                placeholder={contents.resetPassword.newPasswordPlaceholder}
                                required
                                disabled={isLoading}
                                autoComplete="new-password"
                                autoFocus
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

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#0F172A]" htmlFor="reset-confirm">
                            {contents.resetPassword.confirmPasswordLabel}
                        </label>
                        <input
                            id="reset-confirm"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#0F172A] placeholder-[#94a3b8] focus:outline-none focus:border-[#2563EB] focus:ring-2 transition-all duration-200 disabled:opacity-50"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); if (status === 'error') setStatus('ready'); }}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                            autoComplete="new-password"
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
                                {contents.resetPassword.savingBtn}
                            </>
                        ) : contents.resetPassword.saveBtn}
                    </button>
                </form>
            </>
        );
    };

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
                        {contents.resetPassword.leftHeadline}
                    </h2>
                    <p className="text-white/55 text-base leading-relaxed max-w-xs">
                        {contents.resetPassword.leftSubtext}
                    </p>
                </div>

                {/* Stats */}
                <div className="relative z-10 flex gap-10">
                    <div>
                        <p className="text-white font-bold text-2xl">8+</p>
                        <p className="text-white/45 text-sm mt-0.5">{contents.resetPassword.statMinChars}</p>
                    </div>
                    <div className="w-px bg-white/15 self-stretch" />
                    <div>
                        <p className="text-white font-bold text-2xl">30хв</p>
                        <p className="text-white/45 text-sm mt-0.5">{contents.resetPassword.statLinkExpiry}</p>
                    </div>
                    <div className="w-px bg-white/15 self-stretch" />
                    <div>
                        <p className="text-white font-bold text-2xl">AES</p>
                        <p className="text-white/45 text-sm mt-0.5">{contents.resetPassword.statEncryption}</p>
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

                    {renderRightContent()}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
