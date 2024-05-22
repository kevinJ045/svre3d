import * as React from "react";
import { Equipments } from "../../repositories/equipments.js";
import { PlayerInfo } from "../../repositories/player.js";
import { Context } from "../data/context.js";
export const ItemActions = ({ item }) => {
    const { setCurrentBook, setCurrentPage, setTab } = React.useContext(Context);
    const handleWearToggle = () => {
        if (item?.data.wid) {
            Equipments.unequip(PlayerInfo.entity, item?.reference.equipment.type, item);
        }
        else {
            Equipments.equip(PlayerInfo.entity, item?.reference.equipment.type, item);
        }
    };
    const handleDrop = () => {
    };
    const handleOpenBook = () => {
        setCurrentBook(item.reference.config?.book);
        setCurrentPage(item.reference.config?.book.pages[0]);
        setTab('book');
    };
    return (React.createElement("div", { className: "item-actions" },
        item.reference.equipment && (React.createElement("button", { onClick: handleWearToggle }, item?.data.wid ? "Unequip" : "Equip")),
        item.reference.config?.book && (React.createElement("button", { onClick: handleOpenBook }, "About")),
        React.createElement("button", { onClick: handleDrop }, "Drop")));
};
