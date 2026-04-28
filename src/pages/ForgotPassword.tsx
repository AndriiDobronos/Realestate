import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = 'idle' | 'loading' | 'sent' | 'error';

// ─── Component ───────────────────────────────────────────────────────────────

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setErrorMessage('Будь ласка, введіть email.');
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

            // Независимо от того, существует email или нет — всегда отвечаем
            // одинаково. Это стандартная практика безопасности: не раскрывать
            // факт наличия/отсутствия email в базе (предотвращает enumeration-атаки).
            if (response.ok || response.status === 404) {
                setStatus('sent');
            } else {
                const data = await response.json();
                setErrorMessage(data.message || 'Помилка сервера. Спробуйте пізніше.');
                setStatus('error');
            }
        } catch {
            setErrorMessage('Помилка з\'єднання. Спробуйте пізніше.');
            setStatus('error');
        }
    };

    // ─── Render: sent confirmation ──────────────────────────────────────────

    if (status === 'sent') {
        return (
            <div>
                <div style={styles.offset} />
                <div style={styles.container}>
                    <div style={styles.glassCard}>
                        <div style={styles.icon}>✉️</div>
                        <h2 style={styles.title}>Перевірте пошту</h2>
                        <p style={styles.subtitle}>
                            Якщо акаунт з адресою <strong>{email}</strong> існує,
                            ми надіслали інструкцію для скидання пароля.
                            Перевірте також папку «Спам».
                        </p>
                        <p style={styles.hint}>
                            Посилання дійсне протягом <strong>30 хвилин</strong>.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            style={styles.btnPrimary}
                        >
                            Повернутися до входу
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Render: form ────────────────────────────────────────────────────────

    return (
        <div>
            <div style={styles.offset} />
            <div style={styles.container}>
                <div style={styles.glassCard}>
                    <div style={styles.icon}>🔑</div>
                    <h2 style={styles.title}>Забули пароль?</h2>
                    <p style={styles.subtitle}>
                        Введіть email вашого акаунту — ми надішлемо посилання
                        для скидання пароля.
                    </p>

                    {status === 'error' && (
                        <p style={styles.errorText}>{errorMessage}</p>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <input
                            type="email"
                            placeholder="Ваш email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (status === 'error') setStatus('idle');
                            }}
                            required
                            disabled={status === 'loading'}
                            style={styles.input}
                            autoComplete="email"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            style={{ ...styles.btnPrimary, width: '100%' }}
                        >
                            {status === 'loading' ? 'Надсилаємо...' : 'Надіслати посилання'}
                        </button>
                    </form>

                    <button
                        onClick={() => navigate('/login')}
                        style={styles.btnLink}
                    >
                        ← Повернутися до входу
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

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
        padding: '36px 44px',
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
    icon: { fontSize: '40px', marginBottom: '12px' },
    title: {
        fontSize: '22px',
        fontWeight: 700,
        color: '#1a1a2e',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#444',
        lineHeight: 1.6,
        marginBottom: '20px',
    },
    hint: {
        fontSize: '13px',
        color: '#666',
        marginBottom: '20px',
    },
    input: {
        display: 'block',
        width: '100%',
        padding: '10px 14px',
        marginBottom: '12px',
        border: '1px solid rgba(255,255,255,0.5)',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.6)',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    btnPrimary: {
        display: 'inline-block',
        padding: '10px 24px',
        background: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
    },
    btnLink: {
        marginTop: '16px',
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        fontSize: '13px',
        cursor: 'pointer',
        textDecoration: 'underline',
        display: 'block',
        width: '100%',
        textAlign: 'center',
    },
    errorText: {
        color: '#ef4444',
        fontSize: '14px',
        marginBottom: '12px',
    },
};

export default ForgotPassword;