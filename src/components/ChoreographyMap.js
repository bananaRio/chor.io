import React, { useState, useRef, useCallback, useEffect } from "react";
import { Stage, Layer, Circle, Arrow, Text, Image } from "react-konva";
import useImage from "use-image";
import floor_img from "../images/dance_floor1.png";
import '../pages/Page.css';

// a fixed color palette. Each new dance move will be assigned a color in sequence.
const colorPalette = [
  "#FF5733", // 1
  "#33FF57", // 2
  "#3357FF", // 3
  "#FF33A8", // 4
  "#A833FF", // 5
  "#33FFF3", // 6
  "#FFC133", // 7
  "#FF8F33", // 8
  "#33FF8F", // 9
  "#8F33FF", // 10
  "#FF3333", // 11
  "#33FF33", // 12
  "#3333FF", // 13
  "#FF33FF", // 14
  "#33FFFF", // 15
  "#FFFF33", // 16
  "#FF6633", // 17
  "#33FF66", // 18
  "#6633FF", // 19
  "#FF3366", // 20
  "#66FF33", // 21
  "#3366FF", // 22
  "#FF9933", // 23
  "#33FF99", // 24
  "#9933FF", // 25
  "#FF3399", // 26
  "#3399FF", // 27
  "#99FF33", // 28
  "#FFCC33", // 29
  "#33FFCC", // 30
  "#CC33FF", // 31
  "#FF33CC", // 32
  "#33CCFF", // 33
  "#CCFF33", // 34
  "#FF7733", // 35
  "#33FF77", // 36
  "#7733FF", // 37
  "#FF3377", // 38
  "#3377FF", // 39
  "#77FF33", // 40
  "#FFAA33", // 41
  "#33FFAA", // 42
  "#AA33FF", // 43
  "#FF33AA", // 44
  "#33AAFF", // 45
  "#AAFF33", // 46
  "#DD3344", // 47
  "#44DD33", // 48
  "#3344DD", // 49
  "#DD4433"  // 50
];

// A custom cursor: a 16x16 circle image, with its hotspot at (8,8).
// (If you want, you can adjust this data URI.)
const circleCursor = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABFElEQVQ4T6WTv0tCURSGv3v3O7jS0KLiIjiAhFGJBDa7CJDRBEKmaBYFBRaJECQiJAkSKKoqAhVhGKBCEQnqIipCqtS35u7s5Mx83Lfz/x7cOe8z7nvvOuBkhHbBaJ6ycxHh+Pbt2BOAvf4QH+MFwjVX0j1EJexRS+CK0EHULRr6C9HNb+z9w0k6tBfEV0qksIlIfRfTJwTOb4vHyg9P0/MUzEIXYV8n6HVp1tW6LVr1/IGKxj6eGPJK+zy1+k4ZkN86qjQInF+Hhe4GygbeIcx3WJxA0S0r8TYb0G9BxK36uAdl2/xX3F9SY6POq+zZp/VgfdAC+7mDfv/1EdvBv3ghjS8E1sgQAAAABJRU5ErkJggg==') 8 8, pointer";

