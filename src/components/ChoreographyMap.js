import React, { useEffect } from "react";
import { Stage, Layer, Circle, Arrow, Image } from "react-konva";
import useImage from "use-image";
import floor_img from "../images/dance_floor1.png";

function ChoreographyMap({
  moveList = [],
  editableMove,
  onEditableMoveChange,
  isEditable = true,
  connectorOffsets = [],
  stageWidth = 800,
  stageHeight = 400,
  onConnectorOffsetsChange = () => {},
  onMoveDoubleClick = () => {}
}) {
  const [mapBackground] = useImage(floor_img);

  // Combine saved moves and the editable move if it exists
  const markers = editableMove && isEditable 
    ? [...moveList, editableMove] 
    : [...moveList];

  // Ensure connectorOffsets array always has correct length
  useEffect(() => {
    const requiredLength = Math.max(markers.length - 1, 0);
    
    if (connectorOffsets.length !== requiredLength) {
      const newOffsets = Array(requiredLength).fill().map((_, i) => 
        connectorOffsets[i] || { dx: 0, dy: 0 }
      );
      
      onConnectorOffsetsChange(newOffsets);
    }
  }, [markers.length, connectorOffsets, onConnectorOffsetsChange]);

  // Helper functions to get marker coordinates
  const getX = (marker) => marker.positions ? marker.positions.x : marker.x;
  const getY = (marker) => marker.positions ? marker.positions.y : marker.y;

  // Generate curved connectors between markers
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
  

  // Render control hotspots for curve adjustment (only in edit mode)
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
          radius={8}
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
        
        {/* Render saved moves (non-editable) with double-click functionality */}
        {moveList.map((move, index) => (
          <Circle
            key={`move-${index}`}
            x={getX(move)}
            y={getY(move)}
            radius={10}
            fill={move.color || "black"}
            stroke="white"
            strokeWidth={1}
            onDblClick={() => onMoveDoubleClick(index)}
          />
        ))}
        
        {/* Render the editable move if provided */}
        {editableMove && isEditable && (
          <Circle
          x={getX(editableMove)}
          y={getY(editableMove)}
          radius={12}
          fill={editableMove.color || "red"}
          stroke="white"
          strokeWidth={2}
          draggable
          dragBoundFunc={pos => {
            // Ensure the circle stays within the stage
            let x = pos.x;
            let y = pos.y;
            x = Math.max(0, Math.min(x, stageWidth));
            y = Math.max(0, Math.min(y, stageHeight));
            return { x, y };
          }}
          onDragMove={e => {
            const newPos = e.target.position();
            if (onEditableMoveChange) {
              onEditableMoveChange(newPos);
            }
          }}
        />        
        )}
      </Layer>
    </Stage>
  );
}

export default ChoreographyMap;
