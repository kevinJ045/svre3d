// server.js
import express from 'express';
// @ts-ignore
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import * as socketIo from 'socket.io';
import http from "http";
import { init, userConnected } from './init.js';
import { Sockets } from './ping/sockets.js';
import { Data } from './db/db.js';
import { env } from './constant/env.js';
import { ResourceMap } from './repositories/resources.js';
import { getPropStr } from './common/getpropstr.js';

const app = express();
const PORT = process.env.PORT || 3000;

const serverData =  {
  seed: "jimba",
  players: [],
  users: {
    'u': 'makano'
  }
}

async function createApp() {
  // Create Vite dev server
  
  const vite = await createViteServer({
    server: { middlewareMode: 'html' as any }
  });

  await Data.connect(env.mongoURL);

  app.get('/lsdir/*', async (req, res) => {
  	const requestedPath = req.originalUrl.split('/lsdir/')[1];
    const directoryPath = path.resolve('client', requestedPath);
    try {
      const files = await fs.promises.readdir(directoryPath);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(files));
    } catch (error) {
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  const httpServer = http.createServer(app);
  
  // Initialize Socket.IO
  const io = new socketIo.Server(httpServer);

  Sockets.setIO(io);

  io.on('connection', (socket) => {
    userConnected(serverData, socket);
  });

  app.get('/resources/:package/:id/icon', (req, res) => {
    res.sendFile(
      ResourceMap.findResource(req.params.package+':'+req.params.id)?.ui?.icon?.src
    );
  });

  app.get('/resources/:package/:id/res', (req, res) => {
    const ref = ResourceMap.findResource(req.params.package+':'+req.params.id);
    let src = ref?.resource?.src;

    if(req.query.prop){
      src = getPropStr(ref!, req.query.prop) as any;
    }
    res.sendFile(
      src
    );
  });

  app.get('/resources/:package/:id', (req, res) => {
    res.send(
      ResourceMap.findResource(req.params.package+':'+req.params.id)
    );
  });

  app.get('/resources/all', (req, res) => {
    res.send(
      ResourceMap.all()
    );
  });

  app.use(vite.middlewares);

  // Serve index.html for all other routes (SPA fallback)
  app.get('*', async (req, res) => {
    const url = req.originalUrl;
    try {
      const template = await vite.transformIndexHtml(url, await (vite as any).read(url));
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      console.log(e);
      res.status(500).end(e.message);
    }
  });

  // Start Express server
  httpServer.listen(PORT, () => {
    
    init(serverData);
    
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

createApp();
