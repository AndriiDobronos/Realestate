import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();
    const isUA = language === 'uk';

    const toggleLanguage = () => {
        setLanguage(isUA ? 'en' : 'uk');
    };

    return (
        // <div >
        <button
            onClick={toggleLanguage}
            className="flex items-center justify-center bg-transparent rounded-full w-[80px] h-[44px] p-1"
        >
            <div style={{boxShadow: 'inset 0 0 4px rgba(0, 0, 0, 0.3)'}}
            className={`relative flex w-[72px] h-[36px] rounded-full p-1 transition-colors duration-300 ${
                isUA ? 'bg-[#F59E0B]' : 'bg-[#2563EB]'
            }`}>
                <span
                style={{boxShadow: 'inset 2px 2px 8px rgba(0, 0, 0, 0.3)'}}
                className={`absolute w-6 h-6 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    isUA ? 'translate-x-[36px]' : 'translate-x-[4px]'
                }`}
            ></span>
            <span className="w-full flex justify-between items-center text-xs font-semibold px-2 text-white">
                <span>EN</span>
                <span>UA</span>
            </span>
            </div>
        </button>
        // </div>
    );
};

export default LanguageSwitcher;
