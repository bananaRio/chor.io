import React, { useEffect } from "react";
import { Stage, Layer, Circle, Arrow, Text, Image } from "react-konva";
import useImage from "use-image";
import floor_img from "../images/dance_floor1.png";

function ChoreographyMap({
  moveList = [],
  editableMove,
  liveMarker, // New prop for the live playback indicator
  onEditableMoveChange,
  isEditable = true,
  connectorOffsets = [],
  onConnectorOffsetsChange = () => {},
  onMoveDoubleClick = () => {}
}) {
  const [mapBackground] = useImage(floor_img);
  const stageWidth = 800;
  const stageHeight = 400;

  // Combine static moves with the editable move (if in editing mode)
  const markers = [...moveList];
  if (editableMove && isEditable) {
    markers.push(editableMove);
  }

  // Ensure connectorOffsets array has the required length.
  useEffect(() => {
    const requiredLength = Math.max(markers.length - 1, 0);
    if (connectorOffsets.length !== requiredLength) {
      const newOffsets = [];
      for (let i = 0; i < requiredLength; i++) {
        newOffsets.push(connectorOffsets[i] || { dx: 0, dy: 0 });
      }
      onConnectorOffsetsChange(newOffsets);
    }
  }, [markers.length, connectorOffsets, onConnectorOffsetsChange]);

  // Helper functions to safely obtain coordinates.
  const getX = (marker) => (marker.positions ? marker.positions.x : marker.x);
  const getY = (marker) => (marker.positions ? marker.positions.y : marker.y);

  // Draw curved connectors between markers.
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
          stroke="black"
          fill="black"
          strokeWidth={2}
          pointerLength={10}
          pointerWidth={10}
          tension={0.5}
        />
      );
    });
  };

  // Render control hotspots only if editing is enabled.
  const renderControlHotspots = () => {
    if (!isEditable || markers.length < 2) return null;
    return markers.slice(0, -1).map((marker, index) => {
      const nextMarker = markers[index + 1];
      const mid = {
        x: (getX(marker) + getX(nextMarker)) / 2,
        y: (getY(marker) + getY(nextMarker)) / 2
      };
      const offset = connectorOffsets[index] || { dx: 0, dy: 0 };
      const controlPoint = { x: mid.x + offset.dx, y: mid.y + offset.dy };
      return (
        <Circle
          key={`hotspot-${index}`}
          x={controlPoint.x}
          y={controlPoint.y}
          radius={7}
          fill="blue"
          opacity={0}
          draggable={isEditable}
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
            const newOffset = { dx: pos.x - mid.x, dy: pos.y - mid.y };
            const newOffsets = [...connectorOffsets];
            newOffsets[index] = newOffset;
            onConnectorOffsetsChange(newOffsets);
          }}
        />
      );
    });
  };

  return (
    <Stage
      width={stageWidth}
      height={stageHeight}
      style={{ border: "1px solid #ccc", background: "#eee" }}
    >
      <Layer>
        {mapBackground && (
          <Image image={mapBackground} x={0} y={0} width={stageWidth} height={stageHeight} />
        )}
        {generateConnectors()}
        {renderControlHotspots()}
        {/* Render static moves using safe helper functions */}
        {markers.map((move, index) => (
          <React.Fragment key={move.name + index}>
            <Circle
              x={getX(move)}
              y={getY(move)}
              radius={20}
              fill={move.color}
              onDblClick={(e) => onMoveDoubleClick(index)}
            />
            <Text
              x={getX(move) + 25}
              y={getY(move) - 10}
              text={move.name}
              fontSize={16}
              fill="#333"
            />
          </React.Fragment>
        ))}
        {/* Render the editable move if provided */}
        {editableMove && (
          <React.Fragment>
            <Circle
              x={editableMove.x}
              y={editableMove.y}
              radius={20}
              fill={editableMove.color}
              stroke="orange"
              strokeWidth={4}
              draggable={isEditable}
              onDragMove={(e) => {
                const newPos = e.target.position();
                if (onEditableMoveChange) {
                  onEditableMoveChange(newPos);
                }
              }}
            />
            <Text
              x={editableMove.x + 25}
              y={editableMove.y - 10}
              text={editableMove.note || editableMove.id}
              fontSize={16}
              fill="#333"
            />
          </React.Fragment>
        )}
        {/* Render the live playback marker if provided */}
        {liveMarker && (
          <Circle x={liveMarker.x} y={liveMarker.y} radius={20} fill={liveMarker.color} />
        )}
      </Layer>
    </Stage>
  );
}

export default ChoreographyMap;