import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';

type CardProps = {
    title: string;
    description: string;
    icon: React.ReactNode;
    iconBg: string;
};

const ServiceCard = ({ title, description, icon, iconBg }: CardProps) => (
    <div className="group bg-white rounded-2xl shadow-md p-5 flex gap-4 hover:shadow-xl transition-shadow duration-300 h-full">
        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
            {icon}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
            <h4 className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 leading-snug">
                {title}
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
    </div>
);

/* ── SVG Icons ────────────────────────────────────────────────────── */

const IconPostAd = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#16a34a">
        <path d="M240-160q-33 0-56.5-23.5T160-240v-480q0-33 23.5-56.5T240-800h320l240 240v120h-80v-80H520v-200H240v480h280v80H240Zm480 40q-83 0-141.5-58.5T520-320q0-83 58.5-141.5T720-520q83 0 141.5 58.5T920-320q0 83-58.5 141.5T720-120Zm-20-80h40v-100h100v-40H740v-100h-40v100H600v40h100v100Z"/>
    </svg>
);

const IconFindHome = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#2563eb">
        <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
    </svg>
);

const IconAgreement = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#d97706">
        <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/>
    </svg>
);

const IconAI = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7c3aed">
        <path d="M480-80q-17 0-28.5-11.5T440-120v-1q0-127-88-216t-216-89h-1q-17 0-28.5-11.5T95-465v-1q0-17 11.5-28.5T135-506h1q127 0 216-89t89-216v-1q0-17 11.5-28.5T470-852h1q17 0 28.5 11.5T511-812v1q0 127 88 216t217 89h1q17 0 28.5 11.5T857-467v1q0 17-11.5 28.5T817-426h-1q-127 0-216 88.5T511-121v1q0 17-11.5 28.5T471-80h-1Z"/>
    </svg>
);

const IconVideo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#dc2626">
        <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h480q33 0 56.5 23.5T720-720v180l160-160v440L720-420v180q0 33-23.5 56.5T640-160H160Zm0-80h480v-480H160v480Zm0 0v-480 480Z"/>
    </svg>
);

const IconBell = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ea580c">
        <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
    </svg>
);

const IconBadge = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4f46e5">
        <path d="M480-440q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0-80q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0 440q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-400Zm0 308q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-308Z"/>
    </svg>
);

const IconTrending = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#0d9488">
        <path d="m136-240-56-56 296-298 160 160 208-206H640v-80h240v240h-80v-104L576-320 416-480 136-240Z"/>
    </svg>
);

/* ── Page ─────────────────────────────────────────────────────────── */

const Services = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts;
    const s = contents.services;

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="h-16" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* ── Header ─────────────────────────────────── */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                        {s[0].text}
                    </h1>
                    <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
                        {s[1].text}
                    </p>
                </div>

                {/* ── Free Services ──────────────────────────── */}
                <section className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 uppercase tracking-wide">
                            {s[2].text}
                        </span>
                        <hr className="flex-1 border-gray-200" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/" className="block">
                            <ServiceCard
                                title={s[3].text}
                                description={s[4].text}
                                icon={<IconPostAd />}
                                iconBg="bg-green-50"
                            />
                        </Link>
                        <Link to="/" className="block">
                            <ServiceCard
                                title={s[5].text}
                                description={s[6].text}
                                icon={<IconFindHome />}
                                iconBg="bg-blue-50"
                            />
                        </Link>
                        <Link to="/agreement" className="block">
                            <ServiceCard
                                title={s[16].text}
                                description={s[17].text}
                                icon={<IconAgreement />}
                                iconBg="bg-amber-50"
                            />
                        </Link>
                        <Link to="/realEstateEstimator" className="block">
                            <ServiceCard
                                title={s[18].text}
                                description={s[19].text}
                                icon={<IconAI />}
                                iconBg="bg-purple-50"
                            />
                        </Link>
                    </div>
                </section>

                {/* ── Premium Services ───────────────────────── */}
                <section className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 uppercase tracking-wide">
                            {s[7].text}
                        </span>
                        <hr className="flex-1 border-gray-200" />
                    </div>
                    <p className="text-xs text-gray-400 mb-5 pl-1">{s[15].text}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/advertising" className="block">
                            <ServiceCard
                                title={s[8].text}
                                description={s[9].text}
                                icon={<IconVideo />}
                                iconBg="bg-red-50"
                            />
                        </Link>
                        <Link to="/notification" className="block">
                            <ServiceCard
                                title={s[10].text}
                                description={s[11].text}
                                icon={<IconBell />}
                                iconBg="bg-orange-50"
                            />
                        </Link>
                        <Link to="/addAgent/new" className="block">
                            <ServiceCard
                                title={s[12].text}
                                description={s[13].text}
                                icon={<IconBadge />}
                                iconBg="bg-indigo-50"
                            />
                        </Link>
                        <Link to="/promotionYourListing" className="block">
                            <ServiceCard
                                title={s[20].text}
                                description={s[21].text}
                                icon={<IconTrending />}
                                iconBg="bg-teal-50"
                            />
                        </Link>
                    </div>
                </section>

                {/* ── CTA ────────────────────────────────────── */}
                <div className="text-center pt-4 pb-8">
                    <Link
                        to="/subscribeToPremiumServices"
                        className="inline-block px-8 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                        {s[14].text}
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Services;
