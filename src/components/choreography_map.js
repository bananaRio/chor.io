import React, {useEffect, useState} from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import useImage from 'use-image';

// choreography_map.js
/* This is the component that handles the visualization
 * and interaction with the choreography map.
 */

const path_planner = () => {
  // state hooks for managing the paths and nodes
  const [paths, setPaths] = useState([
    // points array contain x1, y1, x2, y2, x3, y3
    // color is the color of the path
    { id: 'path1', points: [100, 300, 300, 450, 600, 600], color: 'yellow', nodes: ['S', '1'] },
    { id: 'path2', points: [600, 600, 700, 450, 700, 300], color: 'pink', nodes: ['1', '2'] },
    // Add more paths as needed
  ])


  // a state variable (ID) that tracks what path is currently created
  const [selectedPathID, setSelectedPathID] = useState(null);
  // a state variable that tracks which point is being dragged
  const [dragPointIndex, setDragPointIndex] = useState(null);
  // a state variable for the zoom level
  const [scale, setScale] = useState(1);
  // a state varible for the position of the stage (canvas)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // a reference to the stage component
  const stageRef = useRef(null);

  // a state variable for the canvas dimentions
  const [stageSize, setStageSize] = useState({
    // initially the current window size, will be updated
    // if the window is resized
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // checkSize function to update the stage(canvas) size
  useEffect (() => {
    const checkSize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    // addEventListener() method attaches an event handler to an element.
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const handleWheel = (e) => {
    // prevent the default behavior of the wheel event
    // which is to scroll the page
    e.evt.preventDefault();

    // zoom factor
    const scaleBy = 1.1;
    // get the current stage
    const stage = stageRef.current;
    // store current scale for calculatins
    const oldScale = stage.scaleX();

    // get the mouse position relative to the stage in screen coordinates
    const pointer = stage.getPointerPosition();
    // calculate the new scale
    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    // determines new scale based on the wheel direction
    const newPos = {
      x: pointer.x - (pointer.x - position.x) * (newScale / oldScale),
      y: pointer.y - (pointer.y - position.y) * (newScale / oldScale),
    };
  };

}


// main ChoreographyMap component
const ChoreographyMap = () => {
  return (
    <div>
      <h1>my map</h1>
      {/* Add your map visualization and interaction logic here */}
    </div>
  );
};

export default ChoreographyMap;