import { Item } from "../../models/item"
import * as React from "react";

export const SlotItem = ({ item }: { item: Item }) => {
  // Check if the item has an icon configuration
  const hasIcon = item?.reference?.config?.icon;

  // CSS classes for styling based on whether the item has an icon
  const classNames = `item${hasIcon ? ' with-icon' : ''}`;

  // Inline styles for the item icon
  const iconStyle: React.CSSProperties = {};
  if (hasIcon) {
    const { src, width = '100%', height = '100%', offset } = item.reference.config!.icon;
    iconStyle.backgroundImage = `url("${src}")`;
    iconStyle.backgroundSize = `${width} ${height}`;
    if (offset) {
      iconStyle.backgroundPosition = `${offset.left} ${offset.top}`;
    }
		iconStyle.backgroundRepeat = 'no-repeat';
  }

  return (
    <div className={classNames} style={iconStyle}>
      <span className="item-count">{item.quantity}</span>
    </div>
  );
};