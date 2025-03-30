import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "react-bootstrap";

function Modify() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [routineData, setRoutineData] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [time, setTime] = useState(0);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#000000");
    const [checkedRequirements, setCheckedRequirements] = useState({});
    const [userTimeInput, setUserTimeInput] = useState("00:00");

    useEffect(() => {
        setUserTimeInput(`${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`);
    }, [time]);


    useEffect(() => {
        const storedData = JSON.parse(sessionStorage.getItem("uploadedJson")) || { moves: [] };
        setRoutineData(storedData);

        if (id !== "new" && storedData.moves[id]) {
            const move = storedData.moves[id];
            setName(move.name);
            setDescription(move.description);
            setTime(move.startTime);
            setPosition(move.positions);
            setColor(move.color);
            setCheckedRequirements(
                move.requirements_filled.reduce((acc, req) => {
                    acc[req.requirement_name] = true;
                    return acc;
                }, {})
            );
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
            let updatedMoves = [...routineData.moves];

            const newMove = {
                name: name,
                startTime: time,
                positions: position,
                description: description,
                requirements_filled: Object.keys(checkedRequirements)
                    .filter((key) => checkedRequirements[key])
                    .map((key) => ({ requirement_name: key })),
                color: color,
            };

            if (id !== undefined && id !== "new") {
                updatedMoves[id] = newMove;
            } else {
                updatedMoves.push(newMove);
            }

            // Sort moves by startTime
            updatedMoves.sort((a, b) => a.startTime - b.startTime);

            sessionStorage.setItem("uploadedJson", JSON.stringify({ ...routineData, moves: updatedMoves }));
            navigate("/Overview");
        }
    };



    const handleMapClick = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPosition({ x, y });
    };

    return (
        <div className="container p-4">
            <header className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                <h4>Modify</h4>
                <div>
                    <button className="btn btn-secondary me-2" onClick={() => navigate("/Overview")}>Discard Changes</button>
                    <button className="btn btn-primary me-2" onClick={handleSave}>Save</button>
                    {id !== undefined && <button className="btn btn-danger" onClick={handleDelete}>Delete</button>}
                </div>
            </header>

            <div className="row mt-4">
                <div className="col-md-6">
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
                    <Card className="bg-light text-center p-4 position-relative" onClick={handleMapClick}>
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
                <h4>Time Selection</h4>
                <div className="d-flex align-items-center">
                    <input
                        type="range"
                        className="form-range custom-slider flex-grow-1"
                        min="0" max="180"
                        value={time}
                        onChange={(e) => setTime(Number(e.target.value))}
                    />

                    {/* Time Input */}
                    <input
                        type="text"
                        className="form-control ms-3 text-center time-input"
                        value={userTimeInput}
                        onChange={(e) => setUserTimeInput(e.target.value)}
                        onBlur={() => {
                            const input = userTimeInput.split(":");
                            if (input.length === 2) {
                                const minutes = parseInt(input[0], 10);
                                const seconds = parseInt(input[1], 10);

                                if (!isNaN(minutes) && !isNaN(seconds)) {
                                    const totalSeconds = minutes * 60 + seconds;
                                    if (totalSeconds >= 0 && totalSeconds <= 180) {
                                        setTime(totalSeconds);
                                    }
                                }
                            }

                            // Reset the input to valid mm:ss format after blur
                            setUserTimeInput(`${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`);
                        }}
                    />
                </div>
            </div>
        </div>

    );
}

export default Modify;
