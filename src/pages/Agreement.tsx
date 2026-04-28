import React, { useRef} from "react";
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import {useLanguage} from "../context/LanguageContext";
import agreement from '../assets/files/agreement.pdf';

const Agreement = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts
    const downloadRef = useRef<HTMLAnchorElement>(null);

    const handleDownload = () => {
        if (downloadRef.current) {
            downloadRef.current.click();
        }
    };

    return (
        <div className="w-full px-4 sm:px-8 md:px-16 lg:px-32 py-10 text-gray-600">
            <div className="h-16"></div>
            <h1 className="text-3xl sm:text-4xl font-bold text-center mt-4" style={{textShadow:"2px 1px 2px rgba(0,0,0,0.6)"}}>
                {contents.agreement[0].text}
            </h1>
            <div className="bg-red-50 border-2 border-gray-600 rounded-lg my-6 py-2">
                <p>{contents.agreement[1].text}</p>
            </div>
            {/* Скрытая ссылка для скачивания */}
            <a
                ref={downloadRef}
                href={agreement}
                download="agreement.pdf"
                className="hidden"
            >
                Download
            </a>

            <div className="w-full ">
                <h2 className="text-xl sm:text-2xl font-bold text-center mt-4">
                    ДОГОВІР ОРЕНДИ НЕРУХОМОСТІ
                </h2 >
                <p>
                    Місто ____________     «___» ____________ 20__ року
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-left mt-4">
                    1. Загальні умови:
                </h2>
                <p className="text-left mt-4">
                    Орендодавець: ______________________________________________ (ПІБ
                    власника), який є власником об’єкта
                    нерухомості за адресою: ______________________________________________.
                    Орендар: ______________________________________________ (ПІБ орендаря),
                    який зобов’язується використовувати об’єкт
                    за цільовим призначенням та не передавати
                    його у суборенду без письмової згоди
                    Орендодавця.
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-left mt-4">
                    2. Характеристика об’єкта оренди:
                </h2>
                <p className="text-left mt-4">
                    Об’єкт оренди: квартира/будинок ________________________________ , що
                    знаходиться за адресою ______________________________________________.
                    На момент укладення договору у житлі
                    знаходяться такі речі, якими Орендар може
                    користуватися: ________________________________ (наприклад:
                    пральна машина, мікрохвильова піч, пилосос,
                    телевізор, диван, крісла, шафи тощо).
                    Орендар зобов’язується зберігати їх
                    цілісність і працездатність.
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-left mt-4">
                    3. Оплата та строки:
                </h2>
                <p className="text-left mt-4">
                    Орендар сплачує орендну плату щомісяця у
                    період з _____________ по _____________ число кожного місяця.
                    Договір укладається на строк:
                    ________________________________.
                    Заставна сума становить ________________________________ грн і
                    вноситься одночасно з оплатою за перший
                    місяць.
                    Після закінчення договору, у разі
                    задовільного стану об’єкта та збереження
                    наданих речей, Орендодавець зобов’язується
                    повернути Орендарю заставну суму або її
                    частину (у разі необхідності компенсації
                    шкоди, завданої з вини Орендаря).
                    Орендодавець зобов’язується своєчасно
                    здійснювати оплату всіх комунальних
                    платежів постачальникам послуг.
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-left mt-4">
                    4. Форс-мажорні обставини
                </h2>
                <p className="text-left mt-4">
                    Сторони звільняються від відповідальності
                    за невиконання або неналежне виконання
                    зобов’язань за цим Договором у випадку
                    виникнення форс-мажорних обставин
                    (військові дії, стихійні лиха, пожежі,
                    епідемії, рішення органів влади тощо), які
                    безпосередньо вплинули на можливість
                    виконання умов договору.
                    Сторона, для якої настали такі обставини,
                    зобов’язана негайно повідомити іншу
                    сторону.
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-left mt-4">
                    5. Паспортні дані та підписи
                </h2>
                <div className="flex flex-row">
                    <div>
                        <p className="text-left mt-4"> Орендодавець:</p>
                        <p className="text-left mt-4">ПІБ: ___________________________________</p>
                        <p className="text-left mt-4">Паспорт: серія ______ № _____________</p>
                        <p className="text-left mt-4">Телефон: _____________________________</p>
                        <p className="text-left mt-4">Підпис Орендодавця: ________________</p>
                    </div>
                    <div className="ml-32">
                        <p className="text-left mt-4">Орендар:</p>
                        <p className="text-left mt-4">ПІБ: ___________________________________</p>
                        <p className="text-left mt-4">Паспорт: серія ______ № _____________</p>
                        <p className="text-left mt-4">Телефон: _____________________________</p>
                        <p className="text-left mt-4">Підпис Орендаря: ___________________</p>
                    </div>
                </div>
            </div>
            <button onClick={handleDownload}
                className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center space-x-2"
            >
                <span>Завантажити договір</span>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
                    {/*{fill="#5f6368"}*/}
                    <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
                </svg>

            </button>
        </div>
    )
};
export default Agreement;