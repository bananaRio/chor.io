import React, { useEffect } from "react";
import { Stage, Layer, Circle, Arrow, Text, Image } from "react-konva";
import useImage from "use-image";
import floor_img from "../images/dance_floor1.png";

function ChoreographyMap({
  moveList = [],
  editableMove,
  onEditableMoveChange,
  isEditable = true,
  connectorOffsets = [],
  onConnectorOffsetsChange = () => {},
  // optional callback for double-clicking a move on the map
  onMoveDoubleClick = () => {}
}) {
  const [mapBackground] = useImage(floor_img);
  const stageWidth = 800;
  const stageHeight = 400;

  // combine saved moves and, if editing, the editable move.
  const markers = [...moveList];
  if (editableMove && isEditable) {
    markers.push(editableMove);
  }

  // ensure connectorOffsets array always has length equal to markers.length - 1.
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

  // helper functions to get marker coordinates.
  const getX = (marker) => marker.positions ? marker.positions.x : marker.x;
  const getY = (marker) => marker.positions ? marker.positions.y : marker.y;

  // draw curved connectors between markers.
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

  // render control hotspots ONLY if in editing mode.
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
          opacity={0} // Invisible by default.
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
    <Stage width={stageWidth} height={stageHeight} style={{ border: "1px solid #ccc", background: "#eee" }}>
      <Layer>
        {mapBackground && (
          <Image image={mapBackground} x={0} y={0} width={stageWidth} height={stageHeight} />
        )}
        {generateConnectors()}
        {renderControlHotspots()}
        {/* render saved moves (non-editable) with double-click functionality */}
        {moveList.map((move, index) => (
          <React.Fragment key={move.name + index}>
            <Circle 
              x={move.positions.x} 
              y={move.positions.y} 
              radius={20} 
              fill={move.color}
              onDblClick={(e) => onMoveDoubleClick(index)}
            />
            <Text x={move.positions.x + 25} y={move.positions.y - 10} text={move.name} fontSize={16} fill="#333" />
          </React.Fragment>
        ))}
        {/* render the editable move if provided */}
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
      </Layer>
    </Stage>
  );
}

export default ChoreographyMap;