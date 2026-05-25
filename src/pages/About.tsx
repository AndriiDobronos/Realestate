import bedroom from '../assets/bedroom1to1.webp';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { useLanguage } from "../context/LanguageContext";
import Footer from "../components/Footer";

const About = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts;
    const a = contents.about;

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <div className="h-16" />

            {/* ── Hero ───────────────────────────────────────── */}
            <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 lg:px-16 py-10 lg:py-16">
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

                    {/* ── Text ─────────────────────────────────── */}
                    <div className="flex flex-col gap-5 w-full lg:w-1/2 text-left">
                        <span className="self-start text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 uppercase tracking-wide">
                            {a[0].text}
                        </span>

                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white leading-tight">
                            {a[1].text}
                        </h1>

                        <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                            {a[2].text}
                        </p>

                        <div>
                            <button className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-semibold transition-colors duration-200 shadow-sm">
                                {a[3].text}
                            </button>
                        </div>
                    </div>

                    {/* ── Image ────────────────────────────────── */}
                    <div className="w-full lg:w-1/2">
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src={bedroom}
                                alt="bedroom"
                                className="w-full h-auto max-h-[520px] object-cover object-center"
                            />
                        </div>
                    </div>

                </div>
            </div>

            <Footer color="#8e5e2e" />
        </div>
    );
};

export default About;
