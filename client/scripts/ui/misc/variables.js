import { PlayerInfo } from "../../repositories/player.js";
export const UISelectedItem = (new class ItemSelector extends EventTarget {
    constructor() {
        super(...arguments);
        this.item = null;
    }
    select(item) {
        this.item = item;
        this.dispatchEvent(new Event('select'));
    }
    ;
    unselect() {
        this.item = null;
        this.dispatchEvent(new Event('unselect'));
    }
    ;
});
export const UIVariables = () => ({
    player: {
        health: PlayerInfo?.entity?.health || { max: 100, current: 100 },
        exp: PlayerInfo?.entity?.exp || { level: 1, max: 100, current: 0 }
    },
    selectedItem: UISelectedItem.item
});
