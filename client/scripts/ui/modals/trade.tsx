import { createRoot } from "react-dom/client";
import UI from "../uiman";
import React, { useEffect, useRef, useState } from "react";
import { SlotItem } from "../widgets/slotitem";
import { Items } from "../../repositories/items";
import { InventoryItem } from "../widgets/inventory";
import { PlayerInfo } from "../../repositories/player";
import { THREE } from "enable3d";
import { cloneGltf } from "../../lib/gltfclone";

export type ItemIDAndQt = {
  item: string,
  quantity: number
};
export type TradeListType = {
  name: string,
  items: {
    costs: ItemIDAndQt[],
    items: ItemIDAndQt[]
  }[]
};

export const TradeList = ({ list, close }: { list: TradeListType, close: () => void }) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    // Initialize THREE.js scene
    const initTHREE = () => {
      const width = previewRef.current?.clientWidth || 200;
      const height = 400;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setClearAlpha(0);
      previewRef.current?.appendChild(renderer.domElement);

      const sun = new THREE.AmbientLight(0xffffff, 1);
      scene.add(sun);

      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
    };

    initTHREE();

    const animate = () => {
      requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      if(modelRef.current){
        // modelRef.current.rotation.x += 0.01;
        modelRef.current.rotation.y += 0.01;
      }
    };

    animate();

    return () => {
      // Cleanup on component unmount
      rendererRef.current?.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      modelRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Load and display the 3D model when selectedItem changes
    if (selectedItem) {
      console.log(selectedItem);
      const loadModel = async () => {
        const item = Items.create({ itemID: selectedItem.item, quantity: selectedItem.quantity } as any);
        const resource = item.reference.resource.loader == "gltf" ? cloneGltf(item.reference.resource.load) : item.reference.resource.load.clone();

        resource.scale.setScalar(2.5)

        if (modelRef.current) {
          sceneRef.current?.remove(modelRef.current);
        }

        modelRef.current = resource;
        sceneRef.current?.add(modelRef.current!);
      };

      loadModel();
    }
  }, [selectedItem]);

  return (
    <div className="trade-modal">
      <div className="trade-list">
        <h2>{list.name}</h2>
        <div className="main-grid">
          <div className="item-preview" ref={previewRef}></div>
          <div className="trade-items">
            {list.items.map((tradeItem, index) => (
              <div key={index} className="trade-item" onClick={() => setSelectedItem(tradeItem.items[0])}>
                <div className="costs items-list">
                  {[...tradeItem.costs, ...tradeItem.costs, ...tradeItem.costs].map((cost, costIndex) => (
                    <SlotItem
                      key={costIndex}
                      click={false}
                      item={Items.create({
                        itemID: cost.item,
                        quantity: cost.quantity,
                      } as any)}
                    ></SlotItem>
                  ))}
                </div>
                <div className="items items-list">
                  {tradeItem.items.map((item, itemIndex) => (
                    <SlotItem
                      key={itemIndex}
                      click={false}
                      item={Items.create({
                        itemID: item.item,
                        quantity: item.quantity,
                      } as any)}
                    ></SlotItem>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="close" onClick={close}></div>
      </div>
    </div>
  );
};


export default class TradeUI {


  static open(tradeMenu: TradeListType) {
    const container = document.createElement('div');
    UI.uiRoot.appendChild(container);
    const root = createRoot(container);

    const removeComponent = () => {
      root.unmount();
      UI.uiRoot.removeChild(container);
    };

    const list = <TradeList list={tradeMenu} close={removeComponent} />;
    root.render(list);
  }


}