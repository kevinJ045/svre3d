import * as React from "react";
import { Map2D } from "../misc/map.js";

export const Map2DWidget = (
	{ activeTab }
) => {

	const canvasRef = React.useRef(null);
	const inputRef = React.useRef(null);
	const infoRef = React.useRef(null);

  React.useEffect(() => {
    const createCanvas = (canvas) => {
      Map2D.create(canvas, infoRef.current as any, inputRef.current as any);
    };

    if (canvasRef.current) {
      createCanvas(canvasRef.current);
    }
  });

	return (
		<div>
      <div ref={infoRef} className="info-area"></div>
      <input ref={inputRef} type="range" className="zoom-range" min="0.075" max="1.5" step="0.1" />
      <canvas ref={canvasRef} id="map"></canvas>
    </div>
	)
}