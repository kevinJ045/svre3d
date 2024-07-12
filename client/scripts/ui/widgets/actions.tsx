import { Item } from "../../models/item.js"
import * as React from "react";
import { Equipments } from "../../repositories/equipments.js";
import { PlayerInfo } from "../../repositories/player.js";
import { Context } from "../data/context.js";



export const ItemActions = (
    { item }:
    { item: Item }
) => {

    const {
        setCurrentBook,
        setCurrentPage,
        setTab
    } = React.useContext(Context);

    const handleWearToggle = () => {
        if (item?.data.wid) {
            Equipments.unequip(PlayerInfo.entity, item?.reference!.equipment!.type!, item);
        } else {
            Equipments.equip(PlayerInfo.entity, item?.reference!.equipment!.type!, item);
        }
    };

    const handleDrop = () => {
        
    };

    const handleOpenBook = () => {
        setCurrentBook(item.reference.config?.book);
        setCurrentPage(item.reference.config?.book.pages[0]);
        setTab('book');
    }

    return (
        <div className="item-actions">
            {item.reference.equipment && (
                <button onClick={handleWearToggle}>
                    {item?.data.wid ? "Unequip" : "Equip"}
                </button>
            )}
            {item.reference.config?.book && (
                <button onClick={handleOpenBook}>
                    About
                </button>
            )}
            <button onClick={handleDrop}>Drop</button>
        </div>
    );
}
