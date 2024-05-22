import React from 'react';
import { Items } from '../../repositories/items.js';
import { SlotItem } from './slotitem.js';
export const ItemList = () => {
    return (React.createElement("div", { className: "row" }, Items.all().map(item => (React.createElement(SlotItem, { counter: false, click: false, item: Items.create({
            id: item.id,
            quantity: 1
        }) })))));
};
