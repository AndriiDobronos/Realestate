import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ─── Types ───────────────────────────────────────────────────────────────────

type Status =
    | 'idle'
    | 'validating'   // проверяем токен при загрузке страницы
    | 'ready'        // токен валиден, форма активна
    | 'loading'      // отправка нового пароля
    | 'success'      // пароль успешно изменён
    | 'invalid_token' // токен не найден или истёк
    | 'error';

// ─── Component ───────────────────────────────────────────────────────────────

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<Status>('validating');
    const [errorMessage, setErrorMessage] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // ─── Validate token on mount ────────────────────────────────────────────
    // При открытии страницы сразу проверяем токен на сервере.
    // Это предотвращает ситуацию когда пользователь заполнит форму,
    // нажмёт «Сохранить» и только тогда узнает что токен уже истёк.

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
                if (response.ok) {
                    setStatus('ready');
                } else {
                    setStatus('invalid_token');
                }
            } catch {
                // При ошибке сети не блокируем пользователя — разрешаем попробовать
                setStatus('ready');
            }
        };

        validateToken();
    }, [token, API_URL]);

    // ─── Password validation ─────────────────────────────────────────────────

    const validatePasswords = (): string | null => {
        if (password.length < 8) {
            return 'Пароль повинен містити щонайменше 8 символів.';
        }
        if (password !== confirmPassword) {
            return 'Паролі не збігаються.';
        }
        return null;
    };

    // ─── Submit new password ─────────────────────────────────────────────────

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
                // Автоматический редирект на /login через 3 секунды
                setTimeout(() => navigate('/login', {
                    state: { message: 'Пароль успішно змінено. Тепер ви можете увійти.' }
                }), 3000);
            } else if (response.status === 400 || response.status === 410) {
                // 410 Gone — токен истёк или уже использован
                setStatus('invalid_token');
            } else {
                setErrorMessage(data.message || 'Помилка сервера. Спробуйте пізніше.');
                setStatus('error');
            }
        } catch {
            setErrorMessage('Помилка з\'єднання. Спробуйте пізніше.');
            setStatus('error');
        }
    };

    // ─── Render: validating ──────────────────────────────────────────────────

    if (status === 'validating') {
        return (
            <PageWrapper>
                <div style={styles.icon}>⏳</div>
                <h2 style={styles.title}>Перевіряємо посилання...</h2>
            </PageWrapper>
        );
    }

    // ─── Render: invalid / expired token ─────────────────────────────────────

    if (status === 'invalid_token') {
        return (
            <PageWrapper>
                <div style={styles.icon}>❌</div>
                <h2 style={styles.title}>Посилання недійсне</h2>
                <p style={styles.subtitle}>
                    Це посилання для скидання пароля вже використано або термін
                    його дії минув (30 хвилин). Будь ласка, запросіть нове.
                </p>
                <button
                    onClick={() => navigate('/forgot-password')}
                    style={styles.btnPrimary}
                >
                    Запросити нове посилання
                </button>
                <button
                    onClick={() => navigate('/login')}
                    style={styles.btnLink}
                >
                    ← До входу
                </button>
            </PageWrapper>
        );
    }

    // ─── Render: success ─────────────────────────────────────────────────────

    if (status === 'success') {
        return (
            <PageWrapper>
                <div style={styles.icon}>✅</div>
                <h2 style={styles.title}>Пароль змінено!</h2>
                <p style={styles.subtitle}>
                    Ваш пароль успішно оновлено. Зараз ми перенаправимо вас
                    на сторінку входу...
                </p>
            </PageWrapper>
        );
    }

    // ─── Render: form (ready | error | loading) ──────────────────────────────

    return (
        <PageWrapper>
            <div style={styles.icon}>🔐</div>
            <h2 style={styles.title}>Новий пароль</h2>
            <p style={styles.subtitle}>
                Введіть новий пароль для вашого акаунту.
                Мінімум 8 символів.
            </p>

            {status === 'error' && (
                <p style={styles.errorText}>{errorMessage}</p>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div style={styles.inputWrapper}>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Новий пароль"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (status === 'error') setStatus('ready');
                        }}
                        required
                        disabled={status === 'loading'}
                        style={styles.input}
                        autoComplete="new-password"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        style={styles.eyeBtn}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                    >
                        {showPassword ? '🙈' : '👁️'}
                    </button>
                </div>

                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Повторіть пароль"
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (status === 'error') setStatus('ready');
                    }}
                    required
                    disabled={status === 'loading'}
                    style={styles.input}
                    autoComplete="new-password"
                />

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    style={{ ...styles.btnPrimary, width: '100%', marginTop: '4px' }}
                >
                    {status === 'loading' ? 'Зберігаємо...' : 'Зберегти новий пароль'}
                </button>
            </form>
        </PageWrapper>
    );
};

// ─── PageWrapper — переиспользуемая обёртка с фоном ──────────────────────────

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div>
        <div style={styles.offset} />
        <div style={styles.container}>
            <div style={styles.glassCard}>{children}</div>
        </div>
    </div>
);

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
    inputWrapper: {
        position: 'relative',
        marginBottom: '12px',
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
    eyeBtn: {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '0',
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
        marginTop: '12px',
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

export default ResetPassword;