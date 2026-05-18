import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

type Plan = 'standard' | 'premium';

type LiqPayButtonProps = {
    plan?: Plan;
    label?: string;
    className?: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LiqPayButton = ({ plan, label, className }: LiqPayButtonProps) => {
    const [liqpayData, setLiqpayData] = useState({ data: '', signature: '' });
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const url = plan
            ? `${API_URL}/api/liqpay-params?plan=${plan}`
            : `${API_URL}/api/liqpay-params`;
        axios.get(url)
            .then(response => setLiqpayData(response.data))
            .catch(error => console.error('Error fetching LiqPay params:', error));
    }, [plan]);

    const handleSubmit = () => {
        formRef.current?.submit();
    };

    return (
        <div>
            <form
                ref={formRef}
                method="POST"
                action="https://www.liqpay.ua/api/3/checkout"
                acceptCharset="utf-8"
                style={{ display: 'none' }}
            >
                <input type="hidden" name="data" value={liqpayData.data} />
                <input type="hidden" name="signature" value={liqpayData.signature} />
            </form>
            <button
                className={className ?? "bg-green-600 text-white px-4 py-2 rounded"}
                onClick={handleSubmit}
            >
                {label ?? "Pay with Google Pay (via LiqPay)"}
            </button>
        </div>
    );
};

export default LiqPayButton;
