import { Item } from "../../models/item.js"
import * as React from "react";
import { Equipments } from "../../repositories/equipments.js";
import { PlayerInfo } from "../../repositories/player.js";
import { generateItemIcon } from "../misc/itemicon.js";

export const SlotItem = ({ item, click = true, counter = true, onClick }: { onClick?: any, counter?: boolean, click?: boolean, item: Item }) => {
  // Check if the item has an icon configuration
  const hasIcon = item?.reference?.ui?.icon;

  // CSS classes for styling based on whether the item has an icon
  const classNames = `item${hasIcon ? ' with-icon' : ''}`;

  // Inline styles for the item icon
  const iconStyle = generateItemIcon(hasIcon);

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

  return (
    <div className={classNames} onClick={onclick} style={iconStyle}>
      {counter && <span className="item-count">{item.quantity}</span>}
    </div>
  );
};
