import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';

type RequiredPlan = 'standard' | 'premium';

interface Props {
    requiredPlan: RequiredPlan;
}

const IconWarning = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="currentColor">
        <path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z"/>
    </svg>
);

const SubscriptionBanner = ({ requiredPlan }: Props) => {
    const { language } = useLanguage();
    const t = (language === 'en' ? allEnTexts : allUaTexts).subscriptionBanner;
    const navigate = useNavigate();

    const message = requiredPlan === 'premium' ? t.premiumMsg : t.standardMsg;

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-start gap-3">
                <span className="text-amber-500 mt-0.5 shrink-0">
                    <IconWarning />
                </span>
                <div>
                    <p className="text-sm font-bold text-amber-900">{t.title}</p>
                    <p className="text-sm text-amber-700 mt-0.5">{message}</p>
                </div>
            </div>
            <button
                onClick={() => navigate('/subscription')}
                className="shrink-0 px-4 py-2 rounded-lg !bg-amber-500 hover:!bg-amber-600 active:!bg-amber-700 text-white text-sm font-semibold transition-colors duration-200 !shadow-none !border-0 min-h-[44px]"
            >
                {t.ctaBtn}
            </button>
        </div>
    );
};

export default SubscriptionBanner;
