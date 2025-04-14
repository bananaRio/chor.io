import React, { useEffect, useRef, useState } from "react";

function Timeline({
  duration,
  currentTime,
  setCurrentTime,
  currentMove,
  playerRef,
  isPlaying,
  setIsPlaying,
  editableOnly = false,
  hideControls = false
}) {
  const sliderRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const animationFrameRef = useRef(null);
  const [internalTime, setInternalTime] = useState(currentTime);
  const [hasConflict, setHasConflict] = useState(false);
  const [moveSegments, setMoveSegments] = useState([]);

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
    // Load and process move segments
    const storedData = JSON.parse(sessionStorage.getItem("uploadedJson"));
    if (!storedData?.moves) return;

    // Sort moves by startTime and calculate segments
    const sortedMoves = [...storedData.moves].sort((a, b) => a.startTime - b.startTime);
    const segments = sortedMoves.map((move, index) => {
      const nextMove = sortedMoves[index + 1];
      const endTime = nextMove ? nextMove.startTime : duration;
      return {
        ...move,
        endTime,
        widthPercent: ((endTime - move.startTime) / duration) * 100
      };
    });
    
    setMoveSegments(segments);

    // Check for conflicts if in editable mode
    if (editableOnly && currentMove) {
      const conflict = storedData.moves.some((move) => {
        return move.startTime === internalTime && move.name !== currentMove.name;
      });
      setHasConflict(conflict);
    }
  }, [duration, internalTime, editableOnly, currentMove]);

  const getLabelLeftOffset = () => {
    if (!sliderRef.current || !duration) return 0;
    const slider = sliderRef.current;
    const rect = slider.getBoundingClientRect();
    const percent = internalTime / duration;
    const thumbX = percent * slider.clientWidth;
    return thumbX;
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
    <div style={{ width: "100%", position: "relative" }}>
      <div
        style={{
          backgroundColor: "#1e1c23",
          padding: "20px 24px",
          borderRadius: "6px",
          position: "relative"
        }}
      >
        {/* Move segments background */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          right: '24px',
          height: '12px',
          display: 'flex',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {moveSegments.map((move, index) => (
            <div 
              key={index}
              style={{
                width: `${move.widthPercent}%`,
                backgroundColor: move.color || '#ccc',
                height: '100%'
              }}
            />
          ))}
        </div>

        {currentMove && (
          <div
            style={{
              position: "absolute",
              top: "-35px", 
              left: getLabelLeftOffset(),
              transform: "translateX(-37%)", 
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
            backgroundColor: "transparent",
            outline: "none",
            position: 'relative',
            zIndex: 2,
            accentColor: hasConflict ? "red" : "#007bff"
          }}
        />
      </div>

      {!editableOnly && !hideControls && (
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