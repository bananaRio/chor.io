import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChoreographyMap from "../components/ChoreographyMap";
import Timeline from "../components/Timeline";
import "./Page.css";

function Overview() {
  const jsonData = JSON.parse(sessionStorage.getItem("uploadedJson"));
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const lastMoveRef = useRef(null);

  const [musicFile, setMusicFile] = useState(null);
  const [musicDuration, setMusicDuration] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // New flag to indicate live “playback mode”
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState(null);

  const handleBack = () => navigate("/");
  const handleSettings = () => navigate("/Settings", { state: { new: false } });
  const handleModify = (moveId) => navigate(`/Modify/${moveId}`);
  const handleNewMove = () => navigate("/Modify/new");

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
  // Computes the live marker’s position by interpolating along the path between moves.
  const computeLiveMarker = () => {
    if (!jsonData?.moves || jsonData.moves.length === 0) return null;
    // Sort moves by startTime
    const moves = [...jsonData.moves].sort((a, b) => a.startTime - b.startTime);
    let startMove = moves[0];
    let nextMove = null;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].startTime <= currentTime) {
        startMove = moves[i];
        nextMove = moves[i + 1];
      } else {
        break;
      }
    }
    // If no subsequent move, position the marker at the last move's coordinates.
    if (!nextMove) {
      return {
        x: startMove.positions ? startMove.positions.x : startMove.x,
        y: startMove.positions ? startMove.positions.y : startMove.y,
        color: startMove.color
      };
    } else {
      const t = (currentTime - startMove.startTime) / (nextMove.startTime - startMove.startTime);
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
    if (playerRef.current) {
      playerRef.current.currentTime = currentTime;
      playerRef.current.play();
    }
    setIsPlaying(true);
    setIsPlaybackActive(true);
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

          <Timeline
            duration={duration}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            currentMove={currentEffectiveMove}
            playerRef={playerRef}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />

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
              onClick={handlePlay}
              disabled={isPlaying}
              style={{ marginRight: "8px" }}
            >
              Play
            </button>
            <button
              onClick={handleStop}
              disabled={!isPlaybackActive}
              style={{ marginRight: "8px" }}
            >
              Stop
            </button>
            <button onClick={handleEnd} disabled={!isPlaybackActive}>
              End
            </button>
          </div>

          {musicFile && (
            <div style={{ display: "none" }}>
              <audio
                ref={playerRef}
                src={musicFile}
                onLoadedMetadata={() => {
                  if (playerRef.current?.duration) {
                    setMusicDuration(playerRef.current.duration);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Overview;