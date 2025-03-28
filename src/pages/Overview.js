import React from "react";
import { Link } from "react-router-dom";

function Overview(){
    const jsonData = JSON.parse(sessionStorage.getItem("uploadedJson"))

    return(
        <div>
            <h1>Routine</h1>
            <p>Data goes here:
            {jsonData && <pre>{JSON.stringify(jsonData, null, 2)}</pre>}
            Data complete</p>
            <button className="botContentButton" type="button">
                <Link to="/" style={{ color: "black", textDecoration: "none" }}>
                    Landing
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