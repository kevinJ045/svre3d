import React from "react";
import { InventoryItem } from "./inventory.js";
import { PlayerInfo } from "../../repositories/player.js";
import { Items } from "../../repositories/items.js";
import { prompt } from "../componets/prompt.js";
const ChooseItemUI = ({ cb, ignore, rect }) => {
    const handleItemClick = (item) => {
        cb(item);
    };
    return (React.createElement("div", { className: "inventory-selector", style: {
            left: rect.left + 15 + 'px',
            top: rect.top / 2 + 'px'
        } },
        React.createElement("div", { className: "wrapper" }, PlayerInfo.entity?.inventory.map((item) => {
            if (ignore && ignore.id === item.id)
                return null;
            return (React.createElement(InventoryItem, { key: item.id, item: item, mouse: false, click: false, selectItem: () => handleItemClick(item), unselectItem: () => null, secondaryClick: () => {
                    prompt('Quantity', (i) => {
                        const q = parseInt(i || '');
                        if (item.quantity > q) {
                            item.quantity -= q;
                            handleItemClick(Items.create({
                                ...item,
                                quantity: 1
                            }));
                        }
                        else if (item.quantity == q)
                            handleItemClick(item);
                    });
                } }));
        }))));
};
export default ChooseItemUI;
