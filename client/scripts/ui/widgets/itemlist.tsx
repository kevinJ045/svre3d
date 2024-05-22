
import React, { useState, useEffect } from 'react';
import { Items } from '../../repositories/items.js';
import { SlotItem } from './slotitem.js';

export const ItemList = () => {
  return (
    <div className="row">
      {
        Items.all().map(item => (
          <SlotItem
            counter={false}
            click={false}
            item={
              Items.create({
                id: item.id,
                quantity: 1
              } as any)
            }></SlotItem>
        ))
      }
    </div>
  )
}
