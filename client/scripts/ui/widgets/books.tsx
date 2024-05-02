
import React, { useState, useEffect } from 'react';
import { SlotItem } from './slotitem';
import { Item } from '../../models/item';
import { Items } from '../../repositories/items';
import { InventoryItem } from './inventory';

type bookpagechild = {
  type: string,
  [key: string]: any
}
type bookpage = {
  title: string,
  children: bookpagechild[]
}
type book = {
  name: string,
  icon: string,
  id: string,
  defaultBook?: boolean,
  isItemsList?: boolean,
  pages: bookpage[]
}


const filterFunction = (query: string) => {
  return (i: bookpagechild) => 
    (i.type == 'item' || i.type == 'inventory-item')
    &&
    (i.itemReference ||
    (i.itemReference = Items.all().find(i2 => i.item == i2.id))
    )
    ?
    (
      (i.itemReference as typeof Item.prototype.reference)
      .config?.name?.match(query) || (i.itemReference as typeof Item.prototype.reference)
      .id?.match(query)
    ) 
    :
    (
      (i.content || i.name || i.title)
        ?.match(query)
    ) || console.log(query, i);
}

function PageContent({ children, selectBook, searchQuery = null }: any) {

  const navTo = (to: string) => to ? () => {
    selectBook(to);
  } : () => {};

  return (
    <>
      {children
      .filter(searchQuery ? filterFunction(searchQuery) : i => i)
      .map((child, index) => (
        child.type === 'link' ?  <a key={index} onClick={() => {
          if(child.page){
            selectBook(child.page);
          }
        }} href='#'>{child.content}</a> : <div key={index}>
          {child.type === 'image' && (
            <img onClick={navTo(child.link)} src={child.image} alt={child.title || 'image'} />
          )}
          {child.type === 'text' && (
            <p onClick={navTo(child.link)}>{child.content}</p>
          )}
          {child.type === 'wrapper' && (
            <div onClick={navTo(child.link)} className={child.row ? 'row' : 's'}>{child.content}</div>
          )}
          {child.type === 'item' && (
            <SlotItem
              item={Items.create({
                itemID: child.item,
                quantity: child.quantity || 1,
              } as any)}
              onClick={navTo(child.link)}
              click={false}
              counter={child.quantity > 0}
            />
          )}
          {child.type === 'inventory-item' && (
            <InventoryItem
              item={Items.create({
                itemID: child.item,
                quantity: child.quantity || 1,
              } as any)}
              mouse={false}
              counter={child.quantity > 0}

              selectItem={navTo(child.link)}
              unselectItem={() => {}}
            />
          )}
          {child.children && (
            <PageContent selectBook={selectBook} children={child.children} />
          )}
        </div>
      ))}
    </>
  );
}

function BookComponent({ books }: { books: book[] }) {
  const [currentBook, setCurrentBook] = useState<book | null>(null);
  const [currentPage, setCurrentPage] = useState<bookpage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = books.filter(book => book.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleBookSelection = (book) => {
    setCurrentBook(book);
    setCurrentPage(book.pages[0]); // Set the first page as the initial page
  };

  const handlePageSelection = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className={"book-component"+(currentBook?.isItemsList ? ' no-flex' : '')}>

      {
        currentBook ? null : (
          <div className='main-list'>
            <input
              type="text"
              placeholder="Search for a book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <ul>
              {filteredBooks.map((book) => (
                <li key={book.name} onClick={() => handleBookSelection(book)}>
                  <div className={"book-icon " + (book.icon || 'book-0')}></div>
                  {book.name}
                </li>
              ))}
            </ul>
          </div>
        )
      }

      {currentBook && !currentBook.isItemsList && <div className="sidebar">
        {currentBook && (
          <div>
            <h3><span className='back' onClick={() => { setCurrentBook(null); setCurrentPage(null); }}></span> Pages</h3>
            <ul>
              {currentBook.pages.map((page, index) => (
                <li key={index} className={currentPage?.title == page.title ? 'active' : ''} onClick={() => handlePageSelection(page)}>
                  {page.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>}

      {currentBook && currentBook.isItemsList && <>
        <h2><span className='back' onClick={() => { setCurrentBook(null); setCurrentPage(null); }}></span> {currentBook.name}</h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className='items-list'>
          <PageContent selectBook={(itemID: string) => handleBookSelection(
            books.find(i => i.id == itemID) || null
          )} children={currentBook.pages[0].children} searchQuery={searchQuery} />
        </div>
      </>}

      {currentPage && !currentBook?.isItemsList && <div className="main-content">
        {currentPage && (
          <div>
            <h2>{currentPage.title}</h2>
            <PageContent selectBook={(itemID: string) => handleBookSelection(
              books.find(i => i.id == itemID) || null
            )} children={currentPage.children} />
          </div>
        )}
      </div>}
    </div>
  );
}

export default BookComponent;