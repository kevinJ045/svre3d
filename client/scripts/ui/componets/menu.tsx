import * as React from "react";
import { Tab, TabPane } from "../widgets/tabs";
import { Map2D } from "../misc/map";
import { Map2DWidget } from "../widgets/map";
import { PlayerInfo } from "../../repositories/player";
import { SlotItem, generateItemIcon } from "../widgets/slotitem";
import Inventory, { InventoryItem } from "../widgets/inventory";
import { Character } from "../widgets/character";
import { Item } from "../../models/item";
import { ItemActions } from "../widgets/actions";
import CraftingUI from "../widgets/craftui";
import BookComponent from "../widgets/books";
import { ResourceMap } from "../../repositories/resources";


export const Menu = () => {

	// @ts-ignore
	const [tab, setTab] = React.useState('inventory');
	
	const [inventory, setInventory] = React.useState([...(PlayerInfo.entity?.inventory || [])]);

	const [currentItem, setCurrentItem] = React.useState<Item | null>(null)

	React.useEffect(() => {
		Map2D.activeTab = tab;
	}, [tab]);

	React.useEffect(() => {
		PlayerInfo.entity?.on('inventory', () => {
			setInventory([...PlayerInfo.entity.inventory]);
		}).on('equip', () => {
			setInventory([...PlayerInfo.entity.inventory]);
		}).on('unequip', () => {
			setInventory([...PlayerInfo.entity.inventory]);
		});
	}, []);

	return (<div className="menu">
		
		<div className="tabs">
			<Tab tab="inventory" setActiveTab={setTab} activeTab={tab}>
				<b className="inventory-icon"></b>
			</Tab>

			<Tab tab="crafting" setActiveTab={setTab} activeTab={tab}>
				<b className="craft-icon"></b>
			</Tab>

			<Tab tab="map" setActiveTab={setTab} activeTab={tab}>
				<b className="map-icon"></b>
			</Tab>

			<Tab tab="book" setActiveTab={setTab} activeTab={tab}>
				<b className="book-icon"></b>
			</Tab>

			<Tab tab="settings" setActiveTab={setTab} activeTab={tab}>
				<b className="settings-icon"></b>
			</Tab>
		</div>

		<div className="tab-panes">
			
			<TabPane tab="inventory" activeTab={tab}>


				<div className="inventory">

					{currentItem ? <div className="inventory-item-info">
						<div className="item-title"><div className="item-icon" style={generateItemIcon(currentItem.reference?.config?.icon)}></div>{currentItem.reference.config?.name || currentItem.itemID}<span>{currentItem.quantity}</span></div>
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
				} />
			</TabPane>

			<TabPane tab="settings" activeTab={tab}>
				settings
			</TabPane>

		</div>
	</div>);
}