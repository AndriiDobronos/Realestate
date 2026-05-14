//import { Link } from "react-router-dom";
const ListingPopup = ({ listing }:{listing:any} ) => {
    return (
        <div style={{width:"70px"}} >
            <p>{listing.propertyType}</p>
            <p>${listing.price}</p>
            <p>{listing.location}</p>
            {/*<Link to={`/details/${listing._id}`} style={{ color: "blue", textDecoration: "underline" }}>*/}
            {/*    View details*/}
            {/*</Link>*/}
        </div>
    );
};

export default ListingPopup;
