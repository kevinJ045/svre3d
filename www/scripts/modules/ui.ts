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

		(i as any).item = item;
		
		if(item.item.config?.icon) {
			const { src, width, height, offset } = item.item.config?.icon;
			i.style.setProperty('--item-url', `url("${src}")`);
			i.style.backgroundSize = `${width || '100%'} ${height || '100%'}`;
			if(offset){
				i.style.backgroundPosition = `${offset.left} ${offset.top}`
			}
			i.className += ' with-icon';
		}
		const t = document.createElement('span');
		t.className = 'item-count';
		t.innerText = item.count.toString();
		i.appendChild(t);
		if(item.max == 1) t.style.display = 'none';
		return i;
	}

	updateItemInfo({
		x = 0,
		y = 0,
		parent,
		item
	} : { x: number, y: number, item?: Item, parent?: HTMLElement }) {
		const info = this.find('.inventory-item-info') as HTMLElement;
		if(x == y && x == 0){
			info.querySelector('.item-actions')!.innerHTML = '';
			info.querySelector('.item-title')!.innerHTML = '';
			info.querySelector('.item-about')!.innerHTML = '';
			info.style.display = 'none';
		} else {
			info.style.display = 'flex';
			info.style.top = y+'px';
			info.style.left = x+'px';
			parent?.appendChild(info);

			if(item){
				info.querySelector('.item-title')!.innerHTML = item.name + '<span>' + item.count + '</span>';
				(info.querySelector('.item-about')! as any).innerText = item.data.content || "";
				const actionsEl = info.querySelector('.item-actions') as HTMLElement;
				const actions = this.findItemActions(item);
				
				actions.forEach(act => {
					const action = this.createItemAction(act, item);
					if(act == 'wear'){
						action.innerText = item.data.worn ? 'Unwear' : 'Wear';
						action.addEventListener('click', () => {
							if(item.data.worn == true){
								this.player?.unwearAccessory(item);
								item.data.worn = false;
							} else {
								this.player?.wearAccessory(item);
								item.data.worn = true;
							}
						});
					} else if(act == 'drop'){
						action.innerText = 'Drop';
						action.addEventListener('click', () => {
							this.player!.fromInventory(item);
						});
						action.addEventListener('contextmenu', (e) => {
							e.preventDefault();
							this.player!.fromInventory(item, 1);
						});
					};
					actionsEl.appendChild(action);
				});

			}
		}
	}

	createItemAction(act: string, item: Item){
		const button = document.createElement('button');
		button.innerText = act;
		button.className = 'action-button';
		return button;
	}

	findItemActions(item: Item){
		const actions: string[] = [];
		if(item.item.type == "accessory"){
			actions.push('wear');
		}
		actions.push('drop');
		return actions;
	}

	setPlayer(player: Player){
		this.player = player;

		this.inventory.loadedFirst = true;

		const inventoryItems = [...this.findAll('.inventory-slot')] as HTMLElement[];

		inventoryItems.forEach(slot => {
			slot.addEventListener('mouseenter', (e) => {
				if(slot.querySelector('.item')){
					this.updateItemInfo({
						y: slot.getBoundingClientRect().top - 80,
						x: slot.getBoundingClientRect().left + 25,
						parent: slot,
						item: (slot.querySelector('.item') as any).item as Item
					})
				}
			});
			slot.addEventListener('mouseleave', (e) => {
				this.updateItemInfo({ x: 0, y: 0 });
			});
		});


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
			return inventoryItems.indexOf(inventoryItems.find(i => i.innerHTML == '')!);
		}

		const updateCount = (item : Item) => {
			if(item.data.inventory){
				item.data.inventory.querySelector('.item-count').innerText = item.count;
			}
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

		player.onInventory('update-count',
			(item) => {
				updateCount(item);
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