import React from "react";
import { Link} from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';

const Services = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts

    return (
        <div id={"services"} className="w-full px-4 sm:px-8 md:px-16 lg:px-32 py-10 text-gray-600">
            <div className="h-16"></div>
            {/* Заголовок */}
            <h1 className="text-3xl sm:text-4xl font-bold text-center mt-4" style={{textShadow:"2px 1px 2px rgba(0,0,0,0.6)"}}>
                {contents.services[0].text}
            </h1>

            {/* Подзаголовок */}
            <h2 className="text-lg font-bold sm:text-2xl text-center text-gray-600 mt-4 mb-10" style={{textShadow:"2px 1px 2px rgba(0,0,0,0.6)"}}>
                {contents.services[1].text}
            </h2>

            {/* Бесплатные услуги */}
            <div className="mb-16">
                <h3 className="text-2xl font-semibold mb-6 text-green-700">
                    {/*Free Services*/}{contents.services[2].text}
                </h3>
                <div className="grid gap-8 md:grid-cols-2">
                    <Link to="/" >
                        <ServiceCard
                            title={contents.services[3].text}  //"Place Your Ads for Free"
                            description={contents.services[4].text}  //"Post personal listings to sell or rent apartments, houses, or commercial properties at no cost."
                            icon="📝"
                        />
                    </Link>
                    <Link to="/">
                        <ServiceCard
                            title={contents.services[5].text}  //"Find Properties for Free"
                            description={contents.services[6].text}  //"Search and explore listings for purchase or rent without any fees."
                            icon="🏠"
                        />
                    </Link>
                    <Link to="/agreement">
                        <ServiceCard
                            title={contents.services[16].text}  //"Find Properties for Free"
                            description={contents.services[17].text}  //"Search and explore listings for purchase or rent without any fees."
                            icon="✍"
                            // icon="📝 📢 💼 💬 🤖"
                        />
                    </Link>
                    <Link to="/realEstateEstimator">
                        <ServiceCard
                            title={contents.services[18].text}  //  "Зробити оцінку вартості нерухомості за вашим описом"
                            description={contents.services[19].text}  //  "Отримуйте розрахунок вартості житла чи оренди з допомогою штучного інтелекту"
                            icon="🤖"
                        />
                    </Link>
                </div>
            </div>

            {/* Платные услуги */}
            <div className="mb-16">
                <h3 className="text-2xl font-semibold mb-6 text-blue-700">
                    {/*Premium Services*/}{contents.services[7].text}
                </h3>
                <div className="grid gap-8 md:grid-cols-2">
                    <Link to="/advertising">
                        <ServiceCard
                            title={contents.services[8].text}  //"Main Page Video & Text Banner"
                            description={contents.services[9].text}  //"Advertise your property or service via a featured video and a running text banner on the main page."
                            icon="🎥"
                        />
                    </Link>
                    <Link to="/notification">
                        <ServiceCard
                            title={contents.services[10].text}  //"Instant Email Alerts"
                            description={contents.services[11].text}  //"Get notified by email immediately when a new listing matches your saved search parameters."
                            icon="📬"
                        />
                    </Link>
                    <Link to="/">
                        <ServiceCard
                            title={contents.services[12].text}  //"Personal Realtor Promotion"
                            description={contents.services[13].text}  //"Promote your realtor profile to users who prefer professional assistance in buying, selling, or renting properties."
                            icon="👤"
                        />
                    </Link>

                </div>
            </div>

            <div className="text-center mt-12">
                <Link to="/" className="bg-green-600 text-white hover:text-white px-6 py-3 rounded-lg text-lg hover:bg-green-700 transition">
                    {/*Try it for Free*/}{contents.services[14].text}
                </Link>
                <p className="text-sm text-gray-500 mt-2">{contents.services[15].text}</p>
                {/*Premium services available with a subscription.*/}
            </div>
        </div>
    );
};

type CardProps = {
    title: string;
    description: string;
    icon: string;
};

const ServiceCard: React.FC<CardProps> = ({ title, description, icon }) => {
    return (
        <div className="flex items-start p-6 border rounded-lg shadow hover:shadow-lg transition bg-white">
            <div className="text-4xl mr-4">{icon}</div>
            <div className="text-gray-600">
                <h4 className="text-xl font-bold mb-2">{title}</h4>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    );
};
export default Services;