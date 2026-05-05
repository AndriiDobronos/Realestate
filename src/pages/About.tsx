import React, {useState} from 'react';
import bedroom from '../assets/bedroom1to1.webp';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import {useLanguage} from "../context/LanguageContext";
import Footer from "../components/Footer";

const About:React.FC = ()=> {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts

    return (
        <div className="about">
            <div className="flex flex-col lg:flex-row px-4 sm:px-8 md:px-16 lg:px-16 xl:px-16 gap-8 sm:gap-12 md:gap-16 lg:gap-12 xl:gap-32 mb-12">
                <div className="flex flex-col pt-12 sm:pt-16 md:pt-24 lg:pt-32 text-left w-full lg:w-1/2">
                    <b className="text-green-600 text-sm sm:text-base md:text-lg lg:text-xl mb-2 sm:mb-3 lg:mb-4 mt-8 sm:mt-12 lg:mt-16">
                        {contents.about[0].text.toUpperCase()}
                    </b>
                    <b
                        className="text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4"
                        style={{ color: 'rgb(45, 30, 15)' }}
                    >
                        {contents.about[1].text}
                    </b>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600">
                        {contents.about[2].text}
                    </p>
                    <button className="mt-6 w-fit px-6 py-3 bg-green-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-green-700 transition-colors">
                        {contents.about[3].text}
                    </button>
                </div>
                <div className="pt-12 sm:pt-0 md:pt-0 lg:pt-28 w-full lg:w-1/2 flex justify-center">
                    <img src={bedroom} alt="bedroom" className="w-full max-w-md sm:max-w-lg md:max-w-xl" />
                </div>
            </div>
            <Footer  color={'#8e5e2e'} />
        </div>

    );
}
export default About;