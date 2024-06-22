/**
 * Uncomment the scene you want to run. (default three.js)
 */

import { PlayerInfo } from "./repositories/player.js";
import { ResourceMap } from "./repositories/resources.js";
import { initScene } from "./scene/init.js";
import { connectSocket } from "./socket/socket.js";
import { WorldData } from "./world/data.js";
import { Seed } from "./world/seed.js";

// start three.js scene (with enable3d physics)
// import './three'

// start standalone enable3d scene
// import './standalone'


connectSocket(({
  player,
  resources,
  playerEntity,
  worldData
}) => {

  if (PlayerInfo.player.username) return;

  PlayerInfo.setPlayer(player);
  PlayerInfo.setPlayerEntity(playerEntity);
  ResourceMap.queue.push(...resources);

  Seed.setSeed(worldData.seed);
  WorldData.setData(worldData);


  initScene();
});

