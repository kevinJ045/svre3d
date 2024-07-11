import React, { useState, useEffect } from "react";
import ChooseItemUI from "./chooseite.js";
import { ping } from "../../socket/socket.js";
import { Items } from "../../repositories/items.js";
import { Item } from "../../models/item.js";
import { prompt } from "../componets/prompt.js";
import { ItemIcon } from "./slotitem.js";

const Tool = ({ tool, activeTool, handleActiveToolChange }) => <div onClick={() => handleActiveToolChange(tool)} className="tool"><div className={tool+" "+(activeTool == tool ? 'active' : 'inactive')}></div></div>

const CraftingUI = () => {
    const [slotItems, setSlotItems] = useState([] as any[]);
    const [contentValue, setContentValue] = useState("");
    const [showChooseItem, setShowChooseItem] = useState(false);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
    const [resultItem, setResultItem] = useState<Item | null>(null);
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [brushColor, setBrushColor] = useState<string | null>(null);

    const [rect, setRect] = useState({
        top: 0,
        left: 0
    });

    const handleBrushColor = (color) => {
        setBrushColor(color);
        slotItems.forEach(item => item.options.brushColor = color);
    }

    const handleActiveToolChange = (tool: string) => {
        if(activeTool == tool){
            setActiveTool(null);
            slotsUpdate(null);
            if(brushColor) handleBrushColor(null);
        } else {
            if(tool == 'brush'){
                prompt('Color', (c) => {
                    handleBrushColor(c);
                    setActiveTool(tool);
                    slotsUpdate(tool);
                });
            } else {
                setActiveTool(tool);
                slotsUpdate(tool);
            }
        }
    }

    const finishCraft = () => {
        setSlotItems([]);
        setContentValue("");
        setResultItem(null);
    };

    const slotsUpdate = (tool = activeTool) => {
        if(!slotItems.length) return;
        Items.crafting(true, tool || '', ...slotItems)
        .then(i => {
            setResultItem(i ? Items.create({
                itemID: i.item.itemID || i.item.manifest.id,
                quantity: i.quantity
            } as any) : null);
        });
    };

    const craft = () => {
        Items.crafting(false, activeTool || '', ...slotItems)
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
            slotItems.splice(index, 1);
            return slotItems;
        });
        slotsUpdate();
    };

    const handleInputChange = (e) => {
        setContentValue(e.target.value);
    };

    const handleChooseItem = (item) => {    
        setSlotItems((slotItems) => {
            slotItems[selectedSlotIndex!] = { ...item, options: { brushColor } };
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
                    {slotItems[0] ? <ItemIcon item={slotItems[0]}></ItemIcon> : null}
                </div>
            </div>
            <div className="slot-2" onClick={() => handleSlotClick(1)} onContextMenu={(e) => handleSlotContextMenu(1, e)}>
                <div className="inventory-slot independent">
                    {slotItems[1] ? <ItemIcon item={slotItems[1]}></ItemIcon> : null}
                </div>
            </div>
            <div className="slot-result">
                <div className="inventory-slot independent" onClick={() => resultItem ? craft() : null}>
                    {
                        resultItem ?
                        <ItemIcon item={resultItem}></ItemIcon>
                        : null
                    }
                </div>
            </div>

            <div className="craft-tools">
                <Tool handleActiveToolChange={handleActiveToolChange} activeTool={activeTool} tool="hammer"></Tool>
            
                <Tool handleActiveToolChange={handleActiveToolChange} activeTool={activeTool} tool="press"></Tool>
            
                <Tool handleActiveToolChange={handleActiveToolChange} activeTool={activeTool} tool="brush"></Tool>
            
                <Tool handleActiveToolChange={handleActiveToolChange} activeTool={activeTool} tool="melter"></Tool>
            
                <Tool handleActiveToolChange={handleActiveToolChange} activeTool={activeTool} tool="assembler"></Tool>
            </div>
        </div>
    );
};

export default CraftingUI;
