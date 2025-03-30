import React from "react";
import { useNavigate } from "react-router-dom";

function Overview() {
    const jsonData = JSON.parse(sessionStorage.getItem("uploadedJson"));
    const navigate = useNavigate();

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
                    <ul style={{ padding: 0 }}>
                        {jsonData.moves.map((move, index) => (
                            <li key={index} style={{ listStyle: "none", marginBottom: "15px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "8px",
                                        borderRadius: "10px",
                                        border: "1px solid #ddd",
                                        backgroundColor: "#f9f9f9",
                                    }}
                                >
                                    {/* Color Bar */}
                                    <div
                                        style={{
                                            width: "10px",
                                            height: "30px",
                                            backgroundColor: move.color,
                                            borderRadius: "5px",
                                            marginRight: "10px",
                                        }}
                                    ></div>

                                    {/* Edit Button with Pencil Image */}
                                    <button
                                        className="botContentButton"
                                        type="button"
                                        onClick={() => handleModify(index)} // Navigate to /Modify/{moveId}
                                        style={{
                                            fontSize: "12px",
                                            padding: "5px",
                                            backgroundColor: "transparent",
                                            border: "none",
                                            borderRadius: "5px",
                                            marginRight: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}>
                                        <img
                                            src="/pencil.png" // Assuming the pencil image is in the public folder
                                            alt="Edit"
                                            style={{
                                                width: "16px", // Adjust size of the pencil icon
                                                height: "16px",
                                                objectFit: "contain",
                                            }}
                                        />
                                    </button>

                                    {/* Move Name */}
                                    <span>{move.name}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No moves available</p>
                )}
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, padding: "20px" }}>
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
