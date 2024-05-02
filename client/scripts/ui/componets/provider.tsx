import { Item } from "../../models/item";
import { PlayerInfo } from "../../repositories/player";
import { Context } from "../data/context"
import React, { useEffect, useState } from "react";
import { Map2D } from "../misc/map";
import { book, bookpage } from "../widgets/books";

let listening = false;

export const MainUI = ({ children }) => {

  const [tab, setTab] = useState('inventory');

  const [inventory, setInventory] = useState([...(PlayerInfo.entity?.inventory || [])]);
  const [currentItem, setCurrentItem] = React.useState<Item | null>(null)

  const [currentBook, setCurrentBook] = useState<book | null>(null);
  const [currentPage, setCurrentPage] = useState<bookpage | null>(null);


  const data = {
    tab, setTab,
    inventory, setInventory,
    currentItem, setCurrentItem,
    currentBook, setCurrentBook,
    currentPage, setCurrentPage
  };

  useEffect(() => {
    if(listening) return;
    listening = true;
    PlayerInfo.entity?.on('inventory', () => {
			setInventory([...PlayerInfo.entity.inventory]);
		}).on('equip', () => {
			setInventory([...PlayerInfo.entity.inventory]);
		}).on('unequip', () => {
			setInventory([...PlayerInfo.entity.inventory]);
		});
  }, []);


	React.useEffect(() => {
		Map2D.activeTab = tab;
	}, [tab]);

  return <Context.Provider value={data}>
    {children}
  </Context.Provider>
}