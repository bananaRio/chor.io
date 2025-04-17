import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import './Page.css';

function Landing() {
    const [jsonData, setJsonData] = useState({ routineName: "new routine" });
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedJson = sessionStorage.getItem("uploadedJson");
        if (storedJson) {
            setJsonData(JSON.parse(storedJson));
        }
    }, []);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsedJson = JSON.parse(e.target.result);
                    setJsonData(parsedJson);
                    sessionStorage.setItem("uploadedJson", JSON.stringify(parsedJson)); // Save to session
                } catch (error) {
                    console.error("Invalid JSON file", error);
                    alert("Invalid JSON file");
                }
            };
            reader.readAsText(file);
        }
    };

    const handleNew = () => {
        const empty_routine = {
            routineName: "My Routine",
            music_source_path: "",
            dimensions: { x: 800, y: 400 },
            defaultLength: 100,
            moves: [],
            requirements: {},
            requirementsDescriptions: {}

        };

        setJsonData(empty_routine);
        sessionStorage.setItem("uploadedJson", JSON.stringify(empty_routine));
        navigate("/chor.io/settings", { state: { new: true } });
    };

    const handleProceed = () => {
        if (jsonData.routineName === "new routine") {
            alert("Please upload a valid routine file or create a new routine before proceeding.");
            return;
        }
        navigate("/chor.io/overview");
    };

    const isValidfileName = (name) => {
        const invalidChars = /[<>:"/\\|?*]/;
        return name && name !== "new routine" && !invalidChars.test(name);
    };

    const handleExport = () => {
        if (!isValidfileName(jsonData.routineName)) {
            alert("File cannot be exported due to file name");
            return;
        }

        const blob = new Blob([JSON.stringify(jsonData)], {
            type: "text/plain;charset=utf-8"
        });

        saveAs(blob, jsonData.routineName + ".json");
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center bg-light p-3 sticky-top">
                <h2 className="m-0">Manage Routines</h2>
            </div>

            <div className="d-flex" style={{ height: "100vh" }}>
                {/* Left Pane */}
                <div style={{ flex: 1, padding: "40px" }}>
                    <header className="mb-4">
                        <h2>Create New Routine</h2>
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={handleNew}
                        >
                            Create New
                        </button>
                    </header>

                    <section className="mb-4">
                        <h3>Load Routine File</h3>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            className="form-control mb-2"
                        />
                        <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={handleProceed}
                        >
                            Proceed with <b>{jsonData.routineName}</b>
                        </button>
                    </section>

                    <section>
                        <h3>Export to File</h3>
                        <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={handleExport}
                        >
                            Export File
                        </button>
                    </section>
                </div>

                {/* Right Pane */}
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img src="/chor.io/images/choriologo.png" alt="Logo" style={{ maxWidth: "80%", maxHeight: "80%" }} />
                </div>
            </div>
        </div>
    );
}

export default Landing;
