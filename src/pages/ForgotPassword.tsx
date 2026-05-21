import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';

type Status = 'idle' | 'loading' | 'sent' | 'error';

const ForgotPassword: React.FC = () => {
    const { language } = useLanguage();
    const contents = language === 'en' ? allEnTexts : allUaTexts;
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState<string>(location.state?.prefilledEmail || '');
    const [status, setStatus] = useState<Status>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setErrorMessage(contents.forgotPassword.errorEmpty);
            setStatus('error');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include',
            });

            // Always show success regardless of whether email exists — prevents enumeration.
            if (response.ok || response.status === 404) {
                setStatus('sent');
            } else {
                const data = await response.json();
                setErrorMessage(data.message || contents.forgotPassword.serverError);
                setStatus('error');
            }
        } catch {
            setErrorMessage(contents.forgotPassword.connectionError);
            setStatus('error');
        }
    };

    const isLoading = status === 'loading';

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
                        {contents.forgotPassword.leftHeadline}
                    </h2>
                    <p className="text-white/55 text-base leading-relaxed max-w-xs">
                        {contents.forgotPassword.leftSubtext}
                    </p>
                </div>

                {/* Stats */}
                <div className="relative z-10 flex gap-10">
                    <div>
                        <p className="text-white font-bold text-2xl">256-bit</p>
                        <p className="text-white/45 text-sm mt-0.5">{contents.forgotPassword.statEncryption}</p>
                    </div>
                    <div className="w-px bg-white/15 self-stretch" />
                    <div>
                        <p className="text-white font-bold text-2xl">30хв</p>
                        <p className="text-white/45 text-sm mt-0.5">{contents.forgotPassword.statLinkExpiry}</p>
                    </div>
                    <div className="w-px bg-white/15 self-stretch" />
                    <div>
                        <p className="text-white font-bold text-2xl">24/7</p>
                        <p className="text-white/45 text-sm mt-0.5">{contents.forgotPassword.statSupport}</p>
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

                    {status === 'sent' ? (
                        /* ── Sent confirmation ── */
                        <>
                            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#10b981">
                                    <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/>
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
                                {contents.forgotPassword.sentTitle}
                            </h1>
                            <p className="text-[#64748B] text-sm leading-relaxed mb-2">
                                {contents.forgotPassword.sentText}{' '}
                                <strong className="text-[#0F172A]">{email}</strong>.
                            </p>
                            <p className="text-[#64748B] text-sm leading-relaxed mb-8">
                                {contents.forgotPassword.sentHint}
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 cursor-pointer !shadow-none !border-0"
                                style={{ background: '#2563EB' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563EB'; }}
                            >
                                {contents.forgotPassword.backToLogin}
                            </button>
                        </>
                    ) : (
                        /* ── Form ── */
                        <>
                            {/* Back link */}
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors duration-200 cursor-pointer !bg-transparent !shadow-none !border-0 !p-0 mb-8"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                                    <path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/>
                                </svg>
                                {contents.forgotPassword.backToLogin}
                            </button>

                            <h1 className="text-2xl font-bold text-[#0F172A] mb-1.5">
                                {contents.forgotPassword.title}
                            </h1>
                            <p className="text-[#64748B] text-sm mb-7">
                                {contents.forgotPassword.subtitle}
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
                                    <label className="text-sm font-medium text-[#0F172A]" htmlFor="forgot-email">
                                        Email
                                    </label>
                                    <input
                                        id="forgot-email"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#0F172A] placeholder-[#94a3b8] focus:outline-none focus:border-[#2563EB] focus:ring-2 transition-all duration-200 disabled:opacity-50"
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                                        placeholder="name@example.com"
                                        required
                                        disabled={isLoading}
                                        autoComplete="email"
                                        autoFocus
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
                                            {contents.forgotPassword.sendingBtn}
                                        </>
                                    ) : contents.forgotPassword.submitBtn}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
