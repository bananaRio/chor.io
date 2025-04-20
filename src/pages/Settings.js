import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Settings() {
  const [routine, setRoutine] = useState(
    JSON.parse(sessionStorage.getItem("uploadedJson"))
  );
  const [musicFile, setMusicFile] = useState(null);
  const [defaultLength, setDefaultLength] = useState(180);

  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const syncOnFocus = () => {
      const latestJson = JSON.parse(
        sessionStorage.getItem("uploadedJson")
      );
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
      default_length: defaultLength || routine.default_length,
    };
    sessionStorage.setItem(
      "uploadedJson",
      JSON.stringify(updatedRoutine)
    );
    navigate("/chor.io/overview");
  };

  const handleBack = () => {
    const prev = loc.state.new ? "/chor.io" : "/chor.io/overview";
    navigate(prev);
  };

  return (
    <div className="container d-flex justify-content-center py-5">
      <div className="w-100" style={{ maxWidth: 600 }}>
        <div className="text-center mb-4">
          <h2>Routine Settings</h2>
        </div>

        <div className="form-group mb-3">
          <label htmlFor="routineName">
            Routine Name <span className="text-danger">*</span>
          </label>
          <input
            id="routineName"
            type="text"
            className="form-control"
            name="routineName"
            value={routine.routineName}
            onChange={handleChange}
            placeholder="Enter a name for your routine, e.g. 'HipHop_1'"
          />
          <small className="form-text text-muted">
            Please choose a unique name for your routine.
          </small>
        </div>

        <div className="form-group mb-3">
          <label htmlFor="fileUpload">Music/Video File</label>
          <input
            id="fileUpload"
            type="file"
            className="form-control"
            accept="audio/*,video/*"
            onChange={handleFileUpload}
          />
        </div>

        {musicFile && (
          <div className="form-group mb-3 text-center">
            <p className="mb-2">Selected File:</p>
            <audio controls src={musicFile} />
          </div>
        )}

        <div className="form-group mb-3">
          <label>Floor Dimensions (m)</label>
          <div className="d-flex gap-2">
            <input
              type="number"
              className="form-control"
              style={{ flex: 1 }}
              name="x"
              value={routine.dimensions.x}
              onChange={handleDimensionChange}
              placeholder="Width"
            />
            <input
              type="number"
              className="form-control"
              style={{ flex: 1 }}
              name="y"
              value={routine.dimensions.y}
              onChange={handleDimensionChange}
              placeholder="Height"
            />
          </div>
        </div>

        <div className="form-group mb-4">
          <label htmlFor="defaultLength">
            Default Routine Length (seconds)
          </label>
          <input
            id="defaultLength"
            type="number"
            className="form-control"
            value={defaultLength}
            onChange={(e) => setDefaultLength(Number(e.target.value))}
          />
        </div>

        <div className="d-flex justify-content-between">
          <button
            className="btn btn-secondary px-4"
            onClick={handleBack}
          >
            Back
          </button>
          <button
            className="btn btn-success px-4"
            onClick={handleSaveAndProceed}
          >
            Save &amp; Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
