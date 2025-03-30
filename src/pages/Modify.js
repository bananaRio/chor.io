import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "react-bootstrap";

function Modify() {
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [time, setTime] = useState(0);
  const requirements = ["Requirement 1", "Requirement 2", "Requirement 3"];
  const [checkedRequirements, setCheckedRequirements] = useState({});

  let {id} = useParams();
  let entryState = JSON.parse(sessionStorage.getItem("uploadedJson"));

  const handleDelete = () => {
    navigate("/Overview");

    // TODO perform the delete

    sessionStorage.setItem("uploadedJson", JSON.stringify(entryState));
  }
  const handleBack = () => {
    navigate("/Overview");
    // Doing so should autodiscard anything done -- it'll be overwritten on reload
  }
  const handleSave = () => {
    navigate("/Overview");
    sessionStorage.setItem("uploadedJson", JSON.stringify(entryState));
  }

  const handleMapClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPosition({ x, y });
  };

  const handleCheckboxChange = (req) => {
    setCheckedRequirements((prev) => ({
      ...prev,
      [req]: !prev[req],
    }));
  };

  return (
    <div className="container p-4">
      <header className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
        <h1 className="h4">Modify |{id}|</h1>
        <div>
          <button className="btn btn-secondary me-2" onClick={handleBack}>Discard Changes</button>
          <button className="btn btn-primary me-2" onClick={handleSave}>Save</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </header>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" placeholder="Enter name" />
          </div>
          <div className="mb-3">
            <label className="form-label">Text</label>
            <textarea className="form-control" placeholder="Enter description"></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Color</label>
            <input type="color" className="form-control form-control-color" />
          </div>
          <div>
            <label className="form-label">Requirements</label>
            <div>
              {requirements.map((req) => (
                <div key={req} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={!!checkedRequirements[req]}
                    onChange={() => handleCheckboxChange(req)}
                  />
                  <label className="form-check-label">{req}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <Card className="bg-light text-center p-4" onClick={handleMapClick}>
            Click to select a location
            {position && (
              <div
                className="position-absolute bg-danger rounded-circle"
                style={{ width: '10px', height: '10px', left: position.x, top: position.y }}
              ></div>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-4 p-3 bg-light rounded">
        <label className="form-label">Time Selection</label>
        <input 
          type="range" 
          className="form-range" 
          min="0" max="100" 
          value={time} 
          onChange={(e) => setTime(e.target.value)} 
        />
      </div>
    </div>
  );
}

export default Modify;
