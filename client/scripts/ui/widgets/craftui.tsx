import React, { useState, useEffect } from "react";
import ChooseItemUI from "./chooseite.js";
import { ping } from "../../socket/socket.js";
import { Items } from "../../repositories/items.js";
import { Item } from "../../models/item.js";
import { prompt } from "../componets/prompt.js";
import { ItemIcon } from "./slotitem.js";
import { Context } from "../data/context.js";
import { InventoryItem } from "./inventory.js";
import GlobalEmitter from "../../misc/globalEmitter.js";

const Tool = ({ tool, activeTool, handleActiveToolChange }) => <div onClick={() => handleActiveToolChange(tool)} className={"tool "+tool+' '+(activeTool == tool ? 'active' : '')}></div>

const CraftingUI = () => {
    const {
        crafting_selectItems,
        setcrafting_selectItems,
        crafting_slotItems,
        crafting_setSlotItems,
        crafting_setSlotItemsC,
        inventory
	} = React.useContext(Context);

    const [contentValue, setContentValue] = useState("");
    const [resultItem, setResultItem] = useState<Item | null>(null);
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [brushColor, setBrushColor] = useState<string | null>(null);

    const [currentSlots, setCurrentSlots] = useState<any[]>([]);

    const handleBrushColor = (color) => {
        setBrushColor(color);
        crafting_slotItems.forEach(item => (item.options = (item.options || {})) && (item.options.brushColor = color));
    }

    const handleActiveToolChange = (tool: string) => {
        if (activeTool == tool) {
            setActiveTool(null);
            slotsUpdate(null);
            if (brushColor) handleBrushColor(null);
        } else {
            if (tool == 'brush') {
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
        // crafting_setSlotItems([]);
        // setContentValue("");
        // setResultItem(null);
        slotsUpdate();
    };

    const slotsUpdate = (tool = activeTool) => {
        if (!crafting_slotItems.length) return;
        Items.crafting(true, tool || '', ...crafting_slotItems)
            .then(i => {
                setResultItem(i ? Items.create({
                    itemID: i.item.itemID || i.item.manifest.id,
                    quantity: i.quantity
                } as any) : null);
            });
    };

    const craft = () => {
        Items.crafting(false, activeTool || '', ...crafting_slotItems)
            .then(i => {
                finishCraft();
            });
    }

    useEffect(() => {
        slotsUpdate();
        setCurrentSlots(crafting_slotItems);
    }, [crafting_slotItems]);

    // useEffect(() => {
    //     GlobalEmitter.on('crafting:slots:update', (items) => {
    //         console.log(items);
    //         setCurrentSlots(items);
    //         slotsUpdate();
    //     });
    // }, []);

    const handleSlotClick = (index: number) => {
        if(crafting_selectItems > -1){
            setcrafting_selectItems(-1);
        } else {
            setcrafting_selectItems(index);
        }
    };

    const handleSlotRemove = (index) => {
        crafting_setSlotItems((slotItems) => {
            slotItems.splice(index, 1);
            return slotItems;
        });
        setResultItem(null);
        slotsUpdate();
    };

    const handleInputChange = (e) => {
        setContentValue(e.target.value);
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

            <div className="slots">

                <div className="slot empty" onClick={() => handleSlotClick(0)}>
                {currentSlots[0] && inventory.find(i => i.id == currentSlots[0].id) ? <>
                    <InventoryItem click={false} item={inventory.find(i => i.id == currentSlots[0].id)}></InventoryItem>
                    <div className="corner-rm" onClick={() => handleSlotRemove(0)}>
                        <div className="icon xsm c icon-deletesm"></div>
                    </div>
                </> : null}
                </div>
                <div className="slot empty" onClick={() => handleSlotClick(1)}>
                {currentSlots[1] && inventory.find(i => i.id == currentSlots[1].id) ? <>
                    <InventoryItem click={false} item={inventory.find(i => i.id == currentSlots[1].id)}></InventoryItem>
                    <div className="corner-rm" onClick={() => handleSlotRemove(1)}>
                        <div className="icon xsm c icon-deletesm"></div>
                    </div>
                </> : null}
                </div>

                <div className="slot tool">
                    {activeTool ? <Tool handleActiveToolChange={() => {}} activeTool={''} tool={activeTool}></Tool> : <div className="icon"></div>} 
                </div>

                <div className="arrow">
                    <div className="icon icon-arrow-right"></div>
                </div>

                <div className="slot result" onClick={() => resultItem ? craft() : null}>
                    {
                        resultItem ?
                            <InventoryItem item={resultItem}></InventoryItem>
                            : null
                    }
                </div>

            </div>

            <div className="tools">
                <h3>Tools</h3>
                <div className="tools-grid">
                    <div className="tool-list">
                        <Tool handleActiveToolChange={handleActiveToolChange} activeTool={activeTool} tool="hammer"></Tool>

                        <Tool handleActiveToolChange={handleActiveToolChange} activeTool={activeTool} tool="press"></Tool>

                        <Tool handleActiveToolChange={handleActiveToolChange} activeTool={activeTool} tool="brush"></Tool>

                        <Tool handleActiveToolChange={handleActiveToolChange} activeTool={activeTool} tool="melter"></Tool>

                        <Tool handleActiveToolChange={handleActiveToolChange} activeTool={activeTool} tool="assembler"></Tool>
                    </div>
                    <div className="tool-info">
                        <div className="liner"></div>
                        <div className="content">
                            <h3>Assembler</h3>
                            <div className="separator">
                                <div className="line"></div>
                                <div className="guy"></div>
                                <div className="line"></div>
                            </div>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur reprehenderit veniam cum
                                quis doloremque quasi minus adipisci repellat, corporis voluptate, quas inventore alias eum,
                                ipsa ab iste harum repellendus aperiam!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CraftingUI;
