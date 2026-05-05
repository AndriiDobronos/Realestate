import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import {RootState} from "../app/store";
import {useDispatch, useSelector} from 'react-redux';
import { useLanguage } from '../context/LanguageContext';
import logo from '../../src/assets/logo/MyDreamHouseLogo.jpg';
import profile from '../../src/assets/logo/userProfile.webp';
import {Home} from "../pages/Home";
import LanguageSwitcher from "./LanguageSwitcher";
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import Burger from "./Burger";
import {resetAuthProperty, setAuthProperty, setAuthChecking} from "../features/auth/authSlice"
import { useAuth } from '../services/useAuth'
import {setIsRegistration, setUserName, setUserId} from '../features/registration/registrationSlice'

const Header = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts
    const dispatch = useDispatch();
    const isRegistration = useSelector((state: RootState) => state.registration. isRegistered);
    const ownerName = useSelector((state: RootState) => state.registration.userName);
    const [view, setView] = useState(false);
    const [show, setShow] = useState(false);
    const [activeHint, setActiveHint] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [widthScreen, setWidthScreen] = useState(window.innerWidth >= 900);
    const isAuth = useSelector((state: RootState) => state.auth.isLogin);
    const { checkAuth } = useAuth();

    useEffect(() => {
        checkAuth().then(({ isAuthenticated: serverAuth, user }) => {
            if (serverAuth && user) {
                dispatch(setAuthProperty(true));
                dispatch(setIsRegistration(true));
                dispatch(setUserName(user.name));
                dispatch(setUserId(user.id));
            } else {
                dispatch(resetAuthProperty());
            }
            dispatch(setAuthChecking(false));
        });
        const handleResize = () => {
            setWidthScreen(window.innerWidth >= 900);
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return ()=> window.removeEventListener('resize', handleResize);
    },[]);

    return (
        <header className="bg-blue-600 text-white p-4 w-full fixed z-[99]" style={{boxShadow:"inset 3px 3px 12px rgba(0, 0, 0, 0.6)"}}>
            <div className="mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold lg:text-2xl" style={{textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)"}}>
                    {contents.header[0].text} {/*{language === 'en' ? 'Dream House' : 'Дім мрії'}*/}
                </h1>
                <div className="logo" style={{width:"64px",height:"100%", padding:"0",marginTop:"-8px",marginBottom:"-8px"}}>
                    <Link to="/">
                        <img className="object-cover rounded-lg"
                             style={{boxShadow:"2px 2px 4px rgba(0, 0, 0, 0.5)"}}
                             src={logo} alt="logo"/>
                    </Link>
                </div>

                <nav className={`${widthScreen ? "flex" : "hidden"}`}>
                {/*<nav className="hidden md:flex">*/}
                    <ul className="flex space-x-4">
                        {(isRegistration)  && <li onClick={() => setShow(prevState => !prevState)}
                            //onMouseEnter={() => setShow(true)}
                            className="relative pointer">
                            {isAuth && <a className="hover:underline text-yellow-200 hover:text-yellow-400"
                                  //onMouseEnter={() => setShow(true)}
                            >
                                {contents.header[1].text}
                                {/*{Place an ad}*/}
                            </a>}
                            {show && <div id="profile" style={{width:"200px"}}
                                          //onMouseLeave={() => setShow(false)}
                                          className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-2 w-full bg-gray-200 p-2 text-sm text-gray-700 rounded-lg shadow-md
                                    before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full
                                    before:border-8 before:border-transparent before:border-b-gray-200"
                            >
                                <p className="text-2xl mb-6" style={{textShadow:"2px 1px 2px rgba(0, 0, 0, 0.6)"}}>{contents.header[2].text}</p>
                                {/*{Select option}*/}
                                <button className="bg-gray-50 mb-6 mt-2" >
                                    <Link  to="listings/new/sale" className="text-gray-700">
                                        {contents.header[3].text} {/*{For sale}*/}
                                    </Link>
                                </button>
                                <button className="bg-gray-50 mb-2" >
                                    <Link  to="listings/new/rent" className="text-gray-700">
                                        {contents.header[4].text} {/*{For rent}*/}
                                    </Link>
                                </button>
                            </div>}
                        </li>}
                        <li><Link to="about" className="hover:underline text-yellow-200 hover:text-yellow-400"> {contents.header[5].text}</Link></li>
                        {/*{About}*/}
                        <li className="flex relative">
                            <div className="profile rounded-full overflow-hidden"
                                 onClick={()=>setView(prevState => !prevState)}
                                 //onMouseEnter={()=>setView(true)}
                                 style={{width:"50px", padding:"0",marginTop:"-8px",marginBottom:"-8px",boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)"}}>
                                <img
                                    className="w-full h-full object-cover"
                                    style={{boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",scale:"1.16",cursor:"pointer"}}
                                    src={profile} alt="logo"/>
                            </div>
                            {view && <div id="profile" style={{width:"200px"}}
                                          //onMouseLeave={() => setView(false)}
                                 className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-2 w-full bg-gray-200 p-2 text-sm text-gray-700 rounded-lg shadow-md
                                    before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full
                                    before:border-8 before:border-transparent before:border-b-gray-200"
                            >
                                <p className="text-2xl" style={{textShadow:"2px 1px 2px rgba(0, 0, 0, 0.6)"}}>{contents.header[6].text}: {/*{My profile}*/}</p>
                                <p className="text-xl mb-4 text-blue-600">{ownerName}</p>
                                <button className="bg-gray-50 mb-6 w-[88%]"><Link to="myListings">{contents.header[7].text} {/*{Edit my Listings}*/}</Link></button>
                                <button className="bg-gray-50 mb-6 w-[88%]"><Link to="myComments">{contents.header[8].text} {/*{Edit my Comments}*/}</Link></button>
                                <button className="bg-gray-50 mb-6 w-[88%]"><Link to="myNotification">{contents.header[12].text} {/*{Edit my Notification}*/}</Link></button>
                                <button onClick={()=>Home.handleLogOut()}
                                        className="bg-red-500 text-white mb-2 w-[88%]"
                                        onMouseEnter={() => setActiveHint(true)}
                                        onMouseLeave={() => setActiveHint(false)}
                                >
                                    {contents.header[9].text} {/*{LogOut}*/}
                                </button>

                                {activeHint && <div className="absolute z-10 left-1/2 transform -translate-x-1/2
                                    w-full bg-yellow-200 p-2 text-sm text-gray-700 rounded shadow-md
                                    before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full
                                    before:border-8 before:border-transparent before:border-b-yellow-200">{contents.header[10].text}
                                    {/*{Logging out will remove your account data and all your sale or rental listings from our platform.}*/}
                                </div>}

                            </div>}
                        </li>
                        <li><Link to="agents" className="hover:underline text-yellow-200 hover:text-yellow-400">{contents.header[11].text}</Link></li>
                        {/*{Agents}*/}
                        {/* {(ownerName === 'admin') && <li><Link to="advertising" className="hover:underline text-yellow-200 hover:text-yellow-400">Video</Link></li>} */}
                        <li><Link to="services" className="hover:underline text-yellow-200 hover:text-yellow-400">{contents.header[13].text}</Link></li>
                        {/*{Services}*/}
                        <LanguageSwitcher />
                    </ul>
                </nav>

                <a onClick={() => setMobileMenu(!mobileMenu)} className={`${widthScreen ? "hidden" : "flex"}`}>
                    {/*{ className="md:hidden "}*/}
                    <Burger open={mobileMenu} />
                </a>

                <ul className={`absolute right-0 top-[60px] bg-blue-700 text-white px-4 pt-4 pb-8 space-y-6 transition-all duration-500
                    ${mobileMenu ? "opacity-100" : "opacity-0 w-2"} ${widthScreen ? "hidden" : "block w-1/2"}`}>
                    <li>
                        <Link to="/" onClick={() => setMobileMenu(false)}
                              className="hover:underline text-yellow-200 hover:text-yellow-400">
                            {contents.header[14].text}
                        </Link>
                    </li>
                    {isRegistration  && (<li onClick={() => setShow(!show)} className="relative pointer">
                        {isAuth && <Link className="hover:underline text-yellow-200 hover:text-yellow-400">
                            {contents.header[1].text}<br/>{contents.header[1].nextText}
                            {/*{Place an ad}*/}
                        </Link>}
                        {show && <div id="profile" style={{width:"200px"}}
                                      onMouseLeave={() => setShow(false)}
                                      className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-2 w-full bg-gray-200 p-2 text-sm text-gray-700 rounded-lg shadow-md
                                    before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full
                                    before:border-8 before:border-transparent before:border-b-gray-200"
                        >
                            <p className="text-2xl mb-6" style={{textShadow:"2px 1px 2px rgba(0, 0, 0, 0.6)"}}>{contents.header[2].text}</p>
                            {/*{Select option}*/}
                            <button className="bg-gray-50 mb-6 mt-2" >
                                <Link  to="listings/new/sale" className="text-gray-700" onClick={() => setMobileMenu(false)}>
                                    {contents.header[3].text} {/*{For sale}*/}
                                </Link>
                            </button>
                            <button className="bg-gray-50 mb-2" >
                                <Link  to="listings/new/rent" className="text-gray-700" onClick={() => setMobileMenu(false)}>
                                    {contents.header[4].text} {/*{For rent}*/}
                                </Link>
                            </button>
                        </div>}
                    </li>)}
                    <li><Link to="about" className="hover:underline text-yellow-200 hover:text-yellow-400" onClick={() => setMobileMenu(false)}>
                        {contents.header[5].text}
                    </Link></li>
                    <li className="flex relative justify-center" onClick={() => setView(!view)}>
                        <Link className="hover:underline text-yellow-200 hover:text-yellow-400">
                            {contents.header[6].text}
                        </Link>
                        {view && <div id="profile" style={{width:"200px"}}
                                      onMouseLeave={() => setView(false)}
                                      className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-2 w-full bg-gray-200 p-2 text-sm text-gray-700 rounded-lg shadow-md
                                    before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full
                                    before:border-8 before:border-transparent before:border-b-gray-200"
                        >
                            <p className="text-2xl mb-6" style={{textShadow:"2px 1px 2px rgba(0, 0, 0, 0.6)"}}>{contents.header[6].text} {/*{My profile}*/}</p>
                            <p className="text-xl mb-4 text-blue-600">{ownerName}</p>
                            <button className="bg-gray-50 mb-6 w-[88%]"><Link to="myListings">{contents.header[7].text} {/*{Edit my Listings}*/}</Link></button>
                            <button className="bg-gray-50 mb-6 w-[88%]"><Link to="myComments">{contents.header[8].text} {/*{Edit my Comments}*/}</Link></button>
                            <button className="bg-gray-50 mb-6 w-[88%]"><Link to="myNotification">{contents.header[12].text} {/*{Edit my Notification}*/}</Link></button>
                            <button onClick={()=>Home.handleLogOut()}
                                    className="bg-red-500 text-white mb-2 w-[88%]"
                                    onMouseEnter={() => setActiveHint(true)}
                                    onMouseLeave={() => setActiveHint(false)}
                            >
                                {contents.header[9].text} {/*{LogOut}*/}
                            </button>

                            {activeHint && <div className="absolute z-10 left-1/2 transform -translate-x-1/2
                                    w-full bg-yellow-200 p-2 text-sm text-gray-700 rounded shadow-md
                                    before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full
                                    before:border-8 before:border-transparent before:border-b-yellow-200">{contents.header[10].text}
                                {/*{Logging out will remove your account data and all your sale or rental listings from our platform.}*/}
                            </div>}
                        </div>}
                    </li>
                    <li><Link to="agents" className="hover:underline text-yellow-200 hover:text-yellow-400" onClick={() => setMobileMenu(false)}>
                        {contents.header[11].text}
                    </Link></li>
                    {/* {(ownerName === 'admin') && <li><Link to="advertising" className="hover:underline text-yellow-200 hover:text-yellow-400" onClick={() => setMobileMenu(false)}>
                        Video
                    </Link></li>} */}
                    <li><Link to="services" className="hover:underline text-yellow-200 hover:text-yellow-400" onClick={() => setMobileMenu(false)}>
                        {contents.header[13].text}
                    </Link></li>
                    <li className="mx-auto w-16">
                        <LanguageSwitcher />
                    </li>
                </ul>

            </div>
        </header>
    );
};

export default Header;