import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { setSubscribeType, setSubscribeExpired, normalizeSubscribeType } from '../features/registration/registrationSlice';
import { useAuth } from '../services/useAuth';

type Plan = 'standard' | 'premium' | 'free';

type LiqPayButtonProps = {
    plan?: Plan;
    label?: string;
    className?: string;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LiqPayButton = ({ plan, label, className }: LiqPayButtonProps) => {
    const [liqpayData, setLiqpayData] = useState({ data: '', signature: '' });
    const [status, setStatus] = useState<'idle' | 'paying' | 'success' | 'error'>('idle');
    const dispatch = useDispatch();
    const { language } = useLanguage();
    const t = (language === 'en' ? allEnTexts : allUaTexts).subscriptionBanner;
    const { checkAuth } = useAuth();

    useEffect(() => {
        if (plan === 'free') return;
        const url = plan
            ? `${API_URL}/api/liqpay-params?plan=${plan}`
            : `${API_URL}/api/liqpay-params`;
        axios.get(url)
            .then(response => setLiqpayData(response.data))
            .catch(error => console.error('Error fetching LiqPay params:', error));
    }, [plan]);

    const handlePay = async () => {
        if (status === 'paying') return;
        if (plan !== 'free' && !liqpayData.data) return;
        setStatus('paying');
        try {
            if (plan === 'free') {
                await axios.post(
                    `${API_URL}/api/subscribe/pay`,
                    { plan: 'Free', amount: 0 },
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                await axios.post(
                    `${API_URL}/api/subscribe/pay`,
                    { data: liqpayData.data, signature: liqpayData.signature },
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
            }
            const { isAuthenticated, user } = await checkAuth();
            if (isAuthenticated && user) {
                dispatch(setSubscribeType(normalizeSubscribeType(user.subscribeType)));
                dispatch(setSubscribeExpired(user.subscribeExpired ?? null));
            }
            setStatus('success');
        } catch {
            setStatus('error');
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                className={className ?? 'bg-green-600 text-white px-4 py-2 rounded'}
                onClick={handlePay}
                disabled={status === 'paying' || status === 'success'}
            >
                {status === 'paying' ? t.paying : label ?? 'Оплатити'}
            </button>
            {status === 'success' && (
                <p className="text-sm font-semibold text-green-600 text-center">
                    {plan === 'free' ? t.downgradeSuccess : t.paySuccess}
                </p>
            )}
            {status === 'error' && (
                <p className="text-sm font-semibold text-red-500 text-center">{t.payError}</p>
            )}
        </div>
    );
};

export default LiqPayButton;
