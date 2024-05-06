import React, { useEffect, useRef, useState } from 'react';
import { Random } from '../../../server/common/rand.ts';
import { Noise } from '../../../server/lib/noise/index.ts';

export const Running2dGoobers = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;

  const gridSize = 10;

  class Square {
    gridX = 0;
    gridY = 0;
    color = '';
    size = 0;
    direction = 'left';

    speed = 0.1;

    constructor(gridX, gridY, size, color) {
      this.gridX = gridX;
      this.gridY = gridY;
      this.size = size;
      this.color = color;
      this.direction = this.getRandomDirection();

      this.speed = Random.from(1, 3) / 10;
    }

    blink = 0;
    draw() {
      const x = this.gridX * gridSize;
      const y = this.gridY * gridSize;

      ctx.fillStyle = this.color;
      ctx.fillRect(x, y, this.size, this.size);

      const eyeSize = this.size * 0.6;
      const eyeOffset = eyeSize / 3;

      const blink = Random.from(0, 50) == 5;
      if(blink){
        this.blink = 5;
      }

      ctx.fillStyle = this.blink ? this.color : 'white';
      ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
      ctx.fillStyle = this.blink ? this.color : 'black';
      ctx.fillRect(x + eyeOffset + eyeSize * 0.25, y + eyeOffset + eyeSize * 0.25, eyeSize * 0.5, eyeSize * 0.5);
      ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize / 3);
      if(this.blink){
        ctx.fillStyle = 'black';
        ctx.fillRect(x + eyeOffset, y + eyeOffset + eyeSize/2, eyeSize, eyeSize / 4);
      }
      if(this.blink > 0) this.blink--;
    }


    update() {

      switch (this.direction) {
        case 'left':
          this.gridX -= this.speed;
          break;
        case 'right':
          this.gridX += this.speed;
          break;
        case 'up':
          this.gridY -= this.speed;
          break;
        case 'down':
          this.gridY += this.speed;
          break;
      }

      if (this.gridX < 0) this.gridX = canvas.width / gridSize - 1;
      if (this.gridX >= canvas.width / gridSize) this.gridX = 0;
      if (this.gridY < 0) this.gridY = canvas.height / gridSize - 1;
      if (this.gridY >= canvas.height / gridSize) this.gridY = 0;

      if (Math.random() < 0.1) {
        this.direction = this.getRandomDirection();
      }
    }

    getRandomDirection() {
      const directions = ['left', 'right', 'up', 'down'];
      const randomIndex = Math.floor(Math.random() * directions.length);
      return directions[randomIndex];
    }
  }

  const squares: Square[] = [];


  const numSquares = 50;
  const squareSize = gridSize;

  for (let i = 0; i < numSquares; i++) {
    const gridX = Math.floor(Math.random() * (canvas.width / gridSize));
    const gridY = Math.floor(Math.random() * (canvas.height / gridSize));
    const color = `hsl(${Math.random() * 360}, 100%, 50%)`; // Random color
    squares.push(new Square(gridX, gridY, squareSize, color));
  }

  function animate() {

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    squares.forEach(square => {
      ctx.fillStyle = square.color;
      ctx.fillRect(square.gridX * gridSize, square.gridY * gridSize, square.size, square.size);

      square.update();
      square.draw();
    });


    requestAnimationFrame(animate);
  }

  animate();

}


export const LoginBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      Running2dGoobers(canvas);
    }
  }, []);

  return (
    <div className='login-bg'>
      <canvas width={window.innerWidth} height={window.innerHeight} ref={canvasRef}></canvas>
    </div>
  );
}