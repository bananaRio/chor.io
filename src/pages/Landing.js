import React from "react";
import { Link } from "react-router-dom";

function Landing() {
    return (
        <div>
            <h1>Landing</h1>
            <button className="botContentButton" type="button">
                <Link to="/routineHome" style={{ color: "black", textDecoration: "none" }}>
                    Test
                </Link>
            </button>
        </div>
    );
}

export default Landing;
