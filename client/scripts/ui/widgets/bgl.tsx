import React, { useEffect, useRef } from "react";
import { ShaderPass, THREE } from "enable3d";
import { Random } from "../../../../server/common/rand";
import { WorldData } from "../../world/data";
import { getChunkType } from "../../world/chunktype";
import { Seed } from "../../world/seed";
import { OBJLoader } from "../../lib/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js';
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import * as POSTPROCESSING from "postprocessing"
import { SSGIEffect, TRAAEffect, MotionBlurEffect, VelocityDepthNormalPass } from "realism-effects"

async function doBGL(canvas: HTMLCanvasElement) {

  async function loadTex(url: string) {
    const textureLoader = new THREE.TextureLoader(new THREE.LoadingManager);
    return new Promise((r, re) => {
      textureLoader.load(url, (item) => {
        r(item);
      }, () => re(null));
    });
  }

  async function loadObj(url: string) {
    const loader = new OBJLoader(new THREE.LoadingManager);
    return new Promise((r, re) => {
      loader.load(url, (item) => {
        r(item);
      }, null, () => re(null));
    });
  }

  async function loadGlb(url: string) {
    const loader = new GLTFLoader(new THREE.LoadingManager);
    return new Promise((r, re) => {
      loader.load(url, (item) => {
        r(item);
      });
    });
  }

  const groundTextures = {
    forest: await loadTex('/resources/i/forest/res?prop=biome.ground.texture.resource.sources.0'),
    swamp: await loadTex('/resources/i/swamp/res?prop=biome.ground.texture.resource.sources.0'),
    magic: await loadTex('/resources/i/magic/res?prop=biome.ground.texture.resource.sources.0'),
    lava: await loadTex('/resources/i/lava/res?prop=biome.ground.texture.resource.sources.0'),
  }

  const sides = {
    forest: await loadTex('/resources/i/forest/res?prop=biome.ground.texture.resource.sources.1'),
    swamp: await loadTex('/resources/i/swamp/res?prop=biome.ground.texture.resource.sources.1'),
    magic: await loadTex('/resources/i/magic/res?prop=biome.ground.texture.resource.sources.1'),
    lava: await loadTex('/resources/i/lava/res?prop=biome.ground.texture.resource.sources.1'),
  }

  const leafTexture = await loadTex('/resources/i/leaf_texture/res');
  const player: {
    scene: THREE.Object3D,
    animations: THREE.AnimationClip[]
  } = await loadGlb('/resources/i/player/res') as any;

  const TreeStructure = {
    density: await (await fetch('/resources/i/grass?prop=structures.0.density')).text(),
    ...await (await fetch('/resources/i/grass?prop=structures.0.structure.object')).json(),
    obj: await loadObj('/resources/i/grass?prop=structures.0.structure.object&res=resource.src')
  };

  const structures = {
    forest: {
      ...TreeStructure,
      density: 2
    },
    magic: {
      ...TreeStructure,
      density: 5
    },
    swamp: TreeStructure
  }

  Seed.setSeed(Date.now().toString());
  WorldData.set('biomeColors', Object.keys(groundTextures).map(n => [n]));

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.shadowMap.enabled = true;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 2, 1000);

  camera.position.set(5, 10, 0); // Adjust the camera position to look down
  player.scene.position.z = 10; // Adjust the camera position to look down
  // camera.rotation.set(-Math.PI / 2, 0, 0); // Rotate the camera to look straight down

  const alight = new THREE.AmbientLight(0xdddddd, 1);
  scene.add(alight);

  const dlight = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(dlight);
  dlight.castShadow = true;
  dlight.shadow.mapSize.width = 1024;
  dlight.shadow.mapSize.height = 1024;
  var d = 40;
  dlight.shadow.camera.left = - d;
  dlight.shadow.camera.right = d;
  dlight.shadow.camera.top = d;
  dlight.shadow.camera.bottom = - d;
  dlight.shadow.camera.near = 0.5;
  dlight.shadow.camera.far = 10000;
  dlight.position.set(-40, 50, -0);

  let elevation = -5;
  let rowIndex = 1;
  let currentRow = Array(10).fill(null);
  let currentBoxes: THREE.Mesh[] = [];

  function findIndex() {
    const index = Random.from(0, 9);
    if (currentRow[index]) return findIndex();
    return index;
  }

  function generatePositions(x, z) {
    const roundedX = Math.round(x);
    const roundedZ = Math.round(z);
    const adjustedX = Math.floor(roundedX / 5) * 5;
    const adjustedZ = Math.floor(roundedZ / 5) * 5;
    return { x, z: adjustedZ };
  }

  function createBox(col: number) {

    const pos = generatePositions((col - 5) * 5, (
      elevation == 0 ? (rowIndex * 5) : player.scene.position.z
    ) - 20);

    const badBox = currentBoxes.find(box => box.userData.pos.x === pos.x && box.userData.pos.z === pos.z);

    if (badBox) {
      return badBox;
    }

    const type = getChunkType(pos.x, pos.z, 0.01, 0);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1, 5),
    );
    box.material = [
      new THREE.MeshToonMaterial({ opacity: 1, map: sides[type] }),
      new THREE.MeshToonMaterial({ opacity: 1, map: sides[type] }),
      new THREE.MeshToonMaterial({ opacity: 1, map: groundTextures[type] }),
      new THREE.MeshToonMaterial({ opacity: 1, map: sides[type] }),
      new THREE.MeshToonMaterial({ opacity: 1, map: sides[type] }),
      new THREE.MeshToonMaterial({ opacity: 1, map: groundTextures[type] })
    ]
    box.userData.pos = pos;
    box.castShadow = true;
    box.receiveShadow = true;

    const LeafMaterial = (type) => new THREE.MeshToonMaterial({
      color: type == 'magic' ? 0x861ac5 : 0x385848,
      map: leafTexture as any,
      emissive: type == 'magic' ? 0x210312 : 0x232324
    });

    const LogMaterial = new THREE.MeshToonMaterial({
      color: 0x660000,
      map: groundTextures.forest as any
    });

    if (structures[type] && pos.x !== 0 && pos.x !== 5) {
      const structure = structures[type];
      const rule = structure.structures[
        Random.pick(...Object.keys(structure.structures))
      ];
      const name = Random.pick(...rule.name);
      let obj = structure.obj.clone() as THREE.Object3D;
      obj.scale.set(0.5, 0.5, 0.5);
      obj.castShadow = true;
      obj.receiveShadow = true;
      obj.traverse((o: any) => {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.name == name) obj = o;
        if (o.material?.[0]?.name == 'Leaf') {
          o.material[0] = LeafMaterial(type);
        }
        if (o.material?.[1]?.name == 'Leaf') {
          o.material[1] = LeafMaterial(type);
        }
        if (o.material?.[0]?.name == 'Log') {
          o.material[0] = LogMaterial;
        }
        if (o.material?.[1]?.name == 'Log') {
          o.material[1] = LogMaterial;
        }
      });
      if (Random.from(0, parseInt(structure.density)) == 0) box.add(obj);
    }

    box.position.x = pos.x;
    box.position.y = elevation;
    box.position.z = pos.z;

    box.rotation.y = Random.pick(
      Math.PI / 2,
      Math.PI,
      0
    );

    box.userData.speed = Random.from(1, 5) / 10;


    scene.add(box);
    currentBoxes.push(box);
    return box;
  }

  function renderRow() {
    if (!currentRow.some(i => !i)) {
      rowIndex++;
      currentRow = Array(10).fill(null);
    }
    const currentIndex = findIndex();
    currentRow[currentIndex] = createBox(currentIndex);
  }

  elevation = 0;
  for (let i = 0; i < 200; i++) {
    renderRow();
  }
  elevation = -5;

  player.scene.position.y = 0.6;
  player.scene.castShadow = true;
  player.scene.children[0].rotation.x = -Math.PI / 10;
  player.scene.scale.set(0.5, 0.5, 0.5)

  scene.add(player.scene);

  player.scene.traverse(o => o.castShadow = true)

  let mixer = new THREE.AnimationMixer(player.scene);
  mixer.timeScale = 4;
  mixer.stopAllAction();
  const action = mixer.clipAction(player.animations[7]);
  action.reset();
  action.loop = THREE.LoopRepeat;
  action.play();

  const dayDuration = 60000; // 60 seconds for a full day
  const nightDuration = 60000; // 60 seconds for a full night
  const fullCycleDuration = dayDuration + nightDuration;

  const colors = {
    sunrise: new THREE.Color(0xff4500), // orangish sunrise color
    day: new THREE.Color(0xffffff), // normal daylight color
    sunset: new THREE.Color(0xff4500), // orangish sunset color
    night: new THREE.Color(0x0000ff), // blueish night color
    preDawn: new THREE.Color(0x87ceeb) // whiter blueish color before sunrise
  };

  const lightPositions = {
    sunrise: new THREE.Vector3(-40, 50, 0),
    sunset: new THREE.Vector3(40, 50, 0)
  };

  // Function to update light color and position based on time
  function updateLight(elapsedTime) {
    const cycleTime = elapsedTime % fullCycleDuration;
    const halfCycle = fullCycleDuration / 2;

    lightPositions.sunset.z = dlight.position.z;
    lightPositions.sunrise.z = dlight.position.z;

    if (cycleTime < dayDuration) {
      // Day phase
      const dayProgress = cycleTime / dayDuration;

      // Interpolate color and position for morning to afternoon
      if (dayProgress < 0.5) {
        const sunriseProgress = dayProgress * 2;
        dlight.color.lerpColors(colors.sunrise, colors.day, sunriseProgress);
        dlight.position.lerpVectors(lightPositions.sunrise, lightPositions.sunset, sunriseProgress);
      } else {
        const sunsetProgress = (dayProgress - 0.5) * 2;
        dlight.color.lerpColors(colors.day, colors.sunset, sunsetProgress);
        dlight.position.lerpVectors(lightPositions.sunset, lightPositions.sunrise, sunsetProgress);
      }
    } else {
      // Night phase
      const nightProgress = (cycleTime - dayDuration) / nightDuration;

      // Interpolate color and position for dusk to dawn
      if (nightProgress < 0.5) {
        const nightfallProgress = nightProgress * 2;
        dlight.color.lerpColors(colors.sunset, colors.night, nightfallProgress);
      } else {
        const preDawnProgress = (nightProgress - 0.5) * 2;
        dlight.color.lerpColors(colors.night, colors.preDawn, preDawnProgress);
      }
    }
  }

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloompass = new UnrealBloomPass(
    new THREE.Vector2(canvas.width, canvas.height),
    0.5, 0.0, 1.01
  );
  composer.addPass(bloompass)


  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false
  };

  // save pass
  const savePass = new SavePass(
    new THREE.WebGLRenderTarget(
      canvas.width,
      canvas.height,
      renderTargetParameters
    )
  );

  // blend pass
  const blendPass = new ShaderPass(BlendShader, "tDiffuse1");
  blendPass.uniforms["tDiffuse2"].value = savePass.renderTarget.texture;
  blendPass.uniforms["mixRatio"].value = 0.7;

  // output pass
  const outputPass = new ShaderPass(CopyShader);
  outputPass.renderToScreen = true;

  composer.addPass(blendPass);
  composer.addPass(savePass);
  composer.addPass(outputPass);

  const ssaoPass = new SSAOPass(scene, camera, renderer.getSize(new THREE.Vector2()).x, renderer.getSize(new THREE.Vector2()).y);
  ssaoPass.kernelRadius = 16;
  ssaoPass.minDistance = 0.02;
  ssaoPass.maxDistance = Infinity;
  composer.addPass(ssaoPass);


  const particles: THREE.Mesh[] = [];

  function spawnParticles(position: THREE.Vector3) {

    if (Random.from(1, 2) == 1) return;

    const fromPosition = position.clone().subScalar(0.5);
    const toPosition = position.clone().addScalar(0.5);

    const count = Random.from(1, 5); // Random number of particles

    for (let index = 0; index < count; index++) {
      // Select random position within the given range
      const particlePosition = new THREE.Vector3(
        Random.from(fromPosition.x, toPosition.x),
        Random.from(fromPosition.y, toPosition.y),
        Random.from(fromPosition.z, toPosition.z)
      );

      // Create a mesh for the particle
      const particleGeometry = new THREE.SphereGeometry(0.05); // Small sphere for particle
      const particleMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1.5
      });
      const particleMesh = new THREE.Mesh(particleGeometry, particleMaterial);
      particleMesh.position.copy(particlePosition);

      // This will be the velocity in the z direction (moving away from the player)
      const particleSpeed = Random.from(1, 5) / 20; // Make it into a decimal
      const particleDirection = Random.from(-1, 1) / 10; // Random x direction multiplier
      const gravity = Random.from(1, 3) / 100; // Small gravity effect

      particleMesh.userData = {
        particleSpeed,
        particleDirection,
        gravity,
        lifetime: Random.from(25, 100), // Random lifetime between 1 and 3 seconds
        life: 0 // Initial age of the particle
      };

      particles.push(particleMesh);
      scene.add(particleMesh);
    }
  }


  function updateParticles(deltaTime) {
    particles.forEach(particle => {
      const data = particle.userData;

      // Update particle age
      data.life++;

      if (data.life >= data.lifetime) {
        // Remove particle
        scene.remove(particle);
        particles.splice(particles.indexOf(particle), 1);
      } else {
        // Update particle position based on velocity and gravity
        const velocityX = data.particleSpeed * data.particleDirection;
        const velocityZ = -data.particleSpeed; // Moves away from the player in the z direction
        const velocityY = -data.gravity; // Gravity effect

        particle.position.x += velocityX;
        particle.position.y += velocityY;
        particle.position.z -= velocityZ;

        // Optionally, you can also adjust size, color, or other properties based on lifetime
        const alpha = 1 - (data.life / data.lifetime);
        (particle as any).material.opacity = alpha; // Fade out as lifetime progresses
      }
    });
  }

  let shakeIntensity = 0; // The maximum intensity of the shake
  let shakeDuration = 0;  // The duration of the shake effect
  let shakeTimer = 0;     // Timer to track the shake duration

  const shakeParams = {
    intensity: 0.5, // Maximum shake intensity
    duration: 0.5,  // Duration of the shake in seconds
  };

  function triggerShake(intensity, duration) {
    shakeIntensity = intensity;
    shakeDuration = duration;
    shakeTimer = duration;
  }

  function updateCameraShake(deltaTime) {
    if (shakeTimer > 0) {
      // Calculate shake amount
      const shakeAmount = shakeIntensity * Math.random();

      // Apply shake to camera position
      camera.position.x += (Math.random() - 0.5) * shakeAmount;
      camera.position.y += (Math.random() - 0.5) * shakeAmount;
      camera.position.z += (Math.random() - 0.5) * shakeAmount;

      // Update shake timer
      shakeTimer -= deltaTime;

      // If shake is done, reset intensity
      if (shakeTimer <= 0) {
        shakeIntensity = 0;
      }
    }
  }


  const clock = new THREE.Clock();

  const pspeed = 0.2;
  const endTime = 1000;
  let ended = false;

  function render() {
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime() * 1000;

    // updateCameraShake(delta);
    // if(Random.from(0, 1000) == 7){
    //   triggerShake(0.5, 1.0);
    // }

    if(elapsedTime < endTime) {
      renderRow();
      updateLight(elapsedTime);
      camera.lookAt(
        player.scene.position
        .clone().add(new THREE.Vector3(4, 0, 0))
      )

      currentBoxes.forEach(box => {
        if (box.position.distanceTo(camera.position) > 40) {
          currentBoxes.splice(currentBoxes.indexOf(box), 1);
          scene.remove(box);
        }
        if (box.position.y < 0) box.position.y += box.userData.speed;
        if (box.position.y > 0) box.position.y = 0;
      });
      player.scene.position.z -= pspeed;
      camera.position.z -= pspeed;
      dlight.position.z -= pspeed;
      dlight.target.position.z -= pspeed;
      dlight.target.updateMatrixWorld();
      dlight.updateMatrixWorld();
      blendPass.uniforms["mixRatio"].value = Random.from(5, 9) / 10;
    } else if(!ended){
      player.scene.children[0].rotation.x = 0;
      mixer.timeScale = 1;
      mixer.stopAllAction();
      const idle = mixer.clipAction(player.animations[2]);
      idle.loop = THREE.LoopRepeat;
      idle.play();
      endTime;
      ended = true;
    } else {
      composer.removePass(bloompass);
      // if(currentBoxes.length > 1) currentBoxes.forEach(box => {
      //   if (box.position.distanceTo(player.scene.position.clone()) > 5) {
      //     if (box.position.y < -10){
      //       currentBoxes.splice(currentBoxes.indexOf(box), 1);
      //       scene.remove(box);
      //     } else {
      //       box.position.y -= box.userData.speed;
      //     }
      //   }
      //   if(currentBoxes.filter(box => box.position.y >= 0).length == 2){
      //     scene.remove(currentBoxes.sort((a, b) => {
      //       return b.position.distanceTo(player.scene.position.clone()) - a.position.distanceTo(player.scene.position.clone());
      //     }).shift()!);
      //   }
      // });
      // else currentBoxes.forEach(box => {
      //   if(Math.floor(player.scene.position.z + 5) > Math.floor(box.position.z + 5)){
      //     box.position.z += 0.1;
      //     box.userData.moveBackward = true;
      //   } else if(!box.userData.moveBackward && Math.floor(player.scene.position.z - 5) < Math.floor(box.position.z + 5)){
      //     box.position.z -= 0.1;
      //   } else {
      //     if(!camera.userData.turned){
      //       camera.position.set(0, 4, 20);
      //       player.scene.position.x -= 3.5 * (canvas.width / canvas.height);
      //       currentBoxes[0].position.x -= 3.5 * (canvas.width / canvas.height);
      //       camera.userData.turned = true;
      //     }
      //   }
      // });

      if(!camera.userData.turned){
        camera.position.set(0, 4, 20);
        player.scene.position.x -= 3.5 * (canvas.width / canvas.height);
        currentBoxes[0].position.x -= 3.5 * (canvas.width / canvas.height);
        camera.userData.turned = true;
      }

      if(camera.userData.turned){
        camera.lookAt(
          new THREE.Vector3(0)
        )
      } else {
        camera.lookAt(
          player.scene.position
        )
      }
    }
    mixer.update(delta);
    spawnParticles(player.scene.position);
    updateParticles(delta);

    composer.render();
    requestAnimationFrame(render);
  }
  clock.start();
  render();
}

export function BGLogin() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      doBGL(canvas);
    }
  }, []);

  return <canvas className="page-background" width={window.innerWidth} height={window.innerHeight} ref={canvasRef}></canvas>
}