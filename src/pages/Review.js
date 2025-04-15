import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChoreographyMap from "../components/ChoreographyMap";
import Timeline from "../components/Timeline";
import "./Page.css";

function Review() {
  const [jsonData, setJsonData] = useState(
    JSON.parse(sessionStorage.getItem("uploadedJson")) // Updates on focus, so it's ok
  );

  const navigate = useNavigate();
  const playerRef = useRef(null);
  const videoRef = useRef(null);
  const lastMoveRef = useRef(null);

  const [musicFile, setMusicFile] = useState(null);
  const [musicDuration, setMusicDuration] = useState(180);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState(null);

  const [isPlaybackActive, setIsPlaybackActive] = useState(false);

  const handleBack = () => navigate("/Overview");
  const handleExport = () => navigate("/", { state: { new: false } });

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
      // setEditedDescription(currentEffectiveMove.description || "");
      lastMoveRef.current = currentEffectiveMove;
    }
  }, [currentEffectiveMove]);

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
      playerRef.current.play().catch(console.error);
    }

    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
      videoRef.current.play().catch(console.error);
    }
  };


  const handleStop = () => {
    if (playerRef.current) playerRef.current.pause();
    if (videoRef.current) videoRef.current.pause();
    setIsPlaying(false);
    setIsPlaybackActive(false);
  };


  const handleEnd = () => {
    if (playerRef.current) playerRef.current.pause();
    if (videoRef.current) videoRef.current.pause();
    setCurrentTime(0);
    setIsPlaying(false);
    setIsPlaybackActive(false);
  };

  const updateTime = (time) => {
    setCurrentTime(time);
    if (playerRef.current) playerRef.current.currentTime = time;
    if (videoRef.current) videoRef.current.currentTime = time;
  };



  useEffect(() => {
    let animationFrameId;
    let lastUpdate = 0;
    const animate = () => {
      if (playerRef.current && !playerRef.current.paused) {
        const now = Date.now();
        if (now - lastUpdate > 100) {  // update every 100ms
          setCurrentTime(playerRef.current.currentTime);
          lastUpdate = now;
        }
        animationFrameId = requestAnimationFrame(animate);
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


      <div style={{ flex: 1, padding: "20px" }}>
        <div>
          <div className="row">
            <div className="col">
              <h2>{jsonData.routineName}</h2>
            </div>
            <button className="btn btn-secondary" type="button" onClick={handleBack}>
              Back
            </button>
            <button className="btn btn-primary" type="button" onClick={handleExport}>
              Export
            </button>
          </div>

          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            {/* Left: Choreography Map */}
            <div style={{ flex: 1.5 }}>
              <h4>Position on Floor</h4>
              <div
                style={{
                  height: "400px",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingLeft: "20px"
                }}
              >
                <ChoreographyMap
                  duration={musicDuration}
                  moveList={isPlaybackActive ? [] : jsonData?.moves}
                  isEditable={false}
                  connectorOffsets={jsonData.connectorOffsets || []}
                  liveMarker={liveMarker}
                  stageWidth={jsonData.dimensions.x}
                  stageHeight={jsonData.dimensions.y}
                />
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <video
                preload="none"
                ref={videoRef}
                style={{
                  width: "108%",
                  height: "225%",
                  objectFit: "cover",
                  borderRadius: "10px",
                  backgroundColor: "#000",
                  marginTop: "40px",
                  marginLeft: "-40px",
                  pointerEvents: "none"
                }}
                onLoadedMetadata={() => {
                  if (playerRef.current?.duration) {
                    setMusicDuration(playerRef.current.duration);
                  }
                }}
                src={musicFile}
              >
              </video>

            </div>
          </div>


          <div style={{
            marginTop: "30px",
            marginBottom: "30px",
            padding: "20px",
            backgroundColor: "#1e1e24",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
          }}>
            <h4 style={{ color: "#fff", marginBottom: "20px" }}>Routine Timeline</h4>

            <Timeline
              musicDuration={musicDuration}
              currentTime={currentTime}
              moves={jsonData?.moves}
              currentEffectiveMove={currentEffectiveMove}
              setCurrentTime={updateTime}
              setSelectedMoveIndex={setSelectedMoveIndex}
              playerRef={playerRef}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              className="botContentButton"
              onClick={handlePlay}
              disabled={isPlaying}
              style={{ marginRight: "8px" }}
            >
              <img src="chor.io/images/play.png" alt="Play" style={{ width: "30px", height: "30px" }} />
            </button>
            <button
              className="botContentButton"
              onClick={handleStop}
              disabled={!isPlaybackActive}
              style={{ marginRight: "8px" }}
            >
              <img src="chor.io/images/pause.png" alt="Pause" style={{ width: "30px", height: "30px" }} />
            </button>
            <button
              className="botContentButton"
              onClick={handleEnd}
              disabled={!isPlaybackActive}
            >
              <img src="chor.io/images/stop.png" alt="Stop" style={{ width: "30px", height: "30px" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Review;
