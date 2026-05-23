import { useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAppSelector } from '../app/hooks';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import LiqPayButton from '../components/LiqPayButton';
import { useSubscription } from '../hooks/useSubscription';

/* ── Animation helpers ──────────────────────────────────────────── */

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };

const AnimatedSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/* ── SVG icons ──────────────────────────────────────────────────── */

const IconCheck = ({ color = '#16a34a' }: { color?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill={color}>
        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
    </svg>
);

const IconShield = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#6b7280">
        <path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Z" />
    </svg>
);

const IconCalendar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#6b7280">
        <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z" />
    </svg>
);

const IconInfo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#9ca3af" className="shrink-0 mt-0.5">
        <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
    </svg>
);

const IconChevronDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
        <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" />
    </svg>
);

/* ── Feature row ────────────────────────────────────────────────── */

const Feature = ({ text, color }: { text: string; color: string }) => (
    <li className="flex items-start gap-2.5 text-sm text-gray-600">
        <span className="mt-0.5 shrink-0">
            <IconCheck color={color} />
        </span>
        {text}
    </li>
);

/* ── Active plan badge ──────────────────────────────────────────── */

const ActiveBadge = ({ label }: { label: string }) => (
    <div className="mb-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold self-start">
        <svg xmlns="http://www.w3.org/2000/svg" height="13px" viewBox="0 -960 960 960" width="13px" fill="currentColor">
            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
        </svg>
        {label}
    </div>
);

/* ── FAQ item ───────────────────────────────────────────────────── */

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(prev => !prev)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-gray-800 !bg-white !shadow-none !border-0 min-h-[44px]"
                aria-expanded={open}
            >
                {question}
                <span className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                    <IconChevronDown />
                </span>
            </button>
            {open && (
                <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100">
                    {answer}
                </div>
            )}
        </div>
    );
};

/* ── Main page ──────────────────────────────────────────────────── */

