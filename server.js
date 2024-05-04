#!/bin/node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const res_path = path.resolve('./packages');
const server_path = path.resolve('./server');

let childProcess;


const startServer = () => {
  // If a child process already exists, terminate it
  if (childProcess) {
    childProcess.kill();
  }

  // Start the server as a child process
  childProcess = spawn('bun', ['server/index.ts'], {
    stdio: 'inherit', 
   });

};


fs.watch(res_path, 
	{ recursive: true },	
	(event, filename) => {
    console.clear();
		console.log('updated yaml', filename);
		startServer();
		
	});
fs.watch(server_path, 
  { recursive: true },	
  (event, filename) => {
    console.clear();
    startServer();
  });

startServer();
