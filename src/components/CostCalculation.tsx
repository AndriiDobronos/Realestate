import { GoogleGenAI } from "@google/genai";
import {useEffect, useState} from 'react';

const CostCalculation = () => {
    const ai = new GoogleGenAI({apiKey:"AIzaSyBTzke5g4ok1AqMllGQpfNWhDJVszmKOJA"});
    const [answer, setAnswer] = useState<string>('');

    useEffect(() => {
        async function main() {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: "Explain how AI works in a few words",
            });
            if (response.text) {
                setAnswer(response?.text);
                console.log(response.text);
            }else {
                setAnswer('No response was found.');
            }

        }
        main();
    },[]);

    return (
        <div className="w-full pt-24 text-black" >
            <p>*{answer}*</p>
        </div>
    )
}
export default CostCalculation;

