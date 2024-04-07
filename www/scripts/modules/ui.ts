import { ItemEntity } from "./itementity";
import { Item } from "./models/item2";
import { CustomScene } from "./models/scene";
import { Player } from "./player";
import { PointerDrag, PointerLock, THREE } from "enable3d";
import { getChunkType } from "./world";



export class UI {

	menuElement = document.getElementById('full-menu');

	player!: Player;

	constructor(){
		this.findAll('.tab').forEach(e => {
			e.addEventListener('click', () => {
				this.activateTab(e.getAttribute('to'));
			});
		});

	};

	activeTab = "";
	activateTab(tab){
		this.findAll('.tab').forEach(e => e.classList.remove('active'));
		this.findAll('.tab-pane').forEach(e => e.classList.remove('active'));

		this.find('.tab[to='+tab+']')?.classList.add('active');
		this.find('.tab-pane[tab='+tab+']')?.classList.add('active');
		this.activeTab = tab;
	}

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

	getDropPosition(){
		var quaternion = new THREE.Quaternion().setFromEuler(this.player.mesh.rotation);

		var movementDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion)
		.add(this.player.mesh.position);
		return new THREE.Vector3(movementDirection.x * 5, this.player.mesh.position.y, movementDirection.z * 5);
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
							this.player!.rmInventory(item);
							ItemEntity.createItem(this.player.scene, this.getDropPosition(), item);
						});
						action.addEventListener('contextmenu', (e) => {
							e.preventDefault();
							item.count--;
							if(item.count <= 0) this.player!.rmInventory(item);
							const i = new Item(item.item);
							ItemEntity.createItem(this.player.scene, this.getDropPosition(), i);
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

		// Find First Empty Index
		const emptyOne = () => {
			return inventoryItems.indexOf(inventoryItems.find(i => !i.querySelector('.item'))!);
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

    this.create2dMap(player.scene);
		this.initCrafting();

	}

	loadedForPosition = "";
	create2dMap(scene: CustomScene) {
    const canvas = this.find('#map')! as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
		const chunkSize = scene.chunkSize;

		const mapOffset = { x: 0, y: 0 };
		let scale = 0.001;

		const playerIcon = scene.findLoadedResource('m:player_marker', 'textures')!.load;

		const init = () => {

			if(this.activeTab != 'map') return;

			const X = mapOffset.x;
			const Y = mapOffset.y;
	
			const playerPosition = scene.player.mesh.position;
	
			const half_height = height / 2;
			const half_width = width / 2;
			const playerX = Math.floor(playerPosition.x / chunkSize) * chunkSize;
			const playerZ = Math.floor(playerPosition.z / chunkSize) * chunkSize;
	
			for (let z = playerZ - half_height + Y; z < playerZ + half_height + Y; z += chunkSize) {
				for (let x = playerX - half_width + X; x < playerX + half_width + X; x += chunkSize) {
					const offset = 0;
					const noiseValue = scene.loadedChunks.noise.perlin2((x + offset) * scale, (z + offset) * scale);
					const chunkType = getChunkType(noiseValue, chunkSize, scene.loadedChunks);
					const color = chunkType.map!.color;
					// const scaleDelta = Math.abs(scale - 0.01) * 100;
					ctx.fillStyle = color;
					// ctx.strokeStyle = 'black'; // Set border color
    			// ctx.lineWidth = 1;
					ctx.fillRect(x + half_width - playerX - X, z + half_height - playerZ - Y, chunkSize, chunkSize);
					// ctx.strokeRect(x + half_width - playerX - X, z + half_height - playerZ - Y, chunkSize, chunkSize);
				}
			}
			
			const playerIndicatorX = half_width - X + (playerPosition.x % chunkSize);
			const playerIndicatorZ = half_height - Y + (playerPosition.z % chunkSize);

			// Draw the player icon at the calculated position
			ctx.drawImage(playerIcon, playerIndicatorX - playerIcon.width / 2, playerIndicatorZ - playerIcon.height / 2);
			
		}
		

		let isDragging = false;
		let lastX = 0;
		let lastY = 0;

		canvas.addEventListener('mousedown', (event) => {
			isDragging = true;
			lastX = event.clientX;
			lastY = event.clientY;
		});

		canvas.addEventListener('mousemove', (event) => {
			if (!isDragging) return;

			const deltaX = event.clientX - lastX;
			const deltaY = event.clientY - lastY;

			// Update mapOffset based on deltaX and deltaY
			mapOffset.x -= deltaX * 3;
			mapOffset.y -= deltaY * 3;

			lastX = event.clientX;
			lastY = event.clientY;
		});

		canvas.addEventListener('mouseup', (e) => {
			isDragging = false;
		});

		canvas.addEventListener('dblclick', () => {
			mapOffset.x = mapOffset.y = 0;
		});

		canvas.addEventListener('wheel', (event) => {
			const scaleChange = event.deltaY > 0 ? 0.0001 : -0.0001;
			scale += scaleChange;
			scale = Math.max(0.0001, Math.min(0.1, scale));
		});

    canvas.addEventListener('reinit', (event) => {
			init();
		});
	}

	update2dMap(){
		const canvas = this.find('#map')! as HTMLCanvasElement;
		canvas.dispatchEvent(new Event('reinit'));
	}



	initCrafting(){
		const craftBench = this.find('#craft-ui');
		const slots = [
			craftBench.querySelector('.slot-1')!,
			craftBench.querySelector('.slot-2')!
		];

		slots.forEach(slot => {
			slot.addEventListener('click', () => {
				
			});
		});


	}

	showChooseItemUi(parent){
		parent.appendChild()
	}

}