import React from "react";
import { InventoryItem } from "./inventory";
import { PlayerInfo } from "../../repositories/player";
import { Items } from "../../repositories/items";

const ChooseItemUI = ({ cb, ignore, rect }) => {
    const handleItemClick = (item) => {
        cb(item);
    };


    return (
        <div className="inventory-selector"
        style={{
            left: rect.left + 15 + 'px',
            top: rect.top / 2 + 'px'
        }}>
            <div className="wrapper">
                {PlayerInfo.entity?.inventory.map((item) => {
                    if (ignore && ignore.id === item.id) return null;
                    return (
                        <InventoryItem 
                        key={item.id}
                        item={item}
                        mouse={false}
                        click={false}
                        selectItem={() => handleItemClick(item)}
                        unselectItem={() => null}
                        
                        secondaryClick={
                            () => {
                                const q = parseInt(prompt('Quantity') || '');
                                if(item.quantity > q){
                                    item.quantity -= q;
                                    handleItemClick(
                                        Items.create(
                                            {
                                                ...item,
                                                quantity: 1
                                            } as typeof item
                                        )
                                    )
                                } else if(item.quantity == q) handleItemClick(item)
                            }
                        }
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ChooseItemUI;