const SubscriptionToServices = () => {
    const { language } = useLanguage();
    const t = (language === 'en' ? allEnTexts : allUaTexts).subscriptionToServices;
    const isRegistration = useAppSelector(state => state.registration.isRegistered);
    const { subscribeType } = useSubscription();

    const isFreePlan     = isRegistration && subscribeType === 'Free';
    const isStandardPlan = isRegistration && subscribeType === 'Standard';
    const isPremiumPlan  = isRegistration && subscribeType === 'Premium';

    const freeFeatures     = [t.free1, t.free2, t.free3, t.free4, t.free5, t.free6];
    const standardFeatures = [t.std1, t.std2, t.std3, t.std4, t.std5];
    const premiumFeatures  = [t.prem1, t.prem2, t.prem3, t.prem4, t.prem5, t.prem6, t.prem7];
    const faqItems = [
        { q: t.faq1Q, a: t.faq1A },
        { q: t.faq2Q, a: t.faq2A },
        { q: t.faq3Q, a: t.faq3A },
        { q: t.faq4Q, a: t.faq4A },
    ];

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="h-16" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* ── Header ─────────────────────────────────────── */}
                <AnimatedSection className="text-center mb-12">
                    <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                        {t.pageTitle}
                    </motion.h1>
                    <motion.p variants={fadeUp} className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
                        {t.pageSubtitle}
                    </motion.p>
                </AnimatedSection>

                {/* ── Pricing cards ──────────────────────────────── */}
                <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

                    {/* ── Free card ── */}
                    <motion.div
                        variants={fadeUp}
                        className={`bg-white rounded-2xl shadow-md p-6 flex flex-col transition-shadow duration-300 hover:shadow-lg
                            ${isFreePlan ? 'border-2 border-green-400' : 'border border-gray-100'}`}
                    >
                        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide mb-3 self-start">
                            {t.freeName}
                        </span>

                        {isFreePlan && <ActiveBadge label={t.activePlan} />}

                        <div className="flex items-end gap-1 mb-2">
                            <span className="text-3xl font-black text-gray-800">{t.freePriceLabel}</span>
                        </div>

                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{t.freeDesc}</p>

                        <hr className="border-gray-100 mb-5" />

                        <ul className={`flex flex-col gap-3 flex-1 ${(isStandardPlan || isPremiumPlan) ? 'mb-8' : ''}`}>
                            {freeFeatures.map((f, i) => (
                                <Feature key={i} text={f} color="#6b7280" />
                            ))}
                        </ul>

                        {(isStandardPlan || isPremiumPlan) && (
                            <LiqPayButton
                                plan="free"
                                label={t.downgradeCta}
                                className="w-full py-3 rounded-xl !bg-gray-100 hover:!bg-gray-200 active:!bg-gray-300 text-gray-700 text-sm font-semibold transition-colors duration-200 !shadow-none !border-0 min-h-[44px]"
                            />
                        )}
                    </motion.div>

                    {/* ── Standard card ── */}
                    <motion.div
                        variants={fadeUp}
                        className={`bg-white rounded-2xl shadow-md p-6 flex flex-col transition-shadow duration-300 hover:shadow-lg
                            ${isStandardPlan ? 'border-2 border-green-400' : 'border border-gray-100'}`}
                    >
                        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wide mb-3 self-start">
                            {t.standardName}
                        </span>

                        {isStandardPlan && <ActiveBadge label={t.activePlan} />}

                        <div className="flex items-end gap-1 mb-2">
                            <span className="text-4xl font-black text-gray-800">{t.standardPrice}</span>
                            <span className="text-gray-400 text-sm pb-1">грн {t.quarterly}</span>
                        </div>

                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{t.standardDesc}</p>

                        <hr className="border-gray-100 mb-5" />

                        <ul className="flex flex-col gap-3 mb-8 flex-1">
                            {standardFeatures.map((f, i) => (
                                <Feature key={i} text={f} color="#2563eb" />
                            ))}
                        </ul>

                        <LiqPayButton
                            plan="standard"
                            label={t.ctaBtn}
                            className="w-full py-3 rounded-xl !bg-blue-600 hover:!bg-blue-700 active:!bg-blue-800 text-white text-sm font-bold transition-colors duration-200 !shadow-none !border-0 min-h-[44px]"
                        />
                    </motion.div>

                    {/* ── Premium card ── */}
                    <motion.div
                        variants={fadeUp}
                        className={`relative bg-white rounded-2xl shadow-xl p-6 flex flex-col transition-shadow duration-300 hover:shadow-2xl
                            ${isPremiumPlan ? 'border-2 border-green-400' : 'border-2 border-amber-400'}`}
                    >
                        {/* Top badge: active plan OR popular */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                            {isPremiumPlan ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-4 py-1 rounded-full bg-green-500 text-white uppercase tracking-wide shadow-sm whitespace-nowrap">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="12px" viewBox="0 -960 960 960" width="12px" fill="white">
                                        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                                    </svg>
                                    {t.activePlan}
                                </span>
                            ) : (
                                <span className="inline-block text-xs font-bold px-4 py-1 rounded-full bg-amber-400 text-white uppercase tracking-wide shadow-sm whitespace-nowrap">
                                    {t.popular}
                                </span>
                            )}
                        </div>

                        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 uppercase tracking-wide mb-3 self-start mt-3">
                            {t.premiumName}
                        </span>

                        <div className="flex items-end gap-1 mb-2">
                            <span className="text-4xl font-black text-gray-800">{t.premiumPrice}</span>
                            <span className="text-gray-400 text-sm pb-1">грн {t.quarterly}</span>
                        </div>

                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{t.premiumDesc}</p>

                        <hr className="border-amber-100 mb-5" />

                        <ul className="flex flex-col gap-3 mb-8 flex-1">
                            {premiumFeatures.map((f, i) => (
                                <Feature key={i} text={f} color="#d97706" />
                            ))}
                        </ul>

                        <LiqPayButton
                            plan="premium"
                            label={t.ctaBtn}
                            className="w-full py-3 rounded-xl !bg-amber-500 hover:!bg-amber-600 active:!bg-amber-700 text-white text-sm font-bold transition-colors duration-200 !shadow-none !border-0 min-h-[44px]"
                        />
                    </motion.div>

                </AnimatedSection>

                {/* ── No-refund notice ───────────────────────────── */}
                <AnimatedSection>
                    <motion.div
                        variants={fadeUp}
                        className="flex items-start gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 mb-8"
                    >
                        <IconInfo />
                        <p className="text-xs text-gray-500 leading-relaxed">{t.noRefundNotice}</p>
                    </motion.div>
                </AnimatedSection>

                {/* ── Trust badges ───────────────────────────────── */}
                <AnimatedSection>
                    <motion.div
                        variants={fadeUp}
                        className="flex flex-wrap justify-center gap-6 py-6 mb-10 border-y border-gray-200"
                    >
                        {[
                            { icon: <IconShield />, text: t.securePayment },
                            { icon: <IconCalendar />, text: t.cancelAnytime },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                                {item.icon}
                                {item.text}
                            </div>
                        ))}
                    </motion.div>
                </AnimatedSection>

                {/* ── FAQ ────────────────────────────────────────── */}
                <AnimatedSection>
                    <motion.h2 variants={fadeUp} className="text-xl font-bold text-gray-800 mb-5 text-center">
                        {t.faqTitle}
                    </motion.h2>
                    <motion.div variants={fadeUp} className="flex flex-col gap-3 max-w-2xl mx-auto pb-10">
                        {faqItems.map((item, i) => (
                            <FaqItem key={i} question={item.q} answer={item.a} />
                        ))}
                    </motion.div>
                </AnimatedSection>

            </div>
        </div>
    );
};

export default SubscriptionToServices;
