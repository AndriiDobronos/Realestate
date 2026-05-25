import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { useLanguage } from "../context/LanguageContext";

const TODAY = new Date().toISOString().slice(0, 10);

const RealEstateEstimator = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts;
    const t = contents.subscriptionBanner;
    const [propertyDescription, setPropertyDescription] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorDetails, setErrorDetails] = useState('');
    const [conversationHistory, setConversationHistory] = useState<{ question: string; answer: string }[]>([]);
    const [hasUsedToday, setHasUsedToday] = useState(
        () => localStorage.getItem('estimatorLastUsed') === TODAY
    );

    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY_OLD });

    const estimatePropertyValue = async () => {
        if (!propertyDescription.trim()) {
            setError(contents.estimator[0].text);
            return;
        }
        setLoading(true);
        setError('');
        setErrorDetails('');
        try {
            const prompt = `
            You're a real estate appraisal expert. Analyze the property description and calculate the approximate value.
            Description of the object: ${propertyDescription}
            Consider: location and area, area/rooms/floor, property condition, nearby amenities, market trends.
            Format: Approximate cost: [price range in hryvnia] / Justification: [brief explanation]
            Be as realistic as possible.
            ${language === "en" ? "Give answer in English" : "Give answer in Ukrainian"}
            `;
            const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
            if (!response?.text) throw new Error("Empty response from Google AI service");
            setEstimatedPrice(response.text);
            setConversationHistory(prev => [...prev, { question: propertyDescription, answer: response.text! }]);
            localStorage.setItem('estimatorLastUsed', TODAY);
            setHasUsedToday(true);
        } catch (err) {
            let reason = "Unknown error";
            if (typeof err === 'object' && err !== null) {
                const e = err as { response?: { status?: number; statusText?: string; data?: { error?: { message?: string } } }; status?: number; statusText?: string; message?: string };
                if (e.response) {
                    reason = `HTTP ${e.response.status}: ${e.response.statusText}`;
                    if (e.response.data?.error) reason += ` | ${e.response.data.error.message || JSON.stringify(e.response.data.error)}`;
                } else if (e.status) {
                    reason = `Status: ${e.status} - ${e.statusText ?? "Unknown"}`;
                } else if (e.message) {
                    reason = e.message;
                }
            }
            setError(contents.estimator[1].text);
            setErrorDetails(reason);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = () => {
        setConversationHistory([]);
        setEstimatedPrice('');
        setPropertyDescription('');
        setError('');
        setErrorDetails('');
    };

    const textareaCls = "w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-blue-400 transition-colors resize-none leading-relaxed";

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="h-16" />
            {hasUsedToday && (
                <div className="max-w-2xl mx-auto px-4 pt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-start gap-3 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#2563eb" className="shrink-0 mt-0.5">
                            <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                        </svg>
                        <div>
                            <p className="text-sm font-bold text-blue-900">{t.dailyLimitTitle}</p>
                            <p className="text-sm text-blue-700 mt-0.5">{t.dailyLimitMsg}</p>
                        </div>
                    </div>
                </div>
            )}
            <div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-5">

                {/* ── Header ─────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-md p-6 flex gap-4 items-start">
                    <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7c3aed">
                            <path d="M480-80q-17 0-28.5-11.5T440-120v-1q0-127-88-216t-216-89h-1q-17 0-28.5-11.5T95-465v-1q0-17 11.5-28.5T135-506h1q127 0 216-89t89-216v-1q0-17 11.5-28.5T470-852h1q17 0 28.5 11.5T511-812v1q0 127 88 216t217 89h1q17 0 28.5 11.5T857-467v1q0 17-11.5 28.5T817-426h-1q-127 0-216 88.5T511-121v1q0 17-11.5 28.5T471-80h-1Z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{contents.estimator[2].text}</h1>
                        <p className="text-sm text-gray-500 mt-1">{contents.estimator[3].text}</p>
                    </div>
                </div>

                {/* ── Input ──────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {contents.estimator[4].text.length > 60
                            ? contents.estimator[4].text.slice(0, 60) + '…'
                            : contents.estimator[4].text}
                    </p>
                    <textarea
                        className={textareaCls}
                        value={propertyDescription}
                        onChange={e => setPropertyDescription(e.target.value)}
                        placeholder={contents.estimator[4].text}
                        rows={5}
                        disabled={loading || hasUsedToday}
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={estimatePropertyValue}
                            disabled={loading || hasUsedToday || !propertyDescription.trim()}
                            className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="white">
                                        <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q17 0 28.5 11.5T520-840q0 17-11.5 28.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-17 11.5-28.5T840-520q17 0 28.5 11.5T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Z"/>
                                    </svg>
                                    {contents.estimator[5].text}
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="white">
                                        <path d="M441-120v-86q-53-12-91.5-46T291-348l74-30q15 48 52.5 73t82.5 25q41 0 69.5-18.5T598-356q0-35-22-55.5T463-463q-77-26-114.5-60T311-614q0-70 44-112t86-53v-81h80v81q45 8 82.5 36.5T657-669l-74 32q-12-32-34-48t-60-16q-44 0-67 19.5T399-629q0 33 30 52t104 40q69 20 104.5 63.5T673-371q0 79-48.5 122T520-200v80h-79Z"/>
                                    </svg>
                                    {contents.estimator[6].text}
                                </>
                            )}
                        </button>
                        <button
                            onClick={clearHistory}
                            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 text-sm font-semibold transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#4b5563">
                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                            </svg>
                            {contents.estimator[7].text}
                        </button>
                    </div>
                </div>

                {/* ── Error ──────────────────────────────────── */}
                {error && (
                    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-2 border-l-4 border-red-400">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#ef4444">
                                <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                            </svg>
                            <p className="text-sm font-semibold text-red-500">{error}</p>
                        </div>
                        {errorDetails && (
                            <details className="text-xs text-gray-400">
                                <summary className="cursor-pointer select-none">Деталі помилки</summary>
                                <pre className="mt-1 whitespace-pre-wrap break-all">{errorDetails}</pre>
                            </details>
                        )}
                    </div>
                )}

                {/* ── Result ─────────────────────────────────── */}
                {estimatedPrice && !loading && (
                    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">{contents.estimator[8].text}</h2>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700">AI</span>
                        </div>
                        <hr className="border-gray-100" />
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line rounded-xl bg-gray-50 px-4 py-3">
                            {estimatedPrice}
                        </div>
                    </div>
                )}

                {/* ── History ────────────────────────────────── */}
                {conversationHistory.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide">
                                {contents.estimator[9].text}
                            </span>
                            <hr className="flex-1 border-gray-200" />
                        </div>

                        {conversationHistory.map((item, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3">
                                {item.question && (
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            {contents.estimator[10].text}
                                        </p>
                                        <p className="text-sm text-gray-600 rounded-xl bg-gray-50 px-4 py-3">{item.question}</p>
                                    </div>
                                )}
                                {item.answer && (
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                                            {contents.estimator[11].text}
                                        </p>
                                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line rounded-xl bg-purple-50 px-4 py-3">
                                            {item.answer}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            </div>
            </div>
        </div>
    );
};

export default RealEstateEstimator;
