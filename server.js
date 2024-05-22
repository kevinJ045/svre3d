#!/bin/node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { watch } from 'chokidar';

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

const restartServer =  (event, filename) => {
  console.clear();
  console.log('updated file');
  startServer();
}

watch(res_path, { recursive: true },	
).on('change',restartServer);
watch(server_path, { recursive: true })
.on('change',restartServer);
process.on('beforeExit', () => childProcess?.kill())

startServer();
