import React from "react";
import { Link } from "react-router-dom";

function Review(){
    return(
        <div>
            <h1>Review</h1>
            <button className="botContentButton" type="button">
                <Link to="/Overview" style={{ color: "black", textDecoration: "none" }}>
                    Done
                </Link>
            </button>
        </div>
    );
}

export default Review;