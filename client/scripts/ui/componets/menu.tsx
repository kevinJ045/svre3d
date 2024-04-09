import * as React from "react";
import { Tab, TabPane } from "../widgets/tabs";
import { Map2D } from "../misc/map";
import { Map2DWidget } from "../widgets/map";
import { PlayerInfo } from "../../repositories/player";
import { SlotItem } from "../widgets/slotitem";
import Inventory from "../widgets/inventory";


export const Menu = () => {

	const [tab, setTab] = React.useState('inventory');

	const [inventory, setInventory] = React.useState([...PlayerInfo.entity.inventory]);


	React.useEffect(() => {
		Map2D.activeTab = tab;
	}, [tab]);

	React.useEffect(() => {
		PlayerInfo.entity.on('inventory', () => {
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

			<Tab tab="settings" setActiveTab={setTab} activeTab={tab}>
				<b className="settings-icon"></b>
			</Tab>
		</div>

		<div className="tab-panes">
			
			<TabPane tab="inventory" activeTab={tab}>
				<div className="inventory">
					
					<div className="inventory-item-info">
						<div className="item-title">Item<span>1</span></div>
						<p className="item-about"></p>
						<div className="item-actions"></div>
					</div>
					
					<Inventory inventory={inventory}></Inventory>

					<div className="inventory-group" style={{width: "45px"}}>
						{
							['hat', 'eye', 'armor', 'attachment'].map(
								type => {
									return <div key={type} className={"inventory-slot wearable "+type}>
										{
											(() => {
												let item = inventory
												.find(i => i.data.wid && i.reference?.equipment.type == type);

											return item ? <SlotItem item={item as any} /> : null;
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
				<div className="item-content-editor">
					<input type="text" id="item-content-text" />
				</div>

				<div className="slot-1">
					<div className="inventory-slot independent"></div>
				</div>
				<div className="slot-2">
					<div className="inventory-slot independent"></div>
				</div>

				<div className="slot-result">
					<div className="inventory-slot independent"></div>
				</div>

			</TabPane>

			<TabPane tab="map" activeTab={tab} id="map">
				<Map2DWidget activeTab={tab} />
			</TabPane>

			<TabPane tab="settings" activeTab={tab}>
				settings
			</TabPane>

		</div>
	</div>);
}