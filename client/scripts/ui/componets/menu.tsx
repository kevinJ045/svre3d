import * as React from "react";
import { Tab, TabPane } from "../widgets/tabs.js";
import { Map2D } from "../misc/map.js";
import { Map2DWidget } from "../widgets/map.js";
import { PlayerInfo } from "../../repositories/player.js";
import { SlotItem } from "../widgets/slotitem.js";
import Inventory, { InventoryItem } from "../widgets/inventory.js";
import { Character } from "../widgets/character.js";
import { Item } from "../../models/item.js";
import { ItemActions } from "../widgets/actions.js";
import CraftingUI from "../widgets/craftui.js";
import BookComponent from "../widgets/books.js";
import { ResourceMap } from "../../repositories/resources.js";
import { DefaultBooks } from "../constants/books.js";
import { Context } from "../data/context.js";
import { generateItemIcon } from "../misc/itemicon.ts";
import ChatsUI from "../chats/chats.tsx";
import { SettingsUI } from "../widgets/settings.tsx";


export const Menu = () => {

	const { 
		tab,
		setTab,
		currentItem,
		setCurrentItem,
		inventory
	} = React.useContext(Context);

	return (<div className="player-menu" id="full-menu"><div className="menu">
		
		<div className="tabs">
			<Tab tab="inventory" setActiveTab={setTab} activeTab={tab}>
				<b className="inventory-icon"></b>
			</Tab>

			<Tab tab="crafting" setActiveTab={setTab} activeTab={tab}>
				<b className="crafting-icon"></b>
			</Tab>

			<Tab tab="map" setActiveTab={setTab} activeTab={tab}>
				<b className="map-icon"></b>
			</Tab>

			<Tab tab="book" setActiveTab={setTab} activeTab={tab}>
				<b className="book-icon"></b>
			</Tab>

			<Tab tab="chats" setActiveTab={setTab} activeTab={tab}>
				<b className="chats-icon"></b>
			</Tab>

			<Tab tab="settings" setActiveTab={setTab} activeTab={tab}>
				<b className="settings-icon"></b>
			</Tab>
		</div>

		<div className="tab-panes">
			
			<TabPane tab="inventory" activeTab={tab}>


				<div className="inventory">

					{currentItem ? <div className="inventory-item-info">
						<div className="item-title"><div className="item-icon" style={generateItemIcon(currentItem.reference?.ui?.icon)}></div>{currentItem.reference.item?.name || currentItem.itemID}<span>{currentItem.quantity}</span></div>
						<p className="item-about">{currentItem.data.content}</p>
						<ItemActions item={currentItem} />
					</div> : null}
					
					<Inventory selectItem={
						(item: Item) => setCurrentItem(item)
					} unselectItem={
						() => setCurrentItem(null)
					} inventory={inventory}></Inventory>

					<div className="inventory-group has-character" style={{width: "45px"}}>

						{
							['hat', 'eye', 'armor', 'attachment'].map(
								type => {
									return <div key={type} className={"inventory-slot wearable "+type}>
										{
											(() => {
												let item = inventory
												.find(i => i.data.wid && i.reference?.equipment.type == type);

											return item ? <InventoryItem
											selectItem={
												(item: Item) => setCurrentItem(item)
											} unselectItem={
												() => setCurrentItem(null)
											}
											free={true}
											item={item as any} /> : null;
											})()
										}
									</div>
								}
							)
						}
					</div>

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
					).map(i => ({...i.config!.book, id: i.id}))
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
	</div></div>);
}