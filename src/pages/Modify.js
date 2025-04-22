import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChoreographyMap from "../components/ChoreographyMap";
import Timeline from "../components/Timeline";
import './Page.css';

function Modify() {
  const navigate = useNavigate();
  const { id } = useParams();

  // routine data
  const [routineData, setRoutineData] = useState(
    JSON.parse(sessionStorage.getItem("uploadedJson"))
  );

  // ref to Name input to measure its vertical position
  const nameInputRef = useRef(null);
  const [mapOffset, setMapOffset] = useState(0);

  // form state
  const [name, setName] = useState("New Move");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#000000");
  
  const [waitTime, setWaitTime] = useState(0);
  const [position, setPosition] = useState({
    x: routineData.dimensions.x / 2,
    y: routineData.dimensions.y / 2,
  });
  const [time, setTime] = useState(0);
  const [checkedRequirements, setCheckedRequirements] = useState({});

  // curve offsets
  const [connectorOffsets, setConnectorOffsets] = useState([]);

  // audio playback
  const [musicFile, setMusicFile] = useState(null);
  const [musicDuration, setMusicDuration] = useState(
    routineData.defaultLength
  );
  const playerRef = useRef(null);

  // sync and initialize on focus / id change
  useEffect(() => {
    const sync = () => {
      const stored = JSON.parse(
        sessionStorage.getItem("uploadedJson")
      ) || { moves: [] };
      setRoutineData(stored);
      if (stored.music_source_path) setMusicFile(stored.music_source_path);
      if (stored.connectorOffsets) setConnectorOffsets(stored.connectorOffsets);
      if (id !== "new" && stored.moves[id]) {
        const mv = stored.moves[id];
        setName(mv.name);
        setDescription(mv.description);
        setColor(mv.color);
        setWaitTime(mv.waitTime || 0);
        setPosition(mv.positions);
        setTime(mv.startTime);
        const chk = {};
        mv.requirements_filled.forEach(r => (chk[r.requirement_name] = true));
        setCheckedRequirements(chk);
      }
    };
    sync();
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, [id]);

  // measure Name input offset for map alignment
  useEffect(() => {
    if (nameInputRef.current) {
      setMapOffset(nameInputRef.current.offsetTop);
    }
  }, []);

  // save move
  const handleSave = () => {
    if (!routineData) return;
    if (id === "new" && name.trim() === "New Move") {
      alert("Error: Move name must not be 'New Move'.");
      return;
    }
    const conflict = routineData.moves.find(
      (m, idx) => m.startTime === time && (id === "new" || idx !== parseInt(id))
    );
    if (conflict) {
      alert(`Error: Another move (${conflict.name}) starts at ${time.toFixed(2)}s.`);
      return;
    }
    const newMv = {
      name,
      description,
      color,
      waitTime,
      positions: position,
      startTime: time,
      requirements_filled: Object.keys(checkedRequirements)
        .filter(r => checkedRequirements[r])
        .map(r => ({ requirement_name: r })),
    };
    const arr = [...routineData.moves];
    if (id === "new") arr.push(newMv);
    else arr[parseInt(id)] = newMv;
    arr.sort((a, b) => a.startTime - b.startTime);
    const updated = { ...routineData, moves: arr, connectorOffsets };
    sessionStorage.setItem("uploadedJson", JSON.stringify(updated));
    navigate("/chor.io/overview");
  };

  // delete move
  const handleDelete = () => {
    if (!routineData || id === "new") return;
    const arr = routineData.moves.filter((_, i) => i !== parseInt(id));
    sessionStorage.setItem(
      "uploadedJson",
      JSON.stringify({ ...routineData, moves: arr })
    );
    navigate("/chor.io/overview");
  };

  // remove current for preview
  const savedMoves = () => {
    const arr = [...(routineData.moves || [])];
    if (id !== "new") arr.splice(parseInt(id), 1);
    return arr;
  };

  const currentMove = { name, color, startTime: time };

  return (
    <div style={{ flex: 1, padding: "40px" }}>
      <div className="row">
        <div className="col">
          <h2>Modify Move</h2>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/chor.io/overview")}>Discard</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
        {id !== "new" && <button className="btn btn-danger" onClick={handleDelete}>Delete</button>}
      </div>

      <div className="row mt-4">
        {/* left: form */}
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              ref={nameInputRef}
              type="text"
              className="form-control"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Color</label>
            <input
              type="color"
              className="form-control form-control-color"
              value={color}
              onChange={e => setColor(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Wait Time (s)</label>
            <input
              type="number"
              className="form-control"
              min={0}
              step={0.1}
              value={waitTime}
              onChange={e => setWaitTime(parseFloat(e.target.value) || 0)}
            />
            <small className="text-muted">How long before next move</small>
          </div>
          <div className="p-3 bg-light rounded mt-4">
            <h5>Requirements</h5>
            {routineData.requirements &&
              Object.keys(routineData.requirements).map((req, idx) => (
                <div key={idx} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`req-${idx}`}
                    checked={checkedRequirements[req] || false}
                    onChange={() =>
                      setCheckedRequirements(prev => ({ ...prev, [req]: !prev[req] }))
                    }
                  />
                  <label className="form-check-label" htmlFor={`req-${idx}`}> 
                    <b>{req}</b>: {routineData.requirementsDescriptions[req]}
                  </label>
                </div>
              ))}
          </div>
        </div>

        {/* right: map */}
        <div className="col-md-6" style={{ marginTop: mapOffset }}>
          <h5>Select Move Start Position</h5>
          <ChoreographyMap
            moveList={savedMoves()}
            editableMove={{ startTime: time, positions: position, color }}
            onEditableMoveChange={setPosition}
            isEditable
            connectorOffsets={connectorOffsets}
            onConnectorOffsetsChange={setConnectorOffsets}
            stageWidth={routineData.dimensions.x}
            stageHeight={routineData.dimensions.y}
          />
          <p style={{ marginTop: '0.5rem' }}>
            Position: X={Math.round(position.x)}, Y={Math.round(position.y)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <h4>Select Time</h4>
        <Timeline
          musicDuration={musicDuration}
          currentTime={time}
          moves={routineData.moves}
          currentEffectiveMove={currentMove}
          setCurrentTime={setTime}
          setSelectedMoveIndex={() => {}}
          playerRef={playerRef}
        />
      </div>

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
