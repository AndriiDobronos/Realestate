import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { useSubscription } from '../hooks/useSubscription';
import SubscriptionBanner from '../components/SubscriptionBanner';

/* ── Animation variants ─────────────────────────────────────────── */

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.12 } },
};

/* ── Animated section wrapper ───────────────────────────────────── */

const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.div
            ref={ref}
            variants={stagger}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/* ── Inline placeholder photos (gradient tiles) ─────────────────── */

const galleryItems = [
    { type: 'img', bg: 'from-slate-800 to-slate-600', label: 'Living room', aspect: 'row-span-2' },
    { type: 'img', bg: 'from-amber-700 to-amber-500', label: 'Kitchen', aspect: '' },
    { type: 'video', bg: 'from-teal-800 to-teal-500', label: '3D Tour', aspect: '' },
    { type: 'img', bg: 'from-indigo-800 to-indigo-600', label: 'Bedroom', aspect: '' },
    { type: 'img', bg: 'from-rose-800 to-rose-600', label: 'Exterior', aspect: '' },
];

/* ── SVG Icons ──────────────────────────────────────────────────── */

const IconCamera = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor">
        <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM120-120q-33 0-56.5-23.5T40-200v-480q0-33 23.5-56.5T120-760h126l74-80h320l74 80h126q33 0 56.5 23.5T920-680v480q0 33-23.5 56.5T840-120H120Z"/>
    </svg>
);

const IconVideo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor">
        <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h480q33 0 56.5 23.5T720-720v180l160-160v440L720-420v180q0 33-23.5 56.5T640-160H160Z"/>
    </svg>
);

const IconText = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor">
        <path d="M120-240v-80h480v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
    </svg>
);

const IconPlay = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
        <path d="M320-200v-560l440 280-440 280Z"/>
    </svg>
);

const IconCheck = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
    </svg>
);

const IconArrowDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
        <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"/>
    </svg>
);

/* ── Main component ─────────────────────────────────────────────── */

