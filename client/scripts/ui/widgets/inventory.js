import React, { useState } from 'react';
import { SlotItem } from './slotitem.js';
export const InventoryItem = ({ selectItem, unselectItem, item, free = false, mouse = true, click = true, counter = true, secondaryClick = (any) => { } }) => {
    return (React.createElement("div", { onClick: () => selectItem(item), onMouseEnter: () => mouse ? selectItem(item) : null, onContextMenu: (e) => {
            e.preventDefault();
            secondaryClick(item);
        }, 
        // onMouseLeave={
        //   () => unselectItem(item)
        // }
        className: free ? '' : "inventory-slot" }, item ? React.createElement(SlotItem, { counter: counter, click: click, item: item }) : ""));
};
const Inventory = ({ inventory, selectItem, unselectItem, }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const totalPages = Math.ceil(inventory.length / itemsPerPage);
    const handleNextPage = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };
    const handlePrevPage = () => {
        setCurrentPage(prevPage => prevPage - 1);
    };
    const renderInventoryItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const slicedInventory = inventory.filter(i => !i.data.wid).slice(startIndex, endIndex);
        const filledSlots = slicedInventory.map((item, index) => (React.createElement(InventoryItem, { key: index, selectItem: selectItem, unselectItem: unselectItem, item: item })));
        // Calculate the number of empty slots to fill
        const emptySlotsCount = Math.max(0, itemsPerPage - slicedInventory.length);
        const emptySlots = Array.from({ length: emptySlotsCount }).map((_, index) => (React.createElement("div", { onMouseEnter: () => unselectItem(), key: `empty-${index}`, className: "inventory-slot" })));
        return filledSlots.concat(emptySlots);
    };
    return (React.createElement("div", { className: "inventory-group" },
        renderInventoryItems(),
        totalPages > 1 ? (React.createElement("div", { className: "pager-buttons" },
            React.createElement("button", { className: "button prev", onClick: handlePrevPage, disabled: currentPage === 1 }, "Prev"),
            React.createElement("span", null, `${currentPage}/${totalPages}`),
            React.createElement("button", { className: "button next", onClick: handleNextPage, disabled: currentPage === totalPages }, "Next"))) : null));
};
export default Inventory;
