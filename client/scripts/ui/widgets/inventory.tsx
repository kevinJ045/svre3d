import React, { useState } from 'react';
import { SlotItem } from './slotitem';


export const InventoryItem = ({
  selectItem,
  unselectItem,
  item,
  free = false,
  mouse = true
}) => {
  return (<div 
    onClick={
      () => selectItem(item)
    }
    // onMouseEnter={
    //   () => mouse ? selectItem(item) : null
    // }
    // onMouseLeave={
    //   () => unselectItem(item)
    // }
    className={free ? '' : "inventory-slot"}>
      {item ? <SlotItem item={item}></SlotItem> : ""}
    </div>);
}

const Inventory = ({ 
  inventory,
  selectItem,
  unselectItem,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(inventory.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prevPage => prevPage - 1);
  };

  const renderInventoryItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const slicedInventory = inventory.filter(i => !i.data.wid).slice(startIndex, endIndex);

    const filledSlots = slicedInventory.map((item, index) => (
      <InventoryItem
      key={index} 
      selectItem={selectItem}
      unselectItem={unselectItem}
      item={item}
      ></InventoryItem>
    ));

    // Calculate the number of empty slots to fill
    const emptySlotsCount = Math.max(0, itemsPerPage - slicedInventory.length);
    const emptySlots = Array.from({ length: emptySlotsCount }).map((_, index) => (
      <div
      onMouseEnter={
        () => unselectItem()
      }
      key={`empty-${index}`} className="inventory-slot">
        {/* Render whatever you want for empty slots */}
      </div>
    ));

    return filledSlots.concat(emptySlots);
  };

  return (
    <div className="inventory-group">
      {renderInventoryItems()}
      { totalPages > 1 ? (<div className="pager-buttons">
        <button className="button prev" onClick={handlePrevPage} disabled={currentPage === 1}>
          Prev
        </button>
        <span>{`${currentPage}/${totalPages}`}</span>
        <button className="button next" onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>) : null }
    </div>
  );
};

export default Inventory;