const PromotionYourListing = () => {
    const { language } = useLanguage();
    const t = (language === 'en' ? allEnTexts : allUaTexts).promotionYourListing;
    const { canUseStandard } = useSubscription();

    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [fieldError, setFieldError] = useState('');

    const formRef = useRef<HTMLDivElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setFieldError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
            setFieldError(t.requiredMsg);
            return;
        }
        setStatus('submitting');
        // Simulated submit — wire to real endpoint when ready
        await new Promise(r => setTimeout(r, 1400));
        setStatus('success');
        setForm({ name: '', email: '', phone: '' });
    };

    const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth' });

    const services = [
        { icon: <IconCamera />, title: t.service1Title, desc: t.service1Desc, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30' },
        { icon: <IconVideo />,  title: t.service2Title, desc: t.service2Desc, color: 'from-teal-500 to-cyan-600',   shadow: 'shadow-teal-500/30'  },
        { icon: <IconText />,   title: t.service3Title, desc: t.service3Desc, color: 'from-violet-500 to-purple-700', shadow: 'shadow-violet-500/30' },
    ];

    const stats = [
        { value: t.stat1Value, label: t.stat1Label },
        { value: t.stat2Value, label: t.stat2Label },
        { value: t.stat3Value, label: t.stat3Label },
    ];

    return (
        <div className="min-h-screen bg-[#050810] text-white overflow-x-hidden">
            {!canUseStandard && (
                <div className="max-w-5xl mx-auto px-6 pt-24">
                    <SubscriptionBanner requiredPlan="standard" />
                </div>
            )}
            <div className={!canUseStandard ? 'pointer-events-none opacity-50 select-none' : ''}>

            {/* ══════════════════════════════════════════════════════
                HERO
            ══════════════════════════════════════════════════════ */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">

                {/* Background glow orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px]"
                        style={{ background: 'radial-gradient(circle, #0f766e, transparent 70%)' }}
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
                        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                        className="absolute bottom-[10%] right-[15%] w-[420px] h-[420px] rounded-full blur-[100px]"
                        style={{ background: 'radial-gradient(circle, #6d28d9, transparent 70%)' }}
                    />
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                        className="absolute top-[50%] right-[30%] w-[300px] h-[300px] rounded-full blur-[80px]"
                        style={{ background: 'radial-gradient(circle, #d97706, transparent 70%)' }}
                    />
                </div>

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Content */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="relative z-10 max-w-4xl mx-auto"
                >
                    <motion.div variants={fadeUp} className="mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-teal-500/40 text-teal-400 bg-teal-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                            {t.heroEyebrow}
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={fadeUp}
                        className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8"
                        style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                        <span className="block text-white">{t.heroHeadline.split(' ').slice(0, 2).join(' ')}</span>
                        <span
                            className="block"
                            style={{ background: 'linear-gradient(135deg, #14b8a6, #6d28d9, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                        >
                            {t.heroHeadline.split(' ').slice(2).join(' ')}
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed mb-10">
                        {t.heroSubtitle}
                    </motion.p>

                    {/* Stats row */}
                    <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-8 mb-12">
                        {stats.map((s, i) => (
                            <div key={i} className="text-center">
                                <p className="text-3xl font-black text-white">{s.value}</p>
                                <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{s.label}</p>
                            </div>
                        ))}
                    </motion.div>

                    <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={scrollToForm}
                            className="px-8 py-4 rounded-2xl text-white text-sm font-bold tracking-wide cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)', boxShadow: '0 0 40px rgba(15,118,110,0.4)' }}
                        >
                            {t.heroCta}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 rounded-2xl text-white/70 text-sm font-semibold border border-white/10 hover:border-white/30 hover:text-white transition-colors duration-200 cursor-pointer flex items-center gap-2 !bg-transparent !shadow-none"
                        >
                            {t.heroScroll}
                            <IconArrowDown />
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20"
                >
                    <IconArrowDown />
                </motion.div>
            </section>

            {/* ══════════════════════════════════════════════════════
                SERVICES
            ══════════════════════════════════════════════════════ */}
            <section className="py-28 px-6">
                <Section className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} className="text-center mb-16">
                        <p className="text-xs font-semibold text-teal-400 uppercase tracking-[0.3em] mb-4">What we offer</p>
                        <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                            Three steps to a<br />
                            <span style={{ background: 'linear-gradient(135deg, #14b8a6, #6d28d9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>perfect listing</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {services.map((svc, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className="relative rounded-3xl p-8 border border-white/[0.06] overflow-hidden cursor-default"
                                style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
                            >
                                {/* Card glow */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${svc.color} blur-3xl -z-10`} />

                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${svc.color} shadow-lg ${svc.shadow}`}>
                                    {svc.icon}
                                </div>

                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-white/30 font-mono">0{i + 1}</span>
                                    <div className="flex-1 h-px bg-white/10" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-3 mt-4">{svc.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{svc.desc}</p>

                                <div className="mt-6 flex items-center gap-2 text-teal-400 text-xs font-semibold">
                                    <IconCheck />
                                    <span>Included in package</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Section>
            </section>

            {/* ══════════════════════════════════════════════════════
                GALLERY / COLLAGE
            ══════════════════════════════════════════════════════ */}
            <section id="gallery" className="py-20 px-6">
                <Section className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} className="text-center mb-14">
                        <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.3em] mb-4">Portfolio</p>
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">{t.galleryTitle}</h2>
                        <p className="text-white/40 text-base">{t.gallerySubtitle}</p>
                    </motion.div>

                    {/* Asymmetric grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[180px]">
                        {galleryItems.map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                whileHover={{ scale: 1.02, zIndex: 10 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${item.bg} cursor-pointer ${item.aspect}`}
                            >
                                {/* Placeholder texture */}
                                <div className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)',
                                        backgroundSize: '20px 20px',
                                    }}
                                />

                                {item.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div
                                            whileHover={{ scale: 1.15 }}
                                            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
                                        >
                                            <IconPlay />
                                        </motion.div>
                                    </div>
                                )}

                                <div className="absolute bottom-3 left-3">
                                    <span className="text-xs font-semibold text-white/80 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                                        {item.label}
                                    </span>
                                </div>

                                {/* Premium badge on first item */}
                                {i === 0 && (
                                    <div className="absolute top-3 right-3">
                                        <span className="text-[10px] font-bold text-teal-300 bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Premium
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {/* "Before" comparison tile */}
                        <motion.div
                            variants={fadeUp}
                            className="relative rounded-2xl overflow-hidden col-span-2 md:col-span-1"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-500" />
                            <div className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%)',
                                    backgroundSize: '20px 20px',
                                }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                                <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Before</p>
                                <p className="text-white/20 text-3xl font-black">vs</p>
                                <p className="text-xs text-teal-400 uppercase tracking-widest mt-2">After</p>
                            </div>
                        </motion.div>
                    </div>
                </Section>
            </section>

            {/* ══════════════════════════════════════════════════════
                FORM
            ══════════════════════════════════════════════════════ */}
            <section className="py-28 px-6" ref={formRef}>
                <Section className="max-w-xl mx-auto">
                    <motion.div variants={fadeUp} className="text-center mb-10">
                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-[0.3em] mb-4">Get started</p>
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">{t.formTitle}</h2>
                        <p className="text-white/40 text-base">{t.formSubtitle}</p>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        className="rounded-3xl p-8 border border-white/[0.08]"
                        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}
                    >
                        <AnimatePresence mode="wait">
                            {status === 'success' ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                        className="w-16 h-16 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center mx-auto mb-5 text-teal-400"
                                    >
                                        <IconCheck />
                                    </motion.div>
                                    <p className="text-white font-bold text-xl mb-2">{t.successMsg}</p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="mt-4 text-sm text-teal-400 hover:text-teal-300 transition-colors cursor-pointer !bg-transparent !shadow-none !border-0 !p-0"
                                    >
                                        ← Back
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onSubmit={handleSubmit}
                                    className="flex flex-col gap-5"
                                >
                                    {[
                                        { name: 'name',  label: t.labelName,  placeholder: t.placeholderName,  type: 'text' },
                                        { name: 'email', label: t.labelEmail, placeholder: t.placeholderEmail, type: 'email' },
                                        { name: 'phone', label: t.labelPhone, placeholder: t.placeholderPhone, type: 'tel' },
                                    ].map(field => (
                                        <div key={field.name} className="flex flex-col gap-1.5">
                                            <label htmlFor={field.name} className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                                                {field.label}
                                            </label>
                                            <input
                                                id={field.name}
                                                name={field.name}
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                value={form[field.name as keyof typeof form]}
                                                onChange={handleChange}
                                                disabled={status === 'submitting'}
                                                className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 border border-white/10 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all duration-200 disabled:opacity-40"
                                                style={{ background: 'rgba(255,255,255,0.05)' }}
                                            />
                                        </div>
                                    ))}

                                    {fieldError && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-xs font-semibold"
                                        >
                                            {fieldError}
                                        </motion.p>
                                    )}

                                    <motion.button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="mt-2 w-full py-4 rounded-xl text-white font-bold text-sm tracking-wide transition-opacity duration-200 disabled:opacity-50 cursor-pointer"
                                        style={{
                                            background: 'linear-gradient(135deg, #0f766e, #0369a1)',
                                            boxShadow: '0 0 30px rgba(15,118,110,0.35)',
                                        }}
                                    >
                                        {status === 'submitting' ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <motion.span
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                                                />
                                                {t.submitting}
                                            </span>
                                        ) : t.submitBtn}
                                    </motion.button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </Section>
            </section>

            {/* ══════════════════════════════════════════════════════
                BOTTOM GLOW FOOTER LINE
            ══════════════════════════════════════════════════════ */}
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #14b8a6, #6d28d9, transparent)' }} />
            <div className="h-20" />

        </div>{/* end canUseStandard guard */}
        </div>
    );
};

export default PromotionYourListing;
