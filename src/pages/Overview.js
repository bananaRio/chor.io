import React from "react";
import { Link } from "react-router-dom";

function Overview(){
    return(
        <div>
            <h1>Routine</h1>
            <button className="botContentButton" type="button">
                <Link to="/" style={{ color: "black", textDecoration: "none" }}>
                    back
                </Link>
            </button>
            <button className="botContentButton" type="button">
                <Link to="/Modify" style={{ color: "black", textDecoration: "none" }}>
                    Modify
                </Link>
            </button>
            <button className="botContentButton" type="button">
                <Link to="/Review" style={{ color: "black", textDecoration: "none" }}>
                    Review
                </Link>
            </button>
            <button className="botContentButton" type="button">
                <Link to="/Settings" style={{ color: "black", textDecoration: "none" }}>
                    Settings
                </Link>
            </button>



        </div>
    );
}

export default Overview;