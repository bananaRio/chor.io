import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChoreographyMap from "../components/ChoreographyMap";
import './Page.css';

function Overview() {
    const jsonData = JSON.parse(sessionStorage.getItem("uploadedJson"));
    const navigate = useNavigate();
    const playInterval = useRef(null); // Ref to store the interval ID
    const playerRef = useRef(null);

    // State for position and time tracking
    const [musicFile, setMusicFile] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [currentTime, setCurrentTime] = useState(0); // Time in seconds
    const [isPlaying, setIsPlaying] = useState(false); // Track play state
    const sliderRef = useRef(null);
    const [sliderWidth, setSliderWidth] = useState(0);

    const handleBack = () => navigate("/");
    const handleSettings = () => navigate("/Settings", { state: { new: false } });
    const handleModify = (moveId) => navigate(`/Modify/${moveId}`);
    // const handleReview = () => navigate("/Review");
    const handleNewMove = () => navigate("/Modify/new");


    const getDuration = () => {
        if (!jsonData?.moves || jsonData.moves.length === 0) return 0;
        const lastMove = jsonData.moves[jsonData.moves.length - 1];
        return lastMove.startTime;
    };

    const duration = getDuration();

    const handlePositionChange = (newPosition) => {
        setPosition(newPosition);
    };

    const getCurrentMove = () => {
        if (!jsonData?.moves || jsonData.moves.length === 0) return null;

        let current = null;
        for (const move of jsonData.moves) {
            if (move.startTime <= currentTime) {
                current = move;
            } else {
                break;
            }
        }
        return current;
    };


    const currentMove = getCurrentMove();

    const getLabelLeftOffset = () => {
        const percent = duration ? currentTime / duration : 0;
        const offset = 20;
        return percent * sliderWidth - offset;
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
                playerRef.current?.play();
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
        playerRef.current?.pause();
    };
    // Clean up interval on component unmount
    React.useEffect(() => {
        return () => {
            if (playInterval.current) {
                clearInterval(playInterval.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (sliderRef.current) {
            setSliderWidth(sliderRef.current.offsetWidth);
        }
    }, [jsonData]);

    React.useEffect(() => {
        if (jsonData.music_source_path) {
            setMusicFile(jsonData.music_source_path);
        }
    }, [jsonData])

    React.useEffect(() => {
        if (playerRef.current) {
            playerRef.current.currentTime = currentTime;
        }
    }, [currentTime]);

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
                    <ul className="list-unstyled">
                        {jsonData.moves.map((move, index) => (
                            <li key={index} className="d-flex align-items-center p-2 mb-2"
                                style={{
                                    backgroundColor: "#f8f9fa",
                                    borderRadius: "10px",
                                    border: "1px solid #ddd",
                                }}>
                                {/* Move Color Indicator */}
                                <div
                                    style={{
                                        width: "6px",
                                        height: "30px",
                                        backgroundColor: move.color,
                                        borderRadius: "3px",
                                        marginRight: "10px",
                                    }}>
                                </div>

                                {/* Move Name */}
                                <span className="flex-grow-1" style={{ color: "black" }}>{move.name}</span>

                                {/* Edit Button */}
                                <button
                                    type="button"
                                    onClick={() => handleModify(index)}
                                    className="btn btn-outline-secondary d-flex align-items-center"
                                    style={{
                                        padding: "5px 10px",
                                        borderRadius: "8px",
                                        backgroundColor: "white",
                                    }}
                                >
                                    <img
                                        src="/pencil.png"
                                        alt="Edit"
                                        style={{ width: "20px", height: "20px", marginRight: "5px" }}
                                    />
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
                    <h2>{jsonData.routineName}</h2>
                    <h4>Position on Floor</h4>
                    <div className="border rounded" style={{
                        height: "400px",
                        padding: "0",
                        margin: "0",
                        border: "none",
                        background: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <ChoreographyMap
                            initialPosition={position}
                            onPositionChange={handlePositionChange}
                            currentTime={currentTime} // Pass time to child
                            moveList={jsonData?.moves}
                            style={{ background: "transparent" }}
                        />
                    </div>
                    <div className="mt-2">
                        <p>Current position: X: {Math.round(position.x)}, Y: {Math.round(position.y)}</p>
                    </div>
                </div>

                {/* Time Controls */}
                <div style={{ position: "relative", marginTop: "40px" }}>
                    {/* Floating Label */}
                    {currentMove && (
                        <div
                            style={{
                                position: "absolute",
                                left: getLabelLeftOffset(),
                                top: -30,
                                transform: "translateX(-50%)",
                                fontWeight: "bold",
                                backgroundColor: "#fff",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                whiteSpace: "nowrap",
                                pointerEvents: "none",
                                background: currentMove.color
                            }}
                        >
                            {currentMove.name}
                        </div>
                    )}

                    {/* Range Input */}
                    <input
                        ref={sliderRef}
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleTimeChange}
                        style={{ width: "100%" }}
                    />
                    <p>Current Time: {currentTime} sec</p>
                    <button onClick={handlePlay} disabled={isPlaying}>Play</button>
                    <button onClick={handlePause} disabled={!isPlaying}>Pause</button>
                </div>

                <button className="botContentButton" type="button" onClick={handleBack}>Back</button>
                <button className="botContentButton" type="button" onClick={handleSettings}>Settings</button>
                {/* <button className="botContentButton" type="button" onClick={handleReview}>Review</button> */}
                {musicFile && (
                    <div style={{ display: "none" }}>
                        <p>Selected File:</p>
                        <audio ref={playerRef} controls src={musicFile}></audio>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Overview;