function ChoreographyMap({ initialPosition, onPositionChange, moveList}) {
  const [mapBackground] = useImage(floor_img);
  const [targets, setTargets] = useState([]);
  // connectorOffsets: one per connector, each is {dx, dy} relative to default midpoint.
  const [connectorOffsets, setConnectorOffsets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastReportedPosition, setLastReportedPosition] = useState(null);

  const stageRef = useRef(null);
  const stageWidth = 800;
  const stageHeight = 400;

  // optionally initialize with a target at initialPosition.
  useEffect(() => {
    if (
      !isInitialized &&
      initialPosition &&
      initialPosition.x !== undefined &&
      initialPosition.y !== undefined
    ) {
      setIsInitialized(true);
      // free to add an initial target here if desired.
    }
  }, [initialPosition, isInitialized]);

  // update connectorOffsets when targets change.
  useEffect(() => {
    if (targets.length < 2) {
      setConnectorOffsets([]);
      return;
    }
    setConnectorOffsets((prevOffsets) => {
      const newOffsets = [];
      for (let i = 0; i < targets.length - 1; i++) {
        newOffsets.push(prevOffsets[i] || { dx: 0, dy: 0 });
      }
      return newOffsets;
    });
  }, [targets]);

  // notify parent when the last target's position changes.
  useEffect(() => {
    if (targets.length > 0 && onPositionChange) {
      const target = targets[targets.length - 1];
      const newPos = { x: target.x, y: target.y };
      if (
        !lastReportedPosition ||
        lastReportedPosition.x !== newPos.x ||
        lastReportedPosition.y !== newPos.y
      ) {
        setLastReportedPosition(newPos);
        onPositionChange(newPos);
      }
    }
  }, [targets, onPositionChange, lastReportedPosition]);

  // generate connectors between consecutive targets.
  const generateConnectors = useCallback(() => {
    if (targets.length < 2) return null;
    return targets.slice(0, -1).map((target, index) => {
      const nextTarget = targets[index + 1];
      const defaultMid = {
        x: (target.x + nextTarget.x) / 2,
        y: (target.y + nextTarget.y) / 2,
      };
      const offset = connectorOffsets[index] || { dx: 0, dy: 0 };
      const controlPoint = {
        x: defaultMid.x + offset.dx,
        y: defaultMid.y + offset.dy,
      };

      return (
        <Arrow
          key={`connector-${target.id}-${nextTarget.id}`}
          points={[
            target.x,
            target.y,
            controlPoint.x,
            controlPoint.y,
            nextTarget.x,
            nextTarget.y,
          ]}
          stroke="black"
          fill="black"
          strokeWidth={2}
          pointerLength={10}
          pointerWidth={10}
          tension={0.5} // 0 for straight line; >0 for curvature.
          onMouseEnter={(e) => {
            e.target.getStage().container().style.cursor = circleCursor;
          }}
          onMouseLeave={(e) => {
            e.target.getStage().container().style.cursor = "default";
          }}
        />
      );
    });
  }, [targets, connectorOffsets]);

  // render control hotspots for adjusting connector curvature.
  // they are invisible by default (opacity 0), but on hover become visible.
  const renderControlHotspots = () => {
    if (targets.length < 2) return null;
    return targets.slice(0, -1).map((target, index) => {
      const nextTarget = targets[index + 1];
      const defaultMid = {
        x: (target.x + nextTarget.x) / 2,
        y: (target.y + nextTarget.y) / 2,
      };
      const offset = connectorOffsets[index] || { dx: 0, dy: 0 };
      const controlPoint = {
        x: defaultMid.x + offset.dx,
        y: defaultMid.y + offset.dy,
      };

      return (
        <Circle
          key={`hotspot-${index}`}
          x={controlPoint.x}
          y={controlPoint.y}
          radius={7}
          fill="blue"
          opacity={0} // invisible by default.
          draggable
          onMouseEnter={(e) => {
            e.target.opacity(0.6);
            e.target.getStage().container().style.cursor = circleCursor;
          }}
          onMouseLeave={(e) => {
            e.target.opacity(0);
            e.target.getStage().container().style.cursor = "default";
          }}
          onDragMove={(e) => {
            const pos = e.target.position();
            const newOffset = {
              dx: pos.x - defaultMid.x,
              dy: pos.y - defaultMid.y,
            };
            setConnectorOffsets((prev) => {
              const newOffsets = [...prev];
              newOffsets[index] = newOffset;
              return newOffsets;
            });
          }}
        />
      );
    });
  };

  // add a new dance move. The color is chosen deterministically from a fixed palette.
  const handleAddMove = () => {
    let newX, newY;
    if (targets.length === 0) {
      newX = stageWidth / 2;
      newY = stageHeight / 2;
    } else {
      const lastTarget = targets[targets.length - 1];
      newX = lastTarget.x + 30;
      newY = lastTarget.y;
    }
    // cycle through the palette.
    const color = colorPalette[targets.length % colorPalette.length];

    const newTarget = {
      x: newX,
      y: newY,
      id: `target-${Date.now()}`,
      note: `Move ${targets.length + 1}`,
      color, // use deterministic color.
    };
    setTargets([...targets, newTarget]);
  };

  // stage click (optional0)
  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      // optionally add a move on stage click.
    }
  };

  // update target position as it's dragged.
  const handleDragMove = (e, id) => {
    const { x, y } = e.target.position();
    setTargets((prevTargets) =>
      prevTargets.map((t) => (t.id === id ? { ...t, x, y } : t))
    );
  };

  // select a target.
  const handleSelect = (id) => {
    setSelectedId(id);
  };

  // change a target's note.
  const handleNoteChange = (id, newNote) => {
    setTargets((prevTargets) =>
      prevTargets.map((t) => (t.id === id ? { ...t, note: newNote } : t))
    );
  };

  React.useEffect(() => {
    if (!isInitialized && moveList && moveList.length > 0) {
      const newTargets = moveList.map((move, index) => {
        const baseX = stageWidth / 2;
        const baseY = stageHeight / 2;
        return {
          x: baseX + index * 30,
          y: baseY,
          id: move.name,
          note: move.name,
          color: move.color,
        };
      });
  
      setTargets(newTargets);
      setIsInitialized(true); // prevent re-running
    }
  }, [isInitialized, moveList]);
  
  return (
    <div>
      {/* <div style={{ marginBottom: "8px" }}>
        <button onClick={handleAddMove}>Add Dance Move</button>
      </div> */}
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        onMouseDown={handleStageClick}
        style={{ border: "1px solid #ccc", background: "#eee" }}
      >
        <Layer>
          {mapBackground && (
            <Image
              image={mapBackground}
              x={0}
              y={0}
              width={stageWidth}
              height={stageHeight}
            />
          )}
          {generateConnectors()}
          {renderControlHotspots()}
          {targets.map((target) => (
            <React.Fragment key={target.id}>
              <Circle
                x={target.x}
                y={target.y}
                radius={20}
                fill={target.color}
                stroke={target.id === selectedId ? "orange" : ""}
                strokeWidth={target.id === selectedId ? 4 : 0}
                draggable
                onDragMove={(e) => handleDragMove(e, target.id)}
                onClick={() => handleSelect(target.id)}
                onTap={() => handleSelect(target.id)}
              />
              <Text
                x={target.x + 25}
                y={target.y - 10}
                text={target.note}
                fontSize={16}
                fill="#333"
                onClick={() => handleSelect(target.id)}
                onTap={() => handleSelect(target.id)}
              />
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
      {selectedId && (
        <NoteEditor
          target={targets.find((t) => t.id === selectedId)}
          onChange={handleNoteChange}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

/**
 * A simple note editor to modify a move's note.
 */
function NoteEditor({ target, onChange, onClose }) {
  const [value, setValue] = useState(target.note || "");
  const handleSubmit = () => {
    onChange(target.id, value);
    onClose();
  };
  return (
    <div style={{ marginTop: 10 }}>
      <label>
        Note for {target.id}:{" "}
        <input
          style={{ marginLeft: 8 }}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <button onClick={handleSubmit} style={{ marginLeft: 8 }}>
        Save
      </button>
      <button onClick={onClose} style={{ marginLeft: 8 }}>
        Cancel
      </button>
    </div>
  );
}

export default ChoreographyMap;