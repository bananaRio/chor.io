import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChoreographyMap from "../components/ChoreographyMap";
import Timeline from "../components/Timeline";
import "./Page.css";
import RequirementsSection from '../components/RequirementsSection';

function Overview() {
  const [jsonData, setJsonData] = useState(
    JSON.parse(sessionStorage.getItem("uploadedJson"))
  );

  const navigate = useNavigate();
  const playerRef = useRef(null);
  const lastMoveRef = useRef(null);

  const [musicFile, setMusicFile] = useState(jsonData.defaultLength);
  const [musicDuration, setMusicDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [selectedMoveIndex, setSelectedMoveIndex] = useState(null);

  const handleBack = () => navigate("/");
  const handleSettings = () => navigate("/Settings", { state: { new: false } });
  const handleModify = (moveId) => navigate(`/Modify/${moveId}`);
  const handleNewMove = () => navigate("/Modify/new");

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
          : move.name === currentEffectiveMove.name && move.startTime === currentEffectiveMove.startTime
      ) {
        return { ...move, description: editedDescription };
      }
      return move;
    });

    sessionStorage.setItem(
      "uploadedJson",
      JSON.stringify({ ...jsonData, moves: updatedMoves })
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "300px", padding: "10px", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <div style={{ marginBottom: "20px" }}>
          <button
            className="btn btn-success w-100"
            type="button"
            onClick={handleNewMove}
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
                className="d-flex align-items-center p-2 mb-2 bg-light rounded border"
                style={{ cursor: "pointer" }}
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
                    marginRight: "10px",
                  }}
                ></div>
                <span className="flex-grow-1 text-dark">{move.name}</span>
                <button
                  type="button"
                  onClick={() => handleModify(index)}
                  className="btn btn-outline-secondary btn-sm"
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

      <div style={{ flex: 1, padding: "20px" }}>
        <div>
          <div className="row">
            <div className="col">
              <h2>{jsonData.routineName}</h2>
            </div>
            <button className="btn btn-secondary" type="button" onClick={handleBack}>
              Landing Page
            </button>
            <button className="btn btn-primary" type="button" onClick={handleSettings}>
              Settings
            </button>
          </div>

          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <div style={{ flex: 2 }}>
              <h4>Position on Floor</h4>
              <div
                style={{
                  height: "400px", // ??? Alt is (jsonData.dimensions.y.toString()) + "px",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChoreographyMap
                  duration={musicDuration}
                  moveList={jsonData?.moves}
                  isEditable={false}
                  connectorOffsets={jsonData.connectorOffsets || []}
                  onMoveDoubleClick={(index) => {
                    setSelectedMoveIndex(index);
                    setEditedDescription(jsonData.moves[index].description || "");
                  }}
                  stageWidth={jsonData.dimensions.x}
                  stageHeight={jsonData.dimensions.y}
                />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h4>Current Move Details</h4>
              {currentEffectiveMove ? (
                <div className="bg-light p-3 rounded border">
                  <h5 className="mb-3" style={{ color: currentEffectiveMove.color }}>
                    {currentEffectiveMove.name}
                  </h5>
                  {/* ??? Can we leverage this for the move and routine names too? */}
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="form-control mb-3"
                    placeholder="Enter move description..."
                    rows={3}
                  />
                  <button className="btn btn-success" onClick={handleSaveDescription}>
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="bg-light p-3 rounded border d-flex align-items-center justify-content-center">
                  No move selected at current time
                </div>
              )}
              <br />
              <h4>Routine Requirements</h4>
              <div className="bg-light p-3 rounded border">
                <RequirementsSection jsonData={jsonData} setJsonData={setJsonData} id={"Overview"} />
              </div>
            </div>
          </div>

          <Timeline
            duration={musicDuration}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            currentMove={currentEffectiveMove}
            playerRef={playerRef}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />

          {musicFile && (
            <audio
              ref={playerRef}
              controls
              src={musicFile}
              onLoadedMetadata={() => {
                if (playerRef.current?.duration) {
                  setMusicDuration(playerRef.current.duration); // TODO is it possible to move this to the upload section?
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
