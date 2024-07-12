import { Item } from "../../models/item.js";
import { PlayerInfo } from "../../repositories/player.js";
import { Context } from "../data/context.js"
import React, { useEffect, useState } from "react";
import { Map2D } from "../misc/map.js";
import { book, bookpage } from "../widgets/books.js";
import { Chat } from "../../../../server/common/chat.js";
import GlobalEmitter from "../../misc/globalEmitter.js";
import { pingFrom } from "../../socket/socket.js";

let listening = false;

export const MainUI = ({ children }) => {

	const [tab, setTab] = useState('inventory');

	const [inventory, setInventory] = useState([...(PlayerInfo.entity?.inventory || [])]);
	const [currentItem, setCurrentItem] = React.useState<Item | null>(null)

	const [currentBook, setCurrentBook] = useState<book | null>(null);
	const [currentPage, setCurrentPage] = useState<bookpage | null>(null);

	const [chats, setChats] = useState<Chat[]>([]);

	const addChat = (chat: Chat) => {
		setChats(prevChats => [...prevChats, chat]);
	}

	const removeChat = (chat: Chat) => {
		setChats(chats => chats.filter(c => chat.message.id !== c.message.id));
	}

	const editChatContent = (chat: Chat) => {
		setChats(chats => chats.map(c => {
			if (chat.message.id !== c.message.id) {
				c.message.text = chat.message.text;
			}
			return c;
		}));
	}

	const [crafting_selectItems, setcrafting_selectItems] = useState<number>(-1);
	const [crafting_slotItems, crafting_setSlotItems] = useState<any[]>([]);

	const crafting_setItemAtSlot = (index, item) => {
		crafting_slotItems[index] = item;
		crafting_setSlotItems(crafting_slotItems);
	}

	const data = {
		tab, setTab,
		inventory, setInventory,
		currentItem, setCurrentItem,
		currentBook, setCurrentBook,
		currentPage, setCurrentPage,
		chats, setChats,
		addChat, removeChat, editChatContent,
		crafting_slotItems, crafting_setSlotItemsC: (items) => {
			crafting_setSlotItems(items);
			GlobalEmitter.emit('crafting:slots:update', items);
		},
		crafting_setSlotItems,
		crafting_setItemAtSlot,
		crafting_selectItems, setcrafting_selectItems
	};

	useEffect(() => {
		if (listening) return;
		listening = true;
		PlayerInfo.entity?.on('inventory', () => {
			setInventory([...PlayerInfo.entity.inventory]);
		}).on('equip', () => {
			setInventory([...PlayerInfo.entity.inventory]);
		}).on('unequip', () => {
			setInventory([...PlayerInfo.entity.inventory]);
		});

		pingFrom('chat:send', (msg: Chat) => {
			addChat(msg);
		});

		GlobalEmitter.on('openChats', () => {
			setTab('chats');
		});
	}, []);


	// React.useEffect(() => {
	// 	Map2D.activeTab = tab;
	// }, [tab]);

	return <Context.Provider value={data}>
		{children}
	</Context.Provider>
}
