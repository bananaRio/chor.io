import React from "react";
import { Link } from "react-router-dom";

function Modify(){
    return(
        <div>
            <h1>Modify</h1>
            <button className="botContentButton" type="button">
                <Link to="/" style={{ color: "black", textDecoration: "none" }}>
                    back
                </Link>
            </button>
        </div>
    );
}

export default Modify;