import React, { useState } from "react";

function RequirementsSection({ jsonData, setJsonData }) {
  const [editing, setEditing] = useState(null);
  const [editFields, setEditFields] = useState({ name: "", needed: 1, description: "" });
  const [newReq, setNewReq] = useState({ name: "", needed: 1, description: "" });

  // get requirement descriptions (stored in moves)
  const getDescription = (reqName) => {
    const move = jsonData.moves.find(
      m => m.requirements_filled?.some(r => r.requirement_name === reqName) && m.description
    );
    if (editing === reqName) return editFields.description;
    if (jsonData.requirementsDescriptions && jsonData.requirementsDescriptions[reqName])
      return jsonData.requirementsDescriptions[reqName];
    return move?.description || "";
  };


  const getDone = (reqName) =>
    jsonData.moves.filter(
      m => m.requirements_filled?.some(r => r.requirement_name === reqName)
    ).length;


  const handleSaveEdit = (oldName) => {
    const newRequirements = { ...jsonData.requirements };
    // If name changed, delete old and add new
    if (oldName !== editFields.name) {
      delete newRequirements[oldName];
    }
    newRequirements[editFields.name] = editFields.needed;

    const newMoves = jsonData.moves.map(move => ({
      ...move,
      requirements_filled: move.requirements_filled
        ? move.requirements_filled.map(r =>
          r.requirement_name === oldName
            ? { ...r, requirement_name: editFields.name }
            : r
        )
        : [],
    }));

    const newDescriptions = { ...(jsonData.requirementsDescriptions || {}) };
    newDescriptions[editFields.name] = editFields.description;

    const updatedJson = {
      ...jsonData,
      requirements: newRequirements,
      moves: newMoves,
      requirementsDescriptions: newDescriptions,
    };
    sessionStorage.setItem("uploadedJson", JSON.stringify(updatedJson));
    setJsonData(updatedJson);
    setEditing(null);
  };

  const handleAdd = () => {
    if (!newReq.name.trim()) return;
    if (jsonData.requirements[newReq.name]) return; // Prevent duplicate
    const newRequirements = { ...jsonData.requirements, [newReq.name]: newReq.needed };
    const newDescriptions = { ...(jsonData.requirementsDescriptions || {}) };
    newDescriptions[newReq.name] = newReq.description;
    const updatedJson = {
      ...jsonData,
      requirements: newRequirements,
      requirementsDescriptions: newDescriptions,
    };
    sessionStorage.setItem("uploadedJson", JSON.stringify(updatedJson));
    setJsonData(updatedJson);
    setNewReq({ name: "", needed: 1, description: "" });
  };

  const handleDelete = (reqName) => {
    const newRequirements = { ...jsonData.requirements };
    delete newRequirements[reqName];
    const newDescriptions = { ...(jsonData.requirementsDescriptions || {}) };
    delete newDescriptions[reqName];
    const newMoves = jsonData.moves.map(move => ({
      ...move,
      requirements_filled: move.requirements_filled
        ? move.requirements_filled.filter(r => r.requirement_name !== reqName)
        : [],
    }));
    const updatedJson = {
      ...jsonData,
      requirements: newRequirements,
      requirementsDescriptions: newDescriptions,
      moves: newMoves,
    };
    sessionStorage.setItem("uploadedJson", JSON.stringify(updatedJson));
    setJsonData(updatedJson);
  };

  return (
    <div style={{ background: "transparent" }}>
      <ul className="list-unstyled">
        {Object.entries(jsonData.requirements).map(([reqName, needed]) => {
          const done = getDone(reqName);
          const isEditing = editing === reqName;
          return (
            <li key={reqName} className="mb-1">
              <div
                className="d-flex align-items-center"
                style={{
                  background: "transparent",
                  minHeight: "36px",
                  gap: "0.5em",
                  padding: "0.2em 0"
                }}
              >
                <span
                  style={{
                    fontSize: "30px",
                    color: done >= needed ? "green" : "#888",
                    marginRight: 10,
                  }}
                >
                  •
                </span>
                {isEditing ? (
                  <>
                    <input
                      className="form-control me-2"
                      style={{ width: 120, display: "inline-block" }}
                      value={editFields.name}
                      onChange={e => setEditFields({ ...editFields, name: e.target.value })}
                    />
                    <input
                      type="number"
                      className="form-control me-2"
                      style={{ width: 70, display: "inline-block" }}
                      value={editFields.needed}
                      min={1}
                      onChange={e => setEditFields({ ...editFields, needed: parseInt(e.target.value) || 1 })}
                    />
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleSaveEdit(reqName)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(reqName)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <span className="mx-2" style={{ minWidth: 40 }}>
                      {done} / {needed}
                    </span>
                    <strong style={{ minWidth: 120, color: "black" }}>{reqName}</strong>
                    <div style={{ flex: 1 }} />
                    <button
                      className="btn btn-outline-primary btn-sm"
                      style={{ marginLeft: "auto" }}
                      onClick={() => {
                        setEditing(reqName);
                        setEditFields({
                          name: reqName,
                          needed,
                          description: getDescription(reqName),
                        });
                      }}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
              <div className="ms-4 mt-1" style={{ background: "transparent" }}>
                {isEditing ? (
                  <textarea
                    className="form-control"
                    rows={2}
                    value={editFields.description}
                    onChange={e => setEditFields({ ...editFields, description: e.target.value })}
                    placeholder="Requirement description"
                  />
                ) : (
                  <span className="text-muted">{getDescription(reqName) || <i>No description</i>}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <hr />
      <div style={{ background: "transparent" }}>
        <h6>Add New Requirement</h6>
        <div className="d-flex align-items-center mb-2" style={{ background: "transparent" }}>
          <input
            className="form-control me-2"
            style={{ width: 120 }}
            placeholder="Name"
            value={newReq.name}
            onChange={e => setNewReq({ ...newReq, name: e.target.value })}
          />
          <input
            type="number"
            className="form-control me-2"
            style={{ width: 70 }}
            min={1}
            value={newReq.needed}
            onChange={e => setNewReq({ ...newReq, needed: parseInt(e.target.value) || 1 })}
          />
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            Add
          </button>
        </div>
        <textarea
          className="form-control"
          rows={2}
          placeholder="Requirement description"
          value={newReq.description}
          onChange={e => setNewReq({ ...newReq, description: e.target.value })}
        />
      </div>
    </div>
  );
}

export default RequirementsSection;