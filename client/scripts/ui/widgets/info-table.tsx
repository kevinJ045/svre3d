import React, { useEffect, useRef, useState } from "react";
import { Item } from "../../models/item";
import { ItemIcon } from "./slotitem";
import CraftingUI from "./craftui";
import { parseItemDataText } from "../misc/parsetext.tsx";
import { ClassText } from "./classtext.tsx";
import { ColorName } from "./colorname.tsx";
import { ItemActions } from "./actions.tsx";
import { ItemPreview } from "./item-preview.tsx";


export function InfoTable({
  currentItem
}: {
  currentItem: Item
}) {
  const [currentTab, setCurrentTab] = useState('preview');

  return (

    <div className="item-info-and-crafting-ui">

      <div className="header">
        {
          currentTab == 'info' ?
            (currentItem ? <>
              <ItemIcon item={currentItem} />
              {currentItem.reference.item?.name || currentItem.itemID}
            </> : 'About items') : (currentTab == 'craft' ? 'Crafting' : currentTab == 'preview' ? 'Preview' : '')
        }
      </div>
      <div className="tabs">
        <div className={"info-tab " + (currentTab == 'info' ? 'active' : '')} onClick={() => setCurrentTab('info')}>
          <div className="icon c icon-content"></div>
        </div>
        <div className={"info-tab " + (currentTab == 'craft' ? 'active' : '')} onClick={() => setCurrentTab('craft')}>
          <div className="icon c icon-anvil"></div>
        </div>
        <div className={"info-tab " + (currentTab == 'preview' ? 'active' : '')} onClick={() => setCurrentTab('preview')}>
          <div className="icon c icon-anvil"></div>
        </div>
      </div>
      <div className="content">
        <svg version="1.1" viewBox="0 7 210 30" id="svg1" xmlns="http://www.w3.org/2000/svg">
          <g id="g1">
            <path id="rect1230" style={{ fill: 'var(--var-bg-6)' }}
              d="M 0,0 V 24.418187 H 5.8112675 V 34.989154 H 12.543873 V 24.418187 h 6.527502 v 5.749394 h 6.12055 v 4.821573 h 6.73152 V 24.418187 h 12.445118 v 5.749394 h 6.73152 v -5.749394 h 7.344661 v 16.320384 h 6.731521 V 24.418187 h 8.363665 v 10.570967 h 6.732607 V 24.418187 h 9.587779 v 16.320384 h 6.732605 6.323489 V 24.418187 h 19.58465 V 39.25509 h 6.73152 V 24.418187 h 6.73261 v 4.265935 h 6.73153 v -4.265935 h 7.95672 v 17.432711 h 6.73151 V 24.418187 h 7.9567 v 10.570967 h 6.73154 V 24.418187 H 183.0891 V 39.25509 h 6.73262 V 24.418187 h 8.36365 v 10.570967 h 6.73261 V 24.418187 H 210 V 0 Z" />
          </g>
        </svg>
        <div className={"tab-pane info " + (currentTab == 'info' ? 'active' : '')}>
          <div className="content-data">{currentItem ? (currentItem?.data?.content ? parseItemDataText(currentItem?.data?.content) : <p className="mt-4">No item data</p>) : <p className="mt-4">No item selected</p>}</div>
          {currentItem && <div className="stats-or-book">
            <span>Book</span>
            <div className="icon icon-bookmark"></div>
          </div>}

          <div className="flexbox">

            <div className="left">
              <h4><u>Effects:</u></h4>

              {
                currentItem?.reference?.item?.boost && <ul>
                  {
                    Object
                      .keys(currentItem.reference.item.boost)
                      .map((key) => {
                        const value = currentItem.reference.item.boost[key];
                        const name = key.replace(key[0], key[0].toUpperCase());
                        return <li className={value > 0 ? 'plus' : 'minus'} key={key}><b>{Math.abs(value)}</b> {name}</li>
                      })
                  }
                </ul>
              }
            </div>

            <div className="right">
              <ul>
                {currentItem?.data?._eclass && <li><ClassText classname={currentItem.data._eclass} /> Class</li>}
                {currentItem?.data?.brush_color && <li>Color <ColorName color={currentItem.data.brush_color} /></li>}
              </ul>
            </div>

          </div>

          {currentItem && <ItemActions item={currentItem}></ItemActions>}

        </div>
        <div className={"tab-pane craftui " + (currentTab == 'craft' ? 'active' : '')}>

          <CraftingUI />

        </div>
        { currentTab == 'preview' && <div className="tab-pane preview-3d active">

          <ItemPreview currentItem={currentItem} />

        </div>}
      </div>
    </div>)
}