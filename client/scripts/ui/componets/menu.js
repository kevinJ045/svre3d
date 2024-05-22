import * as React from "react";
import { Tab, TabPane } from "../widgets/tabs.js";
import { Map2DWidget } from "../widgets/map.js";
import Inventory, { InventoryItem } from "../widgets/inventory.js";
import { ItemActions } from "../widgets/actions.js";
import CraftingUI from "../widgets/craftui.js";
import BookComponent from "../widgets/books.js";
import { ResourceMap } from "../../repositories/resources.js";
import { DefaultBooks } from "../constants/books.js";
import { Context } from "../data/context.js";
import { generateItemIcon } from "../misc/itemicon.js";
import ChatsUI from "../chats/chats.js";
import { SettingsUI } from "../widgets/settings.js";
export const Menu = () => {
    const { tab, setTab, currentItem, setCurrentItem, inventory } = React.useContext(Context);
    return (React.createElement("div", { className: "player-menu", id: "full-menu" },
        React.createElement("div", { className: "menu" },
            React.createElement("div", { className: "tabs" },
                React.createElement(Tab, { tab: "inventory", setActiveTab: setTab, activeTab: tab },
                    React.createElement("b", { className: "inventory-icon" })),
                React.createElement(Tab, { tab: "crafting", setActiveTab: setTab, activeTab: tab },
                    React.createElement("b", { className: "crafting-icon" })),
                React.createElement(Tab, { tab: "map", setActiveTab: setTab, activeTab: tab },
                    React.createElement("b", { className: "map-icon" })),
                React.createElement(Tab, { tab: "book", setActiveTab: setTab, activeTab: tab },
                    React.createElement("b", { className: "book-icon" })),
                React.createElement(Tab, { tab: "chats", setActiveTab: setTab, activeTab: tab },
                    React.createElement("b", { className: "chats-icon" })),
                React.createElement(Tab, { tab: "settings", setActiveTab: setTab, activeTab: tab },
                    React.createElement("b", { className: "settings-icon" }))),
            React.createElement("div", { className: "tab-panes" },
                React.createElement(TabPane, { tab: "inventory", activeTab: tab },
                    React.createElement("div", { className: "inventory" },
                        currentItem ? React.createElement("div", { className: "inventory-item-info" },
                            React.createElement("div", { className: "item-title" },
                                React.createElement("div", { className: "item-icon", style: generateItemIcon(currentItem.reference?.ui?.icon) }),
                                currentItem.reference.item?.name || currentItem.itemID,
                                React.createElement("span", null, currentItem.quantity)),
                            React.createElement("p", { className: "item-about" }, currentItem.data.content),
                            React.createElement(ItemActions, { item: currentItem })) : null,
                        React.createElement(Inventory, { selectItem: (item) => setCurrentItem(item), unselectItem: () => setCurrentItem(null), inventory: inventory }),
                        React.createElement("div", { className: "inventory-group has-character", style: { width: "45px" } }, ['hat', 'eye', 'armor', 'attachment'].map(type => {
                            return React.createElement("div", { key: type, className: "inventory-slot wearable " + type }, (() => {
                                let item = inventory
                                    .find(i => i.data.wid && i.reference?.equipment.type == type);
                                return item ? React.createElement(InventoryItem, { selectItem: (item) => setCurrentItem(item), unselectItem: () => setCurrentItem(null), free: true, item: item }) : null;
                            })());
                        })))),
                React.createElement(TabPane, { id: "craft-ui", tab: "crafting", activeTab: tab },
                    React.createElement(CraftingUI, null)),
                React.createElement(TabPane, { tab: "map", activeTab: tab, id: "map" },
                    React.createElement(Map2DWidget, { activeTab: tab })),
                React.createElement(TabPane, { tab: "book", activeTab: tab },
                    React.createElement(BookComponent, { books: ResourceMap.resources.filter(i => i.config?.book).map(i => ({ ...i.config.book, id: i.id }))
                            .concat(DefaultBooks()) })),
                React.createElement(TabPane, { tab: "chats", activeTab: tab },
                    React.createElement(ChatsUI.init, null)),
                React.createElement(TabPane, { tab: "settings", activeTab: tab },
                    React.createElement(SettingsUI, null))))));
};
