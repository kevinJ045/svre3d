import * as React from "react";
import { Map2D } from "../misc/map.js";

export const Map2DWidget = (
	{ activeTab }
) => {

	const canvasRef = React.useRef(null);

  React.useEffect(() => {
    // Function to create the canvas content
    const createCanvas = (canvas) => {
      Map2D.create(canvas);
    };

    Map2D.activeTab = activeTab;

    // Call createCanvas function when canvasRef is loaded
    if (canvasRef.current) {
      createCanvas(canvasRef.current);
    }
  });

	return (
		<canvas ref={canvasRef} id="map"></canvas>
	)
}