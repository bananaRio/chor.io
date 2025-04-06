import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChoreographyMap from "../components/ChoreographyMap";
import './Page.css';

function Modify() {
  const navigate = useNavigate();
  const { id } = useParams();

  // overall routine data loaded from session storage
  const [routineData, setRoutineData] = useState(null);

  // fields for the move being created or edited
  const [position, setPosition] = useState({ x: 400, y: 200});
  const [time, setTime] = useState(0);
  const [name, setName] = useState("New Move");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#000000");
  const [checkedRequirements, setCheckedRequirements] = useState({});
  const [userTimeInput, setUserTimeInput] = useState("00:00");

  // state for connector offsets.
  const [connectorOffsets, setConnectorOffsets] = useState([]);

  useEffect(() => {
    setUserTimeInput(
      `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`
    );
  }, [time]);

  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem("uploadedJson")) || { moves: [] };
    setRoutineData(storedData);
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
      const checks = {};
      move.requirements_filled.forEach((req) => {
        checks[req.requirement_name] = true;
      });
      setCheckedRequirements(checks);
    }
  }, [id]);

  const handleDelete = () => {
    if (routineData) {
      const updatedMoves = routineData.moves.filter((_, index) => index !== parseInt(id));
      sessionStorage.setItem("uploadedJson", JSON.stringify({ ...routineData, moves: updatedMoves }));
      navigate("/Overview");
    }
  };

  const handleSave = () => {
    if (routineData) {
      const updatedMoves = [...routineData.moves];
      if (id === "new" && name === "New Move") {
        alert("Error: Move name must not be 'New Move'.");
        return;
      }
      // build the move object.
      const newMove = {
        name,
        startTime: time,
        positions: position,
        description,
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
        connectorOffsets: connectorOffsets  // save connector adjustments.
      };
      sessionStorage.setItem("uploadedJson", JSON.stringify(updatedData));
      navigate("/Overview");
    }
  };

  // this is called when dragging the editable move marker.
  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
  };

  // exclude the currently edited move from the saved moves.
  let savedMoves = routineData ? [...routineData.moves] : [];
  if (id !== "new") {
    savedMoves.splice(parseInt(id), 1);
  }

  // this is the single editable move marker.
  const editableMove = {
    x: position.x,
    y: position.y,
    id: name,
    color,
    note: name
  };

  return (
    <div className="container p-4">
      <header className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
        <h4>Modify</h4>
        <div>
          <button className="btn btn-secondary me-2" onClick={() => navigate("/Overview")}>
            Discard Changes
          </button>
          <button type="button" onClick={handleSave} style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", marginRight: "5px" }}>
            <img src="./images/check.png" alt="Save" style={{ width: "30px", height: "30px" }} />
          </button>
          {id !== "new" && (
            <button type="button" onClick={handleDelete} style={{ backgroundColor: "transparent", border: "none", cursor: "pointer" }}>
              <img src="./images/trash.png" alt="Delete" style={{ width: "30px", height: "30px" }} />
            </button>
          )}
        </div>
      </header>

      <div className="row mt-4">
        <div className="col-md-6">
          {/* Form fields for move details */}
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Text</label>
            <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Color</label>
            <input type="color" className="form-control form-control-color" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div className="mt-4 p-3 bg-light rounded">
            <h4>Available Requirements</h4>
            {routineData?.requirements &&
              Object.keys(routineData.requirements).map((requirement, index) => (
                <div key={index} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`requirement-${index}`}
                    checked={checkedRequirements[requirement] || false}
                    onChange={() => {
                      setCheckedRequirements((prev) => ({
                        ...prev,
                        [requirement]: !prev[requirement],
                      }));
                    }}
                  />
                  <label className="form-check-label" htmlFor={`requirement-${index}`}>
                    {requirement}
                  </label>
                </div>
              ))}
          </div>
        </div>
        <div className="col-md-6">
          <ChoreographyMap
            moveList={savedMoves}
            editableMove={editableMove}
            onEditableMoveChange={handlePositionChange}
            isEditable={true}
            connectorOffsets={connectorOffsets}
            onConnectorOffsetsChange={setConnectorOffsets}
          />
          <div className="mt-2">
            <p>Current position: X: {Math.round(position.x)}, Y: {Math.round(position.y)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-light rounded">
        <h4>Time Selection</h4>
        <div className="d-flex align-items-center">
          <input type="range" className="form-range custom-slider flex-grow-1" min="0" max="180" value={time} onChange={(e) => setTime(Number(e.target.value))} />
          <input type="text" className="form-control ms-3 text-center time-input" style={{ width: "60px" }} value={userTimeInput} onChange={(e) => setUserTimeInput(e.target.value)} onBlur={() => {
            const [mm, ss] = userTimeInput.split(":");
            const minutes = parseInt(mm, 10);
            const seconds = parseInt(ss, 10);
            if (!isNaN(minutes) && !isNaN(seconds)) {
              const totalSeconds = minutes * 60 + seconds;
              if (totalSeconds >= 0 && totalSeconds <= 180) {
                setTime(totalSeconds);
              }
            }
            setUserTimeInput(`${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`);
          }} />
        </div>
      </div>
    </div>
  );
}

export default Modify;