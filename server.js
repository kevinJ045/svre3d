#!/bin/node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const res_path = path.resolve('./client/res/json');

let childProcess;


const startServer = () => {
  // If a child process already exists, terminate it
  if (childProcess) {
    childProcess.kill();
  }

  // Start the server as a child process
  childProcess = spawn('bun', ['--watch','server/index.ts'], {
    stdio: 'inherit', 
   });

};


fs.watch(res_path, 
	{ recursive: true },	
	(event, filename) => {
		console.log('updated json', filename);
		startServer();
		
	});


startServer();
