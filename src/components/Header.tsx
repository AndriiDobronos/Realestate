import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RootState } from '../app/store';
import { useDispatch, useSelector } from 'react-redux';
import { useLanguage } from '../context/LanguageContext';
import logo from '../../src/assets/logo/MyDreamHouseLogo.jpg';
import profile from '../../src/assets/logo/userProfile.webp';
import LanguageSwitcher from './LanguageSwitcher';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import Burger from './Burger';
import { resetAuthProperty, setAuthProperty, setAuthChecking } from '../features/auth/authSlice';
import { useAuth } from '../services/useAuth';
import { setIsRegistration, setUserName, setUserId, setRole } from '../features/registration/registrationSlice';

const Header = () => {
    const { language } = useLanguage();
    const contents = language === 'en' ? allEnTexts : allUaTexts;
    const dispatch = useDispatch();
    const isRegistration = useSelector((state: RootState) => state.registration.isRegistered);
    const ownerName = useSelector((state: RootState) => state.registration.userName);
    const isAuth = useSelector((state: RootState) => state.auth.isLogin);
    const { checkAuth, handleFullLogout } = useAuth();

    const [mobileMenu, setMobileMenu] = useState(false);
    const [showAdDropdown, setShowAdDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showMobileAdDropdown, setShowMobileAdDropdown] = useState(false);
    const [showMobileProfileDropdown, setShowMobileProfileDropdown] = useState(false);
    const [logoutTooltip, setLogoutTooltip] = useState(false);
    const [logoutMessage, setLogoutMessage] = useState('');

    const adRef = useRef<HTMLLIElement>(null);
    const profileRef = useRef<HTMLLIElement>(null);
    const mobileAdRef = useRef<HTMLLIElement>(null);
    const mobileProfileRef = useRef<HTMLLIElement>(null);
    const mobileMenuRef = useRef<HTMLUListElement>(null);
    const burgerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        checkAuth().then(({ isAuthenticated: serverAuth, user }) => {
            if (serverAuth && user) {
                dispatch(setAuthProperty(true));
                dispatch(setIsRegistration(true));
                dispatch(setUserName(user.name));
                dispatch(setUserId(user.id));
                dispatch(setRole(user.role === 'admin' ? 'admin' : 'user'));
            } else {
                dispatch(resetAuthProperty());
            }
            dispatch(setAuthChecking(false));
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Close desktop dropdowns on click outside
    useEffect(() => {
        const handler = (e: PointerEvent) => {
            if (adRef.current && !adRef.current.contains(e.target as Node)) {
                setShowAdDropdown(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setShowProfileDropdown(false);
                setLogoutTooltip(false);
            }
        };
        document.addEventListener('pointerdown', handler);
        return () => document.removeEventListener('pointerdown', handler);
    }, []);

    // Close mobile dropdowns on click outside
    useEffect(() => {
        const handler = (e: PointerEvent) => {
            if (mobileAdRef.current && !mobileAdRef.current.contains(e.target as Node)) {
                setShowMobileAdDropdown(false);
            }
            if (mobileProfileRef.current && !mobileProfileRef.current.contains(e.target as Node)) {
                setShowMobileProfileDropdown(false);
            }
        };
        document.addEventListener('pointerdown', handler);
        return () => document.removeEventListener('pointerdown', handler);
    }, []);

    // Close mobile menu on click outside
    useEffect(() => {
        const handler = (e: PointerEvent) => {
            if (
                mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node) &&
                burgerRef.current && !burgerRef.current.contains(e.target as Node)
            ) {
                setMobileMenu(false);
            }
        };
        document.addEventListener('pointerdown', handler);
        return () => document.removeEventListener('pointerdown', handler);
    }, []);

    const closeMobileMenu = () => setMobileMenu(false);

    const dropdownPanelClass = `absolute z-10 top-full left-1/2 -translate-x-1/2 mt-2 w-52
        bg-white rounded-xl shadow-lg p-3 text-sm text-gray-700
        before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full
        before:border-8 before:border-transparent before:border-b-white`;

    return (
        <header className="bg-[#0F172A] text-white w-full fixed z-[99] shadow-lg">
            <div className="max-w-[1440px] mx-auto px-4 h-16 flex items-center justify-between gap-4">

                {/* Logo + Brand */}
                <div className="flex items-center gap-3 shrink-0">
                    <Link to="/" className="shrink-0 flex items-center">
                        <img
                            className="h-9 w-auto rounded-xl shadow-md"
                            src={logo}
                            alt="logo"
                        />
                    </Link>
                    <h1 className="text-lg font-bold lg:text-xl leading-tight hidden sm:block">
                        {contents.header[0].text}
                    </h1>
                </div>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center">
                    <ul className="flex items-center gap-1">

                        {/* Place an ad */}
                        {isRegistration && isAuth && (
                            <li ref={adRef} className="relative">
                                <button
                                    onClick={() => setShowAdDropdown(prev => !prev)}
                                    className="bg-transparent text-[#F59E0B] hover:text-yellow-300 font-medium px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    {contents.header[1].text}
                                </button>
                                {showAdDropdown && (
                                    <div className={dropdownPanelClass}>
                                        <p className="text-base font-semibold mb-3 text-gray-800">{contents.header[2].text}</p>
                                        <Link to="listings/new/sale" onClick={() => setShowAdDropdown(false)}>
                                            <button className="w-full bg-[#2563EB] text-white hover:bg-blue-700 mb-2 rounded-xl">
                                                {contents.header[3].text}
                                            </button>
                                        </Link>
                                        <Link to="listings/new/rent" onClick={() => setShowAdDropdown(false)}>
                                            <button className="w-full bg-[#2563EB] text-white hover:bg-blue-700 rounded-xl">
                                                {contents.header[4].text}
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </li>
                        )}

                        <li>
                            <Link to="about" className="px-3 py-2 rounded-xl text-[#F59E0B] hover:text-yellow-300 hover:bg-white/10 transition-colors font-medium">
                                {contents.header[5].text}
                            </Link>
                        </li>

                        {/* Profile */}
                        <li ref={profileRef} className="relative">
                            <button
                                onClick={() => setShowProfileDropdown(prev => !prev)}
                                className="mt-[2px] bg-transparent p-0 rounded-full overflow-hidden w-10 h-10 min-h-[40px] border-2 border-white/20 hover:border-[#F59E0B] transition-colors"
                                aria-label={contents.header[6].text}
                            >
                                <img className="w-full h-full object-cover scale-[1.2]" src={profile} alt="profile" />
                            </button>
                            {showProfileDropdown && (
                                <div className={dropdownPanelClass}>
                                    <p className="text-base font-semibold text-gray-800">{contents.header[6].text}</p>
                                    <p className="text-sm text-[#2563EB] mb-3 font-medium truncate">{ownerName}</p>
                                    <Link to="myListings" onClick={() => setShowProfileDropdown(false)}>
                                        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 mb-2 rounded-xl text-left px-3">
                                            {contents.header[7].text}
                                        </button>
                                    </Link>
                                    <Link to="myComments" onClick={() => setShowProfileDropdown(false)}>
                                        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 mb-2 rounded-xl text-left px-3">
                                            {contents.header[8].text}
                                        </button>
                                    </Link>
                                    <Link to="myNotification" onClick={() => setShowProfileDropdown(false)}>
                                        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 mb-3 rounded-xl text-left px-3">
                                            {contents.header[12].text}
                                        </button>
                                    </Link>
                                    <div className="relative">
                                        <button
                                            onClick={() => handleFullLogout(() => {}, setLogoutMessage)}
                                            onMouseEnter={() => setLogoutTooltip(true)}
                                            onMouseLeave={() => setLogoutTooltip(false)}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl"
                                        >
                                            {contents.header[9].text}
                                        </button>
                                        {logoutTooltip && (
                                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-yellow-100 text-yellow-900 text-xs p-2 rounded-lg shadow-md">
                                                {contents.header[10].text}
                                            </div>
                                        )}
                                    </div>
                                    {logoutMessage && <p className="text-xs text-red-500 mt-2">{logoutMessage}</p>}
                                </div>
                            )}
                        </li>

                        <li>
                            <Link to="agents" className="px-3 py-2 rounded-xl text-[#F59E0B] hover:text-yellow-300 hover:bg-white/10 transition-colors font-medium">
                                {contents.header[11].text}
                            </Link>
                        </li>
                        <li>
                            <Link to="services" className="px-3 py-2 rounded-xl text-[#F59E0B] hover:text-yellow-300 hover:bg-white/10 transition-colors font-medium">
                                {contents.header[13].text}
                            </Link>
                        </li>

                        <li>
                            <LanguageSwitcher />
                        </li>
                    </ul>
                </nav>

                {/* Burger button */}
                <button
                    ref={burgerRef}
                    onClick={() => setMobileMenu(prev => !prev)}
                    className="flex items-center justify-center md:hidden bg-transparent min-h-[44px] min-w-[44px] rounded-xl hover:bg-white/10 transition-colors"
                    aria-label="Menu"
                >
                    <Burger open={mobileMenu} />
                </button>
            </div>

            {/* Mobile menu */}
            <ul
                ref={mobileMenuRef}
                className={`md:hidden absolute right-0 top-16 bg-[#0F172A] border-t border-white/10 w-3/4 max-w-xs
                    px-4 pt-4 pb-8 space-y-1 shadow-xl transition-all duration-300
                    ${mobileMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                <li>
                    <Link
                        to="/"
                        onClick={closeMobileMenu}
                        className="block px-3 py-3 rounded-xl text-[#F59E0B] hover:bg-white/10 font-medium min-h-[44px] flex items-center"
                    >
                        {contents.header[14].text}
                    </Link>
                </li>

                {/* Mobile: Place an ad */}
                {isRegistration && isAuth && (
                    <li ref={mobileAdRef} className="relative">
                        <button
                            onClick={() => setShowMobileAdDropdown(prev => !prev)}
                            className="w-full bg-transparent text-[#F59E0B] hover:bg-white/10 font-medium px-3 rounded-xl text-left"
                        >
                            {contents.header[1].text}
                        </button>
                        {showMobileAdDropdown && (
                            <div className="mt-1 bg-white rounded-xl shadow-lg p-3">
                                <p className="text-base font-semibold mb-2 text-gray-800">{contents.header[2].text}</p>
                                <Link to="listings/new/sale" onClick={closeMobileMenu}>
                                    <button className="w-full bg-[#2563EB] text-white hover:bg-blue-700 mb-2 rounded-xl">
                                        {contents.header[3].text}
                                    </button>
                                </Link>
                                <Link to="listings/new/rent" onClick={closeMobileMenu}>
                                    <button className="w-full bg-[#2563EB] text-white hover:bg-blue-700 rounded-xl">
                                        {contents.header[4].text}
                                    </button>
                                </Link>
                            </div>
                        )}
                    </li>
                )}

                <li>
                    <Link
                        to="about"
                        onClick={closeMobileMenu}
                        className="block px-3 py-3 rounded-xl text-[#F59E0B] hover:bg-white/10 font-medium min-h-[44px] flex items-center"
                    >
                        {contents.header[5].text}
                    </Link>
                </li>

                {/* Mobile: Profile */}
                <li ref={mobileProfileRef} className="relative">
                    <button
                        onClick={() => setShowMobileProfileDropdown(prev => !prev)}
                        className="w-full bg-transparent text-[#F59E0B] hover:bg-white/10 font-medium px-3 rounded-xl text-left"
                    >
                        {contents.header[6].text}
                    </button>
                    {showMobileProfileDropdown && (
                        <div className="mt-1 bg-white rounded-xl shadow-lg p-3">
                            <p className="text-base font-semibold text-gray-800">{contents.header[6].text}</p>
                            <p className="text-sm text-[#2563EB] mb-3 font-medium truncate">{ownerName}</p>
                            <Link to="myListings" onClick={closeMobileMenu}>
                                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 mb-2 rounded-xl text-left px-3">
                                    {contents.header[7].text}
                                </button>
                            </Link>
                            <Link to="myComments" onClick={closeMobileMenu}>
                                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 mb-2 rounded-xl text-left px-3">
                                    {contents.header[8].text}
                                </button>
                            </Link>
                            <Link to="myNotification" onClick={closeMobileMenu}>
                                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 mb-3 rounded-xl text-left px-3">
                                    {contents.header[12].text}
                                </button>
                            </Link>
                            <button
                                onClick={() => handleFullLogout(() => {}, setLogoutMessage)}
                                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl"
                            >
                                {contents.header[9].text}
                            </button>
                            <p className="text-xs text-gray-500 mt-2">{contents.header[10].text}</p>
                            {logoutMessage && <p className="text-xs text-red-500 mt-1">{logoutMessage}</p>}
                        </div>
                    )}
                </li>

                <li>
                    <Link
                        to="agents"
                        onClick={closeMobileMenu}
                        className="block px-3 py-3 rounded-xl text-[#F59E0B] hover:bg-white/10 font-medium min-h-[44px] flex items-center"
                    >
                        {contents.header[11].text}
                    </Link>
                </li>
                <li>
                    <Link
                        to="services"
                        onClick={closeMobileMenu}
                        className="block px-3 py-3 rounded-xl text-[#F59E0B] hover:bg-white/10 font-medium min-h-[44px] flex items-center"
                    >
                        {contents.header[13].text}
                    </Link>
                </li>
                <li className="pt-2">
                    <LanguageSwitcher />
                </li>
            </ul>
        </header>
    );
};

export default Header;
