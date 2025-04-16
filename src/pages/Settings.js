import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Settings() {
    const [routine, setRoutine] = useState(JSON.parse(sessionStorage.getItem('uploadedJson')));

    const [musicFile, setMusicFile] = useState(null);
    const [defaultLength, setDefaultLength] = useState(180);

    const navigate = useNavigate();
    const loc = useLocation();

    useEffect(() => {
        const syncOnFocus = () => {
            const latestJson = JSON.parse(sessionStorage.getItem("uploadedJson"));
            setRoutine(latestJson);
        };

        window.addEventListener("focus", syncOnFocus);
        return () => window.removeEventListener("focus", syncOnFocus);
    }, []);

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

    const handleSaveAndProceed = () => {
        const updatedRoutine = {
            ...routine,
            music_source_path: musicFile || routine.music_source_path,
            default_length: defaultLength || routine.default_length
        };

        sessionStorage.setItem("uploadedJson", JSON.stringify(updatedRoutine));
        navigate("/chor.io/overview");
    };


    const handleBack = () => {
        const prev = loc.state.new ? "/chor.io" : "/chor.io/overview";
        navigate(prev);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-secondary" type="button" onClick={handleBack}>
                    Back
                </button>
                <div style={{ width: "45%" }}>
                    <h2>Routine Settings</h2>
                    <label>Routine Name:</label>
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
                    <label>Floor Dimensions:</label>
                    <br />
                    <label>Width:   </label>
                    <input
                        type="number"
                        className="form-control d-inline-block w-auto"
                        name="x"
                        value={routine.dimensions.x}
                        onChange={handleDimensionChange}
                    />
                    <label> Height:   </label>
                    <input
                        type="number"
                        className="form-control d-inline-block w-auto"
                        name="y"
                        value={routine.dimensions.y}
                        onChange={handleDimensionChange}
                    />
                </div>

                <div style={{ width: "45%" }}>
                    <h2>{/* General Settings*/} &#x200b;</h2> {/* Don't worry about the wizardry */}
                    <label>Default Routine Length (s): </label>
                    <input
                        type="text"
                        className="form-control"
                        value={defaultLength}
                        onChange={(e) => setDefaultLength(e.target.value)}
                    />
                </div>
            </div>

            <br />
            <button className="btn btn-primary" type="button" onClick={handleSaveAndProceed}>
                Save & Proceed to Overview
            </button>
        </div>
    );
}

export default Settings;
