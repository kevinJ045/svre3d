import { createRoot } from "react-dom/client";
import UI from "../uiman";
import React, { useEffect, useRef, useState } from "react";
import { ItemIcon } from "../widgets/slotitem";
import { Items } from "../../repositories/items";
import { InventoryItem } from "../widgets/inventory";
import { PlayerInfo } from "../../repositories/player";
import { ExtendedMesh, ExtendedObject3D, THREE } from "enable3d";
import { cloneGltf } from "../../lib/gltfclone";
import { Entities } from "../../repositories/entities";

export type ItemIDAndQt = {
  item: string,
  quantity: number
};
export type TradeItem = {
  costs: ItemIDAndQt[],
  items: ItemIDAndQt[]
};
export type TradeListType = {
  name: string,
  items: TradeItem[]
};

export const TradeList = ({ list, close }: { list: TradeListType, close: () => void }) => {
  const [selectedItem, setSelectedItem] = useState<TradeItem | null>(null);

  const hasAllItems = (tradeItem: TradeItem) => tradeItem.costs.every(i => PlayerInfo.entity?.countItemsInInventory({ itemID: i.item } as any) || 0 >= i.quantity);

  const trade = () => {
    if(selectedItem){
      const has = hasAllItems(selectedItem);
      if(has){
        selectedItem.costs.forEach(cost => {
          PlayerInfo.entity.removeFromInventory(Items.create({
            itemID: cost.item,
            quantity: cost.quantity,
          } as any), cost.quantity)
        });
        selectedItem.items.forEach(item => {
          PlayerInfo.entity.addToInventory(Items.create({
            itemID: item.item,
            quantity: item.quantity,
          } as any))
        });
      }
    }
  }

  return (
    <div className="trade-modal">
      <div className="trade-list">
        <h2>{list.name}</h2>
        <div className="main-grid">
          <div className="trader-face">
            {selectedItem && <div className="items-list">
              {selectedItem.items.map((item, index) => (
                <ItemIcon
                  key={index}
                  item={Items.create({
                    itemID: item.item,
                    quantity: item.quantity,
                  } as any)}
                ></ItemIcon>
              ))}  
            </div>}
            {selectedItem && <div className="trade-button" onClick={trade}>Trade</div>}
          </div>
          <div className="trade-items">
            {list.items.map((tradeItem, index) => (
              <div key={index} className={"trade-item "+ (hasAllItems(tradeItem) ? '' : 'locked')} onClick={() => hasAllItems(tradeItem) ? setSelectedItem(tradeItem) : {}}>
                <div className="costs items-list">
                  {tradeItem.costs.map((cost, costIndex) => (
                    <ItemIcon
                      key={costIndex}
                      item={Items.create({
                        itemID: cost.item,
                        quantity: cost.quantity,
                      } as any)}
                    ></ItemIcon>
                  ))}
                </div>
                <div className="items items-list">
                  {tradeItem.items.map((item, itemIndex) => (
                    <ItemIcon
                      key={itemIndex}
                      item={Items.create({
                        itemID: item.item,
                        quantity: item.quantity,
                      } as any)}
                    ></ItemIcon>
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