import React, { useState } from 'react';
import { ItemIcon } from './slotitem';
import { Equipments } from '../../repositories/equipments';
import { PlayerInfo } from '../../repositories/player';
import { Item } from '../../models/item';


export const InventoryItem = ({
  selectItem,
  unselectItem,
  item,
  free = false,
  mouse = false,
  click = true,
  counter = true,
  selectedItem = {},

  onClick,

  secondaryClick = (any: any) => {}
} : {
  [key: string]: any
}) => {

  const onclick = () => {
    if (onClick) {
      const result = onClick(item);
      if(result == 'no_aftereffect') return;
    }
    if (!click) return;
    selectItem?.(item);
    // if (item?.reference?.equipment) {
    //   if (item?.data.wid) {
    //     Equipments.unequip(PlayerInfo.entity, item?.reference!.equipment!.type!, item);
    //   } else {
    //     Equipments.equip(PlayerInfo.entity, item?.reference!.equipment!.type!, item);
    //   }
    // }
  }
  return (<div 
    onClick={onclick}
    onMouseEnter={
      () => mouse ? selectItem?.(item) : null
    }
    // onContextMenu={(e) => {
    //   e.preventDefault();
    //   secondaryClick(item);
    // }}
    className={(free ? '' : "inventory-item")+' '+(selectedItem ? (selectedItem.id == item.id ? 'active' : '') : '')}>

      {
        item.reference.item.achievement && <div className="item-badge">
          <div className="icon c sm icon-ribbon"></div>
        </div>
      }

      <div className="item-icon">
        <ItemIcon item={item}></ItemIcon>
      </div>

      <div className="item-info" style={
        item.data?.brush_color ? {
          borderLeft: '1px solid '+item.data?.brush_color 
        } : {}
      }>
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
  onClick,
  className = '',
  selectedItem = {}
} : {
  inventory: Item[],
  onClick: (item: Item) => string | undefined | null | void
  [key: string]: any
}) => {

  return (
    <div className={"inventory "+className}>
      {
        inventory.map((item, index) => 
          <InventoryItem
            key={index}
            selectedItem={selectedItem}
            selectItem={selectItem}
            unselectItem={unselectItem}
            item={item}
            onClick={onClick}
            ></InventoryItem>)
      }
    </div>
  );
};

export default Inventory;
