import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Settings() {
    const [routine, setRoutine] = useState(JSON.parse(sessionStorage.getItem('uploadedJson')));

    const [musicFile, setMusicFile] = useState(null);
    const [defaultLength, setDefaultLength] = useState(100);

    const navigate = useNavigate();
    const loc = useLocation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoutine((prev) => ({ ...prev, [name]: value }));
    };

    const handleDimensionChange = (e) => {
        const { name, value } = e.target;
        setRoutine((prev) => ({
            ...prev,
            dimensions: { ...prev.dimensions, [name]: Number(value) },
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileURL = URL.createObjectURL(file);
            setMusicFile(fileURL);
            setRoutine((prev) => ({ ...prev, music_source_path: fileURL }));
        }
    };

    const isValidFileName = (name) => {
        const invalidChars = /[<>:"/\\|?*]/;
        return name && name !== "new routine" && !invalidChars.test(name);
    };

    const handleSaveAndProceed = () => {
        if (!isValidFileName(routine.routineName)) {
            alert("Invalid routine name. Please choose a valid name.");
            return;
        }
        sessionStorage.setItem("uploadedJson", JSON.stringify(routine));
        navigate("/Overview");
    };

    const handleBack = () => {
        const prev = loc.state.new ? "/" : "/Overview";
        navigate(prev);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                {/* Left Pane - Routine Settings */}
                <button className="btn btn-secondary" type="button" onClick={handleBack}>
                    Back
                </button>
                <div style={{ width: "45%" }}>
                    <h2>Routine Settings</h2>
                    <label>Routine Name:<span style={{ color: "red" }}>*</span></label>
                    <input
                        type="text"
                        className="form-control"
                        name="routineName"
                        value={routine.routineName}
                        onChange={handleChange}
                    />

                    <br />
                    <label>Music/Video File: </label>
                    <input
                        type="file"
                        className="form-control"
                        accept="audio/*,video/*"
                        onChange={handleFileUpload}
                    />
                    {musicFile && (
                        <div>
                            <p>Selected File:</p>
                            <audio controls src={musicFile}></audio>
                        </div>
                    )}

                    <br />
                    <label>Dimensions:</label>
                    <br />
                    <label>X: </label>
                    <input
                        type="number"
                        className="form-control d-inline-block w-auto"
                        name="x"
                        value={routine.dimensions.x}
                        onChange={handleDimensionChange}
                    />
                    <label> Y: </label>
                    <input
                        type="number"
                        className="form-control d-inline-block w-auto"
                        name="y"
                        value={routine.dimensions.y}
                        onChange={handleDimensionChange}
                    />
                </div>

                {/* Right Pane - User-wide Settings */}
                <div style={{ width: "45%" }}>
                    <h2>General Settings</h2>
                    <label>Default Routine Length (s): </label> {/* TODO: this doesn't set a global default, but a routine default */}
                    <input
                        type="text"
                        className="form-control"
                        value={defaultLength}
                        onChange={(e) => setDefaultLength(e.target.value)}
                    />
                </div>
            </div>

            {/* Save & Proceed Button */}
            <br />

            <button className="btn btn-primary" type="button" onClick={handleSaveAndProceed}>
                Save & Proceed to Overview
            </button>
        </div>
    );
}

export default Settings;
