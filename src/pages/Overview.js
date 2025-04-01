import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChoreographyMap from "../components/ChoreographyMap";
import './Page.css';

function Overview() {
    const jsonData = JSON.parse(sessionStorage.getItem("uploadedJson"));
    const navigate = useNavigate();
    const playInterval = useRef(null); // Ref to store the interval ID
    
    // State for position and time tracking
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [currentTime, setCurrentTime] = useState(0); // Time in seconds
    const [isPlaying, setIsPlaying] = useState(false); // Track play state

    const handleBack = () => navigate("/");
    const handleSettings = () => navigate("/Settings", { state: { new: false } });
    const handleModify = (moveId) => navigate(`/Modify/${moveId}`);
    const handleReview = () => navigate("/Review");
    const handleNewMove = () => navigate("/Modify/new");


    const getDuration = () => {
        if (!jsonData?.moves || jsonData.moves.length === 0) return 0;
        const lastMove = jsonData.moves[jsonData.moves.length - 1];
        return lastMove.startTime;
    };

    const duration = getDuration();

    // Handle position updates from ChoreographyMap
    const handlePositionChange = (newPosition) => {
        setPosition(newPosition);
    };

    // Time control handlers
    const handleTimeChange = (event) => {
        setCurrentTime(Number(event.target.value));
    };

    const handlePlay = () => {
        if (isPlaying) return;
        
        setIsPlaying(true);
        
        if (playInterval.current) {
            clearInterval(playInterval.current);
        }

        if (currentTime >= duration) {
            return;
        }
        
        playInterval.current = setInterval(() => {
            setCurrentTime((prevTime) => {
                if (prevTime >= duration) {
                    clearInterval(playInterval.current);
                    setIsPlaying(false);
                    return prevTime;
                }
                return prevTime + 1;
            });
        }, 1000);
    };

    const handlePause = () => {
        if (playInterval.current) {
            clearInterval(playInterval.current);
            playInterval.current = null;
        }
        setIsPlaying(false);
    };
    // Clean up interval on component unmount
    React.useEffect(() => {
        return () => {
            if (playInterval.current) {
                clearInterval(playInterval.current);
            }
        };
    }, []);

    return (
        <div style={{ display: "flex" }}>
            {/* Left Pane */}
            <div style={{ width: "300px", padding: "10px", borderRight: "1px solid #ccc", overflowY: "auto" }}>
                <div style={{ marginBottom: "20px" }}>
                    <button className="botContentButton" type="button" onClick={handleNewMove}
                        style={{ width: "100%", padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", fontSize: "16px" }}>
                        New Move
                    </button>
                </div>

                <h3>Moves</h3>
                {jsonData && jsonData.moves && jsonData.moves.length > 0 ? (
                    <ul>
                        {jsonData.moves.map((move, index) => (
                            <li key={index}>
                                <span>{move.name}</span>
                                <button className="botContentButton" type="button" onClick={() => handleModify(index)} style={{ marginLeft: "10px" }}>
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
                            currentTime={currentTime} // Pass time to child
                        />
                    </div>
                    <div className="mt-2">
                        <p>Current position: X: {Math.round(position.x)}, Y: {Math.round(position.y)}</p>
                    </div>
                </div>   

                {/* Time Controls */}
                <div>
                    <h4>TimeLine</h4>
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleTimeChange}
                    />
                    <p>Current Time: {currentTime} sec</p>
                    <button onClick={handlePlay} disabled={isPlaying}>Play</button>
                    <button onClick={handlePause} disabled={!isPlaying}>Pause</button>
                </div>

                <h1>Routine</h1>
                <p>Data goes here:</p>
                {jsonData && (<pre style={{ color: "#9CA3AF" }}>{JSON.stringify(jsonData, null, 2)}</pre>
                )}
                <p>Data complete</p>

                <button className="botContentButton" type="button" onClick={handleBack}>Back</button>
                <button className="botContentButton" type="button" onClick={handleSettings}>Settings</button>
                <button className="botContentButton" type="button" onClick={handleReview}>Review</button>
            </div>
        </div>
    );
}

export default Overview;