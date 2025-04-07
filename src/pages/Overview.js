import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChoreographyMap from "../components/ChoreographyMap";
import Timeline from "../components/Timeline";
import './Page.css';

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
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);

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

  useEffect(() => {
    if (jsonData?.music_source_path) {
      setMusicFile(jsonData.music_source_path);
    }
  }, [jsonData]);

  useEffect(() => {
    if (
      currentMove &&
      (!lastMoveRef.current || lastMoveRef.current.name !== currentMove.name || lastMoveRef.current.startTime !== currentMove.startTime)
    ) {
      setEditedDescription(currentMove.description || "");
      lastMoveRef.current = currentMove;
    }
  }, [currentMove]);

  const handleSaveDescription = () => {
    if (!currentMove || !jsonData?.moves) return;

    const updatedMoves = jsonData.moves.map(move => {
      if (move.name === currentMove.name && move.startTime === currentMove.startTime) {
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

  return (
    <div style={{ display: "flex" }}>
      {/* Left Pane */}
      <div style={{ width: "300px", padding: "10px", borderRight: "1px solid #ccc", overflowY: "auto" }}>
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
              fontSize: "16px",
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
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "30px",
                    backgroundColor: move.color,
                    borderRadius: "3px",
                    marginRight: "10px",
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
                  }}
                >
                  <img
                    src="./images/pencil.png"
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

      <div style={{ flex: 1, padding: "20px" }}>
        <div>
          <h2>{jsonData.routineName}</h2>

          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div style={{ flex: 2 }}>
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
                  moveList={jsonData?.moves}
                  isEditable={false}
                  connectorOffsets={jsonData.connectorOffsets || []}
                />
              </div>
              <div className="mt-2">
                <p>
                  Current position: X: {Math.round(position.x)}, Y: {Math.round(position.y)}
                </p>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h4>Current Move Details</h4>
              {currentMove ? (
                <div style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "8px",
                  border: `2px solid ${currentMove.color || "#ddd"}`,
                  height: "400px",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <h5 style={{ marginBottom: "10px", color: currentMove.color }}>
                    {currentMove.name}
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
                <div style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "2px solid #ddd",
                  height: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <p>No move selected at current time</p>
                </div>
              )}
            </div>
          </div>

          <Timeline
            duration={duration}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            currentMove={currentMove}
            playerRef={playerRef}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />

          <div style={{ marginTop: "20px" }}>
            <button className="botContentButton" type="button" onClick={handleBack}>
              Back
            </button>
            <button className="botContentButton" type="button" onClick={handleSettings}>
              Settings
            </button>
          </div>

          {musicFile && (
            <div style={{ display: "none" }}>
              <audio
                ref={playerRef}
                controls
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