import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChoreographyMap from "../components/ChoreographyMap";
import "./Page.css";

function Overview() {
  const jsonData = JSON.parse(sessionStorage.getItem("uploadedJson"));
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const lastMoveRef = useRef(null);

  // Helper function to adjust color brightness
  const adjustColor = (color, factor) => {
    if (!color || color === "#666") return color;
    
    // Convert hex to RGB
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    
    // Lighten or darken
    r = Math.round(r * factor);
    g = Math.round(g * factor);
    b = Math.round(b * factor);
    
    // Ensure values are in valid range
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const [musicFile, setMusicFile] = useState(null);
  const [musicDuration, setMusicDuration] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // New flag to indicate live "playback mode"
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState(null);

  const handleBack = () => navigate("/");
  const handleSettings = () => navigate("/Settings", { state: { new: false } });
  const handleModify = (moveId) => navigate(`/Modify/${moveId}`);
  const handleNewMove = () => navigate("/Modify/new");

  // Load music file when component mounts
  useEffect(() => {
    if (jsonData?.music_source_path) {
      setMusicFile(jsonData.music_source_path);
    }
  }, [jsonData]);

  const getFallbackDuration = () => {
    if (!jsonData?.moves || jsonData.moves.length === 0) return 0;
    const lastMove = jsonData.moves[jsonData.moves.length - 1];
    return lastMove.startTime;
  };

  const duration = musicDuration || getFallbackDuration();

  // Determine the "current" move based on the currentTime
  const currentMoveFromTime = (() => {
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
  })();

  const currentEffectiveMove =
    selectedMoveIndex !== null ? jsonData.moves[selectedMoveIndex] : currentMoveFromTime;

  useEffect(() => {
    if (
      currentEffectiveMove &&
      (!lastMoveRef.current ||
        lastMoveRef.current.name !== currentEffectiveMove.name ||
        lastMoveRef.current.startTime !== currentEffectiveMove.startTime)
    ) {
      setEditedDescription(currentEffectiveMove.description || "");
      lastMoveRef.current = currentEffectiveMove;
    }
  }, [currentEffectiveMove]);

  const handleSaveDescription = () => {
    if (!currentEffectiveMove || !jsonData?.moves) return;

    const updatedMoves = jsonData.moves.map((move, index) => {
      if (
        selectedMoveIndex !== null
          ? index === selectedMoveIndex
          : move.name === currentEffectiveMove.name &&
            move.startTime === currentEffectiveMove.startTime
      ) {
        return { ...move, description: editedDescription };
      }
      return move;
    });

    sessionStorage.setItem(
      "uploadedJson",
      JSON.stringify({ ...jsonData, moves: updatedMoves })
    );
    setIsEditingDescription(false);
  };

  // --- Live Marker Computation ---
  // Computes the live marker's position by interpolating along the path between moves.
  const computeLiveMarker = () => {
    if (!jsonData?.moves || jsonData.moves.length === 0) return null;
    // Sort moves by startTime
    const moves = [...jsonData.moves].sort((a, b) => a.startTime - b.startTime);
    let startMove = moves[0];
    let nextMove = null;
    
    // Find current and next move
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].startTime <= currentTime) {
        startMove = moves[i];
        nextMove = moves[i + 1];
      } else {
        break;
      }
    }
    
    // Calculate wait time end for current move
    const waitTimeEnd = startMove.startTime + (startMove.waitTime || 0);
    
    // If still in wait time, stay at the current position
    if (currentTime <= waitTimeEnd) {
      return {
        x: startMove.positions ? startMove.positions.x : startMove.x,
        y: startMove.positions ? startMove.positions.y : startMove.y,
        color: startMove.color
      };
    }
    
    // If no subsequent move, position the marker at the last move's coordinates.
    if (!nextMove) {
      return {
        x: startMove.positions ? startMove.positions.x : startMove.x,
        y: startMove.positions ? startMove.positions.y : startMove.y,
        color: startMove.color
      };
    } else {
      // Calculate interpolation based on time after wait period
      const totalTransitionTime = nextMove.startTime - waitTimeEnd;
      const transitionProgress = totalTransitionTime <= 0 ? 1 : (currentTime - waitTimeEnd) / totalTransitionTime;
      const t = Math.min(1, Math.max(0, transitionProgress)); // Clamp between 0 and 1
      
      const startPos = startMove.positions ? startMove.positions : { x: startMove.x, y: startMove.y };
      const endPos = nextMove.positions ? nextMove.positions : { x: nextMove.x, y: nextMove.y };
      
      // Use the connector offset (if defined) for a curved path.
      const moveIndex = moves.findIndex((m) => m === startMove);
      const offsetVal = (jsonData.connectorOffsets && jsonData.connectorOffsets[moveIndex]) || { dx: 0, dy: 0 };
      const mid = { x: (startPos.x + endPos.x) / 2, y: (startPos.y + endPos.y) / 2 };
      const control = { x: mid.x + offsetVal.dx, y: mid.y + offsetVal.dy };
      const oneMinusT = 1 - t;
      const x = oneMinusT * oneMinusT * startPos.x + 2 * oneMinusT * t * control.x + t * t * endPos.x;
      const y = oneMinusT * oneMinusT * startPos.y + 2 * oneMinusT * t * control.y + t * t * endPos.y;
      
      return { x, y, color: startMove.color };
    }
  };

  const liveMarker = isPlaybackActive ? computeLiveMarker() : null;
  // --- End Live Marker Computation ---

  // --- Playback Control Functions ---
  // If a music file is available, the Timeline component (via its animate loop) will update currentTime.
  // If not, we simulate playback with an interval.
  const handlePlay = () => {
    setIsPlaying(true);
    setIsPlaybackActive(true);
    
    // Play music if available
    if (playerRef.current) {
      playerRef.current.currentTime = currentTime;
      playerRef.current.play()
        .catch(err => console.error("Audio play failed:", err));
    }
  };

  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setIsPlaying(false);
    setIsPlaybackActive(false);
  };

  const handleEnd = () => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setIsPlaying(false);
    setIsPlaybackActive(false);
    setCurrentTime(0); // Reset the timeline (adjust if desired)
  };
  // --- End Playback Controls ---

  // --- Playback Animation ---
  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      if (playerRef.current && !playerRef.current.paused) {
        const time = playerRef.current.currentTime;
        setCurrentTime(time);
        animationFrameId = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    };
    
    if (isPlaybackActive && musicFile && playerRef.current) {
      animationFrameId = requestAnimationFrame(animate);
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaybackActive, musicFile]);

  // --- Playback Simulation ---
  // If no music file is loaded, simulate playback by incrementing currentTime
  useEffect(() => {
    let intervalId;
    if (isPlaybackActive && !musicFile) {
      intervalId = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + 0.1; // increase by 0.1 sec every 100ms
          if (newTime >= duration) {
            clearInterval(intervalId);
            setIsPlaybackActive(false);
            setIsPlaying(false);
            return duration;
          }
          return newTime;
        });
      }, 100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaybackActive, musicFile, duration]);
  // --- End Playback Simulation ---

  return (
    <div style={{ display: "flex" }}>
      {/* Left Pane – Moves List */}
      <div
        style={{
          width: "300px",
          padding: "10px",
          borderRight: "1px solid #ccc",
          overflowY: "auto"
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
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px"
            }}
          >
            New Move
          </button>
        </div>
        <h3>Moves</h3>
        {jsonData?.moves?.length > 0 ? (
          <ul className="list-unstyled">
            {jsonData.moves.map((move, index) => (
              <li
                key={index}
                className="d-flex align-items-center p-2 mb-2"
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  cursor: "pointer"
                }}
                onDoubleClick={() => {
                  setSelectedMoveIndex(index);
                  setEditedDescription(move.description || "");
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "30px",
                    backgroundColor: move.color,
                    borderRadius: "3px",
                    marginRight: "10px"
                  }}
                ></div>
                <span className="flex-grow-1" style={{ color: "black" }}>
                  {move.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleModify(index)}
                  className="btn btn-outline-secondary d-flex align-items-center"
                  style={{
                    padding: "5px 10px",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    color: "#9CA3AF"
                  }}
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

      {/* Right Pane – Editing UI and Floor Map */}
      <div style={{ flex: 1, padding: "20px" }}>
        <div>
          <h2>{jsonData.routineName}</h2>
          <div
            style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
          >
            <div style={{ flex: 2 }}>
              <h4>Position on Floor</h4>
              <div
                className="border rounded"
                style={{
                  height: "400px",
                  padding: "0",
                  margin: "0",
                  border: "none",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <ChoreographyMap
                  // When playback is active, pass an empty moveList so that only the live marker is shown.
                  moveList={isPlaybackActive ? [] : jsonData?.moves}
                  isEditable={false}
                  connectorOffsets={jsonData.connectorOffsets || []}
                  liveMarker={liveMarker}
                  onMoveDoubleClick={(index) => {
                    setSelectedMoveIndex(index);
                    setEditedDescription(jsonData.moves[index].description || "");
                  }}
                />
              </div>
              <div className="mt-2">
                <p>
                  Current position: X: {Math.round(position.x)}, Y:{" "}
                  {Math.round(position.y)}
                </p>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h4>Current Move Details</h4>
              {currentEffectiveMove ? (
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "8px",
                    border: `2px solid ${
                      currentEffectiveMove.color || "#ddd"
                    }`,
                    height: "400px",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <h5
                    style={{
                      marginBottom: "10px",
                      color: currentEffectiveMove.color
                    }}
                  >
                    {currentEffectiveMove.name}
                  </h5>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      marginBottom: "10px",
                      resize: "none"
                    }}
                    placeholder="Enter move description..."
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={handleSaveDescription}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px"
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "8px",
                    border: "2px solid #ddd",
                    height: "400px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <p>No move selected at current time</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Timeline Section */}
          <div style={{ 
            marginTop: "30px", 
            marginBottom: "30px", 
            padding: "20px", 
            backgroundColor: "#1e1e24",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}>
            <h4 style={{ color: "#fff", marginBottom: "20px" }}>Routine Timeline</h4>
            
            {/* Time markers bar */}
            <div style={{ 
              position: "relative", 
              height: "20px", 
              marginBottom: "10px",
              color: "#aaa",
              fontSize: "12px",
              display: "flex",
              justifyContent: "space-between"
            }}>
              {Array.from({ length: Math.min(5, Math.ceil(duration / 10) + 1) }).map((_, i) => {
                const markerTime = Math.floor(duration * (i / 4));
                return (
                  <div key={`marker-${i}`} style={{ 
                    textAlign: "center",
                    minWidth: "40px",
                  }}>
                    {`${Math.floor(markerTime / 60)}:${String(Math.floor(markerTime % 60)).padStart(2, '0')}`}
                  </div>
                );
              })}
            </div>
            
            {/* Move segments container */}
            <div style={{ 
              position: "relative", 
              height: "40px", 
              marginBottom: "15px"
            }}>
              {jsonData?.moves && jsonData.moves.map((move, index) => {
                const nextMove = jsonData.moves[index + 1];
                const moveEndTime = move.startTime + (move.waitTime || 0);
                const nextMoveStartTime = nextMove ? nextMove.startTime : duration;
                
                // Position and width for the segments
                const leftPos = (move.startTime / duration) * 100;
                const waitWidth = ((move.waitTime || 0) / duration) * 100;
                const totalWidth = ((nextMoveStartTime - move.startTime) / duration) * 100;
                const transitionWidth = totalWidth - waitWidth;
                
                return (
                  <React.Fragment key={`move-${index}`}>
                    {/* Wait time segment - solid color */}
                    {move.waitTime > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          left: `${leftPos}%`,
                          width: `${waitWidth}%`,
                          height: "35px",
                          backgroundColor: move.color || "#666",
                          borderRadius: waitWidth === totalWidth ? "4px" : "4px 0 0 4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: "bold",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                          zIndex: currentEffectiveMove === move ? 10 : 1,
                          border: currentEffectiveMove === move ? "2px solid #fff" : "none"
                        }}
                        onClick={() => {
                          setCurrentTime(move.startTime);
                          setSelectedMoveIndex(index);
                          if (playerRef.current) {
                            playerRef.current.currentTime = move.startTime;
                          }
                        }}
                        title={`${move.name} - Wait time: ${move.waitTime}s`}
                      >
                        {move.name}
                      </div>
                    )}
                    
                    {/* Transition segment - pattern or different color */}
                    {transitionWidth > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          left: `${leftPos + waitWidth}%`,
                          width: `${transitionWidth}%`,
                          height: "35px",
                          backgroundColor: move.waitTime > 0 ? adjustColor(move.color || "#666", 0.7) : (move.color || "#666"),
                          backgroundImage: move.waitTime > 0 ? `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 10px,
                            rgba(0,0,0,0.1) 10px,
                            rgba(0,0,0,0.1) 20px
                          )` : "none",
                          borderRadius: waitWidth > 0 ? "0 4px 4px 0" : "4px",
                          cursor: "pointer",
                          zIndex: currentEffectiveMove === move ? 10 : 1,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: "bold",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          border: currentEffectiveMove === move ? "2px solid #fff" : "none"
                        }}
                        onClick={() => {
                          const clickTime = move.waitTime > 0 ? moveEndTime : move.startTime;
                          setCurrentTime(clickTime);
                          setSelectedMoveIndex(index);
                          if (playerRef.current) {
                            playerRef.current.currentTime = clickTime;
                          }
                        }}
                        title={`${move.name}${move.waitTime > 0 ? ` - Transition after ${move.waitTime}s wait` : ''}`}
                      >
                        {move.waitTime > 0 ? "" : move.name}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              
              {/* Playhead */}
              <div style={{
                position: "absolute",
                left: `${(currentTime / duration) * 100}%`,
                top: "0",
                height: "35px",
                width: "2px",
                backgroundColor: "#ff5722",
                zIndex: 15
              }}>
                <div style={{
                  position: "absolute",
                  bottom: "-6px",
                  left: "50%",
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#ff5722",
                  borderRadius: "50%",
                  transform: "translateX(-50%)"
                }}></div>
              </div>
            </div>
            
            {/* Slider control */}
            <div style={{ position: "relative" }}>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.01"
                value={currentTime}
                onChange={(e) => {
                  const newTime = parseFloat(e.target.value);
                  setCurrentTime(newTime);
                  if (playerRef.current) {
                    playerRef.current.currentTime = newTime;
                  }
                }}
                style={{
                  width: "100%",
                  height: "10px",
                  appearance: "none",
                  backgroundColor: "#333",
                  borderRadius: "5px",
                  outline: "none",
                  opacity: "1",
                  transition: "opacity .2s",
                  accentColor: "#007bff"
                }}
              />
              <div style={{ 
                marginTop: "8px", 
                display: "flex", 
                justifyContent: "space-between", 
                color: "#aaa",
                fontSize: "12px"
              }}>
                <span>0:00</span>
                <span style={{ color: "#fff" }}>
                  Current: {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}.
                  {String(Math.floor((currentTime % 1) * 100)).padStart(2, '0')}
                </span>
                <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              className="botContentButton"
              type="button"
              onClick={handleBack}
            >
              Back
            </button>
            <button
              className="botContentButton"
              type="button"
              onClick={handleSettings}
            >
              Settings
            </button>
          </div>

          {/* Playback Control Buttons */}
          <div style={{ marginTop: "20px" }}>
            <button
              className="botContentButton"
              onClick={handlePlay}
              disabled={isPlaying}
              style={{ marginRight: "8px" }}
            >
              <img src="./images/play.png" alt="Play" style={{ width: "30px", height: "30px" }} />
            </button>
            <button
              className="botContentButton"
              onClick={handleStop}
              disabled={!isPlaybackActive}
              style={{ marginRight: "8px" }}
            >
              <img src="./images/stop.png" alt="Stop" style={{ width: "30px", height: "30px" }} />
            </button>
            <button
              className="botContentButton"
              onClick={handleEnd}
              disabled={!isPlaybackActive}
            >
              <img src="./images/end.png" alt="End" style={{ width: "30px", height: "30px" }} />
            </button>
          </div>

          {/* Audio element for music playback */}
          {musicFile && (
            <audio
              ref={playerRef}
              src={musicFile}
              onLoadedMetadata={() => {
                if (playerRef.current?.duration) {
                  setMusicDuration(playerRef.current.duration);
                }
              }}
              style={{ display: "none" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Overview;