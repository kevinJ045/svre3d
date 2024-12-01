
import React, { useState, useEffect, useContext } from 'react';
import { ItemIcon } from './slotitem.js';
import { Item } from '../../models/item.js';
import { Items } from '../../repositories/items.js';
import { InventoryItem } from './inventory.js';
import { Context } from '../data/context.js';
import { SearchBar } from './searchbar.js';
import { ResourceMap } from '../../repositories/resources.js';
import { Separator } from './sep.js';


type bookpagechild = {
  type: 'link' | 'inventory-item' | 'item' | 'image' | 'text' | 'wrapper',
  [key: string]: any
}
export type bookpage = {
  title: string,
  children: bookpagechild[]
}
export type book = {
  name?: string,
  icon?: THREE.Texture | { src: string },
  id: string,
  defaultBook?: boolean,
  isItemsList?: boolean,
  pages?: bookpage[]
}

const fetchedBooks: book[] = [];

const filterFunction = (query: string) => {
  return (i: bookpagechild) => 
    (i.type == 'item' || i.type == 'inventory-item')
    &&
    (i.itemReference ||
    (i.itemReference = Items.all().find(i2 => i.item == i2.manifest.id))
    )
    ?
    (
      (i.itemReference as typeof Item.prototype.reference)
      .item?.name?.toLocaleLowerCase().match(query.toLocaleLowerCase()) || (i.itemReference as typeof Item.prototype.reference)
      .manifest?.id?.toLocaleLowerCase().match(query.toLocaleLowerCase())
    ) 
    :
    (
      (i?.content || i?.name || i?.title)
        ?.toLocaleLowerCase().match(query.toLocaleLowerCase())
    );
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
        }} href='#'>{child.content}</a> : child.type === 'inventory-item' ? <InventoryItem
            item={Items.create({
              itemID: child.item,
              quantity: child.quantity || 1,
            } as any)}
            mouse={false}
            counter={child.quantity > 0}
            key={index}
            selectItem={navTo(child.link)}
            unselectItem={() => {}}
          /> : <div key={index}>
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
            <ItemIcon
              item={Items.create({
                itemID: child.item,
                quantity: child.quantity || 1,
              } as any)}
              onClick={navTo(child.link)}
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

async function fetchBook(id?: string){
  if(id){
    let book = fetchedBooks.find(b => b.id == id);
    if(!book) {
      let rawBook = await fetch(
        '/books/' + id
      ).then(r => r.json());
      book = {
        id: rawBook.manifest.id,
        icon: ResourceMap.find(rawBook.book.icon)?.resource.load,
        name: rawBook.book.name,
        pages: rawBook.pages
      };
      fetchedBooks.push(book);
    }
    return book;
  }
  return await fetch(
    '/books'
  ).then(r => r.json());
}

function BookComponent({ books }: { books: book[] }) {

  const {
    currentBook, setCurrentBook,
    currentPage, setCurrentPage
  } = useContext(Context);

  const [allBooks, setAllBooks] = useState(books.filter(book => Object.keys(book).length > 1)); 
  const [searchQuery, setSearchQuery] = useState('');

  const handleBookSelection = (book) => {
    setCurrentBook(book);
    if(book) setCurrentPage(book.pages[0]); // Set the first page as the initial page
  };

  const handlePageSelection = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    (async () => {
      for(let bookIndex in books){
        const book = books[bookIndex];
  
        if(Object.keys(book).length == 1 && book.id){
          books[bookIndex] = await fetchBook(book.id);
        }
      }
      setAllBooks(books);
    })();
  }, [books]);

  return (
    <div className={"book-component"+(currentBook ? ' has-flex' : '')}>

      {/* The book list */}
      {
        currentBook ? null : (
          <div className='main-list'>
            <SearchBar
              className='absolute'
              placeholder="Search for a book..."
              searchQuery={searchQuery}
              setSearchQuery={(e) => setSearchQuery(e)}
            />

            <h1>Books</h1>
            <Separator></Separator>

            <div className='books-items'>
              {allBooks.filter(book => book.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((book) => (
                <div className='book-item' key={book.name} onClick={() => handleBookSelection(book)}>
                  <img src={(book.icon as any).image?.src} />
                  <div className="title">{book.name}</div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {/* The title/topic list */}
      {
        currentBook && !currentBook.isItemsList && <>
          <h1><span className='icon c icon-back' onClick={() => { setCurrentBook(null); setCurrentPage(null); }}></span> Books &gt; {currentBook.name}</h1>
          <Separator></Separator>

          <div className="grid-book">
            <div className="sidebar">
              {currentBook && (
                <div>
                  <h3>Pages</h3>
                  <ul>
                    {currentBook.pages.map((page, index) => (
                      <li key={index} className={currentPage?.title == page.title ? 'active' : ''} onClick={() => handlePageSelection(page)}>
                        {page.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="main-content">
              {currentPage && (
                <div>
                  <h2>{currentPage.title}</h2>
                  <PageContent selectBook={(itemID: string) => handleBookSelection(
                    allBooks.find(i => i.id == itemID) || null
                  )} children={currentPage.children} />
                </div>
              )}
            </div>
          </div>

        </>
      }

      {/* The items list */}
      {currentBook && currentBook.isItemsList && <>
        <h1><span className='icon c icon-back' onClick={() => { setCurrentBook(null); setCurrentPage(null); }}></span> {currentBook.name}</h1>
        <Separator></Separator>
        <SearchBar
          placeholder="Search..."
          searchQuery={searchQuery}
          setSearchQuery={(e) => setSearchQuery(e)}
          className='absolute'
        />
        <div className='items-list'>
          <PageContent selectBook={(itemID: string) => handleBookSelection(
            allBooks.find(i => i.id == itemID) || null
          )} children={currentBook.pages[0].children} searchQuery={searchQuery} />
        </div>
      </>}
    </div>
  );
}

export default BookComponent;