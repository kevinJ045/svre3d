import React from "react";
import { ItemData } from "../../../../server/models/item";
import { Item } from "../../models/item";



export const Context = React.createContext<{
  tab: string, setTab: (t) => void,
  inventory: any[], setInventory: (t) => void,
  currentItem: any, setCurrentItem: (t) => void,
  currentBook: any, setCurrentBook: (t) => void,
  currentPage: any, setCurrentPage: (t) => void
}>({} as any);