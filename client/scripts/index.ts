import { PlayerInfo } from "./repositories/player.js";
import { ResourceMap } from "./repositories/resources.js";
import { initScene } from "./scene/init.js";
import { connectSocket } from "./socket/socket.js";
import { WorldData } from "./world/data.js";
import { Seed } from "./world/seed.js";
import { createRoot } from "react-dom/client";
import * as React from "react";
import { StartPage } from "./ui/componets/startpage.js";


const root = createRoot(document.querySelector('#pages')!);

root.render(
  React.createElement(StartPage, {
    start: (setCurrentPage: (a: string) => void) => connectSocket(({
      player,
      resources,
      playerEntity,
      worldData
    }) => {
    
      if (PlayerInfo.player.username) return;
      setCurrentPage('game');
    
      PlayerInfo.setPlayer(player);
      PlayerInfo.setPlayerEntity(playerEntity);
      ResourceMap.queue.push(...resources);
    
      Seed.setSeed(worldData.seed);
      WorldData.setData(worldData);
    
    
      initScene();
    }, () => setCurrentPage('login'))
  })
);
