import React from "react";

const Timeline = ({
  musicDuration,
  currentTime,
  moves,
  currentEffectiveMove,
  setCurrentTime,
  setSelectedMoveIndex,
  playerRef
}) => {
  const adjustColor = (color, factor) => {
    if (!color || color === "#666") return color;

    // Convert hex to RGB
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    // Lighten or darken
    r = Math.round(r * factor);
    g = Math.round(g * factor);
    b = Math.round(b * factor);

    // Ensure values are in valid range
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return (
    <div style={{
      marginTop: "30px",
      marginBottom: "30px",
      padding: "20px",
      backgroundColor: "#1e1e24",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
    }}>
      <h4 style={{ color: "#fff", marginBottom: "20px" }}>Routine Timeline</h4>

      {/* Time markers bar */}
      <div style={{
        position: "relative",
        height: "20px",
        marginBottom: "10px",
        color: "#aaa",
        fontSize: "12px",
        display: "flex",
        justifyContent: "space-between"
      }}>
        {Array.from({ length: Math.min(5, Math.ceil(musicDuration / 10) + 1) }).map((_, i) => {
          const markerTime = Math.floor(musicDuration * (i / 4));
          return (
            <div key={`marker-${i}`} style={{
              textAlign: "center",
              minWidth: "40px",
            }}>
              {`${Math.floor(markerTime / 60)}:${String(Math.floor(markerTime % 60)).padStart(2, '0')}`}
            </div>
          );
        })}
      </div>

      {/* Move segments container */}
      <div style={{
        position: "relative",
        height: "40px",
        marginBottom: "15px"
      }}>
        {moves && moves.map((move, index) => {
          const nextMove = moves[index + 1];
          const moveEndTime = move.startTime + (move.waitTime || 0);
          const nextMoveStartTime = nextMove ? nextMove.startTime : musicDuration;

          // Position and width for the segments
          const leftPos = (move.startTime / musicDuration) * 100;
          const waitWidth = ((move.waitTime || 0) / musicDuration) * 100;
          const totalWidth = ((nextMoveStartTime - move.startTime) / musicDuration) * 100;
          const transitionWidth = totalWidth - waitWidth;

          return (
            <React.Fragment key={`move-${index}`}>
              {/* Wait time segment - solid color */}
              {move.waitTime > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: `${leftPos}%`,
                    width: `${waitWidth}%`,
                    height: "35px",
                    backgroundColor: move.color || "#666",
                    borderRadius: waitWidth === totalWidth ? "4px" : "4px 0 0 4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "bold",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    zIndex: currentEffectiveMove === move ? 10 : 1,
                    border: currentEffectiveMove === move ? "2px solid #fff" : "none"
                  }}
                  onClick={() => {
                    setCurrentTime(move.startTime);
                    setSelectedMoveIndex(index);
                    if (playerRef.current) {
                      playerRef.current.currentTime = move.startTime;
                    }
                  }}
                  title={`${move.name} - Wait time: ${move.waitTime}s`}
                >
                  {move.name}
                </div>
              )}

              {/* Transition segment - pattern or different color */}
              {transitionWidth > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: `${leftPos + waitWidth}%`,
                    width: `${transitionWidth}%`,
                    height: "35px",
                    backgroundColor: move.waitTime > 0 ? adjustColor(move.color || "#666", 0.7) : (move.color || "#666"),
                    backgroundImage: move.waitTime > 0 ? `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 10px,
                      rgba(0,0,0,0.1) 10px,
                      rgba(0,0,0,0.1) 20px
                    )` : "none",
                    borderRadius: waitWidth > 0 ? "0 4px 4px 0" : "4px",
                    cursor: "pointer",
                    zIndex: currentEffectiveMove === move ? 10 : 1,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "bold",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    border: currentEffectiveMove === move ? "2px solid #fff" : "none"
                  }}
                  onClick={() => {
                    const clickTime = move.waitTime > 0 ? moveEndTime : move.startTime;
                    setCurrentTime(clickTime);
                    setSelectedMoveIndex(index);
                    if (playerRef.current) {
                      playerRef.current.currentTime = clickTime;
                    }
                  }}
                  title={`${move.name}${move.waitTime > 0 ? ` - Transition after ${move.waitTime}s wait` : ''}`}
                >
                  {move.waitTime > 0 ? "" : move.name}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Playhead */}
        <div style={{
          position: "absolute",
          left: `${(currentTime / musicDuration) * 100}%`,
          top: "0",
          height: "35px",
          width: "2px",
          backgroundColor: "#ff5722",
          zIndex: 15
        }}>
          <div style={{
            position: "absolute",
            bottom: "-6px",
            left: "50%",
            width: "12px",
            height: "12px",
            backgroundColor: "#ff5722",
            borderRadius: "50%",
            transform: "translateX(-50%)"
          }}></div>
        </div>
      </div>

      {/* Slider control */}
      <div style={{ position: "relative" }}>
        <input
          type="range"
          min="0"
          max={musicDuration || 100}
          step="0.01"
          value={currentTime}
          onChange={(e) => {
            const newTime = parseFloat(e.target.value);
            setCurrentTime(newTime);
            if (playerRef.current) {
              playerRef.current.currentTime = newTime;
            }
          }}
          style={{
            width: "100%",
            height: "10px",
            appearance: "none",
            backgroundColor: "#333",
            borderRadius: "5px",
            outline: "none",
            opacity: "1",
            transition: "opacity .2s",
            accentColor: "#007bff"
          }}
        />
        <div style={{
          marginTop: "8px",
          display: "flex",
          justifyContent: "space-between",
          color: "#aaa",
          fontSize: "12px"
        }}>
          <span>0:00</span>
          <span style={{ color: "#fff" }}>
            Current: {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}.
            {String(Math.floor((currentTime % 1) * 100)).padStart(2, '0')}
          </span>
          <span>{Math.floor(musicDuration / 60)}:{String(Math.floor(musicDuration % 60)).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;