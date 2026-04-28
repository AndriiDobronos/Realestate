import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from './context/LanguageContext';
import './App.css'
import {Home} from "./pages/Home";
import Header from "./components/Header"
import Listings from "./pages/Listings"
import RegistrationForm from "./pages/RegistrationForm";
import ImageUpLoader from "./components/ImageUpLoader";
import About from "./pages/About";
import Login from "./components/Login";
import Details from "./components/Details";
import LeafletMaps from "./components/LeafletMaps";
import MyListings from "./components/MyListings";
import MyComments from "./components/MyComments";
import Agents from "./pages/Agents";
import AddAgent from "./pages/AddAgent";
import VideoUpLoader from "./components/VideoUploader";
import AdvertisingVideoService from "./components/AdvertisingVideoService";
import Services from "./pages/Services";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Notification from "./pages/Notification";
import MyNotification from "./components/MyNotification";
import Agreement from "./pages/Agreement";
import CostCalculation from "./components/CostCalculation";
import RealEstateEstimator from "./components/RealEstateEstimator";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';

function App() {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <LanguageProvider>
                <BrowserRouter>
                    <Header />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/listings/edit/:listingId?" element={<Listings />} />
                        <Route path="listings/new/:listingType" element={<Listings />} />
                        <Route path="about" element={<About />} />
                        <Route path="services" element={<Services />} />
                        <Route path="agents" element={<Agents />} />
                        <Route path="addAgent/:agentId" element={<AddAgent />} />
                        <Route path="registration" element={<RegistrationForm  />} />
                        <Route path="myComments" element={<MyComments />} />
                        <Route path="imageUpLoader" element={<ImageUpLoader />} />
                        <Route path="videoUpLoader" element={<VideoUpLoader  />} />
                        <Route path="advertising" element={<AdvertisingVideoService  />} />
                        <Route path="login" element={<Login />} />
                        <Route path="details/:id" element={<Details />} />
                        <Route path="leafletMaps" element={<LeafletMaps listings formMapFilter />} />
                        <Route path="myListings" element={<MyListings  />} />
                        <Route path="myNotification" element={<MyNotification  />} />
                        <Route path="notification" element={<Notification />} />
                        <Route path="agreement" element={<Agreement  />} />
                        <Route path="/notification/edit/:notificationId?" element={<Notification />} />
                        <Route path="costCalculation" element={<CostCalculation  />} />
                        <Route path="realEstateEstimator" element={<RealEstateEstimator  />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password"  element={<ResetPassword />} />
                    </Routes>
                </BrowserRouter>
            </LanguageProvider>
        </GoogleOAuthProvider>
    )
}
export default App;