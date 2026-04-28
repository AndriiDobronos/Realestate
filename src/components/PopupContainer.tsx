import "react";
import { createPortal } from "react-dom";
import ListingPopup from "./ListingPopup";

const PopupContainer = ({ container, listing }:{container:any,listing:any}) => {
    return createPortal(<ListingPopup listing={listing} />, container);
};

export default PopupContainer;
