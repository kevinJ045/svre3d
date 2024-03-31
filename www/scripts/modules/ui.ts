import { Item } from "./models/item2";
import { Player } from "./player";



export class UI {

	menuElement = document.getElementById('full-menu');

	player!: Player;

	constructor(){};

	inventory = {
		loadedFirst: false
	}

	show(){
		this.menuElement?.classList.add('active');
	}

	hide(){
		this.menuElement?.classList.remove('active');
	}

	find(q: string){
		return this.menuElement!.querySelector(q)!;
	}

	findAll(q: string){
		return this.menuElement!.querySelectorAll(q)!;
	}

	createItemInventory(item: Item){
		const i = document.createElement('div');
		i.className = 'item';
		
		if(item.item.config?.icon) {
			i.style.setProperty('--item-url', item.item.config?.icon);
			i.className += ' with-icon';
		}
		const t = document.createElement('span');
		t.className = 'item-name';
		t.innerText = item.item.config?.name || item.item._id || 'item';
		i.appendChild(t);
		return i;
	}

	setPlayer(player: Player){
		this.player = player;

		this.inventory.loadedFirst = true;

		const inventoryItems = [...this.findAll('.inventory-slot')];

		const addItem = (item: Item, index: number) => {
			if(!item.data.inventory) item.data.inventory = this.createItemInventory(item);
			inventoryItems[index].appendChild(item.data.inventory as Element);
			item.data.inventory.index = index;
			item.updateUi(this);
		}

		const removeItem = (item: Item) => {
			if(item.data.inventory){
				item.data.inventory.remove();
			}
		}

		const wearItem = (item: Item) => {
			const type = item.item.accessory.type;
			const slot = this.find('.wearable.'+type);
			if(slot){
				if(!item.data.inventory) item.data.inventory = this.createItemInventory(item);
				slot.appendChild(item.data.inventory);
				item.updateUi(this);
			}
		}

		const emptyOne = () => {
			return inventoryItems.indexOf(inventoryItems.find(i => i.innerHTML = '')!);
		}

		player.inventory.forEach((item, index) => {
			addItem(item, index);
		});

		player.onInventory('add',
			(item) => {
				let e = emptyOne();
				addItem(item, e == -1 ? item.data.inventory?.index || 0 : e);
			}
		)

		player.onInventory('remove',
			(item) => {
				removeItem(item);
			}
		)

		player.onInventory('wear',
			(item) => {
				wearItem(item);
			}
		)

	}

}