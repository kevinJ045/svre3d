import React, { useState } from 'react';
import { SlotItem } from './slotitem';

const Inventory = ({ inventory }) => {
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
      <div key={index} className="inventory-slot">
        {item ? <SlotItem item={item}></SlotItem> : ""}
      </div>
    ));

    // Calculate the number of empty slots to fill
    const emptySlotsCount = Math.max(0, itemsPerPage - slicedInventory.length);
    const emptySlots = Array.from({ length: emptySlotsCount }).map((_, index) => (
      <div key={`empty-${index}`} className="inventory-slot">
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