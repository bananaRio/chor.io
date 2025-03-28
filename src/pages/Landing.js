import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {saveAs} from "file-saver";

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
            routineName: "new routine",
            music_source_path: "",
            dimensions: { x: 400, y: 200 },
            moves: [],
        };

        setJsonData(empty_routine);
        sessionStorage.setItem("uploadedJson", JSON.stringify(empty_routine));
        navigate("/Settings", {state: {"new": true}});
    };

    const handleProceed = () => {
        if (jsonData.routineName === "new routine") {
            alert("Please upload a valid routine file or create a new routine before proceeding.");
            return;
        }
        navigate("/Overview");
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

        var blob = new Blob([JSON.stringify(jsonData)], {
            type: "text/plain;charset=utf-8"
        });

        saveAs(blob, jsonData.routineName + ".json");
    }

    return (
        <div>
            <h2>Create New Routine</h2>

            <button className="botContentButton" type="button" onClick={handleNew}>
                Create New
            </button>

            <h2>Load Routine File</h2>

            <br />
            <input type="file" accept=".json" onChange={handleFileUpload} ref={fileInputRef} />
            <br /><br />

            <button className="botContentButton" type="button" onClick={handleProceed}>
                Proceed with 
            </button> <b> {jsonData.routineName} </b>


            <h2>Export to File</h2>

            <button className="botContentButton" type="button" onClick={handleExport}>
                Export File
            </button>
        </div>
    );
}

export default Landing;
