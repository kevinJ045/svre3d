import * as React from "react";
import { Tab, TabPane } from "../widgets/tabs.js";
import { Map2D } from "../misc/map.js";
import { Map2DWidget } from "../widgets/map.js";
import { PlayerInfo } from "../../repositories/player.js";
import { ItemIcon } from "../widgets/slotitem.js";
import Inventory, { InventoryItem } from "../widgets/inventory.js";
import { Character } from "../widgets/character.js";
import { Item } from "../../models/item.js";
import { ItemActions } from "../widgets/actions.js";
import CraftingUI from "../widgets/craftui.js";
import BookComponent from "../widgets/books.js";
import { ResourceMap } from "../../repositories/resources.js";
import { DefaultBooks } from "../constants/books.js";
import { Context } from "../data/context.js";
import { generateItemIcon } from "../misc/itemicon.js";
import ChatsUI from "../chats/chats.js";
import { SettingsUI } from "../widgets/settings.js";
import { Separator } from "../widgets/sep.js";
import { InfoTable } from "../widgets/info-table.js";


export const Menu = () => {

	const {
		tab,
		setTab,
		currentItem,
		setCurrentItem,
		inventory,
		crafting_selectItems,
		setcrafting_selectItems,
		crafting_setItemAtSlot
	} = React.useContext(Context);

	return (<div className="player-menu active" id="full-menu">

		<div className={"sidebar "+ (crafting_selectItems > -1 ? 'disabled' : '')}>
			<Tab tab="inventory" setActiveTab={setTab} activeTab={tab}>
				<b className="icon big icon-bag"></b>
			</Tab>

			<Tab tab="map" setActiveTab={setTab} activeTab={tab}>
				<b className="icon big icon-map"></b>
			</Tab>

			<Tab tab="book" setActiveTab={setTab} activeTab={tab}>
				<b className="icon big icon-book"></b>
			</Tab>

			<Tab tab="chats" setActiveTab={setTab} activeTab={tab}>
				<b className="icon big icon-mail"></b>
			</Tab>

			<Tab tab="settings" setActiveTab={setTab} activeTab={tab}>
				<b className="icon big icon-settings"></b>
			</Tab>
		</div>

		<div className={"menu-content " + (crafting_selectItems > -1 ? "full" : '')}>

			<TabPane tab="inventory" activeTab={tab}>

				<h1>Inventory</h1>

				<Separator></Separator>

				<div className="inventory-tab">
					<Inventory
					className={crafting_selectItems > -1 ? "select" : ''}
					selectItem={
						(item: Item) => setCurrentItem(item)
					}
					unselectItem={
						() => setCurrentItem(null)
					}
					selectedItem={currentItem}
					inventory={inventory}
					onClick={
						(item) => {
							if(crafting_selectItems > -1){
								crafting_setItemAtSlot(crafting_selectItems, item);
								setCurrentItem(item);
								setcrafting_selectItems(-1);
								return 'no_aftereffect';
							}
						}
					}
					></Inventory>

					<InfoTable currentItem={currentItem}></InfoTable>
				</div>

			</TabPane>

			<TabPane id="craft-ui" tab="crafting" activeTab={tab}>

				<CraftingUI />

			</TabPane>

			<TabPane tab="map" activeTab={tab} id="map">
				<Map2DWidget activeTab={tab} />
			</TabPane>

			<TabPane tab="book" activeTab={tab}>
				<BookComponent books={
					ResourceMap.resources.filter(
						i => i.config?.book
					).map(i => ({ ...i.config!.book, id: i.id }))
						.concat(DefaultBooks())
				} />
			</TabPane>

			<TabPane tab="chats" activeTab={tab}>
				<ChatsUI.init></ChatsUI.init>
			</TabPane>

			<TabPane tab="settings" activeTab={tab}>
				<SettingsUI></SettingsUI>
			</TabPane>

		</div>
	</div>);
}
