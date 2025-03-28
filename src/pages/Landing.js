import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Landing() {
    const [jsonData, setJsonData] = useState(null);

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
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div>
            <h1>Landing</h1>
            <button className="botContentButton" type="button">
                <Link to="/Overview" style={{ color: "black", textDecoration: "none" }}>
                    Load Routine
                </Link>
            </button>
            <button className="botContentButton" type="button">
                <Link to="/Settings" style={{ color: "black", textDecoration: "none" }}>
                    New Routine
                </Link>
            </button>
            <br /><br />
            <input type="file" accept=".json" onChange={handleFileUpload} />
            {jsonData && <pre>{JSON.stringify(jsonData, null, 2)}</pre>}
        </div>
    );
}

export default Landing;