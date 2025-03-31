import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChoreographyMap from "../components/ChoreographyMap";

function Overview() {
    const jsonData = JSON.parse(sessionStorage.getItem("uploadedJson"));
    const navigate = useNavigate();
    
    // Add state for position.
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleBack = () => {
        navigate("/");
    };
    
    const handleSettings = () => {
        navigate("/Settings", { state: { new: false } });
    };
    
    const handleModify = (moveId) => {
        navigate(`/Modify/${moveId}`);
    };
    
    const handleReview = () => {
        navigate("/Review");
    };

    const handleNewMove = () => {
        navigate("/Modify/new");  // Navigate to the new move form
    };

    // Handle position updates from ChoreographyMap.
    const handlePositionChange = (newPosition) => {
        setPosition(newPosition);
    };
    
    return (
        <div style={{ display: "flex" }}>
            {/* Left Pane */}
            <div
                style={{
                    width: "300px",
                    padding: "10px",
                    borderRight: "1px solid #ccc",
                    overflowY: "auto",
                }}
            >
                {/* New Move Button */}
                <div style={{ marginBottom: "20px" }}>
                    <button
                        className="botContentButton"
                        type="button"
                        onClick={handleNewMove}
                        style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: "#4CAF50", // Green color for emphasis
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "16px",
                        }}
                    >
                        New Move
                    </button>
                </div>

                <h3>Moves</h3>
                {jsonData && jsonData.moves && jsonData.moves.length > 0 ? (
                    <ul>
                        {jsonData.moves.map((move, index) => (
                            <li key={index}>
                                <span>{move.name}</span>
                                <button
                                    className="botContentButton"
                                    type="button"
                                    onClick={() => handleModify(index)} // Navigate to /Modify/{moveId}
                                    style={{ marginLeft: "10px" }}
                                >
                                    Modify
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No moves available</p>
                )}
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, padding: "20px" }}>
                <div>
                    <h4>Position on Floor</h4>
                    <div className="border rounded" style={{ height: '400px' }}>
                        <ChoreographyMap 
                            initialPosition={position} 
                            onPositionChange={handlePositionChange} 
                        />
                    </div>
                    <div className="mt-2">
                        <p>Current position: X: {Math.round(position.x)}, Y: {Math.round(position.y)}</p>
                    </div>
                </div>   
                <h1>Routine</h1>
                <p>Data goes here:</p>
                {jsonData && (
                    <pre>{JSON.stringify(jsonData, null, 2)}</pre>
                )}
                <p>Data complete</p>

                <button className="botContentButton" type="button" onClick={handleBack}>
                    Back
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
        </div>
    );
}

export default Overview;