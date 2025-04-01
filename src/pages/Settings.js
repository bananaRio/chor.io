import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";


function Settings(props) {
    const [routine, setRoutine] = useState({
        routineName: "",
        music_source_path: "",
        dimensions: { x: 0, y: 0 },
    });

    const [musicFile, setMusicFile] = useState(null);
    const [fontSize, setFontSize] = useState("16px");
    const [bgMode, setBgMode] = useState("dark");

    const navigate = useNavigate();
    const loc = useLocation()

    useEffect(() => {
        const storedJson = sessionStorage.getItem("uploadedJson");
        if (storedJson) {
            setRoutine(JSON.parse(storedJson));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoutine((prev) => ({ ...prev, [name]: value }));
    };

    // TODO: protections for these and similar
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
        alert("You have not saved");
        const prev = loc.state.new ? "/" : "/Overview";
        navigate(prev);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                {/* Left Pane - Routine Settings */}
                <button className="botContentButton" type="button" onClick={handleBack}>
                    Back
                </button>
                <div style={{ width: "45%" }}>
                    <h2>Routine Settings</h2>
                    <label>Routine Name: </label>
                    <input type="text" name="routineName" value={routine.routineName} onChange={handleChange} />

                    <br /><br />
                    <label>Music/Video File: </label>
                    <input type="file" accept="audio/*,video/*" onChange={handleFileUpload} />
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
                    <input type="number" name="x" value={routine.dimensions.x} onChange={handleDimensionChange} />
                    <label> Y: </label>
                    <input type="number" name="y" value={routine.dimensions.y} onChange={handleDimensionChange} />
                </div>

                {/* Right Pane - User-wide Settings */}
                <div style={{ width: "45%" }}>
                    <h2>User Settings</h2>
                    <label>Font Size: </label>
                    <input type="text" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />

                    <br /><br />
                    <label>Background Mode: </label>
                    <select value={bgMode} onChange={(e) => setBgMode(e.target.value)}>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                    </select>
                </div>
            </div>

            {/* Save & Proceed Button */}
            <br />

            <button className="botContentButton" type="button" onClick={handleSaveAndProceed}>
                Save & Proceed to Overview
            </button>
        </div>
    );
}

export default Settings;
