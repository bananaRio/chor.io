import React from "react";
import { useNavigate } from "react-router-dom";
import './Page.css';


function Review(){
    const navigate = useNavigate()
    const handleDone = () => {
        navigate("/Overview");
    }
    return(
        <div>
            <h1>Review</h1>
            <button className="botContentButton" type="button" onClick={handleDone}>
                Done
            </button>
        </div>
    );
}

export default Review;