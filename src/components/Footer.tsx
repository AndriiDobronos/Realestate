import footerImg1 from "../../src/assets/images/ContinuousCityscapeIllustration.png";
//import footerImg2 from "../../src/assets/images/MinimalistCityscapePanorama.png";
import './footer.style.scss';
import {useLanguage} from "../context/LanguageContext";
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import gmailLogo from './../assets/logo/gmail.png';
import instagramLogo from './../assets/logo/instagram.png';
import faceBookLogo from './../assets/logo/facebook.png';
//import telegramLogo from './../assets/logo/telegram.png';
import tiktokLogo from './../assets/logo/tiktok.png';

const Footer = ({color}:{color:any}) => {
    const year = new Date().getFullYear();
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts;

    return (
        <div>
            <div className="grid grid-cols-6 " >
                {[1,2,3,4,5,6].map((el)=><img key={el} src={footerImg1} alt="city"/>)}
            </div>
            <footer className="footer center" id="footer" style={{background:`${color}`}}>
                <div className="footer__left">
                    <div className="footer__left_text">
                        {contents.footer[7].text}<br/>
                    </div>
                    <div className="footer__left_text_two">
                        {contents.footer[9].text}{year}{contents.footer[10].text}
                    </div>
                </div>

                <div className="footer__right">
                    <div className="footer__text" >
                        {contents.footer[4].text}
                    </div>

                    <ul className="footer__nav">
                        <li><a className="footer__link" href={contents.footer[1].href} target="_blank"
                               rel="nofollow">
                            <div className="footer__logo_picture">
                                <img className="footer__logo__button_img" src={instagramLogo} alt="logo-instagram"/>
                            </div>
                            <div className="footer__logo_text">
                                {/*{contents.footer[1].text}*/}
                            </div>
                        </a></li>
                        <li><a className="footer__link" href={contents.footer[2].href} target="_blank"
                               rel="nofollow">
                            <div className="footer__logo_picture">
                                <img className="footer__logo__button_img" src={faceBookLogo} alt="logo-viber"/>
                            </div>
                            <div className="footer__logo_text">
                                {/*{contents.footer[2].text}*/}
                            </div>
                        </a></li>
                        <li><a className="footer__link" href={contents.footer[0].href} target="_blank"
                               rel="nofollow">
                            <div className="footer__logo_picture">
                                <img className="footer__logo__button_img" src={gmailLogo} alt="logo-telegram"/>
                            </div>
                            <div className="footer__logo_text">
                            </div>
                        </a></li>
                        <li><a className="footer__link" href={contents.footer[3].href}>
                            <div className="footer__logo_picture">
                                <img className="footer__logo__button_img" src={tiktokLogo} alt="logo-phone"/>
                            </div>
                            <div className="footer__logo_text">
                            </div>
                        </a></li>
                    </ul>
                    <div className="footer__text">
                        <a className="footer-link text-white"  href={contents.footer[5].href}>
                            {contents.footer[5].text}
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
export default Footer;