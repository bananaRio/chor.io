import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChoreographyMap from "../components/ChoreographyMap";
import Timeline from "../components/Timeline";
import './Page.css';

function Modify() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [routineData, setRoutineData] = useState(JSON.parse(sessionStorage.getItem("uploadedJson")));
  const [waitTime, setWaitTime] = useState(0);
  const [position, setPosition] = useState({ x: routineData.dimensions.x / 2, y: routineData.dimensions.y / 2 });
  const [time, setTime] = useState(0);
  const [name, setName] = useState("New Move");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#000000");
  const [checkedRequirements, setCheckedRequirements] = useState({});
  const [connectorOffsets, setConnectorOffsets] = useState([]);
  const [musicFile, setMusicFile] = useState(null);
  const [musicDuration, setMusicDuration] = useState(routineData.defaultLength); // default fallback
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const syncOnFocus = () => {
      const latestJson = JSON.parse(sessionStorage.getItem("uploadedJson"));
      setRoutineData(latestJson);
    };
  
    window.addEventListener("focus", syncOnFocus);
    return () => window.removeEventListener("focus", syncOnFocus);
  }, []);
  

  useEffect(() => {
    let animationFrameId;
    
    const animate = () => {
      if (playerRef.current && !playerRef.current.paused) {
        const currentTime = playerRef.current.currentTime;
        setTime(currentTime);
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };
    
    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem("uploadedJson")) || { moves: [] };
    setRoutineData(storedData);

    if (storedData.music_source_path) {
      setMusicFile(storedData.music_source_path);
    }

    if (storedData.connectorOffsets) {
      setConnectorOffsets(storedData.connectorOffsets);
    }

    if (id !== "new" && storedData.moves[id]) {
      const move = storedData.moves[id];
      setName(move.name);
      setDescription(move.description);
      setTime(move.startTime);
      setPosition(move.positions);
      setColor(move.color);
      setWaitTime(move.waitTime || 0);

      const checks = {};
      move.requirements_filled.forEach((req) => {
        checks[req.requirement_name] = true;
      });
      setCheckedRequirements(checks);
    }
  }, [id]);

  const handleDelete = () => {
    if (!routineData) return;
    const updatedMoves = routineData.moves.filter((_, index) => index !== parseInt(id));
    sessionStorage.setItem("uploadedJson", JSON.stringify({ ...routineData, moves: updatedMoves }));
    navigate("/Overview");
  };

  const handleSave = () => {
    if (!routineData) return;

    const updatedMoves = [...routineData.moves];
    if (id === "new" && name === "New Move") {
      alert("Error: Move name must not be 'New Move'.");
      return;
    }

    // Check for startTime conflict
    const conflictingMove = routineData.moves.find((move, idx) => {
      const isSameTime = move.startTime === time;
      const isDifferentMove = id === "new" || parseInt(id) !== idx;
      return isSameTime && isDifferentMove;
    });

    if (conflictingMove) {
      alert(
        `Error: Another move (${conflictingMove.name}) already starts at ${time.toFixed(
          2
        )} seconds. Please choose a different time.`
      );
      return;
    }

    const newMove = {
      name,
      startTime: time,
      positions: position,
      description,
      waitTime: waitTime,
      requirements_filled: Object.keys(checkedRequirements)
        .filter((key) => checkedRequirements[key])
        .map((key) => ({ requirement_name: key })),
      color
    };

    if (id === "new") {
      updatedMoves.push(newMove);
    } else {
      updatedMoves[parseInt(id)] = newMove;
    }

    updatedMoves.sort((a, b) => a.startTime - b.startTime);
    const updatedData = {
      ...routineData,
      moves: updatedMoves,
      connectorOffsets
    };
    sessionStorage.setItem("uploadedJson", JSON.stringify(updatedData));
    navigate("/Overview");
  };


  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
  };

  const currentMove = {
    name,
    color,
    startTime: time
  };

  let savedMoves = routineData ? [...routineData.moves] : [];
  if (id !== "new") savedMoves.splice(parseInt(id), 1);

  // const handlePlay = () => {
  //   if (isPlaying) return;
    
  //   if (playerRef.current) {
  //     playerRef.current.currentTime = time;
  //     playerRef.current.play()
  //       .then(() => {
  //         setIsPlaying(true);
  //       })
  //       .catch(err => console.error("Audio play failed:", err));
  //   } else {
  //     setIsPlaying(true);
  //   }
  // };
  
  // Pause handler
  // const handlePause = () => {
  //   if (playerRef.current) {
  //     playerRef.current.pause();
  //   }
  //   setIsPlaying(false);
  // };

  return (
    <div className="container p-4">
      <header className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
        <h4>Modify</h4>
        <div style={{background:"transparent"}}>
          <button className="btn btn-secondary me-2" onClick={() => navigate("/Overview")}>
            Discard Changes
          </button>
          <button
            className="btn btn-primary me-2"
            onClick={handleSave}
            style={{border: "none", cursor: "pointer"}}
          >
            Save
            {/*<img src="./images/check.png" alt="Save" style={{ width: "30px", height: "30px" }} />*/}
          </button>
          {id !== "new" && (
            <button
              className="btn btn-danger me-2"
              onClick={handleDelete}
              style={{ border: "none", cursor: "pointer"}}
            >
              Delete
              {/*<img src="./images/trash.png" alt="Delete" style={{ width: "30px", height: "30px" }} />*/}
            </button>
          )}
        </div>
      </header>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Text</label>
            <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Color</label>
            <input
              type="color"
              className="form-control form-control-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <div className="mb-3">
             <label className="form-label">Wait Time (seconds)</label>
             <input
               type="number"
               className="form-control"
               min="0"
               step="0.1"
               value={waitTime}
               onChange={(e) => setWaitTime(parseFloat(e.target.value) || 0)}
               placeholder="How long to hold this position"
             />
             <small className="text-muted">Time the dancer stays in this position before moving to the next one</small>
           </div>
          <div className="mt-4 p-3 bg-light rounded" style={{ background: "transparent" }}>
            <h4>Routine Requirements Fulfilled</h4>
            {routineData?.requirements &&
              Object.keys(routineData.requirements).map((requirement, index) => (
                <div key={index} className="form-check" style={{ background: "transparent", color: "black" }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`requirement-${index}`}
                    checked={checkedRequirements[requirement] || false}
                    onChange={() => {
                      setCheckedRequirements((prev) => ({
                        ...prev,
                        [requirement]: !prev[requirement]
                      }));
                    }}
                  />
                  <label className="form-check-label" htmlFor={`requirement-${index}`}>
                    <b>{requirement}</b> -- {routineData.requirementsDescriptions[requirement]}
                  </label>
                </div>
              ))}
          </div>
        </div>

        <div className="col-md-6">
          <ChoreographyMap
            moveList={savedMoves}
            editableMove={{
              x: position.x,
              y: position.y,
              id: name,
              color,
              note: name
            }}
            onEditableMoveChange={handlePositionChange}
            isEditable={true}
            connectorOffsets={connectorOffsets}
            onConnectorOffsetsChange={setConnectorOffsets}
            stageWidth={routineData.dimensions.x}
            stageHeight={routineData.dimensions.y}
          />
          <div className="mt-2">
            <p>Current position: X: {Math.round(position.x)}, Y: {Math.round(position.y)}</p>
          </div>
        </div>
      </div>

      {/* White box for slider only */}
      <div className="mt-4 p-3 bg-light rounded">
        <h4>Time Selection</h4>
        <Timeline
          musicDuration={musicDuration}
          currentTime={time}
          moves={routineData?.moves || []}  // Pass just the moves array
          currentEffectiveMove={currentMove}  // Pass the current move being edited
          setCurrentTime={setTime}
          setSelectedMoveIndex={() => {}}  // Empty function since we don't need move selection in modify mode
          playerRef={playerRef}
        />
        <br/>
        <p style={{ color: "black" }}>Current Time: {time.toFixed(2)} sec</p>
      </div>

      
      {/* External controls */}
      {/* <div className="mt-3">
        
        <button
          className="btn"
          onClick={handlePlay}
          disabled={isPlaying}
          style={{ marginRight: "8px" }}
        >
          Play
        </button>
        <button
          onClick={handlePause}
          disabled={!isPlaying}
        >
          Pause
        </button>
      </div> */}

      {/* Hidden audio element */}
      {musicFile && (
        <audio
          ref={playerRef}
          src={musicFile}
          style={{ display: "none" }}
          onLoadedMetadata={() => {
            if (playerRef.current?.duration) {
              setMusicDuration(playerRef.current.duration);
            }
          }}
        />
      )}
    </div>
  );
}

export default Modify;
