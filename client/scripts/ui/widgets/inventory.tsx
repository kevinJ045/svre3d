import React, { useState } from 'react';
import { ItemIcon } from './slotitem';
import { Equipments } from '../../repositories/equipments';
import { PlayerInfo } from '../../repositories/player';


export const InventoryItem = ({
  selectItem,
  unselectItem,
  item,
  free = false,
  mouse = true,
  click = true,
  counter = true,

  onClick,

  secondaryClick = (any: any) => {}
} : {
  [key: string]: any
}) => {

  const onclick = () => {
    if (onClick) onClick();
    if (!click) return;
    if (item?.reference?.equipment) {
      if (item?.data.wid) {
        Equipments.unequip(PlayerInfo.entity, item?.reference!.equipment!.type!, item);
      } else {
        Equipments.equip(PlayerInfo.entity, item?.reference!.equipment!.type!, item);
      }
    }
  }
  return (<div 
    onClick={onclick}
    onMouseEnter={
      () => mouse ? selectItem(item) : null
    }
    onContextMenu={(e) => {
      e.preventDefault();
      secondaryClick(item);
    }}
    // onMouseLeave={
    //   () => unselectItem(item)
    // }
    className={free ? '' : "inventory-item"}>
      <div className="item-icon">
        <ItemIcon item={item}></ItemIcon>
      </div>

      <div className="item-info">
        <div className="item-name">
          {item.reference?.item?.name || item.itemID}
        </div>
        <div className="item-quantity">
          {item.data?.wid ? <>
            <span className="icon c xsm icon-tshirt"></span>
          </> : item.quantity}
        </div>
      </div>

    </div>);
}

const Inventory = ({ 
  inventory,
  selectItem,
  unselectItem,
}) => {

  return (
    <div className="inventory">
      {
        inventory.map((item, index) => 
          <InventoryItem
            key={index}
            selectItem={selectItem}
            unselectItem={unselectItem}
            item={item}
            ></InventoryItem>)
      }
    </div>
  );
};

export default Inventory;
