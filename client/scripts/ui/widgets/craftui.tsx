import React, { useState, useEffect } from "react";
import ChooseItemUI from "./chooseite";
import { SlotItem } from "./slotitem";
import { ping } from "../../socket/socket";
import { Items } from "../../repositories/items";
import { Item } from "../../models/item";

const CraftingUI = () => {
    const [slotItems, setSlotItems] = useState([] as any[]);
    const [contentValue, setContentValue] = useState("");
    const [showChooseItem, setShowChooseItem] = useState(false);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
    const [resultItem, setResultItem] = useState<Item | null>(null);


    const [rect, setRect] = useState({
        top: 0,
        left: 0
    })

    const finishCraft = () => {
        setSlotItems([]);
        setContentValue("");
        setResultItem(null);
    };

    const slotsUpdate = () => {
        if(!slotItems.length) return;
        Items.crafting(true, ...slotItems)
        .then(i => {
            setResultItem(i ? Items.create({
                itemID: i.item.itemID || i.item.id,
                quantity: i.quantity
            } as any) : null);
        });
    };

    const craft = () => {
        Items.crafting(false, ...slotItems)
        .then(i => {
            finishCraft(); 
        });
    }

    useEffect(() => {
        slotsUpdate();
    }, [slotItems]);

    const handleSlotClick = (index) => {
        setSelectedSlotIndex(index);
        setRect({
            top: document.querySelector('.slot-'+(index+1))?.getBoundingClientRect().top || 0,
            left: document.querySelector('.slot-'+(index+1))?.getBoundingClientRect().left || 0
        });
        setShowChooseItem(true);
    };

    const handleSlotContextMenu = (index, e) => {
        e.preventDefault();
        setSlotItems((slotItems) => {
            slotItems[index] = [];
            return slotItems;
        });
        slotsUpdate();
    };

    const handleInputChange = (e) => {
        setContentValue(e.target.value);
    };

    const handleChooseItem = (item) => {    
        setSlotItems((slotItems) => {
            slotItems[selectedSlotIndex!] = item;
            return slotItems;
        });
        setShowChooseItem(false);
        setTimeout(() => slotsUpdate(), 10);
    };

    return (
        <div id="craft-ui">
            <div className="item-content-editor">
                <input
                    type="text"
                    id="item-content-text"
                    value={contentValue}
                    onChange={handleInputChange}
                    placeholder="Item Content"
                />
            </div>
            {showChooseItem && (
                <ChooseItemUI
                    rect={rect}
                    cb={handleChooseItem}
                    ignore={slotItems[selectedSlotIndex!]}
                />
            )}
            <div className="slot-1" onClick={() => handleSlotClick(0)} onContextMenu={(e) => handleSlotContextMenu(0, e)}>
                <div className="inventory-slot independent">
                    {slotItems[0] ? <SlotItem click={false} item={slotItems[0]}></SlotItem> : null}
                </div>
            </div>
            <div className="slot-2" onClick={() => handleSlotClick(1)} onContextMenu={(e) => handleSlotContextMenu(1, e)}>
                <div className="inventory-slot independent">
                    {slotItems[1] ? <SlotItem click={false} item={slotItems[1]}></SlotItem> : null}
                </div>
            </div>
            <div className="slot-result">
                <div className="inventory-slot independent" onClick={() => resultItem ? craft() : null}>
                    {
                        resultItem ?
                        <SlotItem click={false} item={resultItem}></SlotItem>
                        : null
                    }
                </div>
            </div>
        </div>
    );
};

export default CraftingUI;
