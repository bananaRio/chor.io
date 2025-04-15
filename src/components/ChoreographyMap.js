import React, { useEffect } from "react";
import { Stage, Layer, Circle, Arrow, Image } from "react-konva";
import useImage from "use-image";
import floor_img from "../images/dance_floor1.png";

function ChoreographyMap({
  moveList = [],
  editableMove,
  liveMarker, // Live playback indicator
  onEditableMoveChange,
  isEditable = true,
  connectorOffsets = [],
  stageWidth = 800,
  stageHeight = 400,
  onConnectorOffsetsChange = () => { },
  onMoveDoubleClick = () => { }
}) {
  const [mapBackground] = useImage(floor_img);

  // Merge move list with editable move if in editing mode
  const markers = editableMove && isEditable
    ? [...moveList, editableMove]
    : [...moveList];

  // Ensure correct number of connector offsets
  useEffect(() => {
    const requiredLength = Math.max(markers.length - 1, 0);
    if (connectorOffsets.length !== requiredLength) {
      const newOffsets = Array(requiredLength)
        .fill()
        .map((_, i) => connectorOffsets[i] || { dx: 0, dy: 0 });
      onConnectorOffsetsChange(newOffsets);
    }
  }, [markers.length, connectorOffsets, onConnectorOffsetsChange]);

  const getX = (marker) => (marker.positions ? marker.positions.x : marker.x);
  const getY = (marker) => (marker.positions ? marker.positions.y : marker.y);

  // Draw curved connectors
  const generateConnectors = () => {
    if (markers.length < 2) return null;
    return markers.slice(0, -1).map((marker, index) => {
      const nextMarker = markers[index + 1];
      const mid = {
        x: (getX(marker) + getX(nextMarker)) / 2,
        y: (getY(marker) + getY(nextMarker)) / 2
      };
      const offset = connectorOffsets[index] || { dx: 0, dy: 0 };
      const controlPoint = { x: mid.x + offset.dx, y: mid.y + offset.dy };
      return (
        <Arrow
          key={`connector-${index}`}
          points={[
            getX(marker),
            getY(marker),
            controlPoint.x,
            controlPoint.y,
            getX(nextMarker),
            getY(nextMarker)
          ]}
          tension={0.5}
          stroke={nextMarker.color || "black"}
          fill={nextMarker.color || "black"}
          strokeWidth={2}
        />
      );
    });
  };

  // Render draggable hotspots for curve adjustment
  const renderControlHotspots = () => {
    if (!isEditable || markers.length < 2) return null;
    return markers.slice(0, -1).map((marker, index) => {
      const nextMarker = markers[index + 1];
      const mid = {
        x: (getX(marker) + getX(nextMarker)) / 2,
        y: (getY(marker) + getY(nextMarker)) / 2
      };
      const offset = connectorOffsets[index] || { dx: 0, dy: 0 };
      const controlPoint = {
        x: mid.x + offset.dx,
        y: mid.y + offset.dy
      };

      return (
        <Circle
          key={`control-${index}`}
          x={controlPoint.x}
          y={controlPoint.y}
          radius={12}
          fill="blue"
          opacity={0}
          draggable
          onMouseEnter={(e) => {
            e.target.opacity(0.6);
            e.target.getStage().container().style.cursor = "pointer";
          }}
          onMouseLeave={(e) => {
            e.target.opacity(0);
            e.target.getStage().container().style.cursor = "default";
          }}
          onDragMove={(e) => {
            const pos = e.target.position();
            const newOffset = {
              dx: pos.x - mid.x,
              dy: pos.y - mid.y
            };
            const newOffsets = [...connectorOffsets];
            newOffsets[index] = newOffset;
            onConnectorOffsetsChange(newOffsets);
          }}
        />
      );
    });
  };

  return (
    <Stage width={stageWidth} height={stageHeight}>
      <Layer>
        {mapBackground && (
          <Image
            image={mapBackground}
            width={stageWidth}
            height={stageHeight}
          />
        )}

        {generateConnectors()}
        {renderControlHotspots()}

        {/* Render saved moves */}
        {moveList.map((move, index) => (
          <React.Fragment key={`move-${index}`}>
            <Circle
              x={getX(move)}
              y={getY(move)}
              radius={12}
              fill={move.color || "black"}
              stroke="white"
              strokeWidth={1}
              onDblClick={() => onMoveDoubleClick(index)}
            />
            {/* <Text
              x={getX(move) + 12}
              y={getY(move) - 8}
              text={move.name}
              fontSize={14}
              fill="#333"
            /> */}
          </React.Fragment>
        ))}

        {/* Render editable move */}
        {editableMove && isEditable && (
          <React.Fragment>
            <Circle
              x={getX(editableMove)}
              y={getY(editableMove)}
              radius={12}
              fill={editableMove.color || "red"}
              stroke="orange"
              strokeWidth={2}
              draggable
              dragBoundFunc={(pos) => {
                let x = Math.max(0, Math.min(pos.x, stageWidth));
                let y = Math.max(0, Math.min(pos.y, stageHeight));
                return { x, y };
              }}
              onDragMove={(e) => {
                const newPos = e.target.position();
                onEditableMoveChange?.(newPos);
              }}
            />
            {/* <Text
              x={getX(editableMove) + 14}
              y={getY(editableMove) - 8}
              text={editableMove.note || editableMove.id}
              fontSize={14}
              fill="#333"
            /> */}
          </React.Fragment>
        )}

        {/* Render live playback marker */}
        {liveMarker && (
          <Circle
            x={liveMarker.x}
            y={liveMarker.y}
            radius={12}
            fill={liveMarker.color || "green"}
          />
        )}
      </Layer>
    </Stage>
  );
}

export default ChoreographyMap;
