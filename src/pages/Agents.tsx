import { useEffect, useState } from 'react';
import { RootState } from "../app/store";
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { useLanguage } from "../context/LanguageContext";
import Footer from "../components/Footer";

const Agents = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts;
    const userName = useSelector((state: RootState) => state.registration.userName);
    const [isAdmin, setIsAdmin] = useState(false);
    const [agentsData, setAgentsData] = useState<any[]>([]);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchAgents = async () => {
            const response = await fetch(`${API_URL}/agents`, { credentials: "include" });
            const data = await response.json();
            setAgentsData(data);
        };
        fetchAgents();
        if (userName === "admin") setIsAdmin(true);
    }, []);

    return (
        <div>
            <div className="h-[64px]" />
            <div className="mx-auto p-8 flex flex-col text-gray-600">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                        {contents.agents[0].text}
                    </h1>
                    <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
                        {contents.agents[1].text}
                    </p>
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agentsData.map((agent) => (
                        <li
                            key={agent._id}
                            className="group flex flex-col bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        >
                            {/* ── Photo ─────────────────────────────── */}
                            {isAdmin ? (
                                <Link to={`/addAgent/${agent._id}`} className="block h-[280px] w-full overflow-hidden">
                                    <img
                                        src={agent.image}
                                        alt="Agent's photo"
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                    />
                                </Link>
                            ) : (
                                <div className="h-[280px] w-full overflow-hidden">
                                    <img
                                        src={agent.image}
                                        alt="Agent's photo"
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            )}

                            {/* ── Content ───────────────────────────── */}
                            <div className="flex flex-col flex-1 p-5 gap-3">

                                {/* name / title / email */}
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">{agent.name}</h2>
                                    <p className="text-sm text-gray-500">{agent.jobTitle}</p>
                                    <p className="text-sm text-blue-500">{agent.email}</p>
                                </div>

                                {/* stats chips */}
                                <div className="flex gap-2 flex-wrap">
                                    <span className="inline-flex flex-col items-center bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                                        <span className="font-bold text-sm">$ {agent.saleVolume}</span>
                                        <span>{contents.agents[2].text}</span>
                                    </span>
                                    <span className="inline-flex flex-col items-center bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1.5 rounded-full">
                                        <span className="font-bold text-sm">{agent.totalDeal}</span>
                                        <span>{contents.agents[3].text}</span>
                                    </span>
                                    <span className="inline-flex flex-col items-center bg-yellow-50 text-yellow-600 text-xs font-medium px-3 py-1.5 rounded-full">
                                        <span className="font-bold text-sm">{agent.rating} ★</span>
                                        <span>{contents.agents[4].text}</span>
                                    </span>
                                </div>

                                {/* phone */}
                                {agent.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#3B82F6">
                                            <path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12Z"/>
                                        </svg>
                                        <span>{agent.phone}</span>
                                    </div>
                                )}

                                {/* license */}
                                <p className="text-xs text-gray-400 mt-auto">{contents.agents[6].text}{agent.license}</p>

                                {/* contact button */}
                                <a
                                    href={`mailto:${agent.email}?subject=Доброго_дня&body=Я%20хотів%20би%20поспілкуватись%20з%20вами%20з%20приводу`}
                                    className="block w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold text-center transition-colors duration-200"
                                >
                                    {contents.agents[5].text}
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {isAdmin && (
                <div className="mt-8 mb-12 px-8">
                    <Link
                        to="/addAgent/new"
                        className="inline-block px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-semibold transition-colors duration-200"
                    >
                        + Create new Agent
                    </Link>
                </div>
            )}

            <Footer color="#C0B283" />
        </div>
    );
};

export default Agents;
