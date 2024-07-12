import React from "react";
import { ItemData } from "../../../../server/models/item.js";
import { Item } from "../../models/item.js";
import { Chat } from "../../../../server/common/chat.js";



export const Context = React.createContext<{
  tab: string, setTab: (t) => void,
  inventory: any[], setInventory: (t) => void,
  currentItem: any, setCurrentItem: (t) => void,
  currentBook: any, setCurrentBook: (t) => void,
  currentPage: any, setCurrentPage: (t) => void,
  chats: Chat[], setChats: (t) => void,
  addChat: (t) => void, removeChat: (t) => void,
  editChatContent: (t) => void,

  crafting_selectItems: number,
  setcrafting_selectItems: (t) => void
  crafting_slotItems: any[],
  crafting_setSlotItems: (t) => void,
  crafting_setSlotItemsC: (t) => void,
  crafting_setItemAtSlot: (t, a) => void
}>({} as any);
