// import { useState } from 'react';
// import { GoogleGenAI } from "@google/genai";
// import './RealEstateEstimator.css';
// import allEnTexts from '../contents/allEnTexts';
// import allUaTexts from '../contents/allUaTexts';
// import {useLanguage} from "../context/LanguageContext";
//
// const RealEstateEstimator = () => {
//     const { language } = useLanguage();
//     const contents = language === "en" ? allEnTexts : allUaTexts
//     const [propertyDescription, setPropertyDescription] = useState('');
//     const [estimatedPrice, setEstimatedPrice] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [conversationHistory, setConversationHistory] = useState([{question:"", answer:""}]);
//
//     const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY_OLD });
//
//     const estimatePropertyValue = async () => {
//         if (!propertyDescription.trim()) {
//             setError(contents.estimator[0].text);  //"Будь ласка, опишіть об'єкт нерухомості"
//             return;
//         }
//
//         setLoading(true);
//         setError('');
//
//         try {
//             const prompt = `
//         You're a real estate appraisal expert. Analyze the property description and calculate the approximate value.
//
//         Description of the object: ${propertyDescription}
//
//         Consider:
//         - Location and area
//         - Area, number of rooms, and floor
//         - Property condition (new building, existing property, needs renovation)
//         - Availability of nearby amenities
//         - Market trends
//
//         Please provide your answer in the following format:
//         Approximate cost: [price range in hryvnia]
//         Justification: [brief explanation of calculation]
//
//         Be as realistic as possible in your estimate.
//         ${language === "en" ? "Give answer en English" : "Give answer in Ukrainian"}
//         `;
//
//             const response = await ai.models.generateContent({
//                 model: "gemini-2.5-flash",
//                 contents: prompt,
//             });
//
//             const text = response.text || "Give me information about current real estate price trends in Ukraine.";
//             setEstimatedPrice(text);
//
//             // Add to dialogue history
//             setConversationHistory(prev => [
//                 ...prev,
//                 { question: propertyDescription, answer: text }
//             ]);
//
//         } catch (err) {
//             setError(contents.estimator[1].text);  //Виникла помилка при оцінці об'єкта. Спробуйте ще раз.
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const clearHistory = () => {
//         setConversationHistory([]);
//         setEstimatedPrice('');
//         setPropertyDescription('');
//     };
//
//     return (
//         <div className="estimator-container">
//             <div className="pt-24"></div>
//             <h1>🤖 {contents.estimator[2].text}</h1>
//             {/*{`Оцінювач нерухомості з AI`}*/}
//             <p>{contents.estimator[3].text}</p>
//             {/*{`Опишіть об'єкт нерухомості для отримання приблизної вартості`}*/}
//             <div className="input-section">
//         <textarea
//             value={propertyDescription}
//             onChange={(e) => setPropertyDescription(e.target.value)}
//             placeholder={contents.estimator[4].text}
//             // Приклад: 3-кімнатна квартира в центрі Полтави
//             rows={5}
//             disabled={loading}
//         />
//
//                 <button
//                     onClick={estimatePropertyValue}
//                     disabled={loading || !propertyDescription.trim()}
//                     className="estimate-btn"
//                 >
//                     {loading ? `⏳ ${contents.estimator[5].text}` : `💰 ${contents.estimator[6].text}`}
//                     {/*{`Розраховую...` : `Розрахувати вартість`}*/}
//                 </button>
//
//                 <button
//                     onClick={clearHistory}
//                     className="clear-btn"
//                 >
//                     🗑️ {contents.estimator[7].text}
//                     {/*{Очистити}*/}
//                 </button>
//             </div>
//
//             {error && (
//                 <div className="error-message">
//                     ⚠️ {error}
//                 </div>
//             )}
//
//             {estimatedPrice && !loading && (
//                 <div className="result-section">
//                     <h2>📊 {contents.estimator[8].text}</h2>
//                     {/*{Результат оцінки:}*/}
//                     <div className="estimated-price">
//                         {estimatedPrice.split('\n').map((line, index) => (
//                             <p key={index}>{line}</p>
//                         ))}
//                     </div>
//                 </div>
//             )}
//
//             {conversationHistory.length > 0 && (
//                 <div className="history-section">
//                     <h3>📝 {contents.estimator[9].text}</h3>
//                     {/*{Історія оцінок:}*/}
//                     {conversationHistory.map((item, index) => (
//                         <div key={index} className="history-item">
//                             <div className="question">
//                                 <strong>{contents.estimator[10].text}</strong> {item.question}
//                                 {/*{Об'єкт:}*/}
//                             </div>
//                             <div className="answer">
//                                 <strong>{contents.estimator[11].text}</strong> {item.answer}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };
//
// export default RealEstateEstimator;


import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import './RealEstateEstimator.css';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { useLanguage } from "../context/LanguageContext";

const RealEstateEstimator = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts;
    const [propertyDescription, setPropertyDescription] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorDetails, setErrorDetails] = useState('');
    const [conversationHistory, setConversationHistory] = useState([{ question: "", answer: "" }]);

    const ai = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY_OLD
    });

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

            Consider:
            - Location and area
            - Area, number of rooms, and floor
            - Property condition (new building, existing property, needs renovation)
            - Availability of nearby amenities
            - Market trends

            Please provide your answer in the following format:
            Approximate cost: [price range in hryvnia]
            Justification: [brief explanation of calculation]

            Be as realistic as possible in your estimate.
            ${language === "en" ? "Give answer in English" : "Give answer in Ukrainian"}
            `;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            if (!response || !response.text) {
                throw new Error("Empty response from Google AI service");
            }

            const text = response.text;
            setEstimatedPrice(text);

            setConversationHistory(prev => [
                ...prev,
                { question: propertyDescription, answer: text }
            ]);

        } catch (err) {
            console.error("❌ Error during property estimation:", err);

            // Выясним, есть ли структура ошибки от API
            let reason = "Unknown error";

            if (err.response) {
                // Если ошибка пришла как HTTP ответ
                const { status, statusText, data } = err.response;
                reason = `HTTP ${status}: ${statusText}`;
                if (data && data.error) {
                    reason += ` | ${data.error.message || JSON.stringify(data.error)}`;
                }
            } else if (err.status) {
                reason = `Status: ${err.status} - ${err.statusText || "Unknown"}`;
            } else if (err.message) {
                reason = err.message;
            }

            setError(contents.estimator[1].text); // "Виникла помилка при оцінці об'єкта. Спробуйте ще раз."
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

    return (
        <div className="estimator-container">
            <div className="pt-24"></div>
            <h1>🤖 {contents.estimator[2].text}</h1>
            <p>{contents.estimator[3].text}</p>

            <div className="input-section">
                <textarea
                    value={propertyDescription}
                    onChange={(e) => setPropertyDescription(e.target.value)}
                    placeholder={contents.estimator[4].text}
                    rows={5}
                    disabled={loading}
                />

                <button
                    onClick={estimatePropertyValue}
                    disabled={loading || !propertyDescription.trim()}
                    className="estimate-btn"
                >
                    {loading ? `⏳ ${contents.estimator[5].text}` : `💰 ${contents.estimator[6].text}`}
                </button>

                <button onClick={clearHistory} className="clear-btn">
                    🗑️ {contents.estimator[7].text}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                    {errorDetails && (
                        <details style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#555" }}>
                            <summary>Деталі помилки</summary>
                            <pre>{errorDetails}</pre>
                        </details>
                    )}
                </div>
            )}

            {estimatedPrice && !loading && (
                <div className="result-section">
                    <h2>📊 {contents.estimator[8].text}</h2>
                    <div className="estimated-price">
                        {estimatedPrice.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                </div>
            )}

            {conversationHistory.length > 0 && (
                <div className="history-section">
                    <h3>📝 {contents.estimator[9].text}</h3>
                    {conversationHistory.map((item, index) => (
                        <div key={index} className="history-item">
                            <div className="question">
                                <strong>{contents.estimator[10].text}</strong> {item.question}
                            </div>
                            <div className="answer">
                                <strong>{contents.estimator[11].text}</strong> {item.answer}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RealEstateEstimator;
