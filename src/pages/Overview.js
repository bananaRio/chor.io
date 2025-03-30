import React from "react";
import { useNavigate } from "react-router-dom";

function Overview() {
    const jsonData = JSON.parse(sessionStorage.getItem("uploadedJson"));
    const navigate = useNavigate();

    const handleLanding = () => {
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
        navigate("/Modify/new");
    };

    return (
        <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center bg-light p-3 sticky-top">
                <h2 className="m-0">Routine: {jsonData.routineName}</h2>

                {/* Buttons */}
                <div>
                    <button
                        type="bot-content-button"
                        onClick={handleLanding}
                    >Export or Load New File
                    </button>

                    <button
                        type="bot"
                        onClick={handleSettings}
                        style={{ backgroundColor: "transparent", border: "none", cursor: "pointer" }}
                    >
                        <img
                            src="/gear.png"  // The image for Settings
                            alt="Settings"
                            style={{ width: "30px", height: "30px" }}
                        />
                    </button>
                </div>
            </div>


            <div style={{ display: "flex", flex: 1 }}>
                {/* Left Pane */}
                <div
                    style={{
                        width: "300px",
                        padding: "10px",
                        borderRight: "1px solid #ccc",
                        overflowY: "auto",
                        maxHeight: "100vh",
                        position: "sticky",
                        top: "0",
                    }}
                >
                    <div style={{ marginBottom: "20px" }}>
                        <button
                            className="botContentButton"
                            type="button"
                            onClick={handleNewMove}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "none",
                                borderRadius: "5px",
                                fontSize: "16px",
                            }}
                        >
                            New Move
                        </button>
                    </div>

                    <h4>Moves</h4>
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
                                        <div
                                            style={{
                                                width: "10px",
                                                height: "30px",
                                                backgroundColor: move.color,
                                                borderRadius: "5px",
                                                marginRight: "10px",
                                            }}
                                        ></div>

                                        <button
                                            className="botContentButton"
                                            type="button"
                                            onClick={() => handleModify(index)}
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
                                            }}
                                        >
                                            <img
                                                src="/pencil.png"
                                                alt="Edit"
                                                style={{
                                                    width: "16px",
                                                    height: "16px",
                                                    objectFit: "contain",
                                                }}
                                            />
                                        </button>

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
                <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
                    <h4>Routine Details</h4>

                </div>
            </div>
        </div>
    );
}

export default Overview;
