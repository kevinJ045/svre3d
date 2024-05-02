
import React, { useState, useEffect } from 'react';
import { Items } from '../../repositories/items';
import { SlotItem } from './slotitem';

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