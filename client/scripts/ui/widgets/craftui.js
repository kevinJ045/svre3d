import React, { useState, useEffect } from "react";
import ChooseItemUI from "./chooseite.js";
import { SlotItem } from "./slotitem.js";
import { Items } from "../../repositories/items.js";
import { prompt } from "../componets/prompt.js";
const Tool = ({ tool, activeTool, handleActiveToolChange }) => React.createElement("div", { onClick: () => handleActiveToolChange(tool), className: "tool" },
    React.createElement("div", { className: tool + " " + (activeTool == tool ? 'active' : 'inactive') }));
const CraftingUI = () => {
    const [slotItems, setSlotItems] = useState([]);
    const [contentValue, setContentValue] = useState("");
    const [showChooseItem, setShowChooseItem] = useState(false);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
    const [resultItem, setResultItem] = useState(null);
    const [activeTool, setActiveTool] = useState(null);
    const [brushColor, setBrushColor] = useState(null);
    const [rect, setRect] = useState({
        top: 0,
        left: 0
    });
    const handleBrushColor = (color) => {
        setBrushColor(color);
        slotItems.forEach(item => item.options.brushColor = color);
    };
    const handleActiveToolChange = (tool) => {
        if (activeTool == tool) {
            setActiveTool(null);
            slotsUpdate(null);
            if (brushColor)
                handleBrushColor(null);
        }
        else {
            if (tool == 'brush') {
                prompt('Color', (c) => {
                    handleBrushColor(c);
                    setActiveTool(tool);
                    slotsUpdate(tool);
                });
            }
            else {
                setActiveTool(tool);
                slotsUpdate(tool);
            }
        }
    };
    const finishCraft = () => {
        setSlotItems([]);
        setContentValue("");
        setResultItem(null);
    };
    const slotsUpdate = (tool = activeTool) => {
        if (!slotItems.length)
            return;
        Items.crafting(true, tool || '', ...slotItems)
            .then(i => {
            setResultItem(i ? Items.create({
                itemID: i.item.itemID || i.item.manifest.id,
                quantity: i.quantity
            }) : null);
        });
    };
    const craft = () => {
        Items.crafting(false, activeTool || '', ...slotItems)
            .then(i => {
            finishCraft();
        });
    };
    useEffect(() => {
        slotsUpdate();
    }, [slotItems]);
    const handleSlotClick = (index) => {
        setSelectedSlotIndex(index);
        setRect({
            top: document.querySelector('.slot-' + (index + 1))?.getBoundingClientRect().top || 0,
            left: document.querySelector('.slot-' + (index + 1))?.getBoundingClientRect().left || 0
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
            slotItems[selectedSlotIndex] = { ...item, options: { brushColor } };
            return slotItems;
        });
        setShowChooseItem(false);
        setTimeout(() => slotsUpdate(), 10);
    };
    return (React.createElement("div", { id: "craft-ui" },
        React.createElement("div", { className: "item-content-editor" },
            React.createElement("input", { type: "text", id: "item-content-text", value: contentValue, onChange: handleInputChange, placeholder: "Item Content" })),
        showChooseItem && (React.createElement(ChooseItemUI, { rect: rect, cb: handleChooseItem, ignore: slotItems[selectedSlotIndex] })),
        React.createElement("div", { className: "slot-1", onClick: () => handleSlotClick(0), onContextMenu: (e) => handleSlotContextMenu(0, e) },
            React.createElement("div", { className: "inventory-slot independent" }, slotItems[0] ? React.createElement(SlotItem, { click: false, item: slotItems[0] }) : null)),
        React.createElement("div", { className: "slot-2", onClick: () => handleSlotClick(1), onContextMenu: (e) => handleSlotContextMenu(1, e) },
            React.createElement("div", { className: "inventory-slot independent" }, slotItems[1] ? React.createElement(SlotItem, { click: false, item: slotItems[1] }) : null)),
        React.createElement("div", { className: "slot-result" },
            React.createElement("div", { className: "inventory-slot independent", onClick: () => resultItem ? craft() : null }, resultItem ?
                React.createElement(SlotItem, { click: false, item: resultItem })
                : null)),
        React.createElement("div", { className: "craft-tools" },
            React.createElement(Tool, { handleActiveToolChange: handleActiveToolChange, activeTool: activeTool, tool: "hammer" }),
            React.createElement(Tool, { handleActiveToolChange: handleActiveToolChange, activeTool: activeTool, tool: "press" }),
            React.createElement(Tool, { handleActiveToolChange: handleActiveToolChange, activeTool: activeTool, tool: "brush" }),
            React.createElement(Tool, { handleActiveToolChange: handleActiveToolChange, activeTool: activeTool, tool: "melter" }),
            React.createElement(Tool, { handleActiveToolChange: handleActiveToolChange, activeTool: activeTool, tool: "assembler" }))));
};
export default CraftingUI;
