import React from "react";
import { useNavigate } from "react-router-dom";

function Modify(){
    const navigate = useNavigate();
    const handleBack = () => {
        alert("You have not saved");
        navigate("/Overview");
    }
    const handleSave = () => {
        navigate("/Overview");
    }
    return(
        <div>
            <h1>Modify</h1>
            <button className="botContentButton" type="button" onClick={handleBack}>
                back
            </button>
            <button className="botContentButton" type="button" onClick={handleSave}>
                Save
            </button>
        </div>
    );
}

export default Modify;