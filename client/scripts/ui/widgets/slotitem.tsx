import { Item } from "../../models/item.js"
import * as React from "react";
import { Equipments } from "../../repositories/equipments.js";
import { PlayerInfo } from "../../repositories/player.js";
import { generateItemIcon } from "../misc/itemicon.js";

export const ItemIcon = ({ item, onClick }: { onClick?: () => void,item: Item }) => {
  // Check if the item has an icon configuration
  const hasIcon = item?.reference?.ui?.icon;

  // CSS classes for styling based on whether the item has an icon
  const classNames = `${hasIcon ? ' item-icon-image c' : ''}`;

  // Inline styles for the item icon
  const iconStyle = generateItemIcon(hasIcon);

  return (
    <div className={classNames} onClick={onClick ?? (() => {})} style={iconStyle}></div>
  );
};
