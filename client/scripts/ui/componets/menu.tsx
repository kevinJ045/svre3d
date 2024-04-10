import * as React from "react";
import { Tab, TabPane } from "../widgets/tabs";
import { Map2D } from "../misc/map";
import { Map2DWidget } from "../widgets/map";
import { PlayerInfo as s } from "../../repositories/player";
import { SlotItem } from "../widgets/slotitem";
import Inventory from "../widgets/inventory";
import { Character } from "../widgets/character";


export const Menu = () => {

	// @ts-ignore
	if(!s.entity) var PlayerInfo = window.player;
	else var PlayerInfo = s;

	const [tab, setTab] = React.useState('inventory');
	
	const [inventory, setInventory] = React.useState([...(PlayerInfo.entity?.inventory || [])]);


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

			<Tab tab="player-info" setActiveTab={setTab} activeTab={tab}>
				<b className="book-icon"></b>
			</Tab>

			<Tab tab="settings" setActiveTab={setTab} activeTab={tab}>
				<b className="settings-icon"></b>
			</Tab>
		</div>

		<div className="tab-panes">
			
			<TabPane tab="inventory" activeTab={tab}>

				<div className="inventory">
					<Inventory inventory={inventory}></Inventory>

					<div className="inventory-group has-character" style={{width: "45px"}}>

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

			<TabPane tab="player-info" activeTab={tab}>
				<h3>Entity Info</h3>
				<div className="player-info-grid">
						<div className="info">
							<h4>Level {PlayerInfo?.entity.exp.level.toString()}</h4>
						</div>
						<div className="c-preview">
							<Character activeTab={tab}></Character>
						</div>
						<div className="about">
							hello bro... how are you?
						</div>
				</div>
			</TabPane>

			<TabPane tab="settings" activeTab={tab}>
				settings
			</TabPane>

		</div>
	</div>);
}