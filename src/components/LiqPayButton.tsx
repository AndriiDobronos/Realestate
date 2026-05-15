import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const LiqPayButton = () => {
    const [liqpayData, setLiqpayData] = useState({ data: '', signature: '' });
    const formRef = useRef<HTMLFormElement>(null);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        axios.get(`${API_URL}/api/liqpay-params`)
            .then(response => setLiqpayData(response.data))
            .catch(error => console.error('Error fetching LiqPay params:', error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
            >
                Pay with Google Pay (via LiqPay)
            </button>
        </div>
    );
};

export default LiqPayButton;
