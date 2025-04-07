import React, { useEffect, useRef, useState } from "react";

function Timeline({
  duration,
  currentTime,
  setCurrentTime,
  currentMove,
  playerRef,
  isPlaying,
  setIsPlaying,
  editableOnly = false
}) {
  const sliderRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const animationFrameRef = useRef(null);
  const [internalTime, setInternalTime] = useState(currentTime);
  const [hasConflict, setHasConflict] = useState(false);

  const updateSliderWidth = () => {
    if (sliderRef.current) {
      setSliderWidth(sliderRef.current.offsetWidth);
    }
  };

  useEffect(() => {
    updateSliderWidth();
    window.addEventListener("resize", updateSliderWidth);
    return () => window.removeEventListener("resize", updateSliderWidth);
  }, []);

  useEffect(() => {
    setInternalTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
    if (!editableOnly || !currentMove) return;

    const storedData = JSON.parse(sessionStorage.getItem("uploadedJson"));
    if (!storedData?.moves) return;

    const conflict = storedData.moves.some((move) => {
      return move.startTime === internalTime && move.name !== currentMove.name;
    });

    setHasConflict(conflict);
  }, [internalTime, editableOnly, currentMove]);

  const getLabelLeftOffset = () => {
    if (!sliderWidth || !duration) return 0;
    const percent = internalTime / duration;
    const offset = 20;
    return percent * sliderWidth - offset;
  };

  const handleTimeChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setInternalTime(newTime);
    setCurrentTime(newTime);
    if (playerRef?.current) {
      playerRef.current.currentTime = newTime;
    }
  };

  const animate = () => {
    const audio = playerRef.current;
    if (audio && !audio.paused) {
      const time = audio.currentTime;
      setInternalTime(time);
      setCurrentTime(time);
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
      setIsPlaying?.(false);
    }
  };

  const handlePlay = () => {
    if (isPlaying || !playerRef?.current) return;
    playerRef.current.currentTime = internalTime;
    playerRef.current
      .play()
      .then(() => {
        setIsPlaying?.(true);
        animationFrameRef.current = requestAnimationFrame(animate);
      })
      .catch((err) => console.error("Audio play failed:", err));
  };

  const handlePause = () => {
    playerRef.current?.pause();
    setIsPlaying?.(false);
    cancelAnimationFrame(animationFrameRef.current);
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          backgroundColor: "#1e1c23",
          padding: "20px 24px",
          borderRadius: "6px",
          position: "relative"
        }}
      >
        {currentMove && (
          <div
            style={{
              position: "absolute",
              left: getLabelLeftOffset(),
              top: -25,
              transform: "translateX(-50%)",
              fontWeight: "bold",
              backgroundColor: "#fff",
              padding: "4px 8px",
              borderRadius: "6px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              background: currentMove.color
            }}
          >
            {currentMove.name}
          </div>
        )}

        <input
          ref={sliderRef}
          type="range"
          min="0"
          max={duration || 100}
          step="0.01"
          value={internalTime}
          onChange={handleTimeChange}
          style={{
            width: "100%",
            height: "12px",
            borderRadius: "8px",
            appearance: "none",
            backgroundColor: "#ccc",
            outline: "none",
            accentColor: hasConflict ? "red" : "#007bff" // 🎯 bubble color
          }}
        />
      </div>

      {!editableOnly && (
        <div style={{ marginTop: "16px" }}>
          <p style={{ marginBottom: "8px" }}>
            Current Time: {internalTime.toFixed(2)} sec
          </p>
          <div>
            <button onClick={handlePlay} disabled={isPlaying}>
              Play
            </button>
            <button onClick={handlePause} disabled={!isPlaying}>
              Pause
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timeline;
