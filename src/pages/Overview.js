import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChoreographyMap from "../components/ChoreographyMap";
import Timeline from "../components/Timeline";
import "./Page.css";
import RequirementsSection from '../components/RequirementsSection';

function Overview() {
  const [jsonData, setJsonData] = useState(
    JSON.parse(sessionStorage.getItem("uploadedJson")) // Updates on focus, so it's ok
  );

  const navigate = useNavigate();
  const playerRef = useRef(null);
  const lastMoveRef = useRef(null);

  const [musicFile, setMusicFile] = useState(null);
  const [musicDuration, setMusicDuration] = useState(jsonData.defaultLength);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [selectedMoveIndex, setSelectedMoveIndex] = useState(null);

  const [isPlaybackActive, setIsPlaybackActive] = useState(false);

  const handleBack = () => navigate("/chor.io");
  const handleSettings = () => navigate("/chor.io/settings", { state: { new: false } });
  const handleReview = () => navigate("/chor.io/review", { state: { new: false } });

  const handleModify = (moveId) => navigate(`/chor.io/modify/${moveId}`);
  const handleNewMove = () => navigate("/chor.io/modify/new");
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => {
    const syncOnFocus = () => {
      const latestJson = JSON.parse(sessionStorage.getItem("uploadedJson"));
      setJsonData(latestJson);
    };

    window.addEventListener("focus", syncOnFocus);
    return () => window.removeEventListener("focus", syncOnFocus);
  }, []);

  useEffect(() => {
    if (!!musicFile) {
      setMusicDuration(jsonData.defaultLength);
    }
  }, [musicFile, jsonData]);

  useEffect(() => {
    if (jsonData?.music_source_path) {
      setMusicFile(jsonData.music_source_path);
    }
  }, [jsonData]);

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
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
    }, 1000);

  };

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

  const handlePlay = () => {
    setIsPlaying(true);
    setIsPlaybackActive(true);

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
    setCurrentTime(0);
  };

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

  useEffect(() => {
    let intervalId;
    if (isPlaybackActive && !musicFile) {
      intervalId = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + 0.1; // increase by 0.1 sec every 100ms
          if (newTime >= musicDuration) {
            clearInterval(intervalId);
            setIsPlaybackActive(false);
            setIsPlaying(false);
            return musicDuration;
          }
          return newTime;
        });
      }, 100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaybackActive, musicFile, musicDuration]);

  return (
    <div style={{ display: "flex" }}>
      {justSaved && (
        <div
          className="alert alert-success position-fixed"
          style={{
            bottom: '20px',
            right: '20px',
            margin: 0,
            zIndex: 1050
          }}
        >
          Changes saved!
        </div>
      )}
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
                  <img src="/chor.io/images/pencil.png" alt="Modify" width="21px" height="21px" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No moves available</p>
        )}
      </div>

      <div style={{ flex: 1, padding: "40px" }}>
        <div className="row">
          <div className="col">
            <h2>{jsonData.routineName}</h2>
          </div>
          <button className="btn btn-secondary" type="button" onClick={handleSettings}>
            Settings
          </button>
          <button className="btn btn-secondary" type="button" onClick={handleBack}>
            Load or Export File
          </button>
          <button className="btn btn-primary" type="button" onClick={handleReview}>
            Review
          </button>
        </div>

        <br />
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={{ flex: 2 }}>
            <h4>Position on Floor</h4>
            <div
              style={{
                height: "400px", // ??? Alt is (jsonData.dimensions.y.toString()) + "px", or auto
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChoreographyMap
                duration={musicDuration}
                moveList={isPlaybackActive ? [] : jsonData?.moves}
                isEditable={false}
                connectorOffsets={jsonData.connectorOffsets || []}
                liveMarker={liveMarker}
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
                <button className="btn btn-success" onClick={handleSaveDescription}
                  style={{
                    backgroundColor: justSaved ? "green" : "blue",
                    borderColor: justSaved ? "green" : "blue"
                  }}>
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
          musicDuration={musicDuration}
          currentTime={currentTime}
          moves={jsonData?.moves}
          currentEffectiveMove={currentEffectiveMove}
          setCurrentTime={setCurrentTime}
          setSelectedMoveIndex={setSelectedMoveIndex}
          playerRef={playerRef}
        />

        <div style={{ marginTop: "20px" }}>
          <button
            className="btn btn-light"
            onClick={handlePlay}
            disabled={isPlaying}
            style={{ marginRight: "8px" }}
          >
            <img src="/chor.io/images/play.png" alt="Play" style={{ width: "30px", height: "30px" }} />
          </button>
          <button
            className="btn btn-light"
            onClick={handleStop}
            disabled={!isPlaybackActive}
            style={{ marginRight: "8px" }}
          >
            <img src="/chor.io/images/pause.png" alt="Pause" style={{ width: "30px", height: "30px" }} />
          </button>
          <button
            className="btn btn-light"
            onClick={handleEnd}
            disabled={!isPlaybackActive}
          >
            <img src="/chor.io/images/stop.png" alt="Stop" style={{ width: "30px", height: "30px" }} />
          </button>
        </div>

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
  );
}

export default Overview;
