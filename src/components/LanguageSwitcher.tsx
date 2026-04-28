import { useLanguage } from '../context/LanguageContext';
//import allEnTexts from '../contents/allEnTexts';
//import allUaTexts from '../contents/allUaTexts';

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();
    const isUA = language === 'uk';

    const toggleLanguage = () => {
        setLanguage(isUA ? 'en' : 'uk');
    };

    return (
        <button
            onClick={toggleLanguage}
            className={`relative flex w-16 h-8 bg-yellow-300 rounded-full p-1 transition-colors duration-300 ${
                isUA ? 'bg-blue-300' : 'bg-gray-300'
            }`}
        >
      <span
          style={{boxShadow: 'inset 2px 2px 8px rgba(0, 0, 0, 0.3)'}}
          className={`absolute w-6 h-[24px] bottom-[3.5px] bg-white rounded-full shadow-md transform transition-transform duration-300 ${
              isUA ? 'translate-x-[30px]' : 'translate-x-0'
          }`}
      ></span>
            <span className="w-full flex justify-between items-center text-xs font-semibold px-2 text-gray-700">
        <span>EN</span>
        <span>UA</span>
      </span>
        </button>
    );
};

export default LanguageSwitcher;
