import * as Noise from 'noisejs'; 
import seedrandom from 'seedrandom';
import { Entity } from "../models/entity.js";
import { Biomes } from "../repositories/biomes.js";

import { THREE } from "enable3d";
import { Equipments } from '../repositories/equipments';
import { Random } from '../../../server/common/rand';
import { SceneManager } from '../common/sceneman';
import { ResourceMap } from '../repositories/resources';








export class SkinPlayer {

    static createCanvasImage(player: Entity, colors: string[], side: number,
        width = 1000, height = 1000){
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const rng = seedrandom(player.data.username + (side || '-').toString());
        const noise = new Noise.Noise(rng());
      
        canvas.width = width;
        canvas.height = height;
      
        // Fill the canvas with a pattern based on Perlin noise
        const pixelSize = 10; // Size of each pixel block
        for (let y = 0; y < height; y += pixelSize) {
          for (let x = 0; x < width; x += pixelSize) {
            // Generate Perlin noise at the pixel position

             const color = Random.pick(
                ...colors,
                () => Math.abs(noise.perlin2(x * 0.01, y * 0.01) * 10)
             );
      
            // Set the fill color
            ctx.fillStyle = color;
      
            // Draw a block of the pixel size
            ctx.fillRect(x, y, pixelSize, pixelSize);
          }
        }
      
        // Create a Three.js texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);

        // document.body.innerHTML = `<img src="${canvas.toDataURL()}" />`;
      
        // Return the texture
        return texture;
    }



    static skinPlayer(player: Entity){
        
        console.log(player.variant);

        const biome = Biomes.find(player.variant);
        
        if(!biome) return; // If biome doesn't exist

        const colors = Array.isArray(biome.biome.colors) ? [...biome.biome.colors] : [biome.biome.colors];
        colors.push(player.data.color);

        const settings = {
            emissive: 0
        }

        const body = Equipments.entityBody('body', player);
        body.children[0].material = new THREE.MeshLambertMaterial({
            map: this.createCanvasImage(player, colors, 1001),
            ...settings
        });
        colors.pop();
        body.children[3].material = new THREE.MeshLambertMaterial({
            map: this.createCanvasImage(player, colors, 110, 150, 400),
            ...settings
        });

    }

}
