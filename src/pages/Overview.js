import React from "react";
import { useNavigate } from "react-router-dom";

function Overview(){
    const jsonData = JSON.parse(sessionStorage.getItem("uploadedJson"))
    const navigate = useNavigate();
    const handleBack = () => {
        navigate("/");
    }
    const handleSettings = () => {
        navigate("/Settings", {state: {"new": false}});
    }
    const handleModify = () => {
        navigate("/Modify/new")
    }
    const handleReview = () => {
        navigate("/Review")
    }
    return(
        <div>
            <h1>Routine</h1>
            <p>Data goes here:
            {jsonData && <pre>{JSON.stringify(jsonData, null, 2)}</pre>}
            Data complete</p>
            <button className="botContentButton" type="button" onClick={handleBack}>
                back
            </button>
            <button className="botContentButton" type="button" onClick={handleSettings}>
                Settings
            </button>
            <button className="botContentButton" type="button" onClick={handleModify}>
                Modify
            </button>
            <button className="botContentButton" type="button" onClick={handleReview}>
                Review
            </button>



        </div>
    );
}

export default Overview;