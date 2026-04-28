import React, {useEffect, useState} from 'react';
import {RootState} from "../app/store";
import {useDispatch, useSelector} from 'react-redux';
import { Link } from 'react-router-dom';
//import {setImages} from "../features/upLoadImages/upLoadImagesSlice";
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import {useLanguage} from "../context/LanguageContext";
//import {resetAuthProperty, setAuthProperty} from "../features/auth/authSlice"
import Footer from "../components/Footer";

const Agents = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts
    const userName = useSelector((state: RootState) => state.registration.userName);
    //const dispatch = useDispatch();
    const [isAdmin, setIsAdmin] = useState(false);
    //const [userName, setUserName] = useState<string>("");
    //const [isAuth, setIsAuth] = useState(false);
    const [agentsData, setAgentsData] = useState<any[]>([]);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const fetchAgents = async () => {
        const response = await fetch(`${API_URL}/agents`, {credentials: "include"});
        return response.json();
    };

    const getData = async () => {
        const data = await fetchAgents();
        setAgentsData(data);
    };

    // const checkAuth = async () => {
    //     try {
    //         const response = await fetch(`${API_URL}/check-auth`, {
    //             method: "GET", credentials: "include",
    //         });
    //         const data = await response.json();
    //         if (data.isAuthenticated) {
    //             setIsAuth(true);
    //             dispatch(setAuthProperty(true));
    //             setUserName(data.user);
    //         }else{
    //             setIsAuth(false);
    //             dispatch(resetAuthProperty());
    //         }
    //     } catch (err) {
    //         console.error('Auth check error:', err);
    //     }
    // };

    useEffect(() => {
        //checkAuth();
        getData();
        if (userName === "admin") setIsAdmin(true)
    }, []);


    useEffect(() => {
        const saved = localStorage.getItem('agentImages');
        //if (ownerName === "admin") setIsAdmin(true)
    }, []);

    // @ts-ignore
    return (
        <div>
            <div className="h-[64px]"></div>
            <div className="mx-auto p-8 flex flex-col text-left text-gray-600">
                <h3 className="text-4xl font-bold mb-6 left" style={{textShadow:"2px 1px 2px rgba(0,0,0,0.6)"}}>{contents.agents[0].text}</h3>
                {/*{Find the most experienced real estate agents in Kharkiv, Ukr}*/}
                <h3 className="text-2xl font-bold mb-6">{contents.agents[1].text}</h3>
                {/*{MyDreamHouse agents close twice as many deals as other real estate agents. We’re local experts who know how to help you win in today’s market.}*/}
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" >

                    {agentsData.map((agent) => (<li key={agent._id}
                        className="border-gray-400 border-2 rounded-2xl overflow-hidden"
                        style={{boxShadow:"5px 3px 12px rgba(0,0,0,0.6)"}}
                    >

                        {isAdmin ? <Link to={`/addAgent/${agent._id}`}>
                            <div className="h-[310px] w-full overflow-hidden">
                                <img className="w-full h-full object-cover object-top rounded-t-xl" src={agent.image} alt="Agent's photo"/>
                            </div>
                        </Link> : <div className="h-[310px] w-full overflow-hidden">
                            <img className="w-full h-full object-cover object-top rounded-t-xl" src={agent.image} alt="Agent's photo"/>
                        </div>}


                        <div className="p-6">
                            <h2 className="text-2xl font-bold">{agent.name}</h2>
                            {/*•*/}
                            <p>{agent.jobTitle}</p>
                            <p className="text-blue-500 mb-6">{agent.email}</p>
                            <div className="flex flex-row mb-4 grid-cols-3 justify-between">
                                <div className="flex flex-col">
                                    <h2 className="font-bold">$ {agent.saleVolume}</h2>
                                    <p>{contents.agents[2].text}</p>
                                    {/*{Sale volume}*/}
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="font-bold">{agent.totalDeal}</h2>
                                    <p>{contents.agents[3].text}</p>
                                    {/*{Total deals}*/}
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="font-bold">{agent.rating} ★</h2>
                                    <p>{contents.agents[4].text}</p>
                                    {/*{Avg rating}*/}
                                </div>
                            </div>
                            <div className="flex justify-center mb-4">
                                <a className="link mx-auto w-[100%] text-xl bg-blue-500 text-white hover:bg-blue-600"
                                   href={`mailto:${agent.email}?subject=Доброго_дня&body=Я%20хотів%20би%20поспілкуватись%20з%20вами%20з%20приводу`}>
                                    {contents.agents[5].text}{/*{Contact}*/}
                                </a>
                            </div>

                            <h2>{contents.agents[6].text} {agent.license}</h2>
                            {/*{License plate: # }*/}
                        </div>
                    </li>))}

                </ul>
            </div>
            <div className="mt-12 mb-12 px-16">
                {isAdmin && <Link to={`/addAgent/new`} className="link text-gray-600 hover:text-gray-700">
                    Create new Agent
                </Link>}
            </div>
           <p>{userName}*</p>
            <Footer  color={'#C0B283'} />
        </div>
    )
};
export default Agents;