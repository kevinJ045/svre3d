import React from "react";
import { InventoryItem } from "./inventory";
import { PlayerInfo } from "../../repositories/player";

const ChooseItemUI = ({ cb, ignore, rect }) => {
    const handleItemClick = (item) => {
        cb(item);
    };


    return (
        <div className="inventory-selector"
        style={{
            left: rect.left + 15 + 'px',
            top: rect.top - 25 + 'px'
        }}>
            <div className="wrapper">
                {PlayerInfo.entity?.inventory.map((item) => {
                    if (ignore && ignore.id === item.id) return null;
                    return (
                        <InventoryItem 
                        key={item.id}
                        item={item}
                        mouse={false}
                        selectItem={() => handleItemClick(item)}
                        unselectItem={() => null}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ChooseItemUI;
