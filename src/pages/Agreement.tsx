import { useRef } from "react";
import { motion } from 'motion/react';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { useLanguage } from "../context/LanguageContext";
import agreement from '../assets/files/agreement.pdf';

const Agreement = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts;
    const downloadRef = useRef<HTMLAnchorElement>(null);

    const handleDownload = () => downloadRef.current?.click();

    const sectionHeadingCls = "text-base font-bold text-[#0F172A] mt-8 mb-3 pb-2 border-b border-gray-100";
    const blankCls = "inline-block border-b border-gray-400 min-w-[160px] mx-1";
    const blankSmCls = "inline-block border-b border-gray-400 min-w-[80px] mx-1";

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="h-16" />

            {/* ── Hero ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center px-4 pt-8 pb-6"
            >
                <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#2563EB">
                        <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/>
                    </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white mb-2">
                    {contents.agreement[0].text}
                </h1>
            </motion.div>

            {/* ── Instructions banner ───────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="max-w-3xl mx-auto px-4 mb-8"
            >
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                    <span className="shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#d97706">
                            <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                        </svg>
                    </span>
                    <p className="text-sm text-amber-800 leading-relaxed">
                        {contents.agreement[1].text}
                    </p>
                </div>
            </motion.div>

            {/* ── Contract document ─────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="max-w-3xl mx-auto px-4 pb-28"
            >
                <div className="bg-white rounded-2xl shadow-md px-8 py-10 text-[#0F172A] text-sm leading-relaxed">

                    <h2 className="text-xl font-bold text-center text-[#0F172A] tracking-wide mb-1">
                        ДОГОВІР ОРЕНДИ НЕРУХОМОСТІ
                    </h2>
                    <p className="text-center text-[#64748B] text-xs mb-6">
                        Місто <span className={blankSmCls} /> &nbsp;«<span className={blankSmCls} />» <span className={blankCls} /> 20__ року
                    </p>

                    {/* Section 1 */}
                    <h3 className={sectionHeadingCls}>1. Загальні умови</h3>
                    <p className="text-[#334155] leading-7">
                        <span className="font-semibold">Орендодавець:</span>{' '}
                        <span className={blankCls} /> (ПІБ власника), який є власником об'єкта нерухомості за адресою:{' '}
                        <span className={blankCls} />.
                    </p>
                    <p className="text-[#334155] leading-7 mt-3">
                        <span className="font-semibold">Орендар:</span>{' '}
                        <span className={blankCls} /> (ПІБ орендаря), який зобов'язується використовувати об'єкт за цільовим призначенням та не передавати його у суборенду без письмової згоди Орендодавця.
                    </p>

                    {/* Section 2 */}
                    <h3 className={sectionHeadingCls}>2. Характеристика об'єкта оренди</h3>
                    <p className="text-[#334155] leading-7">
                        Об'єкт оренди: квартира/будинок <span className={blankCls} />, що знаходиться за адресою <span className={blankCls} />.
                    </p>
                    <p className="text-[#334155] leading-7 mt-3">
                        На момент укладення договору у житлі знаходяться такі речі, якими Орендар може користуватися:{' '}
                        <span className={blankCls} /> (наприклад: пральна машина, мікрохвильова піч, пилосос, телевізор, диван, крісла, шафи тощо). Орендар зобов'язується зберігати їх цілісність і працездатність.
                    </p>

                    {/* Section 3 */}
                    <h3 className={sectionHeadingCls}>3. Оплата та строки</h3>
                    <p className="text-[#334155] leading-7">
                        Орендар сплачує орендну плату щомісяця у період з <span className={blankSmCls} /> по <span className={blankSmCls} /> число кожного місяця. Договір укладається на строк: <span className={blankCls} />.
                    </p>
                    <p className="text-[#334155] leading-7 mt-3">
                        Заставна сума становить <span className={blankCls} /> грн і вноситься одночасно з оплатою за перший місяць. Після закінчення договору, у разі задовільного стану об'єкта та збереження наданих речей, Орендодавець зобов'язується повернути Орендарю заставну суму або її частину (у разі необхідності компенсації шкоди, завданої з вини Орендаря).
                    </p>
                    <p className="text-[#334155] leading-7 mt-3">
                        Орендодавець зобов'язується своєчасно здійснювати оплату всіх комунальних платежів постачальникам послуг.
                    </p>

                    {/* Section 4 */}
                    <h3 className={sectionHeadingCls}>4. Форс-мажорні обставини</h3>
                    <p className="text-[#334155] leading-7">
                        Сторони звільняються від відповідальності за невиконання або неналежне виконання зобов'язань за цим Договором у випадку виникнення форс-мажорних обставин (військові дії, стихійні лиха, пожежі, епідемії, рішення органів влади тощо), які безпосередньо вплинули на можливість виконання умов договору. Сторона, для якої настали такі обставини, зобов'язана негайно повідомити іншу сторону.
                    </p>

                    {/* Section 5 */}
                    <h3 className={sectionHeadingCls}>5. Паспортні дані та підписи</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-4">
                        <div className="flex flex-col gap-3 text-[#334155]">
                            <p className="font-semibold text-[#0F172A]">Орендодавець:</p>
                            <p>ПІБ: <span className={blankCls} /></p>
                            <p>Паспорт: серія <span className={blankSmCls} /> № <span className={blankSmCls} /></p>
                            <p>Телефон: <span className={blankCls} /></p>
                            <p className="mt-4">Підпис Орендодавця: <span className={blankCls} /></p>
                        </div>
                        <div className="flex flex-col gap-3 text-[#334155]">
                            <p className="font-semibold text-[#0F172A]">Орендар:</p>
                            <p>ПІБ: <span className={blankCls} /></p>
                            <p>Паспорт: серія <span className={blankSmCls} /> № <span className={blankSmCls} /></p>
                            <p>Телефон: <span className={blankCls} /></p>
                            <p className="mt-4">Підпис Орендаря: <span className={blankCls} /></p>
                        </div>
                    </div>

                </div>
            </motion.div>

            {/* ── Hidden download anchor ────────────────────────────── */}
            <a ref={downloadRef} href={agreement} download="agreement.pdf" className="hidden">
                Download
            </a>

            {/* ── Floating download button ──────────────────────────── */}
            <motion.button
                onClick={handleDownload}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="fixed bottom-8 right-8 text-white text-sm font-bold py-3 px-5 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer !border-0 !shadow-none z-50"
                style={{ background: '#2563EB', boxShadow: '0 8px 24px rgba(37,99,235,0.35)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563EB'; }}
            >
                <span>{contents.agreement[2].text}</span>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
                    <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
                </svg>
            </motion.button>
        </div>
    );
};

export default Agreement;
