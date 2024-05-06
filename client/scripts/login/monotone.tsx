import React, { useEffect, useRef } from "react";


export const MonoChromeCanvas = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d')!;

  canvas.width = (canvas.parentNode as HTMLElement).getBoundingClientRect().width;
  canvas.height = (canvas.parentNode as HTMLElement).getBoundingClientRect().height * 0.95;

  const cellWidth = 10;
  const cellHeight = 10; 

  const solidColor = window.getComputedStyle(canvas).getPropertyValue('--background') || '#000000'; 


  function drawGridFadeEffectWithGaps() {
    const cols = canvas.width / cellWidth;
    const rows = canvas.height / cellHeight;

    context.fillStyle = solidColor;
    context.fillRect(0, 0, canvas.width, canvas.height * 0.7);

    for (let y = Math.floor(rows * 0.7); y < rows; y++) {
      const yIndex = y - Math.floor(rows * 0.7);
      const gap = yIndex ? 3 : 1;
      const scatterChance = yIndex / (rows * 0.3); 

      for (let x = 0; x < cols; x++) {
        if (Math.random() < scatterChance) {
          continue;
        }

        context.fillStyle = solidColor;

        context.fillRect(x * cellWidth + gap / 2, y * cellHeight + gap / 2, cellWidth - gap, cellHeight - gap);
      }
    }
  }

  drawGridFadeEffectWithGaps();
}



export const MonotoneBg = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      MonoChromeCanvas(canvas);
    }
  }, []);

  return (
    <canvas className='monochrome-bg' ref={canvasRef}></canvas>
  );
}